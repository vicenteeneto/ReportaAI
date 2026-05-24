import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function AdminSetup() {
  const [status, setStatus] = useState<string>('');
  const [emailPrefix, setEmailPrefix] = useState('');

  const setupAdmins = async () => {
    setStatus('Iniciando criação...');
    
    // allow bypass rate limit by appending a number if requested
    const customEmail1 = `superuser${emailPrefix}@prefeiturademo.gov.br`;
    const customEmail2 = `prefeito${emailPrefix}@prefeiturademo.gov.br`;

    try {
      // Create Superuser
      setStatus(`Criando ${customEmail1}...`);
      const res1 = await supabase.auth.signUp({
        email: customEmail1,
        password: 'A7x510682',
      });
      if (res1.error && !res1.error.message.includes('already registered')) throw res1.error;
      
      if (res1.data.user) {
        await supabase.from('users').upsert({
          id: res1.data.user.id,
          name: 'Superuser',
          email: customEmail1,
          role: 'admin',
          createdAt: Date.now()
        });
      }

      // Create Prefeituraroo
      setStatus(`Criando ${customEmail2}...`);
      const res2 = await supabase.auth.signUp({
        email: customEmail2,
        password: 'testando2026',
      });
      if (res2.error && !res2.error.message.includes('already registered')) throw res2.error;

      if (res2.data.user) {
        await supabase.from('users').upsert({
          id: res2.data.user.id,
          name: 'Prefeituraroo',
          email: customEmail2,
          role: 'admin',
          createdAt: Date.now()
        });
      }

      // Log out just in case
      await supabase.auth.signOut();
      
      setStatus(`Sucesso! Usuários criados com a API do Supabase.\n\nE-mails usados:\n- ${customEmail1}\n- ${customEmail2}\n\nVocê já pode voltar para a tela de login.`);
      
    } catch (e: any) {
      console.error(e);
      setStatus(`Erro: ${e.message}\n\nDICA: Se deu "email rate limit exceeded", insira um número abaixo e tente novamente para gerar um e-mail diferente.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Setup de Administradores</h1>
        <p className="mb-4 text-sm text-slate-600">
          Como o insert via SQL cru pode causar inconsistências na versão atual do Supabase, 
          é mais seguro cadastrar via API.
        </p>
        
        <ol className="list-decimal text-sm mb-6 pl-4 space-y-2">
          <li>Se você rodou os SQLs antigos de admin, apague eles no SQL Editor: <br/> <code>DELETE FROM auth.users WHERE email LIKE '%prefeiturademo%';</code></li>
          <li>Clique no botão abaixo para usar a API nativa de SignIn.</li>
          <li>Depois, é só voltar para a tela de login normalmente.</li>
        </ol>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mudar E-mail (Se já estourou o limite)
          </label>
          <input 
            type="text" 
            placeholder="Ex: 2 (Gera superuser2@...)"
            value={emailPrefix}
            onChange={(e) => setEmailPrefix(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <Button onClick={setupAdmins} className="w-full mb-4 py-6 font-bold text-lg">Criar Usuários Admin</Button>
        
        {status && (
          <div className="p-4 bg-slate-900 text-green-400 rounded text-sm whitespace-pre-wrap font-mono">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
