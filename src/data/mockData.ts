import { Category, Department, Ticket, User, TicketHistory } from './types';
import { CATEGORY_OPTIONS } from './categoryOptions';

export const mockDepartments: Department[] = [
  { id: 'dep-infra', name: 'Secretaria de Infraestrutura', acronym: 'SINFRA', active: true, color: 'bg-orange-500' },
  { id: 'dep-meio-ambiente', name: 'Secretaria de Meio Ambiente', acronym: 'SEMMA', active: true, color: 'bg-green-600' },
  { id: 'dep-mobilidade', name: 'Mobilidade Urbana', acronym: 'SETRAM', active: true, color: 'bg-purple-600' },
  { id: 'dep-saude', name: 'Secretaria de Saude', acronym: 'SMS', active: true, color: 'bg-blue-500' },
  { id: 'dep-educacao', name: 'Secretaria de Educacao', acronym: 'SME', active: true, color: 'bg-cyan-500' },
];

export const mockCategories: Category[] = CATEGORY_OPTIONS;

export const mockUsers: User[] = [
  { id: 'usr-1', name: 'Joao Silva', email: 'joao@example.com', role: 'citizen', neighborhood: 'Jardim Primavera' },
  { id: 'usr-admin', name: 'Admin Pref', email: 'admin@prefeiturademo.gov.br', role: 'admin' },
  { id: 'usr-prefeito', name: 'Prefeito Municipal', email: 'prefeito@prefeiturademo.gov.br', role: 'mayor' },
  { id: 'usr-sec-infra', name: 'Secretario Infra', email: 'infra@prefeiturademo.gov.br', role: 'secretary', departmentId: 'dep-infra' },
];

const today = new Date();
const d = (daysAgo: number) => new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const mockTickets: Ticket[] = [
  {
    id: 'tkt-1', protocol: 'REPT-2026-000101', userId: 'usr-1',
    categoryId: 'cat-buraco', departmentId: 'dep-infra',
    title: 'Buraco gigante e perigoso', description: 'Buraco na Avenida Principal sentido centro, danificando carros.',
    status: 'in_progress', priority: 'high',
    latitude: -16.4716, longitude: -54.6369, address: 'Av. Principal, 1000', neighborhood: 'Centro',
    createdAt: d(3),
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-2', protocol: 'REPT-2026-000102', userId: 'usr-1',
    categoryId: 'cat-iluminacao', departmentId: 'dep-infra',
    title: 'Lampada queimada ha 1 semana', description: 'Poste escuro na praca, perigoso a noite.',
    status: 'resolved', priority: 'medium',
    latitude: -16.4789, longitude: -54.6402, address: 'Rua das Palmeiras, 45', neighborhood: 'Jardim das Flores',
    createdAt: d(10), resolvedAt: d(1),
    photoUrl: 'https://images.unsplash.com/photo-1616422340576-90f719601aeb?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-3', protocol: 'REPT-2026-000103', userId: 'usr-1',
    categoryId: 'cat-lixo', departmentId: 'dep-infra',
    title: 'Entulho na calcada', description: 'Jogaram resto de obra na calcada, impedindo passagem.',
    status: 'triage', priority: 'medium',
    latitude: -16.4855, longitude: -54.6310, address: 'Rua das Flores, 120', neighborhood: 'Jardim das Flores',
    createdAt: d(0),
    photoUrl: 'https://images.unsplash.com/photo-1540954930353-875fdf8e63e1?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-4', protocol: 'REPT-2026-000104', userId: 'usr-1',
    categoryId: 'cat-mato', departmentId: 'dep-meio-ambiente',
    title: 'Mato muito alto no terreno', description: 'Terreno baldio cheio de mato e insetos.',
    status: 'scheduled', priority: 'low',
    latitude: -16.4912, longitude: -54.6290, address: 'Rua C, S/N', neighborhood: 'Parque Municipal',
    createdAt: d(5),
    photoUrl: 'https://images.unsplash.com/photo-1595159491873-1f1afaf8c3ca?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tkt-5', protocol: 'REPT-2026-000105', userId: 'usr-1',
    categoryId: 'cat-transito', departmentId: 'dep-mobilidade',
    title: 'Semaforo intermitente', description: 'Semaforo cruzamento centro piscando amarelo ha horas.',
    status: 'in_progress', priority: 'urgent',
    latitude: -16.4678, longitude: -54.6385, address: 'Av. Brasil, 500', neighborhood: 'Centro',
    createdAt: d(0),
  },
  {
    id: 'tkt-6', protocol: 'REPT-2026-000106', userId: 'usr-1',
    categoryId: 'cat-bueiro-esgoto', departmentId: 'dep-infra',
    title: 'Bueiro entupido alagando rua', description: 'Sempre que chove alaga tudo aqui no bairro.',
    status: 'forwarded', priority: 'high',
    latitude: -16.4740, longitude: -54.6320, address: 'Rua B, 300', neighborhood: 'Vila Esperanca',
    createdAt: d(1),
  },
];

export const mockTicketHistory: TicketHistory[] = [
  { id: 'hist-1', ticketId: 'tkt-1', userId: 'usr-1', action: 'Chamado Aberto', newStatus: 'received', createdAt: d(3) },
  { id: 'hist-2', ticketId: 'tkt-1', userId: 'usr-admin', action: 'Triagem realizada', oldStatus: 'received', newStatus: 'forwarded', createdAt: d(2) },
  { id: 'hist-3', ticketId: 'tkt-1', userId: 'usr-sec-infra', action: 'Equipe no local', oldStatus: 'forwarded', newStatus: 'in_progress', createdAt: d(1) },
];
