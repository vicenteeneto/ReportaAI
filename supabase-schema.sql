-- Run this in the Supabase SQL Editor to set up the tables for your application
-- Then insert default data to be able to test the application.

-- 1. Create tables

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  cpf text,
  neighborhood text,
  role text NOT NULL DEFAULT 'citizen',
  departmentId text,
  avatarUrl text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id text PRIMARY KEY,
  name text NOT NULL,
  acronym text NOT NULL,
  active boolean DEFAULT true,
  color text
);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  iconName text NOT NULL,
  color text NOT NULL,
  defaultDepartmentId text REFERENCES departments(id),
  defaultPriority text NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol text NOT NULL UNIQUE,
  userId uuid REFERENCES users(id),
  categoryId text REFERENCES categories(id),
  subcategoryId text,
  departmentId text REFERENCES departments(id),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'received',
  priority text NOT NULL DEFAULT 'low',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL,
  neighborhood text NOT NULL,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now(),
  dueDate timestamptz,
  resolvedAt timestamptz,
  photoUrl text,
  resolvedPhotoUrl text
);

CREATE TABLE IF NOT EXISTS ticket_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticketId uuid REFERENCES tickets(id),
  userId uuid REFERENCES users(id),
  action text NOT NULL,
  oldStatus text,
  newStatus text,
  comment text,
  createdAt timestamptz DEFAULT now()
);

-- 2. Insert mock data

INSERT INTO users (id, name, email, role, neighborhood, departmentId) VALUES 
('a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'João Silva', 'joao@example.com', 'citizen', 'Vila Aurora', NULL),
('d2cbdf0b-2248-4fd2-8ce1-b922090ba235', 'Admin Pref', 'admin@rondonopolis.mt.gov.br', 'admin', NULL, NULL),
('6b2cae72-eb06-4fb4-8e9a-eb8d34346e4c', 'Prefeito Municipal', 'prefeito@rondonopolis.mt.gov.br', 'mayor', NULL, NULL),
('34dcd932-d04b-4a37-b6f7-b2eb2d1f9cc0', 'Secretário Infra', 'infra@rondonopolis.mt.gov.br', 'secretary', NULL, 'dep-infra')
ON CONFLICT DO NOTHING;

INSERT INTO departments (id, name, acronym, active, color) VALUES 
('dep-infra', 'Secretaria de Infraestrutura', 'SINFRA', true, 'bg-orange-500'),
('dep-meio-ambiente', 'Secretaria de Meio Ambiente', 'SEMMA', true, 'bg-green-600'),
('dep-mobilidade', 'Mobilidade Urbana', 'SETRAM', true, 'bg-purple-600'),
('dep-saude', 'Secretaria de Saúde', 'SMS', true, 'bg-blue-500'),
('dep-educacao', 'Secretaria de Educação', 'SME', true, 'bg-cyan-500')
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name, iconName, color, defaultDepartmentId, defaultPriority) VALUES 
('cat-buraco', 'Buraco na rua', 'AlertTriangle', 'bg-orange-500', 'dep-infra', 'high'),
('cat-iluminacao', 'Iluminação pública', 'Lightbulb', 'bg-yellow-500', 'dep-infra', 'medium'),
('cat-lixo', 'Lixo ou entulho', 'Trash2', 'bg-amber-700', 'dep-infra', 'medium'),
('cat-mato', 'Mato alto', 'Leaf', 'bg-green-500', 'dep-meio-ambiente', 'low'),
('cat-arvore', 'Risco Ambiental / Árvore', 'TreePine', 'bg-emerald-700', 'dep-meio-ambiente', 'high'),
('cat-esgoto', 'Bueiro ou Drenagem', 'Waves', 'bg-blue-600', 'dep-infra', 'high'),
('cat-transito', 'Trânsito e Sinalização', 'TrafficCone', 'bg-purple-500', 'dep-mobilidade', 'medium'),
('cat-saude', 'Saúde Pública', 'Stethoscope', 'bg-red-500', 'dep-saude', 'high'),
('cat-outros', 'Outros', 'MoreHorizontal', 'bg-slate-500', 'dep-infra', 'low')
ON CONFLICT DO NOTHING;

