import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { Search, Filter, Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { AdminTicketDetailsModal } from '../../components/admin/AdminTicketDetailsModal';
import { Ticket } from '../../data/types';

export function AdminTickets() {
  const { tickets, categories, departments, currentUser } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom filter handling from state
  const initialFilter = location.state?.filter || '';
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Parse custom filters like 'urgent' or 'in_progress' from dashboard
  useEffect(() => {
    if (location.state?.filter) {
      const f = location.state.filter;
      if (f === 'in_progress') setStatusFilter('in_progress'); // We need to handle this in filter logic
      else if (f === 'resolved') setStatusFilter('resolved');
      else if (f === 'urgent') setStatusFilter('urgent');
      else setStatusFilter('');
    }
  }, [location.state]);

  // Handle direct ticket link via URL
  useEffect(() => {
    if (id && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
  }, [id, tickets]);

  const handleCloseModal = () => {
    setSelectedTicket(null);
    if (id) {
      navigate('/admin/tickets', { replace: true });
    }
  };

  const filteredTickets = tickets.filter(t => {
    // Role-based security: Secretary sees only their department
    const isSecretary = currentUser?.role === 'secretary' || currentUser?.role === 'coordinator';
    const belongsToDept = isSecretary ? t.departmentId === currentUser?.departmentId : true;
    
    const matchesSearch = t.protocol.includes(searchTerm) || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'in_progress') {
      matchesStatus = t.status !== 'received' && t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'rejected';
    } else if (statusFilter === 'urgent') {
      matchesStatus = t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'rejected';
    } else if (statusFilter) {
      matchesStatus = t.status === statusFilter;
    }
    const matchesDept = departmentFilter ? t.departmentId === departmentFilter : true;
    
    return belongsToDept && matchesSearch && matchesStatus && matchesDept;
  });

  const handleExport = () => {
    alert('Relatório gerado com sucesso! Iniciando download...');
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestão de Chamados</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{filteredTickets.length} registros filtrados</p>
        </div>
        <Button size="sm" onClick={handleExport}>Exportar Relatório</Button>
      </div>

      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50 shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <Input 
              placeholder="Buscar por protocolo ou título..." 
              className="pl-8 h-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
             <Select className="w-36 h-9 text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Status (Todos)</option>
              <option value="urgent">Prioridade Crítica</option>
              <option value="received">Recebido</option>
              <option value="triage">Triagem</option>
              <option value="forwarded">Encaminhado</option>
              <option value="analyzing">Em Análise</option>
              <option value="scheduled">Agendado</option>
              <option value="in_progress">Em Execução (Todos)</option>
              <option value="resolved">Resolvido</option>
              <option value="rejected">Indeferido</option>
            </Select>
            <Select 
              className="w-48 h-9 text-xs" 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={currentUser?.role === 'secretary'}
            >
              <option value="">Todas Secretarias</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.acronym} - {d.name}</option>
              ))}
            </Select>
            <Button variant="outline" size="sm" icon={Filter} className="h-9 px-3 text-xs">Filtros</Button>
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
                      <Button variant="ghost" size="sm" icon={Eye} className="h-6 w-6 p-0" title="Ver Detalhes" onClick={() => setSelectedTicket(ticket)} />
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

      {selectedTicket && (
        <AdminTicketDetailsModal 
          ticket={selectedTicket} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}
