import React from 'react';
import { cn } from '../../lib/utils';
import { TicketStatus, Priority } from '../../data/types';

interface BadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'gray', ...props }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-100 text-[#1E3A8A]',
    green: 'bg-emerald-500 text-white',
    yellow: 'bg-amber-500 text-white',
    red: 'bg-red-500 text-white',
    gray: 'bg-slate-100 text-slate-600 text-slate-600',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-500 text-white',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase font-bold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const map: Record<TicketStatus, { label: string; variant: BadgeProps['variant'] }> = {
    received: { label: 'Recebido', variant: 'gray' },
    triage: { label: 'Em Triagem', variant: 'orange' },
    forwarded: { label: 'Encaminhado', variant: 'purple' },
    analyzing: { label: 'Em Análise', variant: 'yellow' },
    scheduled: { label: 'Programado', variant: 'blue' },
    in_progress: { label: 'Em Execução', variant: 'yellow' },
    resolved: { label: 'Resolvido', variant: 'green' },
    closed: { label: 'Finalizado', variant: 'green' },
    duplicated: { label: 'Duplicado', variant: 'gray' },
    rejected: { label: 'Indeferido', variant: 'red' },
    waiting_info: { label: 'Aguardando Info', variant: 'orange' },
  };

  const config = map[status] || { label: status, variant: 'gray' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const map: Record<Priority, { label: string; variant: BadgeProps['variant'] }> = {
    low: { label: 'Baixa', variant: 'gray' },
    medium: { label: 'Média', variant: 'yellow' },
    high: { label: 'Alta', variant: 'orange' },
    urgent: { label: 'Urgente', variant: 'red' },
  };

  const config = map[priority] || { label: priority, variant: 'gray' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
