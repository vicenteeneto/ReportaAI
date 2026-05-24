import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export function ExecDashboard() {
  const { tickets, categories } = useAppContext();

  const total = tickets.length;
  const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
  
  // Real Delayed Logic: Tickets older than 7 days and NOT resolved/closed
  const delayed = tickets.filter(t => {
    const createdDate = new Date(t.createdAt).getTime();
    const isOld = (Date.now() - createdDate) > (7 * 24 * 60 * 60 * 1000); 
    return isOld && !['resolved', 'closed', 'rejected', 'duplicated'].includes(t.status);
  }).length;
  
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Calculate real trend data for last 6 months
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthName = months[d.getMonth()];
    const count = tickets.filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
    }).length;
    return { name: monthName, value: count };
  });

  const catData = categories.map(cat => ({
    name: cat.name,
    value: tickets.filter(t => t.categoryId === cat.id).length
  })).sort((a,b) => b.value - a.value).slice(0, 5);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
           <p className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-1">Visão Executiva</p>
           <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prefeitura Demo</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 font-medium">Atualizado hoje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp className="w-24 h-24" />
          </div>
          <CardContent className="p-8 relative z-10">
            <p className="text-slate-300 font-medium tracking-wide">Total de Demandas</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-5xl font-black">{total}</h3>
              <span className="text-emerald-400 font-medium text-sm">+12% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-24 h-24 text-blue-600" />
          </div>
          <CardContent className="p-8 relative z-10">
            <p className="text-slate-500 font-medium tracking-wide">Taxa de Resolução</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-5xl font-black text-slate-900">{resolutionRate}%</h3>
            </div>
            <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full rounded-full" style={{width: `${resolutionRate}%`}}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <AlertCircle className="w-24 h-24 text-red-600" />
          </div>
          <CardContent className="p-8 relative z-10">
            <p className="text-slate-500 font-medium tracking-wide">Atrasadas / Críticas</p>
             <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-5xl font-black text-red-600">{delayed}</h3>
              <span className="text-slate-400 font-medium text-sm">chamados</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-slate-200">
           <div className="p-6 border-b border-slate-100">
             <h3 className="font-bold text-lg text-slate-800">Evolução de Entradas</h3>
           </div>
           <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

         <Card className="shadow-sm border-slate-200">
           <div className="p-6 border-b border-slate-100">
             <h3 className="font-bold text-lg text-slate-800">Top 5 Categorias</h3>
           </div>
           <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#334155', fontWeight: 500, fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {catData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
