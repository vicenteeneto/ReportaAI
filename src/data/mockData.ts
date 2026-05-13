import { Category, Department, Ticket, User, TicketHistory } from './types';

export const mockDepartments: Department[] = [
  { id: 'dep-infra', name: 'Secretaria de Infraestrutura', acronym: 'SINFRA', active: true, color: 'bg-orange-500' },
  { id: 'dep-meio-ambiente', name: 'Secretaria de Meio Ambiente', acronym: 'SEMMA', active: true, color: 'bg-green-600' },
  { id: 'dep-mobilidade', name: 'Mobilidade Urbana', acronym: 'SETRAM', active: true, color: 'bg-purple-600' },
  { id: 'dep-saude', name: 'Secretaria de Saúde', acronym: 'SMS', active: true, color: 'bg-blue-500' },
  { id: 'dep-educacao', name: 'Secretaria de Educação', acronym: 'SME', active: true, color: 'bg-cyan-500' },
];

export const mockCategories: Category[] = [
  { id: 'cat-buraco', name: 'Buraco na rua', iconName: 'AlertTriangle', color: 'bg-orange-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'high' },
  { id: 'cat-iluminacao', name: 'Iluminação pública', iconName: 'Lightbulb', color: 'bg-yellow-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-lixo', name: 'Lixo ou entulho', iconName: 'Trash2', color: 'bg-amber-700', defaultDepartmentId: 'dep-infra', defaultPriority: 'medium' },
  { id: 'cat-mato', name: 'Mato alto', iconName: 'Leaf', color: 'bg-green-500', defaultDepartmentId: 'dep-meio-ambiente', defaultPriority: 'low' },
  { id: 'cat-arvore', name: 'Risco Ambiental / Árvore', iconName: 'TreePine', color: 'bg-emerald-700', defaultDepartmentId: 'dep-meio-ambiente', defaultPriority: 'high' },
  { id: 'cat-esgoto', name: 'Bueiro ou Drenagem', iconName: 'Waves', color: 'bg-blue-600', defaultDepartmentId: 'dep-infra', defaultPriority: 'high' },
  { id: 'cat-transito', name: 'Trânsito e Sinalização', iconName: 'TrafficCone', color: 'bg-purple-500', defaultDepartmentId: 'dep-mobilidade', defaultPriority: 'medium' },
  { id: 'cat-saude', name: 'Saúde Pública', iconName: 'Stethoscope', color: 'bg-red-500', defaultDepartmentId: 'dep-saude', defaultPriority: 'high' },
  { id: 'cat-outros', name: 'Outros', iconName: 'MoreHorizontal', color: 'bg-slate-500', defaultDepartmentId: 'dep-infra', defaultPriority: 'low' },
];

export const mockUsers: User[] = [
  { id: 'usr-1', name: 'João Silva', email: 'joao@example.com', role: 'citizen', neighborhood: 'Vila Aurora' },
  { id: 'usr-admin', name: 'Admin Pref', email: 'admin@rondonopolis.mt.gov.br', role: 'admin' },
  { id: 'usr-prefeito', name: 'Prefeito Municipal', email: 'prefeito@rondonopolis.mt.gov.br', role: 'mayor' },
  { id: 'usr-sec-infra', name: 'Secretário Infra', email: 'infra@rondonopolis.mt.gov.br', role: 'secretary', departmentId: 'dep-infra' },
];

const today = new Date();
const d = (daysAgo: number) => new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const mockTickets: Ticket[] = [
  {
    id: 'tkt-1', protocol: 'RD-2026-000101', userId: 'usr-1',
    categoryId: 'cat-buraco', departmentId: 'dep-infra',
    title: 'Buraco gigante e perigoso', description: 'Buraco na Avenida Lions Internacional sentido centro, danificando carros.',
    status: 'in_progress', priority: 'high',
    latitude: -16.4716, longitude: -54.6369, address: 'Av. Lions Internacional, 1000', neighborhood: 'Vila Aurora',
    createdAt: d(3),
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-2', protocol: 'RD-2026-000102', userId: 'usr-1',
    categoryId: 'cat-iluminacao', departmentId: 'dep-infra',
    title: 'Lâmpada queimada há 1 semana', description: 'Poste escuro na praça, perigoso à noite.',
    status: 'resolved', priority: 'medium',
    latitude: -16.4789, longitude: -54.6402, address: 'Rua A, 45', neighborhood: 'Jardim Atlântico',
    createdAt: d(10), resolvedAt: d(1),
    photoUrl: 'https://images.unsplash.com/photo-1616422340576-90f719601aeb?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-3', protocol: 'RD-2026-000103', userId: 'usr-1',
    categoryId: 'cat-lixo', departmentId: 'dep-infra',
    title: 'Entulho na calçada', description: 'Jogaram resto de obra na calçada, impedindo passagem.',
    status: 'triage', priority: 'medium',
    latitude: -16.4855, longitude: -54.6310, address: 'Rua das Flores, 120', neighborhood: 'Sagrada Família',
    createdAt: d(0),
    photoUrl: 'https://images.unsplash.com/photo-1540954930353-875fdf8e63e1?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-4', protocol: 'RD-2026-000104', userId: 'usr-1',
    categoryId: 'cat-mato', departmentId: 'dep-meio-ambiente',
    title: 'Mato muito alto no terreno', description: 'Terreno baldio cheio de mato e insetos no Parque Universitário.',
    status: 'scheduled', priority: 'low',
    latitude: -16.4912, longitude: -54.6290, address: 'Rua C, S/N', neighborhood: 'Parque Universitário',
    createdAt: d(5),
    photoUrl: 'https://images.unsplash.com/photo-1595159491873-1f1afaf8c3ca?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-5', protocol: 'RD-2026-000105', userId: 'usr-1',
    categoryId: 'cat-transito', departmentId: 'dep-mobilidade',
    title: 'Semáforo intermitente', description: 'Semáforo cruzamento centro piscando amarelo há horas.',
    status: 'in_progress', priority: 'urgent',
    latitude: -16.4678, longitude: -54.6385, address: 'Av. Marechal Rondon, 500', neighborhood: 'Centro',
    createdAt: d(0),
  },
  {
    id: 'tkt-6', protocol: 'RD-2026-000106', userId: 'usr-1',
    categoryId: 'cat-esgoto', departmentId: 'dep-infra',
    title: 'Bueiro entupido alagando rua', description: 'Sempre que chove alaga tudo aqui na Vila Aurora.',
    status: 'forwarded', priority: 'high',
    latitude: -16.4740, longitude: -54.6320, address: 'Rua B, 300', neighborhood: 'Vila Aurora',
    createdAt: d(1),
  },
];

export const mockTicketHistory: TicketHistory[] = [
  { id: 'hist-1', ticketId: 'tkt-1', userId: 'usr-1', action: 'Chamado Aberto', newStatus: 'received', createdAt: d(3) },
  { id: 'hist-2', ticketId: 'tkt-1', userId: 'usr-admin', action: 'Triagem realizada', oldStatus: 'received', newStatus: 'forwarded', createdAt: d(2) },
  { id: 'hist-3', ticketId: 'tkt-1', userId: 'usr-sec-infra', action: 'Equipe no local', oldStatus: 'forwarded', newStatus: 'in_progress', createdAt: d(1) },
];
