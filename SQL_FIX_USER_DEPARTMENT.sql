-- CORREÇÃO: ADICIONAR COLUNA departmentId NA TABELA USERS
-- O aplicativo falhava ao salvar a Secretaria de um usuário porque a coluna "departmentId" não existia na tabela de usuários.
-- 
-- Rode o código abaixo no SQL Editor do Supabase:

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
