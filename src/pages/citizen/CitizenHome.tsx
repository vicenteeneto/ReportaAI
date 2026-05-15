import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { 
  PlusSquare, 
  MapPinned, 
  Bell, 
  CheckCircle2, 
  Info,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Loader2
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { format } from 'date-fns';

export function CitizenHome() {
  const navigate = useNavigate();
  const { currentUser, tickets, loading } = useAppContext();

  const myTickets = tickets.filter(t => t.userId === currentUser?.id);
  const recentTickets = myTickets.slice(0, 3); // Get latest 3

  const stats = {
    total: myTickets.length,
    pending: myTickets.filter(t => ['received', 'forwarded', 'in_progress', 'scheduled', 'analyzing', 'triage'].includes(t.status)).length,
    resolved: myTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="w-10 h-10 text-[#1E3A8A] animate-spin mb-4" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Sincronizando Registros</h3>
        <p className="text-[10px] text-slate-400 font-medium mt-1">Aguarde um instante...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile */}
      <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm transition-all">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl overflow-hidden shrink-0">
          {currentUser?.avatarUrl ? (
             <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            currentUser?.name?.charAt(0).toUpperCase() || 'C'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">Olá, {currentUser?.name?.split(' ')[0]}!</h2>
          <p className="text-[11px] sm:text-sm text-slate-500 font-medium truncate">Sua participação ajuda a melhorar nossa cidade.</p>
        </div>
      </div>

      {/* Cidadão Cidadania - Pontuação */}
      <div className="bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <h3 className="text-[10px] sm:text-sm font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-2 px-1">
            Minha Pontuação Cidadã
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 sm:h-7 text-[9px] sm:text-[10px] font-bold uppercase text-[#1E3A8A] hover:bg-blue-100 px-2"
            onClick={() => navigate('/citizen/ranking')}
          >
            Ranking <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-blue-50 shadow-sm flex flex-col items-center text-center">
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              {currentUser?.pointsValidating || 0}
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase mt-0.5 leading-tight">Em Validação</span>
          </div>
          <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-blue-50 shadow-sm flex flex-col items-center text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {currentUser?.pointsValidated || 0}
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase mt-0.5 leading-tight">Validados</span>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-2 sm:mt-3 text-center font-medium">
          Total acumulado: <span className="font-bold text-[#1E3A8A]/70 uppercase">{(currentUser?.pointsValidated || 0) + (currentUser?.pointsValidating || 0)} pts</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card 
          className="bg-white hover:shadow-md transition-shadow cursor-pointer hover:border-[#1E3A8A] overflow-hidden"
          onClick={() => navigate('/citizen/tickets', { state: { filter: 'all' } })}
        >
          <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-xl sm:text-3xl font-black text-slate-800">{stats.total}</span>
            <span className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight mt-0.5">Total</span>
          </CardContent>
        </Card>
        <Card 
          className="bg-amber-50 border-amber-100 hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300 overflow-hidden"
          onClick={() => navigate('/citizen/tickets', { state: { filter: 'in_progress' } })}
        >
          <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-xl sm:text-3xl font-black text-amber-600">{stats.pending}</span>
            <span className="text-[9px] sm:text-xs font-bold text-amber-700 uppercase tracking-tight mt-0.5">Abertos</span>
          </CardContent>
        </Card>
        <Card 
          className="bg-emerald-50 border-emerald-100 hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-300 overflow-hidden"
          onClick={() => navigate('/citizen/tickets', { state: { filter: 'resolved' } })}
        >
          <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-xl sm:text-3xl font-black text-emerald-600">{stats.resolved}</span>
            <span className="text-[9px] sm:text-xs font-bold text-emerald-700 uppercase tracking-tight mt-0.5">Resolvidos</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] text-white border-none shadow-md overflow-hidden relative min-h-[140px]">
          <CardContent className="p-5 sm:p-6 h-full flex flex-col justify-center">
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 leading-tight">Viu algum problema?</h3>
              <p className="text-blue-100 text-[11px] sm:text-sm mb-4 sm:mb-6 max-w-[180px] sm:max-w-[200px] leading-snug">
                Relate agora buracos, mato, lixo ou iluminação.
              </p>
              <Button 
                className="bg-white text-blue-900 hover:bg-slate-50 font-bold uppercase tracking-wider shadow-sm text-[10px] sm:text-xs h-9 sm:h-10 px-4"
                onClick={() => navigate('/citizen/new')}
              >
                <PlusSquare className="w-4 h-4 mr-2" />
                Registrar
              </Button>
            </div>
            <Camera className="absolute right-[-15px] bottom-[-15px] w-28 h-28 sm:w-40 sm:h-40 text-blue-900/20 rotate-[-15deg] pointer-events-none" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-rows-2">
          <Card className="cursor-pointer hover:border-slate-300 hover:shadow transition-all md:col-span-2 group" onClick={() => navigate('/citizen/map')}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 h-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight truncate">Mapa de Problemas</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-tight mt-0.5 truncate">Explore ocorrências em tempo real</p>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-slate-300 hover:shadow transition-all group" onClick={() => navigate('/citizen/tickets')}>
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center h-full gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              </div>
              <span className="font-bold text-[10px] sm:text-xs text-slate-800 uppercase tracking-tight leading-tight">Meus<br className="hidden xs:block"/> Registros</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-slate-300 hover:shadow transition-all group" onClick={() => navigate('/citizen/news')}>
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center h-full gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              </div>
              <span className="font-bold text-[10px] sm:text-xs text-slate-800 uppercase tracking-tight leading-tight">Alertas &<br className="hidden xs:block"/> Notícias</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="pt-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1E3A8A]" /> Atividade Recente
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Acompanhe seus últimos chamados</p>
          </div>
          <Button variant="ghost" size="sm" className="text-sm font-semibold text-[#1E3A8A] hover:text-blue-800 hover:bg-blue-50" onClick={() => navigate('/citizen/tickets')}>
            Ver Todos
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentTickets.length > 0 ? recentTickets.map(ticket => (
            <Card key={ticket.id} className="cursor-pointer hover:border-blue-200 transition-colors hover:shadow-sm" onClick={() => navigate(`/citizen/tickets/${ticket.id}`)}>
              <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                 <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    {ticket.status === 'resolved' ? (
                       <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : ticket.status === 'in_progress' ? (
                       <Clock className="w-6 h-6 text-amber-500" />
                    ) : (
                       <AlertCircle className="w-6 h-6 text-slate-400" />
                    )}
                 </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-bold text-sm text-slate-900 truncate tracking-tight">{ticket.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[150px] md:max-w-[200px]">{ticket.address || 'Sem endereço'}</span>
                    <span className="text-[11px] text-slate-400 font-mono">• {format(new Date(ticket.createdAt), "dd/MM/yyyy")}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <StatusBadge status={ticket.status} />
                  <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="border-dashed shadow-none bg-slate-50 border-slate-300">
              <CardContent className="py-12 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-700 mb-1 text-lg">Nenhum chamado aberto</h4>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">Você não abriu nenhuma solicitação de zeladoria até o momento.</p>
                <Button onClick={() => navigate('/citizen/new')} className="font-semibold text-xs uppercase tracking-wider bg-[#1E3A8A] hover:bg-[#152c6e] text-white">
                  Criar o Primeiro Chamado
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

