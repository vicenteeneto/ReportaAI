import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  MapPin, Camera, ClipboardCheck, 
  Map, BarChart3, Smartphone, Activity, 
  ListChecks, ArrowRight, Lightbulb, 
  Trash2, Leaf, Droplets, Navigation, 
  Footprints, Building2, HeartPulse, 
  BookOpen, ShieldAlert, PawPrint, MessageSquare, 
  FileSearch, MessageCircle, AlertTriangle, Play
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* 3. HEADER */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tight text-[#1E3A8A]">Cidade Conecta</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Rondonópolis</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Como funciona</a>
          <a href="#beneficios" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Benefícios</a>
          <a href="#gestao-publica" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Gestão pública</a>
          <a href="#mapa" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Mapa inteligente</a>
          <Button variant="ghost" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A]" onClick={() => navigate('/login')}>
            Acessar
          </Button>
        </nav>

        <Button 
          className="bg-[#1E3A8A] text-white hover:bg-[#152c6e] h-10 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider" 
          onClick={() => navigate('/login')}
        >
          Acessar plataforma
        </Button>
      </header>

      <main className="flex-1 flex flex-col">
        {/* 4. & 5. HERO SECTION */}
        <section className="bg-gradient-to-b from-[#1E3A8A] to-[#0f1d45] text-white pt-20 pb-28 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-400/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Inovação em Gestão Urbana
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Rondonópolis mais conectada, eficiente e participativa.
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Uma plataforma para o cidadão registrar problemas urbanos com foto e localização, enquanto a prefeitura acompanha, organiza e resolve as demandas em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="bg-white text-[#1E3A8A] hover:bg-slate-100 text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?flow=register')}>
                  Registrar Problema
                </Button>
                <Button variant="outline" size="lg" className="border-blue-400/50 hover:bg-blue-900/50 text-white text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?role=admin')}>
                  Acesso Gestão
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-6 text-sm text-blue-200 font-medium">
                <div className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-blue-400"/> Foto do local</div>
                <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400"/> Localização por GPS</div>
                <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                <div className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-blue-400"/> Protocolo</div>
                <div className="w-1 h-1 rounded-full bg-blue-400/50 hidden sm:block"></div>
                <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-blue-400"/> Dashboard gestão</div>
              </div>
            </div>

            {/* Visual Principal do Hero */}
            <div className="flex-1 w-full max-w-xl relative hidden md:block">
              {/* Fake Dashboard Base */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 h-4 w-40 bg-slate-200 rounded-sm"></div>
                </div>
                
                {/* Dashboard content wrapper */}
                <div className="p-5 flex flex-col gap-4 relative">
                  
                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Chamados (Mês)</p>
                        <p className="text-2xl font-black text-slate-800 leading-none">248</p>
                     </div>
                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Em Atendimento</p>
                        <p className="text-2xl font-black text-blue-800 leading-none">73%</p>
                     </div>
                  </div>

                  {/* Map Mockup Area */}
                  <div className="w-full h-48 bg-slate-100 relative rounded-xl overflow-hidden border border-slate-200">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="absolute right-10 top-0 bottom-4 w-8 bg-white/40 transform rotate-[30deg]"></div>
                    <div className="absolute left-10 top-0 bottom-0 w-8 bg-white/40 transform -rotate-[15deg]"></div>
                    
                    {/* Pins */}
                    <div className="absolute top-1/4 left-1/4" title="Infraestrutura"><MapPin className="w-6 h-6 text-red-500 drop-shadow-md" fill="currentColor" /></div>
                    <div className="absolute bottom-1/3 left-1/3" title="Iluminação"><MapPin className="w-5 h-5 text-amber-400 drop-shadow-md" fill="currentColor" /></div>
                    <div className="absolute top-1/2 right-1/4" title="Resolvido"><MapPin className="w-5 h-5 text-emerald-500 drop-shadow-md" fill="currentColor" /></div>
                  </div>

                  {/* Occurrence Card floating */}
                  <div className="absolute bottom-8 right-[-20px] bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-64 z-20 transform -rotate-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Em Análise</span>
                      <span className="text-[10px] text-slate-400 font-mono">10 MIN ATRÁS</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">Buraco na Via</p>
                    <p className="text-[11px] text-slate-500 truncate mb-2">Av. Marechal Rondon, Centro</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-600">Sec. de Infraestrutura</span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-slate-500"/></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12. SEÇÃO INDICADORES SIMULADOS (Stats Banner) */}
        <section className="bg-white border-b border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Gestão pública orientada por dados</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#1E3A8A] mb-1">+260k</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cidadãos Impactados</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#1E3A8A] mb-1">42</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bairros Monitorados</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#1E3A8A] mb-1">15+</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Categorias de Demandas</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#1E3A8A] mb-1">100%</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Acompanhamento Digital</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SOBRE RONDONÓPOLIS */}
        <section className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 w-full">
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] bg-slate-200 rounded-2xl overflow-hidden relative shadow-lg">
                {/* Abstrato Placeholder */}
                <div className="absolute inset-0 bg-[#1E3A8A] mix-blend-multiply opacity-10"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border-4 border-dashed border-slate-300/50 m-4 rounded-xl">
                   <Building2 className="w-16 h-16 text-slate-400 mb-4" />
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vista urbana de Rondonópolis</p>
                   <p className="text-xs text-slate-400 mt-2 max-w-xs">A página está preparada para receber fotos reais aéreas, de praças ou avenidas da cidade.</p>
                 </div>
              </div>
              {/* Decorativo */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-blue-100 rounded-full blur-3xl -z-10"></div>
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Pensado para a realidade de Rondonópolis.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                De avenidas movimentadas aos bairros mais afastados, o <strong>Cidade Conecta</strong> ajuda a prefeitura a enxergar onde estão as principais demandas urbanas e priorizar ações com base em dados reais da população.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Uma cidade mais eficiente começa quando a gestão sabe exatamente onde estão os problemas, permitindo planejamento inteligente e alocação precisa de recursos.
              </p>
            </div>
          </div>
        </section>

        {/* 7. COMO FUNCIONA NA PRÁTICA */}
        <section id="como-funciona" className="py-24 bg-white border-t border-slate-200 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A] tracking-tight mb-4">Como funciona na prática.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Um fluxo simples que conecta o cidadão à resolução do problema.</p>
          </div>
          
          <div className="max-w-5xl mx-auto relative">
            {/* Linha conectiva invisível no mobile, visível md+ */}
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-slate-100 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
              {/* Passos */}
              {[
                { icon: AlertTriangle, title: "1. Identifica", desc: "Buraco, iluminação, lixo ou outra demanda na cidade." },
                { icon: Smartphone, title: "2. Registra", desc: "Envia foto e localização exata pelo celular." },
                { icon: FileSearch, title: "3. Protocolo", desc: "O cidadão acompanha cada movimentação do chamado." },
                { icon: Navigation, title: "4. Encaminha", desc: "A demanda vai para a secretaria correta automaticamente." },
                { icon: Activity, title: "5. Acompanha", desc: "Gestores visualizam indicadores, mapa e relatórios." },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/5 mb-6 text-[#1E3A8A]">
                    <step.icon className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CATEGORIAS DE CHAMADOS */}
        <section className="py-24 bg-[#f8fafc] px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Demandas urbanas <br className="md:hidden" /> organizadas por categoria.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Mapeamos os principais serviços da cidade para garantir que cada problema chegue rapidamente aos responsáveis.</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: AlertTriangle, label: "Buraco na rua", color: "text-red-600", bg: "bg-red-50" },
              { icon: Lightbulb, label: "Iluminação pública", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: Trash2, label: "Lixo ou entulho", color: "text-orange-600", bg: "bg-orange-50" },
              { icon: Leaf, label: "Mato alto", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Droplets, label: "Esgoto ou drenagem", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Navigation, label: "Trânsito e sinalização", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: HeartPulse, label: "Saúde pública", color: "text-rose-600", bg: "bg-rose-50" },
              { icon: BookOpen, label: "Educação", color: "text-cyan-600", bg: "bg-cyan-50" },
              { icon: Footprints, label: "Calçadas", color: "text-slate-600", bg: "bg-slate-100" },
              { icon: Map, label: "Praças públicas", color: "text-teal-600", bg: "bg-teal-50" },
              { icon: PawPrint, label: "Animais", color: "text-amber-800", bg: "bg-amber-100/50" },
              { icon: ShieldAlert, label: "Segurança", color: "text-slate-800", bg: "bg-slate-200" },
              { icon: Leaf, label: "Risco ambiental", color: "text-green-700", bg: "bg-green-100/50" },
              { icon: Activity, label: "Denúncia", color: "text-red-700", bg: "bg-red-100/50" },
              { icon: MessageSquare, label: "Reclamação", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: MessageCircle, label: "Sugestões gerais", color: "text-blue-500", bg: "bg-blue-50" }
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all text-center gap-3 group">
                <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-700">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 9. PARA A PREFEITURA & 10. MAPA INTELIGENTE */}
        <section id="gestao-publica" className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full mb-32">
            <div className="flex-1 space-y-6">
              <div className="inline-block bg-[#1E3A8A]/10 text-[#1E3A8A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Area de Gestão</div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Uma nova forma de gerir as demandas da cidade.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                O <strong>Cidade Conecta</strong> transforma reclamações espalhadas em dados organizados, permitindo que a prefeitura acompanhe os problemas por bairro, categoria, prioridade, secretaria responsável e status de atendimento.
              </p>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckIcon/> Chamados por bairro</div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckIcon/> Tempo de atendimento</div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckIcon/> Gestão por secretaria</div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckIcon/> Status por categoria</div>
              </div>
              <Button size="lg" className="bg-[#1E3A8A] text-white" onClick={() => navigate('/login?role=admin')}>Acessar painel de gestão</Button>
            </div>
            
            {/* Dashboard Mockup grande */}
            <div className="flex-1 w-full bg-slate-50 rounded-2xl border border-slate-200 p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white p-3 rounded shadow-sm border border-slate-100 flex items-center justify-between"><span className="text-[10px] uppercase font-bold text-slate-500">Abertos</span><span className="font-black text-slate-800">142</span></div>
                <div className="bg-white p-3 rounded shadow-sm border border-slate-100 flex items-center justify-between"><span className="text-[10px] uppercase font-bold text-slate-500">Andamento</span><span className="font-black text-amber-600">89</span></div>
                <div className="bg-white p-3 rounded shadow-sm border border-slate-100 flex items-center justify-between"><span className="text-[10px] uppercase font-bold text-slate-500">Resolvidos</span><span className="font-black text-emerald-600">912</span></div>
              </div>
              <div className="flex gap-3">
                <div className="w-[60%] flex flex-col gap-3">
                  <div className="h-32 bg-white rounded shadow-sm border border-slate-100 p-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Volume Mensal</span>
                    <div className="flex-1 flex items-end gap-2 pt-2">
                      <div className="flex-1 bg-blue-100 h-[40%] rounded-t"></div>
                      <div className="flex-1 bg-blue-200 h-[70%] rounded-t"></div>
                      <div className="flex-1 bg-blue-300 h-[50%] rounded-t"></div>
                      <div className="flex-1 bg-[#1E3A8A] h-[90%] rounded-t"></div>
                      <div className="flex-1 bg-blue-500 h-[60%] rounded-t"></div>
                    </div>
                  </div>
                </div>
                <div className="w-[40%] bg-white rounded shadow-sm border border-slate-100 p-3 flex flex-col gap-3">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Secretarias</span>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center"><span className="text-[10px] font-medium text-slate-600">Infra</span><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[80%] h-full bg-red-500"></div></div></div>
                     <div className="flex justify-between items-center"><span className="text-[10px] font-medium text-slate-600">Obras</span><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[60%] h-full bg-blue-500"></div></div></div>
                     <div className="flex justify-between items-center"><span className="text-[10px] font-medium text-slate-600">Meio Amb.</span><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[40%] h-full bg-green-500"></div></div></div>
                     <div className="flex justify-between items-center"><span className="text-[10px] font-medium text-slate-600">Saúde</span><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[20%] h-full bg-rose-500"></div></div></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* 10. Mapa Inteligente */}
          <div id="mapa" className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 w-full">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
                Mapa inteligente de ocorrências urbanas.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Cada chamado é exibido no mapa com pins coloridos por categoria, facilitando a identificação de regiões críticas, demandas recorrentes e prioridades de atendimento.
              </p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-red-500 min-w-3" /> Infraestrutura</div>
                 <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-amber-500 min-w-3" /> Iluminação pública</div>
                 <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-orange-500 min-w-3" /> Limpeza urbana</div>
                 <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-emerald-500 min-w-3" /> Meio ambiente</div>
                 <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-indigo-500 min-w-3" /> Trânsito e Mobilidade</div>
                 <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-slate-500 min-w-3" /> Outros</div>
              </div>
            </div>

            {/* Mapa visual */}
            <div className="flex-1 w-full relative">
              <div className="bg-slate-100 aspect-square md:aspect-video lg:aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-xl relative flex items-center justify-center">
                 {/* CSS Grid Pattern for map */}
                 <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                 
                 {/* Fake Streets */}
                 <div className="absolute left-[20%] top-0 bottom-0 w-12 bg-white/60 transform rotate-[10deg]"></div>
                 <div className="absolute right-[30%] top-0 bottom-0 w-8 bg-white/60 transform -rotate-[20deg]"></div>
                 <div className="absolute top-[40%] left-0 right-0 h-16 bg-white/60 transform rotate-[5deg]"></div>
                 
                 {/* Pins Grouped */}
                 <div className="absolute top-[35%] left-[25%] flex -space-x-2">
                    <MapPin className="w-8 h-8 text-red-500 fill-white" />
                    <MapPin className="w-8 h-8 text-red-600 fill-white -mt-2" />
                 </div>
                 <div className="absolute top-[60%] right-[35%]">
                    <MapPin className="w-10 h-10 text-amber-500 fill-white drop-shadow-md" />
                 </div>
                 <div className="absolute bottom-[20%] left-[40%]">
                    <MapPin className="w-8 h-8 text-emerald-500 fill-white drop-shadow" />
                 </div>
                 <div className="absolute top-[15%] right-[20%]">
                    <MapPin className="w-7 h-7 text-indigo-500 fill-white drop-shadow" />
                 </div>

                 {/* Filters Mockup UI over map */}
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm w-48 border border-white space-y-2">
                    <div className="h-6 bg-slate-100 rounded w-full"></div>
                    <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-6 bg-blue-100 rounded w-5/6"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. BENEFÍCIOS */}
        <section id="beneficios" className="py-24 bg-slate-900 text-white px-6">
          <div className="max-w-7xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">Benefícios para quem vive a cidade <br className="hidden md:block"/> e para quem cuida dela.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Soluções que conectam necessidades reais a ações efetivas.</p>
          </div>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3"><span className="p-2 bg-blue-500/10 rounded-lg"><Smartphone className="w-6 h-6"/></span> Para o Cidadão</h3>
              <ul className="space-y-4">
                {[
                  "Registro simples pelo celular em poucos toques.",
                  "Envio de foto como evidência incontestável.",
                  "Localização exata do problema via GPS.",
                  "Protocolo único para acompanhamento do status.",
                  "Transparência total no andamento da demanda.",
                  "Canal oficial, seguro e direto com a prefeitura."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3"><span className="p-2 bg-amber-500/10 rounded-lg"><Building2 className="w-6 h-6"/></span> Para a Prefeitura</h3>
              <ul className="space-y-4">
                {[
                  "Demandas organizadas em um único painel central.",
                  "Encaminhamento automático por secretaria.",
                  "Relatórios detalhados por bairro e categoria.",
                  "Dashboard em tempo real para tomada de decisão.",
                  "Mapa de calor das ocorrências mais frequentes.",
                  "Mais controle sobre prazos, custos e produtividade.",
                  "Dados estruturados para prestação de contas."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"/>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 13. TRANSPARÊNCIA */}
        <section className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A] tracking-tight mb-4">Mais transparência para a população. <br/> Mais controle para a gestão.</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
               Com histórico de atendimento, fotos de antes e depois, relatórios e indicadores, a prefeitura consegue mostrar o que foi recebido, encaminhado, resolvido e quais regiões receberam mais ações.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { title: "Antes e depois", desc: "Comprovação visual das manutenções realizadas com fotos do local." },
               { title: "Relatórios mensais", desc: "Métricas consolidadas de desempenho para apresentar à sociedade." },
               { title: "Histórico detalhado", desc: "Auditoria de cada passo do chamado, da abertura à sua conclusão." },
               { title: "Portal público", desc: "Em breve, dados abertos e estatísticas acessíveis para todos." }
             ].map((card, i) => (
               <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">{card.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* 14. TECNOLOGIAS FUTURAS */}
        <section className="py-24 bg-[#1E3A8A] text-white px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">Em desenvolvimento contínuo</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Preparado para evoluir com <br className="hidden sm:block"/>inteligência artificial e WhatsApp.</h2>
          </div>
          
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { title: "Triagem com IA", desc: "A inteligência artificial pode sugerir categoria, prioridade e secretaria responsável." },
               { title: "WhatsApp integrado", desc: "O cidadão poderá registrar chamados conversando com uma assistente virtual." },
               { title: "Detecção de duplicados", desc: "Ocorrências próximas podem ser agrupadas para evitar retrabalho das equipes." },
               { title: "Mapa de calor", desc: "A gestão identifica regiões com maior concentração de problemas estruturais." },
               { title: "Equipe de campo", desc: "Servidores operacionais podem atualizar chamados diretamente pelo celular." },
               { title: "Portal de transparência", desc: "Dados públicos sobre volume de demandas recebidas, em andamento e resolvidas." }
             ].map((item, i) => (
               <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors">
                  <h4 className="font-bold text-blue-100 mb-2">{item.title}</h4>
                  <p className="text-sm text-blue-200/70 leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* 15. FINAL CTA */}
        <section className="py-32 bg-white px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              O cidadão mostra onde está o problema. A prefeitura acompanha, resolve e comprova o resultado.
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Cidade Conecta Rondonópolis é uma proposta de inovação para aproximar a população da gestão pública e transformar demandas urbanas em ações organizadas, mensuráveis e transparentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="bg-[#1E3A8A] text-white hover:bg-[#152c6e] text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?flow=register')}>
                Registrar Problema
              </Button>
              <Button variant="outline" size="lg" className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-slate-50 text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?role=admin')}>
                Conhecer Painel Gestor
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 16. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-slate-400 rounded-full"></div>
              </div>
              <span className="font-bold text-white uppercase tracking-wider">Cidade Conecta Rondonópolis</span>
            </div>
            <p className="text-sm">Plataforma de gestão urbana inteligente.</p>
            <p className="text-xs mt-2 text-slate-500">Projeto piloto para modernização da gestão urbana municipal.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-white transition-colors">Início</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
            <a href="#gestao-publica" className="hover:text-white transition-colors">Gestão pública</a>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors underline underline-offset-4">Acessar plataforma</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon({ className = "w-5 h-5 text-[#1E3A8A]" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

