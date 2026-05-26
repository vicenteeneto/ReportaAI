import { Ticket } from '../data/types';

export const INACTIVE_STATUSES = ['resolved', 'closed', 'rejected', 'duplicated', 'canceled'];

export const SLA_DAYS_BY_PRIORITY: Record<string, number> = {
  urgent: 1,
  high: 3,
  medium: 7,
  low: 15,
};

const getTime = (value: number | string | undefined) => {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (/^\d+$/.test(value)) return Number(value);
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

export const isActiveTicket = (ticket: Ticket) => !INACTIVE_STATUSES.includes(ticket.status);

export const getTicketSlaInfo = (ticket: Ticket) => {
  const slaDays = SLA_DAYS_BY_PRIORITY[ticket.priority] || SLA_DAYS_BY_PRIORITY.medium;
  const createdAt = getTime(ticket.createdAt);
  const dueAt = ticket.dueDate ? getTime(ticket.dueDate) : createdAt + slaDays * 24 * 60 * 60 * 1000;
  const remainingMs = dueAt - Date.now();
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const active = isActiveTicket(ticket);
  const overdue = active && remainingMs < 0;
  const dueSoon = active && !overdue && remainingMs <= 24 * 60 * 60 * 1000;

  return {
    active,
    dueAt,
    overdue,
    dueSoon,
    remainingDays,
    slaDays,
    label: !active
      ? 'Encerrado'
      : overdue
      ? `Atrasado ha ${Math.abs(remainingDays)}d`
      : dueSoon
      ? 'Vence em breve'
      : `${remainingDays}d no prazo`,
  };
};

export const countOverdueTickets = (tickets: Ticket[]) => tickets.filter(ticket => getTicketSlaInfo(ticket).overdue).length;
