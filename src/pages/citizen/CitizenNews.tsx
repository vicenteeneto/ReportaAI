import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../context/AppContext';
import { Bell, Info, AlertTriangle, Calendar, ArrowLeft, ChevronRight, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical';
  publishedAt: string;
  imageUrl?: string;
}

export function CitizenNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      // For now, let's try to fetch or use some defaults if table doesn't exist yet
      const { data, error } = await supabase
        .from('news_alerts')
        .select('*')
        .order('publishedAt', { ascending: false });

      if (!error && data) {
        setNews(data);
      } else {
        // Fallback for demo if SQL not yet applied
        setNews([
          {
            id: '1',
            title: 'Mutirão de Limpeza no Centro',
            content: 'Neste sábado, a secretaria de infraestrutura realizará um grande mutirão de limpeza. Colabore colocando seu entulho na calçada.',
            type: 'info',
            publishedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Interdição na Av. Lions Internacional',
            content: 'Atenção motoristas: trecho próximo ao Shopping ficará interditado para reparos na rede pluvial das 08h às 18h.',
            type: 'warning',
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            title: 'Campanha de Vacinação Prorrogada',
            content: 'A campanha de vacinação contra a gripe foi prorrogada até o final do mês. Procure o post de saúde mais próximo.',
            type: 'info',
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
          }
        ]);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={() => navigate('/citizen')}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Alertas & Notícias</h2>
          <p className="text-xs text-slate-500 font-medium">Comunicados oficiais da prefeitura</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Carregando informativos...</div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
              <div className={`h-1.5 w-full ${
                item.type === 'warning' ? 'bg-amber-400' : 
                item.type === 'critical' ? 'bg-red-500' : 'bg-blue-600'
              }`} />
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getTypeStyles(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 leading-tight">{item.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.publishedAt), 'dd/MM/yy')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.content}</p>
                    <div className="flex justify-end">
                      <button className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center uppercase tracking-wider">
                        Ler Mais <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {news.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-medium">Nenhum alerta ou notícia no momento.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Dúvidas ou Sugestões?</h3>
            <p className="text-slate-400 text-sm">Entre em contato com a Ouvidoria Municipal.</p>
          </div>
          <button className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors uppercase tracking-wider">
            Falar com Suporte
          </button>
        </div>
        <Newspaper className="absolute right-[-20px] top-[-20px] w-40 h-40 text-white/5 pointer-events-none rotate-12" />
      </div>
    </div>
  );
}
