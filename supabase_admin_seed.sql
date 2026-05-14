-- --------------------------------------------------------------------------------
-- SCRIPT COMPLETO DE CRIAÇÃO DOS USUÁRIOS ADMIN DE GESTÃO
-- Copie e cole todo este código na aba "SQL Editor" do Supabase e clique em "Run"
-- --------------------------------------------------------------------------------

-- 1. Forçar o reload do cache do PostgREST (resolve o "Database error querying schema")
NOTIFY pgrst, 'reload schema';

-- 2. Limpar qualquer tentativa anterior de criar esses mesmos e-mails
DELETE FROM public.users WHERE email IN ('superuser@rondonopolis.mt.gov.br', 'prefeituraroo@rondonopolis.mt.gov.br');
DELETE FROM auth.identities WHERE identity_data->>'email' IN ('superuser@rondonopolis.mt.gov.br', 'prefeituraroo@rondonopolis.mt.gov.br');
DELETE FROM auth.users WHERE email IN ('superuser@rondonopolis.mt.gov.br', 'prefeituraroo@rondonopolis.mt.gov.br');

-- 3. Inserção Segura usando o bloco DO $$
DO $$
DECLARE
  uid_superuser UUID := gen_random_uuid();
  uid_prefeitura UUID := gen_random_uuid();
BEGIN
  -- --------------------------------------------------------
  -- INSERIR SUPERUSER
  -- --------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    uid_superuser, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'superuser@rondonopolis.mt.gov.br', crypt('A7x510682', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, identity_data, provider, user_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid_superuser::text,
    json_build_object('sub', uid_superuser::text, 'email', 'superuser@rondonopolis.mt.gov.br', 'email_verified', true),
    'email', uid_superuser, now(), now(), now()
  );

  INSERT INTO public.users (id, name, email, role, "createdAt")
  VALUES (uid_superuser, 'Superuser', 'superuser@rondonopolis.mt.gov.br', 'admin', extract(epoch from now()) * 1000);

  -- --------------------------------------------------------
  -- INSERIR PREFEITURAROO
  -- --------------------------------------------------------
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    uid_prefeitura, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'prefeituraroo@rondonopolis.mt.gov.br', crypt('testando2026', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

  INSERT INTO auth.identities (
    id, provider_id, identity_data, provider, user_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid_prefeitura::text,
    json_build_object('sub', uid_prefeitura::text, 'email', 'prefeituraroo@rondonopolis.mt.gov.br', 'email_verified', true),
    'email', uid_prefeitura, now(), now(), now()
  );

  INSERT INTO public.users (id, name, email, role, "createdAt")
  VALUES (uid_prefeitura, 'Prefeituraroo', 'prefeituraroo@rondonopolis.mt.gov.br', 'admin', extract(epoch from now()) * 1000);

END $$;
