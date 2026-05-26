import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Database, ExternalLink, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { useAppContext } from '../../context/AppContext';
import { Ticket } from '../../data/types';
import { fetchTicketHistory, NormalizedTicketHistory, STATUS_LABELS } from '../../lib/ticketHistory';

const cleanHistoryText = (text?: string) => {
  if (!text) return '';
  return text
    .replace(/Evidencia de resolucao:\s*https:\/\/[^\s]+/gi, 'Evidencia de resolucao anexada.')
    .replace(/Coment[aá]rio:\s*Evidencia de resolucao anexada\./gi, 'Evidencia de resolucao anexada.')
    .trim();
};

const extractEvidenceUrl = (text?: string) => text?.match(/https:\/\/[^\s]+/i)?.[0];

export function CitizenTickets() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeTicketId } = useParams();
  const { currentUser, tickets, categories, departments, loading } = useAppContext();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(location.state?.filter || 'all');
  const [ticketHistory, setTicketHistory] = useState<NormalizedTicketHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  useEffect(() => {
    if (!routeTicketId || tickets.length === 0) return;
    const ticket = tickets.find(t => t.id === routeTicketId && t.userId === currentUser?.id);
    if (ticket) setSelectedTicket(ticket);
  }, [routeTicketId, tickets, currentUser?.id]);

  useEffect(() => {
    if (!selectedTicket) {
      setTicketHistory([]);
      return;
    }

    let isMounted = true;
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const history = await fetchTicketHistory(selectedTicket, currentUser);
        if (isMounted) setTicketHistory(history);
      } catch (error) {
        console.error('Error loading ticket history:', error);
        if (isMounted) setTicketHistory([]);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedTicket, currentUser]);

  const allMyTickets = tickets.filter(t => t.userId === currentUser?.id);

  const myTickets = allMyTickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'in_progress') return !['received', 'resolved', 'closed'].includes(t.status);
    if (filter === 'resolved') return ['resolved', 'closed'].includes(t.status);
    return true;
  });

  if (selectedTicket) {
    const cat = categories.find(c => c.id === selectedTicket.categoryId);
    const dep = departments.find(d => d.id === selectedTicket.departmentId);
    const citizenPhotos = (selectedTicket.photoUrl || '').split(',').map(url => url.trim()).filter(Boolean);
    const resolutionEvidenceUrl = selectedTicket.resolvedPhotoUrl || ticketHistory
      .map((entry) => extractEvidenceUrl(entry.comment) || extractEvidenceUrl(entry.action))
      .find(Boolean);

    return (
      <div className="px-3 py-4 sm:p-4 md:p-6 lg:max-w-3xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 font-sans">
        <button
          type="button"
          onClick={() => {
            setSelectedTicket(null);
            if (routeTicketId) navigate('/citizen/tickets', { replace: true });
          }}
          className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
        </button>

        <div className="space-y-4">
          <div className="flex justify-between items-start gap-3 pt-2 border-t border-slate-200">
            <div className="mt-2 min-w-0">
              <p className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest">{selectedTicket.protocol}</p>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 tracking-tight leading-tight break-words">{selectedTicket.title}</h2>
            </div>
            <div className="mt-2 shrink-0">
              <StatusBadge status={selectedTicket.status} />
            </div>
          </div>

          {citizenPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidencia do cidadao</p>
              <button
                type="button"
                onClick={() => setSelectedImage(citizenPhotos[0])}
                className="relative w-full h-48 md:h-64 overflow-hidden rounded shadow-sm border border-slate-200 bg-slate-100 group"
              >
                <img
                  src={citizenPhotos[0]}
                  alt="Evidencia fotografica"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    const fallback = document.createElement('span');
                    fallback.className = 'text-sm font-semibold text-slate-500';
                    fallback.textContent = 'Evidencia nao disponivel';
                    e.currentTarget.parentElement?.appendChild(fallback);
                  }}
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
                      className="shrink-0 w-16 h-12 rounded overflow-hidden border border-slate-200 bg-slate-100"
                      title={`Abrir foto ${index + 1}`}
                    >
                      <img src={url} alt={`Anexo ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {resolutionEvidenceUrl && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidencia de resolucao</p>
              <button
                type="button"
                onClick={() => setSelectedImage(resolutionEvidenceUrl)}
                className="relative w-full h-48 md:h-64 overflow-hidden rounded shadow-sm border border-emerald-200 bg-emerald-50 group"
              >
                <img
                  src={resolutionEvidenceUrl}
                  alt="Evidencia de resolucao"
                  className="w-full h-full object-cover"
                />
                <span className="absolute right-2 top-2 bg-white/90 text-slate-700 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </button>
            </div>
          )}

          <Card className="rounded shadow-sm">
            <CardContent className="p-0 divide-y divide-slate-100">
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Classificacao</span>
                  <span className="text-xs font-bold text-slate-900">{cat?.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Registro</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Localizacao</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug">{selectedTicket.address} - {selectedTicket.neighborhood}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">Orgao direcionado</span>
                  <span className="text-xs font-bold text-slate-900">{dep?.name}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-b">
                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Detalhamento tecnico</span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2 px-1 sm:px-2 pb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Historico do Chamado</h3>
            <div className="relative border-l-2 border-slate-200 ml-[9px] space-y-5">
              {loadingHistory ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                  Carregando historico...
                </div>
              ) : ticketHistory.length > 0 ? (
                ticketHistory.map((entry, index) => (
                  <div key={entry.id} className="relative -left-[9px] flex gap-3 sm:gap-4 items-start">
                    <div className={`w-4 h-4 rounded ring-[3px] ring-slate-50 mt-1 ${
                      index === 0 ? 'bg-[#1E3A8A]' : ['resolved', 'closed'].includes(entry.newStatus || '') ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1 min-w-0 rounded-xl bg-white border border-slate-100 px-3 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-tight leading-snug break-words">
                          {cleanHistoryText(entry.action)}
                        </p>
                        {entry.userName && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {entry.userName}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                      {entry.oldStatus && entry.newStatus && (
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          De {STATUS_LABELS[entry.oldStatus] || entry.oldStatus} para {STATUS_LABELS[entry.newStatus] || entry.newStatus}
                        </p>
                      )}
                      {entry.comment && (
                        <div className="mt-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
                          <p className="text-xs text-slate-600 whitespace-pre-wrap break-words">{cleanHistoryText(entry.comment)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Nenhuma movimentacao registrada.</p>
              )}
            </div>
          </div>
        </div>

        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute right-4 top-4 text-white/80 hover:text-white" onClick={() => setSelectedImage(null)}>
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="Imagem do chamado" className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl" />
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
                type="button"
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
              <p className="text-[10px] font-medium text-slate-500">Sem ocorrencias ativas ou concluidas.</p>
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
                      <span className="font-mono">{format(new Date(ticket.createdAt), 'dd/MM/yyyy')}</span>
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
