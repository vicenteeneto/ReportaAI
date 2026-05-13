import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { Search, Filter, Eye } from 'lucide-react';
import { format } from 'date-fns';

export function AdminTickets() {
  const { tickets, categories, departments } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.protocol.includes(searchTerm) || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestão de Chamados</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{tickets.length} registros no total</p>
        </div>
        <Button size="sm">Exportar Relatório</Button>
      </div>

      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 bg-slate-50 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <Input 
              placeholder="Buscar por protocolo ou título..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Select className="w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Status (Todos)</option>
              <option value="received">Recebido</option>
              <option value="in_progress">Em Execução</option>
              <option value="resolved">Resolvido</option>
            </Select>
            <Button variant="outline" icon={Filter}>Filtros</Button>
          </div>
        </CardHeader>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-2 uppercase">Protocolo</th>
                <th className="px-4 py-2 uppercase">Categoria</th>
                <th className="px-4 py-2 uppercase">Bairro</th>
                <th className="px-4 py-2 uppercase">Abertura</th>
                <th className="px-4 py-2 uppercase">Prioridade</th>
                <th className="px-4 py-2 uppercase">Status</th>
                <th className="px-4 py-2 uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(ticket => {
                const category = categories.find(c => c.id === ticket.categoryId);
                
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[10px] font-bold text-slate-500">{ticket.protocol}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{category?.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{ticket.neighborhood}</td>
                    <td className="px-4 py-2.5 text-slate-500">{format(new Date(ticket.createdAt), 'dd/MM/yy')}</td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-2.5 text-right w-16">
                      <Button variant="ghost" size="sm" icon={Eye} className="h-6 w-6 p-0" title="Ver Detalhes" />
                    </td>
                  </tr>
                )
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
