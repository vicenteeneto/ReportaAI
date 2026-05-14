-- 1. DELETE FIRST FROM PUBLIC.USERS DUE TO FOREIGN KEY CONSTRAINT
DELETE FROM public.users WHERE email LIKE '%rondonopolis%';

-- 2. NOW DELETE FROM AUTH TABLES
DELETE FROM auth.identities WHERE identity_data->>'email' LIKE '%rondonopolis%';
DELETE FROM auth.users WHERE email LIKE '%rondonopolis%';
