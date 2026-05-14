-- RASTREAMENTO DO ERRO E CORREÇÃO DEFINITIVA
-- O erro atual (foreign key constraint) e os erros de coluna não encontrada ("categoryId") acontecem porque 
-- as tabelas no seu banco estão com os nomes das colunas em formato diferente do formato esperado pelo aplicativo (React).
-- No código do app, passamos as propriedades exatas (ex: "categoryId", "departmentId", etc). 
-- O PostgreSQL por padrão deixa todas as colunas minúsculas (ex: "categoryid"), o que causa a desconexão ou erros de chave estrangeira (FK) se rodou outra migration.

-- =========================================================================
-- SOLUÇÃO DEFINITIVA (MATA OS ERROS DE INSERÇÃO)
-- Copie todo este arquivo e rode no SQL Editor do Supabase.
-- ATENÇÃO: Isso reseta as tabelas do App (tickets, categories, etc), 
-- mas isso é necessário para padronizar os dados com a aplicação.
-- =========================================================================

-- 1. DELETA OS MODELOS ANTIGOS (Que estavam com nomes / relações erradas)
DROP TABLE IF EXISTS public.ticket_history CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
-- Mantenho users para os logins não quebrarem, mas se quiser pode adicionar aqui.

-- 2. RECRIAR OS DEPARTAMENTOS (Garante que os IDs sejam texto para evitar erros UUID)
CREATE TABLE public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT,
  active BOOLEAN DEFAULT true,
  color TEXT,
  "createdAt" BIGINT
);

-- 3. RECRIAR CATEGORIAS (Com a FOREIGN KEY certa e "defaultDepartmentId" escrito exatamente assim)
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "iconName" TEXT,
  color TEXT,
  "defaultDepartmentId" TEXT REFERENCES public.departments(id),
  "defaultPriority" TEXT,
  "createdAt" BIGINT
);

-- 4. RECRIAR TICKETS (Usando camelCase fixo em double quotes para as chaves)
CREATE TABLE public.tickets (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL,
  "userId" UUID REFERENCES auth.users(id), -- Correção: Liga diretamente na tabela do Auth (pra não quebrar login)
  "categoryId" TEXT REFERENCES public.categories(id),
  "departmentId" TEXT REFERENCES public.departments(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  neighborhood TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "photoUrl" TEXT,
  "createdAt" BIGINT,
  "updatedAt" BIGINT
);

-- 5. RECRIAR TICKET HISTORY
CREATE TABLE public.ticket_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "ticketId" TEXT REFERENCES public.tickets(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  "newStatus" TEXT,
  "createdAt" BIGINT
);

-- 6. DESBLOQUEAR RLS TOTALMENTE (Deixa fluir livremente em desenvolvimento)
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history DISABLE ROW LEVEL SECURITY;

-- 7. REINSERIR DADOS INICIAIS BASE PARA FUNCIONAR
INSERT INTO public.departments (id, name, acronym, active, color) VALUES 
('dep-infra', 'Secretaria Municipal de Infraestrutura', 'SINFRA', true, '#eab308'),
('dep-saude', 'Secretaria Municipal de Saúde', 'SMS', true, '#ef4444'),
('dep-meio', 'Secretaria Municipal de Meio Ambiente', 'SEMMA', true, '#22c55e'),
('dep-mobilidade', 'Secretaria de Transporte e Trânsito', 'SETAT', true, '#3b82f6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, name, "iconName", color, "defaultDepartmentId", "defaultPriority") VALUES 
('cat-buraco', 'Buraco na rua', 'AlertTriangle', 'bg-orange-500', 'dep-infra', 'high'),
('cat-iluminacao', 'Iluminação pública', 'Lightbulb', 'bg-yellow-500', 'dep-infra', 'medium'),
('cat-lixo', 'Lixo ou entulho', 'Trash2', 'bg-amber-700', 'dep-infra', 'medium'),
('cat-mato', 'Mato alto', 'Leaf', 'bg-green-500', 'dep-meio', 'low'),
('cat-arvore', 'Risco Ambiental / Árvore', 'TreePine', 'bg-emerald-700', 'dep-meio', 'high')
ON CONFLICT (id) DO NOTHING;

-- TUDO PRONTO! AGORA O BANCO ESTÁ 100% COMPATÍVEL COM O SEU CÓDIGO REACT.
