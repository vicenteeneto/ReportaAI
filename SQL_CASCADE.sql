-- Copie TUDO a partir da linha DO \$\$ abaixo, não deixe faltar a primeira linha!
DO \$\$
DECLARE 
  r RECORD;
BEGIN
  -- 1. Tabela USERS
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'users' AND constraint_type = 'FOREIGN KEY') LOOP
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
  
  ALTER TABLE public.users ADD FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- 2. Tabela TICKETS
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'tickets' AND constraint_type = 'FOREIGN KEY') LOOP
    EXECUTE 'ALTER TABLE public.tickets DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
  
  -- Usamos aspas duplas ("userId") obrigatoriamente no Postgres quando tem letra maiúscula
  ALTER TABLE public.tickets ADD FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.tickets ADD FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON DELETE SET NULL;
  ALTER TABLE public.tickets ADD FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON DELETE SET NULL;

  -- 3. Tabela TICKET_HISTORY
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'ticket_history' AND constraint_type = 'FOREIGN KEY') LOOP
    EXECUTE 'ALTER TABLE public.ticket_history DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;

  ALTER TABLE public.ticket_history ADD FOREIGN KEY ("userId") REFERENCES auth.users(id) ON DELETE CASCADE;
  ALTER TABLE public.ticket_history ADD FOREIGN KEY ("ticketId") REFERENCES public.tickets(id) ON DELETE CASCADE;

END \$\$;
