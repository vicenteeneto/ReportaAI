import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { ArrowLeft, Database, Filter, Loader2, XCircle } from 'lucide-react';
import { Ticket } from '../../data/types';
import { supabase } from '../../lib/supabase';

export function CitizenTickets() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, tickets, categories, departments, loading, updateTicketStatus } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Read initial filter from location state if available
  const initialFilter = location.state?.filter || 'all';
  const [filter, setFilter] = useState<string>(initialFilter);


  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  const allMyTickets = tickets.filter(t => t.userId === currentUser?.id);
  
  const myTickets = allMyTickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return t.status !== 'received' && t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'rejected';
    if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const confirmCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelTicket = async () => {
    if (!selectedTicket) return;
    
    setIsCancelling(true);
    try {
      await updateTicketStatus(selectedTicket.id, 'rejected');
      setSelectedTicket({ ...selectedTicket, status: 'rejected' });
      setShowCancelConfirm(false);
    } catch (e: any) {
      alert('Erro ao cancelar: ' + e.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (selectedTicket) {
    const cat = categories.find(c => c.id === selectedTicket.categoryId);
    const dep = departments.find(d => d.id === selectedTicket.departmentId);

    return (
      <div className="p-4 md:p-6 lg:max-w-3xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 font-sans">
        <button 
          onClick={() => setSelectedTicket(null)}
          className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
        </button>

        <div className="space-y-4">
          <div className="flex justify-between items-start pt-2 border-t border-slate-200">
            <div className="mt-2">
              <p className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest">{selectedTicket.protocol}</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">{selectedTicket.title}</h2>
            </div>
            <div className="mt-2">
              <StatusBadge status={selectedTicket.status} />
            </div>
          </div>

          {selectedTicket.photoUrl && (
            <div className="relative">
              <img 
                src={selectedTicket.photoUrl} 
                alt="Evidência fotográfica" 
                className="w-full h-48 md:h-64 object-cover rounded shadow-sm border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(selectedTicket.photoUrl, '_blank')}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement?.classList.add('broken-img-container');
                }}
              />
              <style>{`
                .broken-img-container::after {
                  content: "Evidência não disponível ⚠️";
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  height: 12rem;
                  background-color: #f1f5f9;
                  border: 1px dashed #cbd5e1;
                  border-radius: 0.25rem;
                  color: #64748b;
                  font-size: 0.875rem;
                  font-weight: 500;
                }
                @media (min-width: 768px) {
                  .broken-img-container::after { height: 16rem; }
                }
              `}</style>
            </div>
          )}

          <Card className="rounded shadow-sm">
            <CardContent className="p-0 divide-y divide-slate-100">
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Classificação</span>
                  <span className="text-xs font-bold text-slate-900">{cat?.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Registro</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Localização</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug">{selectedTicket.address} - {selectedTicket.neighborhood}</span>
                </div>
                 <div className="col-span-2">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Órgão Direcionado</span>
                  <span className="text-xs font-bold text-slate-900">{dep?.name}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-b">
                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Detalhamento Técnico</span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Action */}
          {['received', 'triage'].includes(selectedTicket.status) && (
            <div className="pt-2">
              <button 
                onClick={confirmCancel}
                disabled={isCancelling}
                className="w-full py-3 border border-red-200 text-red-600 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancelar Chamado
              </button>
            </div>
          )}

          {/* Timeline Mock */}
          <div className="pt-2 px-2 pb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Evolução do Chamado</h3>
            <div className="relative border-l-2 border-slate-200 ml-[9px] space-y-6">
              <div className="relative -left-[9px] flex gap-4 items-start">
                 <div className="w-4 h-4 rounded bg-[#1E3A8A] ring-[3px] ring-slate-50 mt-1"></div>
                 <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Registro Inicial</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                 </div>
              </div>
              {selectedTicket.status !== 'received' && (
                <div className="relative -left-[9px] flex gap-4 items-start">
                   <div className="w-4 h-4 rounded bg-orange-500 ring-[3px] ring-slate-50 mt-1"></div>
                   <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Em Procedimento</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Distribuído para {dep?.name || 'análise'}</p>
                   </div>
                </div>
              )}
               {['resolved', 'closed'].includes(selectedTicket.status) && (
                <div className="relative -left-[9px] flex gap-4 items-start">
                   <div className="w-4 h-4 rounded bg-green-500 ring-[3px] ring-slate-50 mt-1"></div>
                   <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Finalização</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Auditoria técnica confirmou solução.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Cancelar Chamado</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Tem certeza que deseja cancelar esta ocorrência? Esta ação não poderá ser desfeita.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 font-bold text-xs" 
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isCancelling}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs" 
                    onClick={handleCancelTicket}
                    isLoading={isCancelling}
                  >
                    Confirmar Cancelamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:max-w-4xl mx-auto space-y-4 font-sans">
      <button 
        type="button"
        onClick={() => navigate('/citizen')}
        className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
      </button>

      <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-2 pt-2">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Meus Registros</h2>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando seus registros...</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
            {(['all', 'in_progress', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  filter === f 
                    ? 'bg-[#1E3A8A] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'in_progress' ? 'Em Andamento' : 'Resolvidos'}
              </button>
            ))}
          </div>

          {myTickets.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center bg-slate-50 border border-slate-200 border-dashed rounded">
              <Database className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">Base vazia</p>
              <p className="text-[10px] font-medium text-slate-500">Sem ocorrências ativas ou concluídas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map(ticket => (
                <Card 
                  key={ticket.id} 
                  className="cursor-pointer hover:border-[#1E3A8A] transition-colors rounded shadow-sm border-slate-200"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="px-4 py-4">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold text-[#1E3A8A] tracking-widest uppercase">{ticket.protocol}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">{ticket.title}</h3>
                    <p className="text-xs text-slate-500 truncate mb-3">{ticket.description}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{ticket.neighborhood}</span>
                      <span className="font-mono">{format(new Date(ticket.createdAt), "dd/MM/yyyy")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
