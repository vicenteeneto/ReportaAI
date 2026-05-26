import { supabase } from './supabase';
import { Ticket, TicketHistory, TicketStatus } from '../data/types';

export const STATUS_LABELS: Record<string, string> = {
  received: 'Recebido',
  triage: 'Triagem',
  forwarded: 'Encaminhado',
  analyzing: 'Em Analise',
  scheduled: 'Agendado',
  in_progress: 'Em Execucao',
  resolved: 'Resolvido',
  closed: 'Finalizado',
  duplicated: 'Duplicado',
  rejected: 'Indeferido',
  waiting_info: 'Pendencia cidadao',
  canceled: 'Cancelado',
};

export type NormalizedTicketHistory = TicketHistory & {
  userName?: string;
};

const getTime = (value: number | string | undefined) => {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (/^\d+$/.test(value)) return Number(value);
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

export const getInitialHistoryEntry = (ticket: Ticket): NormalizedTicketHistory => ({
  id: `${ticket.id}-initial`,
  ticketId: ticket.id,
  userId: ticket.userId,
  userName: 'Cidadao',
  action: 'Registro inicial do chamado',
  newStatus: 'received',
  comment: ticket.description,
  createdAt: getTime(ticket.createdAt),
});

export const normalizeTicketHistory = (ticket: Ticket, items: any[] = []): NormalizedTicketHistory[] => {
  const initial = getInitialHistoryEntry(ticket);
  const normalized = items
    .map((item) => ({
      id: item.id || `${item.ticketId || item.ticket_id || item.ticketid}-${item.createdAt || item.created_at || item.createdat || Date.now()}`,
      ticketId: item.ticketId || item.ticket_id || item.ticketid || ticket.id,
      userId: item.userId || item.user_id || item.userid || '',
      userName: item.userName || item.user_name || item.username || item.authorName || item.author_name || '',
      action: item.action || 'Atualizacao do chamado',
      oldStatus: item.oldStatus || item.old_status || item.oldstatus,
      newStatus: item.newStatus || item.new_status || item.newstatus,
      comment: item.comment || item.comments || item.observation || item.observations || '',
      createdAt: getTime(item.createdAt || item.created_at || item.createdat),
    }))
    .filter((item) => item.id !== initial.id);

  return [initial, ...normalized].sort((a, b) => getTime(a.createdAt) - getTime(b.createdAt));
};

export const enrichHistoryWithUsers = async (
  items: NormalizedTicketHistory[],
  fallbackUser?: { id?: string; name?: string; email?: string } | null
) => {
  const userIds = Array.from(new Set(items.map((item) => item.userId).filter(Boolean)));
  if (userIds.length === 0) return items;

  const { data } = await supabase.from('users').select('id,name,email').in('id', userIds);
  const usersById = new Map((data || []).map((user: any) => [user.id, user.name || user.email]));

  return items.map((item) => ({
    ...item,
    userName:
      item.userName ||
      usersById.get(item.userId) ||
      (item.userId === fallbackUser?.id ? fallbackUser?.name || fallbackUser?.email : '') ||
      'Sistema',
  }));
};

export const fetchTicketHistory = async (
  ticket: Ticket,
  fallbackUser?: { id?: string; name?: string; email?: string } | null
) => {
  const primary = await supabase
    .from('ticket_history')
    .select('*')
    .eq('ticketId', ticket.id)
    .order('createdAt', { ascending: true });

  if (primary.data && !primary.error) {
    return enrichHistoryWithUsers(normalizeTicketHistory(ticket, primary.data), fallbackUser);
  }

  const fallback = await supabase
    .from('ticket_history')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('created_at', { ascending: true });

  return enrichHistoryWithUsers(normalizeTicketHistory(ticket, fallback.data || []), fallbackUser);
};

export const insertTicketHistory = async ({
  ticket,
  userId,
  status,
  previousStatus,
  comment,
  action,
}: {
  ticket: Ticket;
  userId?: string | null;
  status: TicketStatus;
  previousStatus?: TicketStatus | null;
  comment?: string;
  action?: string;
}) => {
  const now = Date.now();
  const historyAction =
    action ||
    (previousStatus && previousStatus !== status
      ? `Status alterado de ${STATUS_LABELS[previousStatus] || previousStatus} para ${STATUS_LABELS[status] || status}`
      : `Comentario registrado em ${STATUS_LABELS[status] || status}`);
  const actionWithComment = comment ? `${historyAction}. Comentario: ${comment}` : historyAction;

  const attempts: Record<string, any>[] = [
    {
      ticketId: ticket.id,
      userId,
      action: historyAction,
      oldStatus: previousStatus || null,
      newStatus: status,
      comment: comment || '',
      createdAt: now,
    },
    {
      ticketId: ticket.id,
      userId,
      action: historyAction,
      newStatus: status,
      comment: comment || '',
      createdAt: now,
    },
    {
      ticketId: ticket.id,
      userId,
      action: actionWithComment,
      newStatus: status,
      createdAt: now,
    },
    {
      ticketId: ticket.id,
      userId,
      action: actionWithComment,
      newStatus: status,
    },
    {
      ticket_id: ticket.id,
      user_id: userId,
      action: historyAction,
      old_status: previousStatus || null,
      new_status: status,
      comment: comment || '',
      created_at: now,
    },
    {
      ticket_id: ticket.id,
      user_id: userId,
      action: historyAction,
      new_status: status,
      comment: comment || '',
      created_at: now,
    },
    {
      ticket_id: ticket.id,
      user_id: userId,
      action: actionWithComment,
      new_status: status,
      created_at: now,
    },
    {
      ticket_id: ticket.id,
      user_id: userId,
      action: actionWithComment,
      new_status: status,
    },
  ];

  for (const payload of attempts) {
    const { error } = await supabase.from('ticket_history').insert(payload);
    if (!error) {
      return normalizeTicketHistory(ticket, [payload]).find((item) => item.id !== `${ticket.id}-initial`) || null;
    }
    console.warn('Ticket history insert failed, trying fallback shape:', error);
  }

  return null;
};
