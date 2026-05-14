-- Inserção de Secretarias base
INSERT INTO public.departments (id, name, acronym, active, color, "createdAt")
VALUES 
  ('dep-infra', 'Secretaria Municipal de Infraestrutura', 'SINFRA', true, '#eab308', extract(epoch from now()) * 1000),
  ('dep-saude', 'Secretaria Municipal de Saúde', 'SMS', true, '#ef4444', extract(epoch from now()) * 1000),
  ('dep-meio', 'Secretaria Municipal de Meio Ambiente', 'SEMMA', true, '#22c55e', extract(epoch from now()) * 1000),
  ('dep-transito', 'Secretaria de Transporte e Trânsito', 'SETAT', true, '#3b82f6', extract(epoch from now()) * 1000)
ON CONFLICT (id) DO NOTHING;

-- Inserção de Categorias base
INSERT INTO public.categories (id, name, "iconName", color, "defaultDepartmentId", "defaultPriority", "createdAt")
VALUES 
  ('cat-buraco', 'Buraco na Via', 'map-pin', '#eab308', 'dep-infra', 'high', extract(epoch from now()) * 1000),
  ('cat-iluminacao', 'Iluminação Pública', 'zap', '#f59e0b', 'dep-infra', 'medium', extract(epoch from now()) * 1000),
  ('cat-foco-dengue', 'Foco de Dengue', 'alert-triangle', '#ef4444', 'dep-saude', 'urgent', extract(epoch from now()) * 1000),
  ('cat-arvore', 'Poda de Árvore', 'leaf', '#22c55e', 'dep-meio', 'medium', extract(epoch from now()) * 1000),
  ('cat-entulho', 'Acúmulo de Lixo / Entulho', 'trash', '#8b5cf6', 'dep-meio', 'high', extract(epoch from now()) * 1000),
  ('cat-semaforo', 'Semáforo com Defeito', 'activity', '#3b82f6', 'dep-transito', 'urgent', extract(epoch from now()) * 1000)
ON CONFLICT (id) DO NOTHING;
