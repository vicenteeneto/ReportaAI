-- Este script cria usuários na tabela de autenticação do Supabase já como administradores da área de Gestão.
-- Se certifique que o projeto supabase esteja com a extensão pgcrypto instalada (CREATE EXTENSION IF NOT EXISTS pgcrypto;)

DO $$
DECLARE
  uid_superuser UUID := gen_random_uuid();
  uid_prefeitura UUID := gen_random_uuid();
BEGIN
  -- 1. Inserir Superuser em auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    uid_superuser, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'superuser@rondonopolis.mt.gov.br', crypt('A7x510682', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

  -- 2. Inserir Prefeituraroo em auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    uid_prefeitura, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'prefeituraroo@rondonopolis.mt.gov.br', crypt('testando2026', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

  -- 3. Inserir dados complementares na tabela public.users
  -- (Garante que role será 'admin' no seu sistema de gestão)
  INSERT INTO public.users (id, name, email, role, "createdAt")
  VALUES (uid_superuser, 'Superuser', 'superuser@rondonopolis.mt.gov.br', 'admin', extract(epoch from now()) * 1000);

  INSERT INTO public.users (id, name, email, role, "createdAt")
  VALUES (uid_prefeitura, 'Prefeituraroo', 'prefeituraroo@rondonopolis.mt.gov.br', 'admin', extract(epoch from now()) * 1000);

END $$;
