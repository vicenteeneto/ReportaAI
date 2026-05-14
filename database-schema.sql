-- Schema definition for Cidade Conecta
-- This script creates the necessary tables, sets up Row Level Security (RLS) policies,
-- and inserts initial default data for Departments and Categories.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf TEXT,
  neighborhood TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  departmentid UUID,
  avatarurl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  iconname TEXT NOT NULL,
  color TEXT NOT NULL,
  defaultdepartmentid UUID REFERENCES public.departments(id),
  defaultpriority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol TEXT UNIQUE NOT NULL,
  userid UUID REFERENCES public.users(id) NOT NULL,
  categoryid UUID REFERENCES public.categories(id) NOT NULL,
  subcategoryid UUID REFERENCES public.categories(id),
  departmentid UUID REFERENCES public.departments(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  priority TEXT NOT NULL DEFAULT 'medium',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  photourl TEXT,
  resolvedphotourl TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create Ticket History Table
CREATE TABLE IF NOT EXISTS public.ticket_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticketid UUID REFERENCES public.tickets(id) NOT NULL,
  userid UUID REFERENCES public.users(id) NOT NULL,
  action TEXT NOT NULL,
  oldstatus TEXT,
  newstatus TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Users: Citizens can read their own data. Public can read basic user info.
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Departments: Everyone can view active departments
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (active = true);

-- Categories: Everyone can view categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Tickets: Citizens can view and create their own tickets. Admins can view all.
CREATE POLICY "Citizens can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = userid);
CREATE POLICY "Admins can view all tickets" ON public.tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role != 'citizen')
);
CREATE POLICY "Citizens can insert tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = userid);
CREATE POLICY "Citizens can update own tickets" ON public.tickets FOR UPDATE USING (auth.uid() = userid);
CREATE POLICY "Admins can update all tickets" ON public.tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role != 'citizen')
);

-- Ticket History: Viewable based on ticket access
CREATE POLICY "History viewable if ticket is viewable" ON public.ticket_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = ticketid AND (userid = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role != 'citizen')))
);
CREATE POLICY "Allowed users can insert history" ON public.ticket_history FOR INSERT WITH CHECK (auth.uid() = userid);


-- 6. Insert Default Initial Data

-- Insert a default 'Obras' Department
INSERT INTO public.departments (id, name, acronym, color) 
VALUES ('d1234567-89ab-cdef-0123-456789abcdef', 'Secretaria Municipal de Obras', 'SMO', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- Insert a default 'Zeladoria' Department
INSERT INTO public.departments (id, name, acronym, color) 
VALUES ('d2345678-9abc-def0-1234-56789abcdef0', 'Serviços Públicos (Zeladoria)', 'SMSP', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- Insert Categories
INSERT INTO public.categories (id, name, iconname, color, defaultdepartmentid, defaultpriority)
VALUES 
  ('c1234567-89ab-cdef-0123-456789abcdef', 'Buraco na rua', 'alert-triangle', '#f59e0b', 'd1234567-89ab-cdef-0123-456789abcdef', 'high'),
  ('c2345678-9abc-def0-1234-56789abcdef0', 'Luminária Queimada', 'lightbulb', '#eab308', 'd2345678-9abc-def0-1234-56789abcdef0', 'medium'),
  ('c3456789-abcd-ef01-2345-6789abcdef01', 'Coleta de Lixo', 'trash-2', '#64748b', 'd2345678-9abc-def0-1234-56789abcdef0', 'medium')
ON CONFLICT (id) DO NOTHING;

-- Storage Setup (for photos)
-- You must manually create a storage bucket in Supabase called 'tickets' 
-- and set it to public.
