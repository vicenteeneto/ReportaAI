import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';

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
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden font-sans text-slate-900">
        <MapContainer center={[-16.4672, -54.6383]} zoom={13} className="absolute inset-0 z-0" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
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

        {/* Top Header - Compact for Mobile */}
        <div className="absolute top-0 left-0 right-0 z-10 p-3 md:p-4 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="pointer-events-auto">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#1E3A8A] transition-colors border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                <span className="hidden xs:inline">Retornar</span>
              </button>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1E3A8A] border border-[#1E3A8A]/20 md:hidden"
            >
              {showFilters ? <X className="w-3.5 h-3.5" /> : <Filter className="w-3.5 h-3.5" />}
              <span>Filtros</span>
            </button>
          </div>

          <div className="mt-2 hidden md:block w-80 pointer-events-auto">
            <div className="bg-white border border-slate-200 rounded p-4 shadow-lg flex flex-col max-h-[70vh]">
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Mapa de Ocorrências</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight mb-4">Visão georreferenciada de chamados por região em Rondonópolis.</p>
              
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
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0`} style={{backgroundColor: getPinColor(cat.color)}} />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="absolute inset-0 bg-black/40 z-30 md:hidden"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col md:hidden"
              >
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3" />
                <div className="px-5 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Categorias</h3>
                  <p className="text-[10px] text-slate-500">Filtre por tipo de ocorrência</p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-1">
                  <button
                    onClick={() => { setSelectedCategory(null); setShowFilters(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
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
                        onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); setShowFilters(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id 
                            ? 'bg-slate-100 text-[#1E3A8A] font-bold' 
                            : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-3 h-3 rounded-full shadow-sm shrink-0`} style={{backgroundColor: getPinColor(cat.color)}} />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Neighborhood Overlay - Bottom for Mobile, Top/Center for Desktop */}
        <div className={`absolute left-0 right-0 z-20 pointer-events-none transition-all duration-300 ${selectedTicket ? 'bottom-40 md:bottom-auto md:top-24' : 'bottom-6 md:bottom-auto md:top-24'}`}>
           <div className={`px-4 md:px-0 md:ml-[340px] flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto snap-x`}>
              <button
                onClick={() => {
                  setSelectedNeighborhood(null);
                  setSelectedTicket(null);
                }}
                className={`snap-start shrink-0 h-14 min-w-[100px] px-4 rounded-xl border shadow-lg text-left transition-all flex items-center gap-3
                  ${selectedNeighborhood === null ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white ring-2 ring-[#1E3A8A]/30 ring-offset-1' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <div className="flex flex-col">
                  <span className={`text-lg font-bold leading-none ${selectedNeighborhood === null ? 'text-white' : 'text-slate-900'}`}>{tickets.length}</span>
                  <span className={`text-[8px] sm:text-[9px] mt-0.5 font-bold uppercase tracking-wider truncate max-w-[80px] ${selectedNeighborhood === null ? 'text-blue-100' : 'text-slate-500'}`}>Toda Cidade</span>
                </div>
              </button>

              {neighborhoods.map(n => (
                <button
                  key={n.name}
                  onClick={() => {
                    setSelectedNeighborhood(selectedNeighborhood === n.name ? null : n.name);
                    setSelectedTicket(null);
                  }}
                  className={`snap-start shrink-0 h-14 min-w-[120px] px-4 rounded-xl border shadow-lg text-left transition-all flex items-center gap-3
                    ${selectedNeighborhood === n.name ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white ring-2 ring-[#1E3A8A]/30 ring-offset-1' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 ${selectedNeighborhood === n.name ? 'text-blue-200' : 'text-slate-400'}`} />
                  <div className="flex flex-col min-w-0">
                    <span className={`text-lg font-bold leading-none ${selectedNeighborhood === n.name ? 'text-white' : 'text-slate-900'}`}>{n.count}</span>
                    <span className={`text-[8px] sm:text-[9px] mt-0.5 font-bold uppercase tracking-wider truncate max-w-[100px] ${selectedNeighborhood === n.name ? 'text-blue-100' : 'text-slate-500'}`} title={n.name}>{n.name}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>
        
        {/* Selected Ticket Card */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="relative">
                {selectedTicket.photoUrl && (
                  <div className="h-32 w-full">
                    <img src={selectedTicket.photoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <button onClick={() => setSelectedTicket(null)} className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-lg backdrop-blur-sm transition-colors">
                  &times;
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{selectedTicket.protocol}</span>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-snug mb-3 line-clamp-2">{selectedTicket.title}</h3>
                
                <div className="flex items-center justify-between h-8 border-t border-slate-50 pt-2 shrink-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 truncate">{selectedTicket.neighborhood}</p>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono shrink-0">{format(new Date(selectedTicket.createdAt), "dd/MM/yyyy")}</p>
                </div>

                <div className="mt-3">
                  <button 
                    onClick={() => navigate(`/citizen/tickets/${selectedTicket.id}`)}
                    className="w-full py-2 bg-[#1E3A8A] text-white rounded-lg text-xs font-bold hover:bg-[#152a61] transition-colors"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
