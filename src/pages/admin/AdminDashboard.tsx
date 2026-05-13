import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Clock, CheckCircle2, AlertTriangle, FileText, MapPin, ChevronRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { tickets, categories } = useAppContext();

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const pending = total - resolved;
  const urgent = tickets.filter(t => t.priority === 'urgent').length;
  
  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const getPinColor = (categoryColor: string) => {
    if (categoryColor.includes('orange')) return '#f97316';
    if (categoryColor.includes('yellow')) return '#eab308';
    if (categoryColor.includes('green')) return '#16a34a';
    if (categoryColor.includes('emerald')) return '#059669';
    if (categoryColor.includes('amber')) return '#d97706';
    if (categoryColor.includes('blue')) return '#3b82f6';
    if (categoryColor.includes('purple')) return '#a855f7';
    if (categoryColor.includes('red')) return '#ef4444';
    return '#475569';
  };

  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <div className="flex flex-col h-full gap-4 lg:gap-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
          <p className="text-sm text-slate-500">Acompanhe as estatísticas e localizações dos chamados.</p>
        </div>
      </div>

      {/* Top Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-1">Total de Chamados</p>
            <h2 className="text-4xl font-black tracking-tight">{total}</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">Registrados na cidade</p>
          </div>
          <FileText className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-[0.03]" />
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resolvidos / Fechados</p>
          <div>
            <h2 className="text-3xl font-black text-slate-800">{resolved}</h2>
            <p className="text-xs text-emerald-600 font-bold mt-1">SLA Atendido</p>
          </div>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Em Análise / Pendentes</p>
          <div>
            <h2 className="text-3xl font-black text-amber-600">{pending}</h2>
            <p className="text-xs text-amber-600/70 font-bold mt-1">Aguardando ação</p>
          </div>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Fora do Prazo / Críticos</p>
          <div>
            <h2 className="text-3xl font-black text-red-600">{urgent}</h2>
            <p className="text-xs text-red-600/70 font-bold mt-1">Ação Imediata Necessária</p>
          </div>
        </div>
      </section>

      {/* Main Content Split */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Side: Recent Tickets List */}
        <Card className="flex flex-col lg:w-1/3 h-[400px] lg:h-auto overflow-hidden">
          <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">Últimos Chamados</CardTitle>
            <Link to="/admin/tickets" className="text-xs font-bold text-[#1E3A8A] hover:underline">Ver Todos</Link>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            {recentTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Nenhum chamado registrado.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTickets.map(ticket => {
                  const cat = categories.find(c => c.id === ticket.categoryId);
                  return (
                    <Link to={`/admin/tickets/${ticket.id}`} key={ticket.id} className="block p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ticket.protocol}</span>
                        <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate mb-1">{ticket.title}</h4>
                      <div className="flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600 truncate">{ticket.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        {cat && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${cat.color.replace('bg-', 'text-').replace('500', '700')} bg-slate-100`}>
                            {cat.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Map */}
        <Card className="flex flex-col flex-1 h-[400px] lg:h-auto overflow-hidden">
          <CardHeader className="py-4 px-5 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">Visão Geográfica</CardTitle>
            <Link to="/admin/map" className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center">
              Ampliar Mapa <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </CardHeader>
          <div className="flex-1 relative bg-slate-100">
            <MapContainer center={[-16.4672, -54.6383]} zoom={13} className="absolute inset-0 z-0">
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
                  />
                );
              })}
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
