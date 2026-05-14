import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../data/types';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { format } from 'date-fns';
import { X, MapPin, Clock, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export function AdminTicketDetailsModal({ ticket, onClose }: Props) {
  const { tickets, categories, departments, updateTicketStatus } = useAppContext();
  const category = categories.find(c => c.id === ticket.categoryId);
  const department = departments.find(d => d.id === ticket.departmentId);

  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status as TicketStatus);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar chamado');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{ticket.protocol}</p>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-[2] space-y-6">
            {ticket.photoUrl && (
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={ticket.photoUrl} alt="Problema" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Descrição do Problema
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Localização
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <p className="text-sm font-medium text-slate-800">{ticket.address}</p>
                <p className="text-sm text-slate-500">Bairro: {ticket.neighborhood}</p>
                <div className="h-40 w-full bg-slate-200 rounded mt-2 flex items-center justify-center text-slate-400 text-xs">
                  {/* We could embed a small static map here later */}
                  [Mapa: {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}]
                </div>
              </div>
            </div>
          </div>

          <div className="flex-[1] space-y-6 md:border-l md:border-slate-100 md:pl-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Informações</p>
              <div className="space-y-4">
                
                {/* Score do Cidadão */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-[#1E3A8A] uppercase tracking-wider font-bold mb-2">Engajamento Cidadão</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="block text-lg font-black text-amber-600">
                        {tickets.filter(t => t.userId === ticket.userId && ['open', 'in_progress'].includes(t.status)).length * 10}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Pts em<br/>Validação</span>
                    </div>
                    <div>
                      <span className="block text-lg font-black text-emerald-600">
                        {tickets.filter(t => t.userId === ticket.userId && t.status === 'resolved').length * 10}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Pts<br/>Validados</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Status Atual</p>
                  <StatusBadge status={ticket.status} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Prioridade</p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Categoria</p>
                  <p className="text-sm font-medium text-slate-800">{category?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Secretaria Resp.</p>
                  <p className="text-sm font-medium text-slate-800">{department?.name || 'Não atribuída'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Abertura</p>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Ações de Gestão
              </p>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Atualizar Status</label>
                <select 
                  className="w-full h-10 px-3 py-2 text-sm rounded-lg border-slate-300 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-slate-800 shadow-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                >
                  <option value="received">Rascunho / Recebido</option>
                  <option value="triage">Em Triagem</option>
                  <option value="forwarded">Encaminhado Sec.</option>
                  <option value="analyzing">Em Análise</option>
                  <option value="scheduled">Agendado</option>
                  <option value="in_progress">Em Execução</option>
                  <option value="resolved">Resolvido</option>
                  <option value="closed">Fechado</option>
                  <option value="duplicated">Duplicado</option>
                  <option value="rejected">Indeferido</option>
                  <option value="waiting_info">Aguardando Cidadão</option>
                </select>

                <Button 
                  className="w-full font-bold uppercase tracking-wide text-xs h-10 mt-2" 
                  disabled={newStatus === ticket.status || isUpdating}
                  onClick={handleUpdate}
                  isLoading={isUpdating}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
