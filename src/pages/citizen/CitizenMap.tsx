import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

export function CitizenMap() {
  const navigate = useNavigate();
  const { tickets, categories } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const getPinColor = (categoryColor: string) => {
    if (categoryColor.includes('orange')) return '#f97316';
    if (categoryColor.includes('yellow')) return '#eab308';
    if (categoryColor.includes('green')) return '#16a34a';
    if (categoryColor.includes('emerald')) return '#059669';
    if (categoryColor.includes('amber')) return '#d97706';
    if (categoryColor.includes('blue')) return '#1d4ed8'; // darker blue for high density
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
          {tickets.map(ticket => {
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

        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white border border-slate-200 rounded p-4 shadow-lg z-10 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#1E3A8A] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Retornar
          </button>
          <h2 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Mapa de Ocorrências</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">Visão georreferenciada de chamados públicos em Rondonópolis.</p>
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