INSERT INTO tickets (id, protocol, userId, categoryId, departmentId, title, description, status, priority, latitude, longitude, address, neighborhood, photoUrl) VALUES 
('73ca81f7-e435-43ea-9fc1-460f7810359f', 'RD-2026-000101', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'cat-buraco', 'dep-infra', 'Buraco gigante e perigoso', 'Buraco na Avenida Lions Internacional sentido centro, danificando carros.', 'in_progress', 'high', -16.4716, -54.6369, 'Av. Lions Internacional, 1000', 'Vila Aurora', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400'),
('5faae00b-ba62-4f36-be5c-41ff8e916298', 'RD-2026-000102', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'cat-iluminacao', 'dep-infra', 'Lâmpada queimada há 1 semana', 'Poste escuro na praça, perigoso à noite.', 'resolved', 'medium', -16.4789, -54.6402, 'Rua A, 45', 'Jardim Atlântico', 'https://images.unsplash.com/photo-1616422340576-90f719601aeb?auto=format&fit=crop&q=80&w=400'),
('eaf712ac-4cba-4df3-8ce0-5c6be22acbb1', 'RD-2026-000103', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'cat-lixo', 'dep-infra', 'Entulho na calçada', 'Jogaram resto de obra na calçada, impedindo passagem.', 'triage', 'medium', -16.4855, -54.6310, 'Rua das Flores, 120', 'Sagrada Família', 'https://images.unsplash.com/photo-1540954930353-875fdf8e63e1?auto=format&fit=crop&q=80&w=400'),
('8967b57a-f3ac-4b6e-bd9f-85f2fbadf1de', 'RD-2026-000104', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'cat-mato', 'dep-meio-ambiente', 'Mato muito alto no terreno', 'Terreno baldio cheio de mato e insetos no Parque Universitário.', 'scheduled', 'low', -16.4912, -54.6290, 'Rua C, S/N', 'Parque Universitário', 'https://images.unsplash.com/photo-1595159491873-1f1afaf8c3ca?auto=format&fit=crop&q=80&w=400'),
('cfb8214f-d007-4e38-95a2-3f6e1f0e2197', 'RD-2026-000105', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'cat-transito', 'dep-mobilidade', 'Semáforo intermitente', 'Semáforo cruzamento centro piscando amarelo há horas.', 'in_progress', 'urgent', -16.4678, -54.6385, 'Av. Marechal Rondon, 500', 'Centro', NULL),
('a2f8bdf9-0f66-4148-be22-d7b3206be638', 'RD-2026-000106', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'cat-esgoto', 'dep-infra', 'Bueiro entupido alagando rua', 'Sempre que chove alaga tudo aqui na Vila Aurora.', 'forwarded', 'high', -16.4740, -54.6320, 'Rua B, 300', 'Vila Aurora', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO ticket_history (id, ticketId, userId, action, oldStatus, newStatus, comment) VALUES 
('1d643ac0-2cf7-4fbd-accf-6b22bc430ec1', '73ca81f7-e435-43ea-9fc1-460f7810359f', 'a83ca3ef-d2f6-48ee-a63e-72c0ec719c8f', 'Chamado Aberto', NULL, 'received', NULL),
('ab7af517-dd34-4bd7-8ba3-f2fd0af6d7bb', '73ca81f7-e435-43ea-9fc1-460f7810359f', 'd2cbdf0b-2248-4fd2-8ce1-b922090ba235', 'Triagem realizada', 'received', 'forwarded', NULL),
('707b2f64-44b4-4b55-8aa4-5e14385a49cd', '73ca81f7-e435-43ea-9fc1-460f7810359f', '34dcd932-d04b-4a37-b6f7-b2eb2d1f9cc0', 'Equipe no local', 'forwarded', 'in_progress', NULL)
ON CONFLICT DO NOTHING;
