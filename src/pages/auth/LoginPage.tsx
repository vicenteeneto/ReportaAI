import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, currentUser } = useAppContext();
  
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(searchParams.get('flow') === 'register');
  const asAdmin = searchParams.get('role') === 'admin';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      // Mock login to demo user if empty, or just use what's typed
      const defaultEmail = asAdmin ? 'admin@rondonopolis.mt.gov.br' : 'joao@example.com';
      await login(defaultEmail);
    } else {
      await login(email);
    }
    // Note: React.useEffect above will handle the redirect once login sets the user.
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-[400px] shadow-2xl shadow-slate-200/50 border border-slate-200 bg-white">
        <CardHeader className="text-center pb-4 pt-6">
           <div className="mx-auto w-12 h-12 rounded bg-[#1E3A8A] flex items-center justify-center mb-5">
            <div className="w-5 h-5 border-[3px] border-[#1E3A8A] bg-white rounded-full flex items-center justify-center"></div>
          </div>
          <CardTitle className="text-xl tracking-tight uppercase">{asAdmin ? 'Acesso Gestão' : (isRegistering ? 'Nova Conta' : 'Acessar Conta')}</CardTitle>
          <CardDescription className="text-xs max-w-[240px] mx-auto mt-1">
            {asAdmin 
              ? 'Área restrita para servidores da prefeitura.' 
              : 'Entre para registrar e acompanhar chamados na cidade.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && !asAdmin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nome completo</label>
                  <Input placeholder="Seu nome" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Documento (CPF)</label>
                  <Input placeholder="000.000.000-00" required />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Identificação (E-mail ou CPF)</label>
              <Input 
                type="text" 
                placeholder={asAdmin ? "servidor@rondonopolis.mt.gov.br" : "seu@email.com"} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Senha de acesso</label>
              <Input type="password" placeholder="••••••••" />
              {asAdmin && (
                <p className="text-[10px] text-slate-500 mt-1 font-mono bg-slate-100 p-2 rounded">
                  <strong>Usuário e senha para teste:</strong><br />
                  admin@rondonopolis.mt.gov.br / qualquer senha
                </p>
              )}
            </div>
            {!isRegistering && !asAdmin && (
              <div className="text-right pt-1">
                <a href="#" className="text-[10px] text-blue-600 font-semibold hover:underline tracking-wide">Esqueci a senha</a>
              </div>
            )}
            <Button type="submit" className="w-full mt-2 font-bold uppercase tracking-wide text-xs h-10" size="lg">
              {isRegistering ? 'Concluir Cadastro' : 'Entrar no Sistema'}
            </Button>
            
            {(!asAdmin) && (
              <>
                <div className="relative mt-6 mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-medium tracking-widest text-[9px]">ou continue com</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full gap-2 border-slate-300 font-bold text-slate-700 h-10"
                  onClick={() => loginWithGoogle()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Entrar com Google</span>
                </Button>
              </>
            )}
          </form>
        </CardContent>
        {(!asAdmin) && (
          <CardFooter className="flex justify-center border-t border-slate-100 py-4 bg-slate-50 mt-4 rounded-b-lg">
            <p className="text-xs text-slate-500 font-medium flex gap-1">
              {isRegistering ? "Já tem acesso?" : "Novo por aqui?"}
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)} 
                className="text-[#1E3A8A] font-bold hover:underline"
              >
                {isRegistering ? "Entrar" : "Criar conta"}
              </button>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
