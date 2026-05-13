import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Filter, X } from 'lucide-react';
import { Ticket } from '../../data/types';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

export function AdminMap() {
  const { tickets, categories } = useAppContext();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mapa de Ocorrências</h2>
        <Button variant="outline" icon={Filter}>Filtros Avançados</Button>
      </div>

      <div className="flex-1 relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex">
        {/* Map Container */}
        <MapContainer center={[-16.4672, -54.6383]} zoom={13} className="relative flex-1 w-full h-full z-0">
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
                <img src={selectedTicket.photoUrl} alt="Local" className="w-full h-40 object-cover rounded-lg" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{selectedTicket.protocol}</p>
                <h4 className="font-bold text-lg leading-tight mt-1">{selectedTicket.title}</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedTicket.status} />
                <PriorityBadge priority={selectedTicket.priority} />
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
                <Button className="w-full">Ver Chamado Completo</Button>
                <Button variant="outline" className="w-full">Atribuir Equipe</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
