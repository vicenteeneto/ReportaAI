import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { PlusSquare, MapPinned, Bell, CheckCircle2, Info } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { format } from 'date-fns';

export function CitizenHome() {
  const navigate = useNavigate();
  const { currentUser, tickets } = useAppContext();

  const myTickets = tickets.filter(t => t.userId === currentUser?.id).slice(0, 3); // Get latest 3

  return (
    <div className="p-4 md:p-6 lg:max-w-4xl mx-auto space-y-6">
      <div className="pt-2 pb-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Olá, {currentUser?.name?.split(' ')[0]}</h2>
        <p className="text-xs text-slate-500 font-medium">Como podemos melhorar a cidade hoje?</p>
      </div>

      <Button 
        size="lg" 
        className="w-full text-sm font-bold uppercase tracking-wider py-4 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-md shadow flex items-center justify-center gap-2"
        onClick={() => navigate('/citizen/new')}
      >
        <PlusSquare className="w-5 h-5" />
        Registrar Novo Chamado
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:border-slate-300 transition-colors" onClick={() => navigate('/citizen/map')}>
          <CardContent className="px-3 py-4 flex flex-col items-center justify-center text-center space-y-2 h-28">
            <div className="w-8 h-8 bg-slate-100 border border-slate-200 text-slate-700 rounded flex items-center justify-center">
              <MapPinned className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-800 uppercase tracking-tight">Mapa da Cidade</span>
            <span className="text-[9px] text-slate-500 font-medium leading-tight">Ver problemas locais</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-slate-300 transition-colors">
          <CardContent className="px-3 py-4 flex flex-col items-center justify-center text-center space-y-2 h-28">
            <div className="w-8 h-8 bg-slate-100 border border-slate-200 text-slate-700 rounded flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-800 uppercase tracking-tight">Avisos Públicos</span>
            <span className="text-[9px] text-slate-500 font-medium leading-tight">Últimas notificações</span>
          </CardContent>
        </Card>
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight">Últimos Chamados</h3>
          <Button variant="ghost" size="sm" className="text-xs font-semibold px-2 h-6" onClick={() => navigate('/citizen/tickets')}>Ver todos</Button>
        </div>
        
        <div className="space-y-2">
          {myTickets.length > 0 ? myTickets.map(ticket => (
            <Card key={ticket.id} className="cursor-pointer hover:border-slate-300 transition-colors" onClick={() => navigate(`/citizen/tickets/${ticket.id}`)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 flex-shrink-0 rounded flex items-center justify-center">
                   {ticket.status === 'resolved' ? <CheckCircle2 className="text-green-600 w-5 h-5"/> : <Info className="text-slate-400 w-5 h-5"/>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-bold text-xs text-slate-900 truncate tracking-tight">{ticket.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={ticket.status} />
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-6 bg-slate-50 rounded border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Você ainda não possui chamados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
