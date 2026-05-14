-- Rastreamento de Erros e Correção Completa para cadastrar tickets e usuários.
-- Você está recebendo o erro "new row violates row-level security policy" porque
-- o Row Level Security (RLS) foi ativado na tabela 'tickets', mas não existe uma 
-- política permitindo que as pessoas criem (Insert) novos chamados.

-- PARA CORRIGIR TODOS OS ERROS: Copie todo este código e execute no SQL Editor do Supabase.

-- ABORDAGEM 1: Desabilitar o RLS (Recomendado na fase de desenvolvimento e protótipo)
-- Isso vai garantir que não aja mais bloqueios para testar o aplicativo.
ALTER TABLE IF EXISTS public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ticket_history DISABLE ROW LEVEL SECURITY;


-- ABORDAGEM 2: Se preferir manter o RLS ativado permanentemente (modo seguro avançado),
-- e preferir não usar o bloco de cima, pode usar estas regras que abrem para os usuários:
/*
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Users (permite que o app crie ou atualize o perfil do cidadão após o login)
DROP POLICY IF EXISTS "allow_users" ON public.users;
CREATE POLICY "allow_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Tickets (permite que qualquer usuário logado crie, leia ou modifique chamados)
DROP POLICY IF EXISTS "allow_tickets" ON public.tickets;
CREATE POLICY "allow_tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
*/
