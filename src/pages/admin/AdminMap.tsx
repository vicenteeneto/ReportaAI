import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Filter, X, MapPin } from 'lucide-react';
import { Ticket } from '../../data/types';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AdminTicketDetailsModal } from '../../components/admin/AdminTicketDetailsModal';
import { getTicketSlaInfo } from '../../lib/sla';

function MapController({ tickets }: { tickets: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (tickets.length === 0) return;
    const bounds = L.latLngBounds(tickets.map(t => [t.latitude, t.longitude]));
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5, maxZoom: 16 });
    }
  }, [tickets, map]);
  return null;
}

export function AdminMap() {
  const { tickets, categories, cities } = useAppContext();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState('');

  const cityFilteredTickets = useMemo(() => {
    return selectedCity ? tickets.filter(t => t.cityId === selectedCity) : tickets;
  }, [tickets, selectedCity]);

  const neighborhoods = useMemo(() => {
    const counts: Record<string, number> = {};
    cityFilteredTickets.forEach(t => {
      counts[t.neighborhood] = (counts[t.neighborhood] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [cityFilteredTickets]);

  const filteredTickets = useMemo(() => {
    let filtered = cityFilteredTickets;
    if (selectedNeighborhood) {
      filtered = filtered.filter(t => t.neighborhood === selectedNeighborhood);
    }
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory);
    }
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (priorityFilter) {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    if (slaFilter === 'overdue') {
      filtered = filtered.filter(t => getTicketSlaInfo(t).overdue);
    }
    if (slaFilter === 'due_soon') {
      filtered = filtered.filter(t => getTicketSlaInfo(t).dueSoon);
    }
    return filtered;
  }, [cityFilteredTickets, selectedNeighborhood, selectedCategory, statusFilter, priorityFilter, slaFilter]);

  const validGeoTickets = useMemo(() => {
    return filteredTickets.filter(t => Number.isFinite(Number(t.latitude)) && Number.isFinite(Number(t.longitude)));
  }, [filteredTickets]);

  // Helper to map color string to hex for inline styles
  const getPinColor = (categoryColor: string) => {
    if (categoryColor.includes('orange')) return '#f97316';
    if (categoryColor.includes('yellow')) return '#eab308';
    if (categoryColor.includes('green')) return '#22c55e';
    if (categoryColor.includes('emerald')) return '#059669';
    if (categoryColor.includes('amber')) return '#d97706';
    if (categoryColor.includes('blue')) return '#3b82f6';
    if (categoryColor.includes('purple')) return '#a855f7';
    if (categoryColor.includes('red')) return '#ef4444';
    return '#64748b';
  };

  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mapa de Ocorrências</h2>
        <div className="flex items-center gap-2">
          <select
            className="border border-slate-300 rounded p-2 text-sm bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedNeighborhood(null);
              setSelectedTicket(null);
            }}
          >
            <option value="">Todas as Cidades</option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button variant="outline" icon={Filter} className="shrink-0" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            Filtros Avançados
          </Button>
        </div>
      </div>

      {showAdvancedFilters && (
        <Card className="p-4 border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <label className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status
              <select className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-normal normal-case tracking-normal" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Todos os status</option>
                <option value="received">Recebido</option>
                <option value="triage">Triagem</option>
                <option value="forwarded">Encaminhado</option>
                <option value="analyzing">Em Análise</option>
                <option value="scheduled">Agendado</option>
                <option value="in_progress">Em Execução</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Finalizado</option>
                <option value="rejected">Indeferido</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Prioridade
              <select className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-normal normal-case tracking-normal" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="">Todas as prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
              SLA
              <select className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-normal normal-case tracking-normal" value={slaFilter} onChange={(e) => setSlaFilter(e.target.value)}>
                <option value="">Todos os prazos</option>
                <option value="overdue">Atrasados</option>
                <option value="due_soon">Vencendo hoje</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setSlaFilter('');
                setSelectedCategory(null);
                setSelectedNeighborhood(null);
              }}>
                Limpar filtros
              </Button>
              <Button className="w-full" onClick={() => setShowAdvancedFilters(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Neighborhood Cards */}
      <div className="w-full overflow-x-auto pb-2 flex gap-3 snap-x no-scrollbar">
        <button
          onClick={() => {
            setSelectedNeighborhood(null);
            setSelectedTicket(null);
          }}
          className={`snap-start shrink-0 min-w-[140px] p-3 rounded-lg border shadow-sm text-left transition-all flex flex-col justify-center
            ${selectedNeighborhood === null ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
        >
          <span className={`text-2xl font-bold ${selectedNeighborhood === null ? 'text-white' : 'text-slate-900'}`}>{cityFilteredTickets.length}</span>
          <span className={`text-xs mt-0.5 font-bold uppercase tracking-wider truncate w-full ${selectedNeighborhood === null ? 'text-slate-300' : 'text-slate-500'}`}>Toda Cidade</span>
        </button>
        {neighborhoods.map(n => (
          <button
            key={n.name}
            onClick={() => {
              setSelectedNeighborhood(selectedNeighborhood === n.name ? null : n.name);
              setSelectedTicket(null);
            }}
            className={`snap-start shrink-0 min-w-[160px] max-w-[180px] p-3 rounded-lg border shadow-sm text-left transition-all flex flex-col justify-center relative overflow-hidden
              ${selectedNeighborhood === n.name ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <MapPin className={`absolute right-2 top-2 opacity-10 w-8 h-8 ${selectedNeighborhood === n.name ? 'text-white' : 'text-slate-900'}`} />
            <span className={`text-2xl font-bold ${selectedNeighborhood === n.name ? 'text-white' : 'text-slate-900'}`}>{n.count}</span>
            <span className={`text-xs mt-0.5 font-bold uppercase tracking-wider truncate w-full relative z-10 ${selectedNeighborhood === n.name ? 'text-slate-300' : 'text-slate-500'}`} title={n.name}>{n.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex">
        {/* Categories Sidebar */}
        <div className="w-80 max-w-[42%] bg-white border-r border-slate-200 flex flex-col z-20 overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tipos de Problema</h3>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === null 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos os Problemas
            </button>
            {categories.map(cat => {
              const count = cityFilteredTickets.filter(t => t.categoryId === cat.id && (!selectedNeighborhood || t.neighborhood === selectedNeighborhood)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`w-full flex items-start justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-slate-100 text-slate-900 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0 text-left">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.color.replace('bg-', 'bg-')} shadow-sm shrink-0 mt-1`} style={{backgroundColor: getPinColor(cat.color)}} />
                    <span className="leading-snug whitespace-normal break-words">{cat.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Container */}
        <MapContainer center={[-16.4672, -54.6383]} zoom={13} className="relative flex-1 w-full h-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController tickets={validGeoTickets} />
          {validGeoTickets.map(ticket => {
            const cat = categories.find(c => c.id === ticket.categoryId);
            if (!cat) return null;

            return (
              <Marker 
                key={ticket.id} 
                position={[Number(ticket.latitude), Number(ticket.longitude)]} 
                icon={createIcon(getPinColor(cat.color))}
                eventHandlers={{
                  click: () => setSelectedTicket(ticket),
                }}
              />
            );
          })}
        </MapContainer>

        {/* Side Panel for Details */}
        {selectedTicket && (
          <div className="w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right-4">
            <div className="p-4 border-b border-slate-100 flex justify-between items-start">
              <h3 className="font-bold text-slate-800">Detalhes do Local</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedTicket.photoUrl && (
                <img src={selectedTicket.photoUrl.split(',')[0]} alt="Local" className="w-full h-40 object-cover rounded-lg" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{selectedTicket.protocol}</p>
                <h4 className="font-bold text-lg leading-tight mt-1">{selectedTicket.title}</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedTicket.status} />
                <PriorityBadge priority={selectedTicket.priority} />
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getTicketSlaInfo(selectedTicket).overdue ? 'bg-red-100 text-red-700' : getTicketSlaInfo(selectedTicket).dueSoon ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {getTicketSlaInfo(selectedTicket).label}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <span className="block text-xs text-slate-500">Endereço</span>
                  <span className="text-sm font-medium">{selectedTicket.address}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Bairro</span>
                  <span className="text-sm font-medium">{selectedTicket.neighborhood}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={() => setShowFullDetails(true)}>Ver Chamado Completo</Button>
                <Button variant="outline" className="w-full">Atribuir Equipe</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFullDetails && selectedTicket && (
        <AdminTicketDetailsModal 
          ticket={selectedTicket} 
          onClose={() => setShowFullDetails(false)} 
        />
      )}
    </div>
  );
}
