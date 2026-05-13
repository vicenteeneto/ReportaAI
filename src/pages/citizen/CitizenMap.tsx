import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { ArrowLeft, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

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

export function CitizenMap() {
  const navigate = useNavigate();
  const { tickets, categories } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const neighborhoods = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.neighborhood] = (counts[t.neighborhood] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    let filtered = tickets;
    if (selectedNeighborhood) {
      filtered = filtered.filter(t => t.neighborhood === selectedNeighborhood);
    }
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory);
    }
    return filtered;
  }, [tickets, selectedNeighborhood, selectedCategory]);

  const getPinColor = (categoryColor: string) => {
    if (categoryColor.includes('orange')) return '#f97316';
    if (categoryColor.includes('yellow')) return '#eab308';
    if (categoryColor.includes('green')) return '#16a34a';
    if (categoryColor.includes('emerald')) return '#059669';
    if (categoryColor.includes('amber')) return '#d97706';
    if (categoryColor.includes('blue')) return '#1d4ed8';
    if (categoryColor.includes('purple')) return '#9333ea';
    if (categoryColor.includes('red')) return '#dc2626';
    return '#475569';
  };

  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-[60px])] md:h-screen bg-slate-900 relative overflow-hidden font-sans">
        <MapContainer center={[-16.4672, -54.6383]} zoom={13} className="absolute inset-0 z-0" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController tickets={filteredTickets} />
          {filteredTickets.map(ticket => {
            const cat = categories.find(c => c.id === ticket.categoryId);
            if (!cat) return null;
            return (
              <Marker 
                key={ticket.id} 
                position={[ticket.latitude, ticket.longitude]} 
                icon={createIcon(getPinColor(cat.color))}
                eventHandlers={{
                  click: () => setSelectedTicket(ticket),
                }}
              />
            );
          })}
        </MapContainer>

        <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            {/* Title Box */}
            <div className="bg-white border border-slate-200 rounded p-4 shadow-lg pointer-events-auto w-full md:w-80 shrink-0 max-h-[85vh] flex flex-col">
              <div>
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors mb-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
                </button>
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Mapa de Ocorrências</h2>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight mb-4">Visão georreferenciada de chamados por região em Rondonópolis.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold transition-colors ${
                    selectedCategory === null 
                      ? 'bg-slate-100 text-[#1E3A8A]' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  TODOS OS PROBLEMAS
                </button>
                {categories.map(cat => {
                  const count = tickets.filter(t => t.categoryId === cat.id && (!selectedNeighborhood || t.neighborhood === selectedNeighborhood)).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors ${
                        selectedCategory === cat.id 
                          ? 'bg-slate-100 text-[#1E3A8A] font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-2.5 h-2.5 rounded-full ${cat.color.replace('bg-', 'bg-')} shadow-sm shrink-0`} style={{backgroundColor: getPinColor(cat.color)}} />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Neighborhood Cards */}
            <div className="flex-1 w-full overflow-x-auto pb-4 md:pb-0 -mb-4 md:mb-0 flex gap-3 pointer-events-auto snap-x no-scrollbar">
              <button
                onClick={() => {
                  setSelectedNeighborhood(null);
                  setSelectedTicket(null);
                }}
                className={`snap-start shrink-0 min-w-[120px] p-3 rounded-lg border shadow-sm text-left transition-all flex flex-col justify-center
                  ${selectedNeighborhood === null ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white ring-2 ring-blue-300 ring-offset-1' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <span className={`text-2xl font-bold ${selectedNeighborhood === null ? 'text-white' : 'text-slate-900'}`}>{tickets.length}</span>
                <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-wider truncate w-full ${selectedNeighborhood === null ? 'text-blue-100' : 'text-slate-500'}`}>Toda Cidade</span>
              </button>
              {neighborhoods.map(n => (
                <button
                  key={n.name}
                  onClick={() => {
                    setSelectedNeighborhood(selectedNeighborhood === n.name ? null : n.name);
                    setSelectedTicket(null);
                  }}
                  className={`snap-start shrink-0 min-w-[140px] max-w-[160px] p-3 rounded-lg border shadow-sm text-left transition-all flex flex-col justify-center relative overflow-hidden
                    ${selectedNeighborhood === n.name ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white ring-2 ring-blue-300 ring-offset-1' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <MapPin className={`absolute right-2 top-2 opacity-10 w-8 h-8 ${selectedNeighborhood === n.name ? 'text-white' : 'text-slate-900'}`} />
                  <span className={`text-2xl font-bold ${selectedNeighborhood === n.name ? 'text-white' : 'text-slate-900'}`}>{n.count}</span>
                  <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-wider truncate w-full relative z-10 ${selectedNeighborhood === n.name ? 'text-blue-100' : 'text-slate-500'}`} title={n.name}>{n.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Selected Ticket Card */}
        {selectedTicket && (
          <div className="absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-80 bg-white rounded shadow-2xl border border-slate-200 z-20 animate-in slide-in-from-bottom-8 overflow-hidden flex flex-col pointer-events-auto">
            {selectedTicket.photoUrl && (
              <div className="h-28 w-full border-b border-slate-100">
                <img src={selectedTicket.photoUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <div className="flex justify-between items-start mb-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest">{selectedTicket.protocol}</span>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{selectedTicket.title}</h3>
              <div className="flex justify-between items-end mt-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 truncate max-w-[60%]">{selectedTicket.neighborhood}</p>
                <p className="text-[9px] text-slate-400 font-mono">{format(new Date(selectedTicket.createdAt), "dd/MM/yyyy")}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                &times;
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
