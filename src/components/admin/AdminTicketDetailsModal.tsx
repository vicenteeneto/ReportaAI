import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../data/types';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { format } from 'date-fns';
import { X, Clock, MessageSquare, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export function AdminTicketDetailsModal({ ticket, onClose }: Props) {
  const { categories, departments, currentUser } = useAppContext();
  const category = categories.find(c => c.id === ticket.categoryId);
  const department = departments.find(d => d.id === ticket.departmentId);
  const citizenPhotos = (ticket.photoUrl || '').split(',').map(url => url.trim()).filter(Boolean);

  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status as TicketStatus);
  const [resolutionComment, setResolutionComment] = useState('');
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const statusLabels: Record<string, string> = {
    received: 'Recebido',
    triage: 'Triagem',
    forwarded: 'Encaminhado',
    analyzing: 'Em Analise',
    scheduled: 'Agendado',
    in_progress: 'Em Execucao',
    resolved: 'Resolvido',
    closed: 'Finalizado',
    rejected: 'Indeferido',
    duplicated: 'Duplicado',
    waiting_info: 'Pendencia Cidadao',
  };

  const normalizeHistory = (items: any[] = []) => {
    return items
      .map((item) => ({
        id: item.id || `${item.ticketId || item.ticket_id}-${item.createdAt || item.created_at || item.createdat}`,
        ticketId: item.ticketId || item.ticket_id || item.ticketid,
        userId: item.userId || item.user_id || item.userid,
        userName: item.userName || item.user_name || item.username || item.authorName || item.author_name,
        action: item.action || 'Atualizacao do chamado',
        oldStatus: item.oldStatus || item.old_status || item.oldstatus,
        newStatus: item.newStatus || item.new_status || item.newstatus,
        comment: item.comment || item.comments || item.observation || item.observations || '',
        createdAt: item.createdAt || item.created_at || item.createdat || Date.now(),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      const primary = await supabase.from('ticket_history').select('*').eq('ticketId', ticket.id).order('createdAt', { ascending: false });
      if (primary.data && !primary.error) {
        setTicketHistory(normalizeHistory(primary.data));
      } else {
        const fallback = await supabase.from('ticket_history').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: false });
        setTicketHistory(normalizeHistory(fallback.data || []));
      }
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [ticket.id]);

  const saveHistory = async (status: TicketStatus, comment: string) => {
    const action = `Status alterado para ${statusLabels[status] || status}`;
    const userId = currentUser?.id || (await supabase.auth.getUser()).data.user?.id || null;
    const userName = currentUser?.name || currentUser?.email || 'Usuario do sistema';
    const now = Date.now();

    const attempts: Record<string, any>[] = [
      {
        ticketId: ticket.id,
        userId,
        userName,
        action,
        oldStatus: ticket.status,
        newStatus: status,
        comment,
        createdAt: now,
      },
      {
        ticket_id: ticket.id,
        user_id: userId,
        user_name: userName,
        action,
        old_status: ticket.status,
        new_status: status,
        comment,
        created_at: now,
      },
    ];

    for (const payload of attempts) {
      const { error: historyError } = await supabase.from('ticket_history').insert(payload);
      if (!historyError) return normalizeHistory([payload])[0];
      console.warn('Ticket history insert failed, trying fallback shape:', historyError);
    }

    return null;
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError('');
    try {
      let resolvedPhotoUrl = ticket.resolvedPhotoUrl;

      if (newStatus === 'resolved' && resolutionFile) {
        const fileExt = resolutionFile.name.split('.').pop();
        const fileName = `resolutions/${ticket.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('tickets').upload(fileName, resolutionFile, {
          contentType: resolutionFile.type || 'image/jpeg',
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('tickets').getPublicUrl(fileName);
        resolvedPhotoUrl = publicUrl;
      }

      const updatePayload = { 
        status: newStatus,
        resolvedPhotoUrl: resolvedPhotoUrl,
        updatedAt: Date.now()
      };
      const { error: updateError } = await supabase.from('tickets').update(updatePayload).eq('id', ticket.id);
      if (updateError) {
        console.warn('Ticket update failed, trying fallback shape:', updateError);
        const { error: fallbackUpdateError } = await supabase.from('tickets').update({
          status: newStatus,
          resolved_photo_url: resolvedPhotoUrl,
          updated_at: Date.now()
        }).eq('id', ticket.id);
        if (fallbackUpdateError) throw fallbackUpdateError;
      }

      const savedHistory = await saveHistory(newStatus, resolutionComment.trim());
      if (savedHistory) {
        setTicketHistory(prev => normalizeHistory([savedHistory, ...prev]));
      }

      // Update global context if needed - simplified reload for now or just close
      onClose();
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      setError('Nao foi possivel atualizar o chamado. Verifique o anexo e tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-4 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{ticket.protocol}</p>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-[3] space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidência do Cidadão</p>
                {citizenPhotos.length > 0 ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(citizenPhotos[0])}
                      className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group"
                    >
                      <img
                        src={citizenPhotos[0]}
                        alt="Problema"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute right-2 top-2 bg-white/90 text-slate-700 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </button>
                    {citizenPhotos.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {citizenPhotos.map((url, index) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setSelectedImage(url)}
                            className="shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                            title={`Abrir foto ${index + 1}`}
                          >
                            <img src={url} alt={`Anexo ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                    Sem foto anexada
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidência de Resolução</p>
                {ticket.resolvedPhotoUrl ? (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(ticket.resolvedPhotoUrl || null)}
                    className="w-full aspect-video rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 relative"
                  >
                    <img 
                      src={ticket.resolvedPhotoUrl} 
                      alt="Resolução" 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ) : (
                  <div className="w-full aspect-video rounded-xl bg-white border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                    Aguardando resolução
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Detalhes Técnicos
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Relato do Cidadão</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Localização</p>
                    <p className="text-sm font-bold text-slate-800 mb-1">{ticket.address}</p>
                    <p className="text-xs text-slate-500 mb-2">Bairro: {ticket.neighborhood}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Histórico de Tramitação
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-64 overflow-y-auto space-y-4">
                  {loadingHistory ? (
                    <p className="text-xs text-center text-slate-400 py-4">Carregando...</p>
                  ) : ticketHistory.length > 0 ? (
                    ticketHistory.map((h) => (
                      <div key={h.id} className="relative pl-4 pb-3 border-l border-slate-200 last:pb-0">
                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#1E3A8A]"></div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {format(new Date(h.createdAt), 'dd/MM/yy HH:mm')}
                          </p>
                          {h.userName && (
                            <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200">
                              {h.userName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1">
                          {h.action}
                        </p>
                        {h.oldStatus && h.newStatus && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            De {statusLabels[h.oldStatus] || h.oldStatus} para {statusLabels[h.newStatus] || h.newStatus}
                          </p>
                        )}
                        {h.comment && (
                          <div className="mt-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
                            <p className="text-xs text-slate-600 whitespace-pre-wrap">{h.comment}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center text-slate-400 py-4">Nenhuma movimentação registrada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-[1.5] space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Painel de Decisão</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">Status do Atendimento</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">Prioridade</p>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Categoria / Secretaria</p>
                    <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{category?.name}</p>
                    <p className="text-[11px] text-slate-500">{department?.name || 'Sem secretaria'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4 font-sans">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Novo Status</label>
                  <select 
                    className="w-full h-10 px-3 py-2 text-sm rounded-lg border-slate-300 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-slate-800 shadow-sm border"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  >
                    <option value="received">Recebido</option>
                    <option value="triage">Triagem</option>
                    <option value="forwarded">Encaminhado</option>
                    <option value="analyzing">Em Análise</option>
                    <option value="scheduled">Agendado</option>
                    <option value="in_progress">Em Execução</option>
                    <option value="resolved">Resolvido ✅</option>
                    <option value="closed">Finalizado</option>
                    <option value="rejected">Indeferido ❌</option>
                    <option value="waiting_info">Pendência Cidadão</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Observações / Comentários</label>
                  <textarea 
                    className="w-full text-sm rounded-lg border-slate-300 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-white text-slate-800 shadow-sm border p-3 min-h-[80px]"
                    placeholder="Explique a ação tomada..."
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                  />
                </div>

                {newStatus === 'resolved' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Foto da Resolução (PNG/JPG)</label>
                    <label className="w-full border-2 border-dashed border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
                      />
                      {resolutionFile ? (
                        <span className="text-xs font-medium text-emerald-600 truncate max-w-full">
                          {resolutionFile.name}
                        </span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-4 h-4 text-slate-400 mb-1" />
                          <span className="text-[10px] font-bold text-slate-500">Anexar Evidência</span>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {error && (
                  <p className="text-xs border border-red-200 bg-red-50 text-red-700 rounded-lg p-2 font-medium">{error}</p>
                )}

                <Button 
                  className="w-full font-bold uppercase tracking-widest text-xs h-11 shadow-md bg-[#1E3A8A]" 
                  disabled={newStatus === ticket.status && !resolutionComment && !resolutionFile || isUpdating}
                  onClick={handleUpdate}
                  isLoading={isUpdating}
                >
                  Confirmar Atualização
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute right-4 top-4 text-white/80 hover:text-white" onClick={() => setSelectedImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="Imagem do chamado" className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}
