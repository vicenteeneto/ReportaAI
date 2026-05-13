import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAppContext();
  
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
    
    navigate(asAdmin ? '/admin' : '/citizen');
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
