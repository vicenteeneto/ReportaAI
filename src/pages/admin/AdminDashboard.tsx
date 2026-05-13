import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export function AdminDashboard() {
  const { tickets, categories } = useAppContext();

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const pending = total - resolved;
  const urgent = tickets.filter(t => t.priority === 'urgent').length;
  const resolutionRate = total > 0 ? ((resolved/total)*100).toFixed(1) : '0.0';

  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: tickets.filter(t => t.categoryId === cat.id).length,
  })).filter(c => c.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  const statusData = [
    { name: 'Recebido', value: tickets.filter(t => t.status === 'received').length },
    { name: 'Andamento', value: tickets.filter(t => ['forwarded', 'analyzing', 'scheduled', 'in_progress'].includes(t.status)).length },
    { name: 'Resolvido', value: resolved },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Chamados este Mês</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-slate-800">{total}</h2>
            <span className="text-[10px] text-emerald-600 font-bold">+12% ↑</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Em Aberto / Triagem</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-amber-500">{pending}</h2>
            <span className="text-[10px] text-slate-400 font-medium">33% do total</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Resolvidos (SLA)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-emerald-600">{resolved}</h2>
            <span className="text-[10px] text-emerald-600 font-bold underline">{resolutionRate}%</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tempo Médio Resolução</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl font-bold text-slate-800">4.2d</h2>
            <span className="text-[10px] text-red-500 font-bold">-0.5d ↓</span>
          </div>
        </div>
      </section>

      {/* Charts - Density optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        <Card className="flex flex-col overflow-hidden h-full">
          <CardHeader className="py-3 px-4 border-b border-slate-100">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">Chamados por Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px'}} />
                <Bar dataKey="value" fill="#1E3A8A" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden h-full">
          <CardHeader className="py-3 px-4 border-b border-slate-100">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 min-h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Footer info bar */}
      <footer className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0 shadow-sm mt-auto">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Resumo Diário:</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            {resolved} Resolvidos
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            {pending} em Andamento/Triagem
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {urgent} Críticos
          </div>
        </div>
        <div className="italic">
          Atualizado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
        </div>
      </footer>
    </div>
  );
}
