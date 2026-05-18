export type Role = 'superadmin' | 'citizen' | 'admin' | 'mayor' | 'secretary' | 'coordinator' | 'triage' | 'field';

export interface City {
  id: string;
  name: string;
  state: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: number | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  neighborhood?: string;
  role: Role;
  departmentId?: string;
  avatarUrl?: string;
  pointsValidating?: number;
  pointsValidated?: number;
  cityId?: string;
}

export interface Department {
  id: string;
  name: string;
  acronym: string;
  active: boolean;
  color?: string;
  cityId?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  defaultDepartmentId: string;
  defaultPriority: Priority;
  cityId?: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 
  | 'received' 
  | 'triage' 
  | 'forwarded' 
  | 'analyzing' 
  | 'scheduled' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed' 
  | 'duplicated' 
  | 'rejected' 
  | 'waiting_info';

export interface Ticket {
  id: string;
  protocol: string;
  userId: string;
  categoryId: string;
  subcategoryId?: string;
  departmentId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  latitude: number;
  cityId?: string;

  longitude: number;
  address: string;
  neighborhood: string;
  createdAt: number | string;
  updatedAt?: number | string;
  dueDate?: number | string;
  resolvedAt?: number | string;
  photoUrl?: string; // Simplification for prototype
  resolvedPhotoUrl?: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  oldStatus?: TicketStatus;
  newStatus?: TicketStatus;
  comment?: string;
  createdAt: number | string;
}
