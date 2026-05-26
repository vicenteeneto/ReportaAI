import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileText, Download, Filter, BarChart, List as ListIcon } from 'lucide-react';
import { format } from 'date-fns';
import { STATUS_MAP, PRIORITY_MAP } from '../../components/ui/Badge';

export function AdminReports() {
  const { tickets, categories, cities, currentUser } = useAppContext();
  const [reportType, setReportType] = useState<'summary' | 'list'>('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      let match = true;
      if (startDate) {
        if (new Date(t.createdAt) < new Date(startDate)) match = false;
      }
      if (endDate) {
        // add one day to include the whole end date
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        if (new Date(t.createdAt) >= nextDay) match = false;
      }
      if (selectedStatus && t.status !== selectedStatus) match = false;
      if (selectedCategory && t.categoryId !== selectedCategory) match = false;
      if (selectedCity && t.cityId !== selectedCity) match = false;
      
      // se nao for superadmin e o currentUser tiver cityId, so ve da sua cidade
      if (currentUser?.role !== 'superadmin' && currentUser?.cityId && t.cityId !== currentUser.cityId) {
          match = false;
      }

      return match;
    });
  }, [tickets, startDate, endDate, selectedStatus, selectedCategory, selectedCity, currentUser]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const cityText = selectedCity ? cities.find(c => c.id === selectedCity)?.name || 'Todas as Cidades' : 'Todas as Cidades';
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // #1E3A8A
    doc.text('reportaAI - Gestão Urbana', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(reportType === 'summary' ? 'Relatório Gerencial de Ocorrências' : 'Relatório Analítico de Chamados', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let filterText = `Data de emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Cidade: ${cityText}`;
    if (startDate || endDate) {
      filterText += ` | Período: ${startDate ? format(new Date(startDate), 'dd/MM/yyyy') : 'Início'} a ${endDate ? format(new Date(endDate), 'dd/MM/yyyy') : 'Hoje'}`;
    }
    doc.text(filterText, 14, 38);

    if (filteredTickets.length === 0) {
      doc.setFontSize(13);
      doc.setTextColor(80, 80, 80);
      doc.text('Nenhum chamado encontrado para os filtros selecionados.', 14, 55);
      doc.save(`relatorio_${reportType}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
      return;
    }

    if (reportType === 'summary') {
      // SUMMARY REPORT
      const total = filteredTickets.length;
      const statusCounts = filteredTickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const categoryCounts = filteredTickets.reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Chamados no período: ${total}`, 14, 50);

      const statusData = Object.entries(statusCounts).map(([status, count]) => {
        const translatedStatus = STATUS_MAP[status as any]?.label || status.toUpperCase();
        return [
          translatedStatus,
          count.toString(), 
          ((Number(count) / total) * 100).toFixed(1) + '%'
        ];
      });

      autoTable(doc, {
        startY: 55,
        head: [['Status do Chamado', 'Quantidade', '%']],
        body: statusData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] },
      });

      const catData = Object.entries(categoryCounts).map(([catId, count]) => {
         const catName = categories.find(c => c.id === catId)?.name || catId;
         return [catName, count.toString(), ((Number(count) / total) * 100).toFixed(1) + '%'];
      }).sort((a, b) => Number(b[1]) - Number(a[1]));

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Categoria', 'Quantidade', '%']],
        body: catData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] },
      });

    } else {
      // LIST REPORT
      const tableData = filteredTickets.map(t => {
        const translatedPriority = PRIORITY_MAP[t.priority]?.label || t.priority.toUpperCase();
        const translatedStatus = STATUS_MAP[t.status]?.label || t.status.toUpperCase();
        return [
          t.protocol,
          format(new Date(t.createdAt), 'dd/MM/yyyy'),
          categories.find(c => c.id === t.categoryId)?.name || '-',
          t.neighborhood,
          translatedPriority,
          translatedStatus
        ];
      });

      autoTable(doc, {
        startY: 45,
        head: [['Protocolo', 'Data', 'Categoria', 'Bairro', 'Prioridade', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 },
      });
    }

    doc.save(`relatorio_${reportType}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Relatórios em PDF</h1>
          <p className="text-slate-500 text-sm mt-1">Gere relatórios gerenciais e operacionais da plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REPORT CONFIG */}
        <Card className="md:col-span-1 shadow-sm border-slate-200 h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Filter className="h-5 w-5 text-blue-600" />
              Configurar Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Relatório</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setReportType('summary')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-colors ${reportType === 'summary' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <BarChart className="h-5 w-5 mb-1" />
                  Gerencial
                </button>
                <button 
                  onClick={() => setReportType('list')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-colors ${reportType === 'list' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <ListIcon className="h-5 w-5 mb-1" />
                  Analítico
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Período</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Data Inicial</span>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Data Final</span>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm" />
                </div>
              </div>
            </div>

            {currentUser?.role === 'superadmin' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
                <select 
                  className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">Todas as Cidades</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria de Problema</label>
              <select 
                className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas as Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status do Chamado</label>
              <select 
                className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="received">Recebido</option>
                <option value="triage">Em Triagem</option>
                <option value="in_progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <Button onClick={generatePDF} className="w-full bg-[#1E3A8A] hover:bg-blue-800 flex items-center justify-center gap-2 py-6 text-white font-bold" variant="primary">
                 <Download className="w-5 h-5" />
                 GERAR RELATÓRIO PDF
               </Button>
            </div>

          </CardContent>
        </Card>

        {/* PREVIEW PANEL */}
        <Card className="md:col-span-2 shadow-sm border-slate-200 bg-slate-50 flex flex-col items-center justify-center min-h-[500px]">
          <div className="text-center p-8 bg-white max-w-sm rounded-xl shadow-sm border border-slate-100">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Relatório Pronto</h3>
             <p className="text-sm text-slate-500 mb-4">
               Com base nos filtros, o relatório contemplará <strong className="text-slate-700">{filteredTickets.length} chamados</strong>.
               <br/><br/>
               Clique no botão <strong>GERAR RELATÓRIO PDF</strong> para baixar o arquivo estruturado.
             </p>
          </div>
        </Card>

      </div>
    </div>
  );
}
