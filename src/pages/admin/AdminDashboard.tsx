import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Clock, MapPin, ChevronRight, Activity, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { countOverdueTickets, getTicketSlaInfo, INACTIVE_STATUSES } from '../../lib/sla';

export function AdminDashboard() {
  const { tickets, categories, departments, currentUser } = useAppContext();
  const navigate = useNavigate();
  const canOpenTickets = ['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'].includes(currentUser?.role || '');
  const openTickets = (filter: string) => {
    if (canOpenTickets) navigate('/admin/tickets', { state: { filter } });
  };
  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const pending = tickets.filter(t => !INACTIVE_STATUSES.includes(t.status)).length;
  const overdue = countOverdueTickets(tickets);
  const urgent = tickets
    .filter(t => t.priority === 'urgent' || t.priority === 'high' || getTicketSlaInfo(t).overdue)
    .filter(t => !INACTIVE_STATUSES.includes(t.status));
  const resolutionRate = total > 0 ? ((resolved/total)*100).toFixed(1) : '0.0';

  // Department Performance
  const deptPerformance = departments.map(dept => {
    const deptTickets = tickets.filter(t => t.departmentId === dept.id);
    const resolvedCount = deptTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const pendingCount = deptTickets.length - resolvedCount;
    return {
      name: dept.acronym || dept.name.split(' ')[0],
      Resolvido: resolvedCount,
      Pendente: pendingCount,
      total: deptTickets.length
    };
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

  // Category Distribution
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: tickets.filter(t => t.categoryId === cat.id).length,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Recent Critical Tickets
  const criticalTickets = [...urgent].sort((a, b) => Number(b.createdAt) - Number(a.createdAt)).slice(0, 4);

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6 pb-2">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1E3A8A]" /> Painel Executivo
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Visão geral do desempenho municipal</p>
        </div>
      </div>

      {/* Top Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0">
        <div 
          onClick={() => openTickets('all')}
          className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all relative overflow-hidden group ${canOpenTickets ? 'cursor-pointer hover:shadow-md hover:border-[#1E3A8A]' : ''}`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Volume Total</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-slate-800">{total}</h2>
            <span className="text-[10px] text-emerald-600 font-bold">+12% ↑</span>
          </div>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-blue-50 rounded-tl-full opacity-50 group-hover:bg-blue-100 transition-colors"></div>
        </div>

        <div 
          onClick={() => openTickets('pending')}
          className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all relative overflow-hidden group ${canOpenTickets ? 'cursor-pointer hover:shadow-md hover:border-amber-400' : ''}`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Fila de Trabalho</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-amber-500">{pending}</h2>
            <span className="text-[10px] text-slate-400 font-medium">Em aberto</span>
          </div>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-amber-50 rounded-tl-full opacity-50 group-hover:bg-amber-100 transition-colors"></div>
        </div>

        <div 
          onClick={() => openTickets('resolved')}
          className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all relative overflow-hidden group ${canOpenTickets ? 'cursor-pointer hover:shadow-md hover:border-emerald-400' : ''}`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Taxa de Resolução</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-emerald-600">{resolutionRate}%</h2>
            <span className="text-[10px] text-emerald-600 font-bold underline">{resolved} resolvidos</span>
          </div>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-emerald-50 rounded-tl-full opacity-50 group-hover:bg-emerald-100 transition-colors"></div>
        </div>

        <div 
          onClick={() => openTickets('urgent')}
          className={`bg-white p-4 rounded-xl border border-red-200 shadow-sm transition-all relative overflow-hidden group ${canOpenTickets ? 'cursor-pointer hover:shadow-md hover:border-red-400' : ''}`}
        >
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> SLA / Atenção
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-red-600">{overdue}</h2>
            <span className="text-[10px] text-red-500 font-bold">Atrasados</span>
          </div>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-red-50 rounded-tl-full opacity-50 group-hover:bg-red-100 transition-colors"></div>
        </div>
      </section>

      {/* Main Grid: Charts & Critical Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6 h-full min-h-[560px]">
          {/* Bar Chart: Dept Performance */}
          <Card className="flex flex-col overflow-hidden min-h-[260px] flex-1 border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-white">
              <CardTitle className="text-xs uppercase tracking-wide text-slate-600 font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1E3A8A]" />
                Desempenho por Secretaria
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 bg-slate-50/50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 500}} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Resolvido" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={36} />
                  <Bar dataKey="Pendente" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart: Categories */}
          <Card className="flex flex-col overflow-hidden min-h-[260px] flex-1 border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-white">
              <CardTitle className="text-xs uppercase tracking-wide text-slate-600 font-bold">Principais Demandas (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex items-center justify-center bg-slate-50/50">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${name.substring(0, 15)}... (${(percent * 100).toFixed(0)}%)` : ''}
                    labelLine={false}
                    fontSize={10}
                    fontWeight={500}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 500}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Critical Feed */}
        <div className="flex flex-col h-full">
          <Card className="flex flex-col overflow-hidden h-full border-red-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-red-100 bg-red-50/50">
              <CardTitle className="text-xs uppercase tracking-wide text-red-700 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Ocorrências Críticas
                </div>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px]">{urgent.length} Pendentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto bg-white">
              {criticalTickets.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {criticalTickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      className={`p-4 transition-colors group flex flex-col gap-2 ${canOpenTickets ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                      onClick={() => canOpenTickets && navigate(`/admin/tickets/${ticket.id}`)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-[#1E3A8A] transition-colors leading-tight">
                          {ticket.title}
                        </h4>
                        <span className="text-[9px] font-mono font-semibold text-slate-400 shrink-0 bg-slate-100 px-1 rounded">{ticket.protocol.split('-')[2]}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{ticket.neighborhood}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 
                          {getTicketSlaInfo(ticket).label} · {format(new Date(ticket.createdAt), "dd/MM 'às' HH:mm")}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E3A8A] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Tudo sob controle</p>
                  <p className="text-[10px] text-slate-500 mt-1">Nenhuma ocorrência crítica ou urgente na fila no momento.</p>
                </div>
              )}
            </CardContent>
            {urgent.length > 4 && (
              <div 
                className="p-3 border-t border-slate-100 bg-slate-50 text-center text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => openTickets('urgent')}
              >
                Ver todas ({urgent.length})
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
