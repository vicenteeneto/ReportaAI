-- Drop tables if they exist to avoid conflicts (be careful in production!)
DROP TABLE IF EXISTS ticket_history CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'citizen',
  "avatarUrl" TEXT,
  "createdAt" BIGINT
);

-- 2. Create Departments Table
CREATE TABLE public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT,
  active BOOLEAN DEFAULT true,
  "createdAt" BIGINT
);

-- 3. Create Categories Table
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  "defaultDepartmentId" TEXT REFERENCES public.departments(id),
  "createdAt" BIGINT
);

-- 4. Create Tickets Table
CREATE TABLE public.tickets (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL,
  "userId" UUID REFERENCES public.users(id),
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

-- 5. Create Ticket History Table
CREATE TABLE public.ticket_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "ticketId" TEXT REFERENCES public.tickets(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  "newStatus" TEXT,
  "createdAt" BIGINT
);

-- Turn off Row Level Security (RLS) for fast prototyping
-- In a real production app, you should ENABLE RLS and write specific policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history DISABLE ROW LEVEL SECURITY;
