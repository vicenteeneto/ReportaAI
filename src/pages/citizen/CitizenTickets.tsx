import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { ArrowLeft, Database, Loader2, XCircle, Pencil, CheckCircle2 } from 'lucide-react';
import { Ticket } from '../../data/types';
import { supabase } from '../../lib/supabase';

export function CitizenTickets() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, tickets, categories, departments, loading, updateTicketStatus, updateTicket } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', address: '', neighborhood: '' });
  
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
    if (filter === 'in_progress') return t.status !== 'received' && t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'rejected' && t.status !== 'canceled';
    if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const confirmCancel = () => { setShowCancelConfirm(true); };

  const openEdit = () => {
    if (!selectedTicket) return;
    setEditForm({
      title: selectedTicket.title,
      description: selectedTicket.description,
      address: selectedTicket.address,
      neighborhood: selectedTicket.neighborhood
    });
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedTicket) return;
    setIsEditing(true);
    try {
      // Build a human-readable diff of what changed
      const diffs: string[] = [];
      if (editForm.title !== selectedTicket.title)
        diffs.push(`Título: "${selectedTicket.title}" → "${editForm.title}"`);
      if (editForm.description !== selectedTicket.description)
        diffs.push(`Descrição atualizada`);
      if (editForm.address !== selectedTicket.address)
        diffs.push(`Endereço: "${selectedTicket.address}" → "${editForm.address}"`);
      if (editForm.neighborhood !== selectedTicket.neighborhood)
        diffs.push(`Bairro: "${selectedTicket.neighborhood}" → "${editForm.neighborhood}"`);

      if (diffs.length === 0) { setShowEditModal(false); return; }

      const changes: Partial<Ticket> = {
        title: editForm.title,
        description: editForm.description,
        address: editForm.address,
        neighborhood: editForm.neighborhood
      };

      await updateTicket(selectedTicket.id, changes, diffs.join(' | '));

      // Update local selected ticket
      setSelectedTicket(prev => prev ? { ...prev, ...changes } : prev);
      setEditSuccess(true);
      setTimeout(() => setShowEditModal(false), 1500);
    } catch (e: any) {
      alert('Erro ao salvar alterações: ' + e.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!selectedTicket) return;
    
    setIsCancelling(true);
    try {
      await updateTicketStatus(selectedTicket.id, 'canceled');
      setSelectedTicket({ ...selectedTicket, status: 'canceled' });
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
                onClick={() => setViewingImage(selectedTicket.photoUrl || null)}
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {/* Edit button: allowed for most statuses except resolved/closed/rejected/canceled */}
            {!['resolved', 'closed', 'rejected', 'canceled', 'duplicated'].includes(selectedTicket.status) && (
              <button
                onClick={openEdit}
                className="flex-1 py-3 border border-[#1E3A8A]/30 text-[#1E3A8A] rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar Chamado
              </button>
            )}
            {/* Cancel button: only for early statuses */}
            {['received', 'triage'].includes(selectedTicket.status) && (
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="flex-1 py-3 border border-red-200 text-red-600 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancelar
              </button>
            )}
          </div>

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

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTicket?.protocol}</p>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">Editar Chamado</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {editSuccess ? (
                <div className="p-8 flex flex-col items-center text-center animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Alterações Salvas!</p>
                  <p className="text-xs text-slate-500 mt-1">As mudanças foram registradas no histórico do chamado.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <p className="text-[10px] text-slate-500 font-medium bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    ⚠️ Todas as alterações ficam registradas no histórico e podem ser visualizadas pelo gestor.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Título</label>
                    <Input
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({...f, title: e.target.value}))}
                      placeholder="Título do chamado"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Descrição</label>
                    <Textarea
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({...f, description: e.target.value}))}
                      className="h-28"
                      placeholder="Descreva o problema em detalhes..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Endereço</label>
                      <Input
                        value={editForm.address}
                        onChange={e => setEditForm(f => ({...f, address: e.target.value}))}
                        placeholder="Rua, número..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Bairro</label>
                      <Input
                        value={editForm.neighborhood}
                        onChange={e => setEditForm(f => ({...f, neighborhood: e.target.value}))}
                        placeholder="Bairro"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 font-bold text-xs h-11" onClick={() => setShowEditModal(false)} disabled={isEditing}>
                      Cancelar
                    </Button>
                    <Button className="flex-1 font-bold text-xs h-11 bg-[#1E3A8A]" onClick={handleEditSubmit} isLoading={isEditing} disabled={isEditing}>
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Image Viewer Modal */}
        {viewingImage && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
            <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
              <button onClick={() => setViewingImage(null)} className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={viewingImage} alt="Fullscreen preview" className="max-w-full max-h-full object-contain rounded" />
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
