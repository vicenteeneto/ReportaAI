-- 1. Remover da tabela public.users primeiro
DELETE FROM public.users WHERE email IN ('superuser@rondonopolis.mt.gov.br', 'prefeituraroo@rondonopolis.mt.gov.br');

-- 2. Remover identidades
DELETE FROM auth.identities WHERE identity_data->>'email' IN ('superuser@rondonopolis.mt.gov.br', 'prefeituraroo@rondonopolis.mt.gov.br');

-- 3. Remover usuários corrompidos
DELETE FROM auth.users WHERE email IN ('superuser@rondonopolis.mt.gov.br', 'prefeituraroo@rondonopolis.mt.gov.br');

-- Tickets/Histories:
-- DELETE FROM ticket_history WHERE userid IN ...