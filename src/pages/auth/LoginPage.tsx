import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, updatePassword, currentUser } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const asAdmin = searchParams.get('role') === 'admin';
  const isRecovery = searchParams.get('mode') === 'recovery' || window.location.hash.includes('type=recovery');
  const [isRegistering, setIsRegistering] = useState(asAdmin ? false : searchParams.get('flow') === 'register');
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const getFriendlyAuthError = (err: any) => {
    const rawMessage = String(err?.message || '');
    const message = rawMessage.toLowerCase();

    if (message.includes('invalid login credentials')) {
      return 'Credenciais invalidas. Confira a senha ou use "Esqueci minha senha".';
    }

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return isRegistering
        ? 'O envio de e-mails para criacao de conta atingiu um limite temporario. Aguarde alguns minutos e tente novamente.'
        : 'Muitas tentativas de envio em pouco tempo. Aguarde alguns minutos antes de solicitar outro link.';
    }

    if (message.includes('user already registered') || message.includes('already registered') || message.includes('ja esta cadastrado')) {
      return 'Este e-mail ja esta em uso. Use "Faca login" para entrar.';
    }

    return rawMessage || 'Ocorreu um erro ao tentar fazer login.';
  };

  if (currentUser && !isRecovery) {
    navigate(asAdmin || currentUser.role !== 'citizen' ? '/admin/dashboard' : '/citizen/home');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRecovery) {
        await updatePassword(password);
        setSuccess('Senha atualizada com sucesso. Você já pode entrar com a nova senha.');
        setPassword('');
        navigate('/login', { replace: true });
      } else if (isResetting) {
        await resetPassword(email);
        setSuccess('Enviamos um link de redefinição para o seu e-mail.');
        setIsResetting(false);
      } else if (isRegistering) {
        const result = await registerWithEmail(email, password, asAdmin ? 'admin' : 'citizen');
        if (result === 'confirmation_required') {
          setSuccess('Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.');
          setIsRegistering(false);
          setPassword('');
        } else {
          setSuccess('Conta criada com sucesso. Redirecionando...');
        }
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-[400px] shadow-2xl shadow-slate-200/50 border border-slate-200 bg-white">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="mx-auto w-12 h-12 rounded bg-[#1E3A8A] flex items-center justify-center mb-5">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <CardTitle className="text-xl tracking-tight uppercase">
            {isRecovery ? 'Nova senha' : asAdmin ? 'Acesso Gestão' : isResetting ? 'Recuperar senha' : 'Acessar Conta'}
          </CardTitle>
          <CardDescription className="text-xs max-w-[240px] mx-auto mt-1">
            {isRecovery
              ? 'Digite uma nova senha para sua conta.'
              : isResetting
              ? 'Informe seu e-mail para receber o link de redefinição.'
              : asAdmin
              ? 'Área restrita para servidores da prefeitura. Faça login para continuar.'
              : 'Entre para registrar e acompanhar chamados na cidade.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 text-center pt-2">
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
              <Input
                type="password"
                placeholder={isRecovery ? 'Nova senha' : 'Sua senha'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isResetting}
                minLength={6}
                className={`h-11 ${isResetting ? 'hidden' : ''}`}
              />
            </div>

            {error && <p className="text-sm border border-red-500 bg-red-50 rounded-lg p-2 text-red-600 font-medium">{error}</p>}
            {success && <p className="text-sm border border-emerald-500 bg-emerald-50 rounded-lg p-2 text-emerald-700 font-medium">{success}</p>}

            <Button type="submit" className="w-full font-bold uppercase tracking-wide text-sm h-11" isLoading={loading}>
              {isRecovery ? 'Salvar nova senha' : isResetting ? 'Enviar link' : isRegistering ? 'Criar Conta' : 'Entrar'}
            </Button>

            {!asAdmin && !isRecovery && (
              <p className="text-sm text-slate-500 mt-4">
                {isResetting ? 'Lembrou a senha?' : isRegistering ? 'Já tem uma conta?' : 'Não tem conta?'}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    if (isResetting) {
                      setIsResetting(false);
                      setIsRegistering(false);
                    } else {
                      setIsRegistering(!isRegistering);
                    }
                  }}
                  className="text-[#1E3A8A] font-bold ml-1 hover:underline"
                >
                  {isResetting ? 'Entrar' : isRegistering ? 'Faça login' : 'Registre-se'}
                </button>
              </p>
            )}

            {!asAdmin && !isRegistering && !isResetting && !isRecovery && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setIsResetting(true);
                  setPassword('');
                }}
                className="text-xs font-bold text-[#1E3A8A] hover:underline"
              >
                Esqueci minha senha
              </button>
            )}

            {asAdmin && (
              <p className="text-sm text-slate-500 mt-4">
                Precisa criar os usuários iniciais?
                <button
                  type="button"
                  onClick={() => navigate('/admin-setup')}
                  className="text-[#1E3A8A] font-bold ml-1 hover:underline"
                >
                  Acessar Setup
                </button>
              </p>
            )}
          </form>

          {!asAdmin && (
            <>
              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">ou</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-slate-300 font-bold text-slate-700 h-11 text-sm shadow-sm"
                onClick={() => loginWithGoogle()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Entrar com Google</span>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
