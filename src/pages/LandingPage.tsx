import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  MapPin, Camera, ClipboardCheck, 
  Map, BarChart3, Smartphone, Activity, 
  ListChecks, Lightbulb, 
  Trash2, Leaf, Droplets, Navigation, 
  Footprints, Building2, HeartPulse, 
  BookOpen, ShieldAlert, PawPrint, MessageSquare, 
  FileSearch, MessageCircle, AlertTriangle, Sparkles
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none tracking-tight text-slate-800">
              reporta<span className="text-[#1E3A8A]">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Gestão urbana inteligente</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Como funciona</a>
          <a href="#beneficios" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Benefícios</a>
          <a href="#gestao-publica" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Para prefeituras</a>
          <a href="#mapa" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Mapa inteligente</a>
          <a href="#ia" className="text-sm font-semibold text-[#1E3A8A] hover:text-blue-600 transition-colors flex items-center gap-1"><Sparkles className="w-3 h-3"/> Inteligência artificial</a>
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
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-[#1E3A8A] to-[#0f1d45] text-white pt-20 pb-28 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-400/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Inovação em Govtech
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Gestão urbana inteligente para cidades que querem ouvir, organizar e resolver.
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Com o reportaAI, cidadãos registram problemas urbanos com foto e localização, enquanto a prefeitura acompanha tudo em tempo real por meio de mapa, dashboard, protocolos e inteligência artificial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="bg-white text-[#1E3A8A] hover:bg-slate-100 text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?flow=register')}>
                  Registrar problema
                </Button>
                <Button variant="outline" size="lg" className="border-blue-400/50 hover:bg-blue-900/50 text-white text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?role=admin')}>
                  Acesso gestão
                </Button>
                <Button variant="ghost" size="lg" className="text-blue-100 hover:text-white hover:bg-blue-800/50 text-sm px-8 uppercase tracking-wide font-bold h-14" onClick={() => { document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Ver como funciona
                </Button>
              </div>
              
              <div className="pt-6">
                <p className="text-sm font-semibold text-blue-300 italic mb-4">"Viu um problema na cidade? reportaAI."</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-blue-200 font-medium">
                  <div className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-blue-400"/> Foto do local</div>
                  <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400"/> Localização por GPS</div>
                  <div className="w-1 h-1 rounded-full bg-blue-400/50"></div>
                  <div className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-blue-400"/> Protocolo</div>
                  <div className="w-1 h-1 rounded-full bg-blue-400/50 hidden sm:block"></div>
                  <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-blue-400"/> Dashboard gestão</div>
                  <div className="w-1 h-1 rounded-full bg-blue-400/50 hidden sm:block"></div>
                  <div className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-400"/> Triagem com IA</div>
                </div>
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
                  <div className="grid grid-cols-3 gap-2 mb-1">
                     <div className="bg-slate-50 p-2 lg:p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Chamados (Mês)</p>
                        <p className="text-xl lg:text-2xl font-black text-slate-800 leading-none">1.248</p>
                     </div>
                     <div className="bg-blue-50 p-2 lg:p-3 rounded-lg border border-blue-100 text-center">
                        <p className="text-[9px] text-blue-600 font-bold uppercase mb-1">Em Atendimento</p>
                        <p className="text-xl lg:text-2xl font-black text-blue-800 leading-none">76%</p>
                     </div>
                     <div className="bg-purple-50 p-2 lg:p-3 rounded-lg border border-purple-100 text-center">
                        <p className="text-[9px] text-purple-600 font-bold uppercase mb-1">Triagem IA</p>
                        <p className="text-xl lg:text-2xl font-black text-purple-800 leading-none">93%</p>
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
                    <div className="absolute bottom-1/4 right-1/3" title="Trânsito"><MapPin className="w-4 h-4 text-purple-500 drop-shadow-md" fill="currentColor" /></div>
                  </div>

                  {/* Occurrence Card floating */}
                  <div className="absolute bottom-6 right-[-10px] lg:right-[-30px] bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-72 z-20 transform -rotate-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Em Análise</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">Alta</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">Buraco na via</p>
                    <p className="text-[11px] text-slate-500 mb-2">Avenida Principal, Centro</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-600">Sec. de Infraestrutura</span>
                    </div>
                    <div className="mt-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-2 rounded flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-purple-800 font-medium leading-tight">A IA sugere: Encaminhar para Secretaria de Obras (Risco de acidente elevado).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INDICADORES SIMULADOS (Stats Banner) */}
        <section className="bg-white border-b border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-[#1E3A8A] mb-8">Gestão pública orientada por dados</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
              <div className="flex flex-col items-center justify-center p-4">
                <HeartPulse className="w-8 h-8 text-[#1E3A8A] mb-3" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Múltiplas Secretarias Integradas</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <Map className="w-8 h-8 text-[#1E3A8A] mb-3" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bairros Monitorados no Mapa</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <ListChecks className="w-8 h-8 text-[#1E3A8A] mb-3" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Categorias Configuráveis</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Triagem Inteligente com IA</span>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE O PROBLEMA */}
        <section className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight mb-4">
              Reclamações espalhadas dificultam a gestão da cidade.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Hoje, muitas demandas da população chegam por WhatsApp, redes sociais, ligações, comentários e contatos informais. Com isso, a prefeitura perde informações importantes, não enxerga os problemas no mapa e tem dificuldade para acompanhar prazos, prioridades e responsáveis.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageCircle, title: "Canais espalhados", desc: "Informações perdidas em diversas redes e telefones." },
              { icon: MapPin, title: "Sem localização exata", desc: "Equipes perdem tempo procurando o local do problema." },
              { icon: Activity, title: "Dificuldade em priorizar", desc: "Sem dados, é difícil saber o que é mais urgente." },
              { icon: FileSearch, title: "Falta de histórico", desc: "O cidadão cobra e a prefeitura não tem protocolo rápido." },
              { icon: Map, title: "Pouca visão por bairro", desc: "Gestão às cegas sobre as regiões mais críticas." },
              { icon: BarChart3, title: "Relatórios manuais", desc: "Dificuldade para fechar números produtivos e estratégicos." }
            ].map((err, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
                  <err.icon className="w-5 h-5 text-red-500" />
                </div>
                <h4 className="font-bold text-slate-800">{err.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{err.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* A SOLUÇÃO */}
        <section className="py-24 bg-white px-6 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Uma plataforma única para transformar demandas urbanas em gestão inteligente.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                O reportaAI organiza cada solicitação em um chamado georreferenciado, com foto, categoria, protocolo, secretaria responsável, status e histórico completo de atendimento.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  { title: "Registro pelo cidadão", icon: Smartphone },
                  { title: "Foto e localização", icon: Camera },
                  { title: "Classificação inteligente", icon: Sparkles },
                  { title: "Encaminhamento por secretaria", icon: Navigation },
                  { title: "Dashboard executivo", icon: BarChart3 },
                  { title: "Relatórios e transparência", icon: ClipboardCheck }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
                      <feat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{feat.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="aspect-square sm:aspect-[4/3] lg:aspect-square bg-slate-100 rounded-full md:rounded-2xl flex items-center justify-center p-8 relative overflow-hidden shadow-inner border border-slate-200">
                 <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col z-10 p-4 transform lg:rotate-3">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">Protocolo REPT-2026</p>
                        <p className="text-[10px] text-slate-400">Aberto hoje</p>
                      </div>
                    </div>
                    <div className="h-32 bg-slate-200 rounded mb-3 overflow-hidden relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400)'}}></div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Status</span> <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded bg-amber-100 text-amber-700">Em análise</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Secretaria</span> <span className="text-xs font-semibold text-slate-800">Infraestrutura</span></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA NA PRÁTICA */}
        <section id="como-funciona" className="py-24 bg-slate-50 border-t border-slate-200 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A] tracking-tight mb-4">Como funciona na prática.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">O cidadão informa. A prefeitura acompanha. A cidade melhora.</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { step: "1", title: "O cidadão identifica", desc: "Buracos, iluminação, lixo, mato alto, sinalização, saúde, educação, segurança ou qualquer outra demanda urbana." },
                { step: "2", title: "Registra pelo app ou site", desc: "A solicitação é enviada de forma simples, com foto, descrição e localização exata no mapa." },
                { step: "3", title: "O sistema gera protocolo", desc: "O cidadão recebe um número e acompanha o andamento do chamado em tempo real, sem ligar para a prefeitura." },
                { step: "4", title: "A IA ajuda na triagem", desc: "A inteligência artificial pode sugerir categoria, prioridade e secretaria responsável pela resolução." },
                { step: "5", title: "A prefeitura encaminha", desc: "Cada secretaria recebe suas demandas organizadas e atualiza os status de atendimento conforme resolvem." },
                { step: "6", title: "A gestão visualiza", desc: "Prefeito, secretários e equipes acompanham mapa integrado, relatórios e evolução produtiva em um painel executivo." },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#1E3A8A] transition-colors">
                  <div className="text-[100px] font-black text-slate-50 absolute -right-6 -top-10 z-0 select-none group-hover:text-blue-50 transition-colors">{item.step}</div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg text-slate-800 mb-3">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARA PREFEITURAS */}
        <section id="gestao-publica" className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 w-full">
            <div className="flex-1 w-full space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
                Feito para prefeituras que querem gerir melhor as demandas da população.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                O reportaAI foi pensado para municípios de diferentes tamanhos, permitindo configurar bairros, secretarias, categorias, prazos, responsáveis e fluxos de atendimento conforme a realidade de cada cidade.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-6">
                {[
                  "Implantação adaptável",
                  "Cadastro de secretarias",
                  "Cadastro de bairros",
                  "Gestão por setor responsável",
                  "Dashboard executivo",
                  "Relatórios por período",
                  "Controle de prazos e trâmites",
                  "Histórico de atendimento",
                  "Transparência para o cidadão",
                  "Dados para tomada de decisão"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-8">
                <Button size="lg" className="bg-[#1E3A8A] text-white hover:bg-[#152c6e]" onClick={() => navigate('/login?role=admin')}>
                  Conhecer solução para prefeituras
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full hidden md:block">
               {/* Illustration / Graphic */}
               <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 flex flex-col gap-4">
                     <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                       <div className="font-bold text-slate-800">Prefeitura Demo</div>
                       <Button variant="outline" size="sm" className="h-7 text-[10px]">Ajustar configurações</Button>
                     </div>
                     <div className="space-y-3">
                       <div className="flex justify-between text-sm py-2"><span className="text-slate-500">Secretarias cadastradas</span><span className="font-bold">14</span></div>
                       <div className="flex justify-between text-sm py-2 border-t border-slate-50"><span className="text-slate-500">Bairros mapeados</span><span className="font-bold">87</span></div>
                       <div className="flex justify-between text-sm py-2 border-t border-slate-50"><span className="text-slate-500">Categorias ativas</span><span className="font-bold">22</span></div>
                       <div className="flex justify-between text-sm py-2 border-t border-slate-50"><span className="text-slate-500">Usuários internos</span><span className="font-bold">45</span></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CATEGORIAS DE CHAMADOS */}
        <section className="py-24 bg-slate-50 px-6 border-y border-slate-200">
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
              { icon: Leaf, label: "Árvore ou risco ambiental", color: "text-green-700", bg: "bg-green-100" },
              { icon: Droplets, label: "Bueiro, esgoto ou drenagem", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Navigation, label: "Trânsito e sinalização", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: Footprints, label: "Calçadas e acessibilidade", color: "text-slate-600", bg: "bg-slate-200" },
              { icon: Map, label: "Praças e espaços públicos", color: "text-teal-600", bg: "bg-teal-50" },
              { icon: HeartPulse, label: "Saúde pública", color: "text-rose-600", bg: "bg-rose-50" },
              { icon: BookOpen, label: "Educação", color: "text-cyan-600", bg: "bg-cyan-50" },
              { icon: ShieldAlert, label: "Segurança", color: "text-slate-800", bg: "bg-slate-200" },
              { icon: PawPrint, label: "Animais", color: "text-amber-800", bg: "bg-amber-100" },
              { icon: Leaf, label: "Denúncia ambiental", color: "text-green-800", bg: "bg-green-200" },
              { icon: MessageSquare, label: "Reclamação de atendimento", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: MessageCircle, label: "Sugestões para a cidade", color: "text-blue-500", bg: "bg-blue-50" }
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

        {/* MAPA INTELIGENTE */}
        <section id="mapa" className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full">
            <div className="flex-1 w-full space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Mapa inteligente para enxergar a cidade em tempo real.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Cada chamado aparece no mapa com pins coloridos por categoria, permitindo identificar regiões críticas, demandas recorrentes, bairros com maior volume de solicitações e prioridades de atendimento.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-6">
                <h4 className="font-bold text-sm text-slate-800 mb-4 uppercase tracking-wider">Filtros dinâmicos:</h4>
                <div className="flex flex-wrap gap-2">
                  {["Bairro", "Categoria", "Status", "Secretaria", "Prioridade", "Período", "Chamados atrasados", "Resolvidos"].map(filter => (
                    <span key={filter} className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full shadow-sm">{filter}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              {/* Map mockup */}
              <div className="w-full aspect-[4/3] bg-slate-100 rounded-3xl relative overflow-hidden border border-slate-200 shadow-lg">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                 
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] uppercase font-bold text-slate-500 py-1 px-3 rounded shadow-sm border border-white">
                   Visão Geral do Mapa
                 </div>

                 {/* Simulated Pins */}
                 <div className="absolute top-[30%] left-[40%]"><MapPin className="w-8 h-8 text-red-500 drop-shadow-md" fill="currentColor" /></div>
                 <div className="absolute top-[45%] left-[25%]"><MapPin className="w-6 h-6 text-amber-500 drop-shadow-md" fill="currentColor" /></div>
                 <div className="absolute top-[60%] left-[50%]"><MapPin className="w-7 h-7 text-green-500 drop-shadow-md" fill="currentColor" /></div>
                 <div className="absolute top-[20%] left-[70%]"><MapPin className="w-6 h-6 text-blue-500 drop-shadow-md" fill="currentColor" /></div>
                 <div className="absolute top-[75%] left-[30%]"><MapPin className="w-8 h-8 text-purple-500 drop-shadow-md" fill="currentColor" /></div>
                 
                 {/* Legend */}
                 <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md border border-slate-200 p-3 flex flex-col gap-2">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-slate-600">Infraestrutura</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[10px] font-bold text-slate-600">Iluminação</span></div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[10px] font-bold text-slate-600">Meio ambiente</span></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTELIGÊNCIA ARTIFICIAL */}
        <section id="ia" className="py-24 bg-gradient-to-br from-[#1E3A8A] to-purple-900 text-white px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
            <div className="flex-1 lg:max-w-md sticky top-24 h-max">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-200 mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 text-purple-300"/> Diferencial tecnológico
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-6">
                Inteligência artificial para acelerar a triagem e melhorar decisões.
              </h2>
              <p className="text-lg text-blue-100 leading-relaxed mb-8">
                O AI do reportaAI representa o uso de inteligência artificial para ajudar a prefeitura a classificar demandas, identificar prioridades, sugerir encaminhamentos e gerar resumos inteligentes para gestores.
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Classificação automática", desc: "A IA pode analisar a descrição do cidadão e sugerir categoria, subcategoria e secretaria responsável." },
                { title: "Priorização inteligente", desc: "O sistema pode indicar demandas mais urgentes com base no tipo de problema, localização e volume de registros." },
                { title: "Detecção de duplicidade", desc: "Chamados próximos e semelhantes podem ser agrupados para evitar retrabalho das equipes." },
                { title: "Resumos executivos", desc: "Gestores podem receber visões resumidas sobre bairros críticos, categorias recorrentes e gargalos." },
                { title: "Apoio ao atendimento", desc: "A IA pode ajudar operadores a responderem de forma mais rápida, clara e padronizada aos cidadãos." },
                { title: "Evolução contínua", desc: "Quanto mais dados a cidade gera, mais inteligente se torna a análise das demandas urbanas." },
              ].map((iaItem, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors">
                  <h4 className="font-bold text-white mb-2 text-lg">{iaItem.title}</h4>
                  <p className="text-sm text-blue-100 leading-relaxed">{iaItem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DASHBOARD EXECUTIVO */}
        <section className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 w-full">
            <div className="flex-1 w-full order-2 md:order-1">
              {/* Dashboard visual */}
              <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 gap-6 flex flex-col">
                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <h5 className="font-bold text-slate-800">Painel Executivo</h5>
                    <div className="flex gap-2">
                       <span className="w-20 h-4 bg-slate-100 rounded-full"></span>
                       <span className="w-12 h-4 bg-slate-100 rounded-full"></span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Total de chamados</p>
                      <p className="text-3xl font-black text-[#1E3A8A]">3.542</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Tempo médio resol.</p>
                      <p className="text-3xl font-black text-green-600">4,2 <span className="text-sm">dias</span></p>
                    </div>
                 </div>

                 <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-end pb-4 px-4 gap-2">
                    {/* Simulated chart bars */}
                    <div className="w-full bg-blue-200 h-[20%] rounded-t-sm"></div>
                    <div className="w-full bg-blue-300 h-[40%] rounded-t-sm"></div>
                    <div className="w-full bg-blue-400 h-[60%] rounded-t-sm"></div>
                    <div className="w-full bg-blue-500 h-[50%] rounded-t-sm"></div>
                    <div className="w-full bg-[#1E3A8A] h-[90%] rounded-t-sm"></div>
                 </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 order-1 md:order-2">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
                Dashboard executivo para prefeitos, secretários e equipes técnicas.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                O reportaAI transforma cada chamado em dado estratégico para a gestão pública, permitindo acompanhar indicadores de atendimento, produtividade, bairros críticos e evolução das demandas ao longo do tempo.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4">
                 {[
                   "Total de chamados", "Chamados abertos", "Chamados resolvidos",
                   "Demandas atrasadas", "Secretarias com mais demandas", "Bairros com maior volume"
                 ].map((item, id) => (
                   <span key={id} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                     <div className="w-1 h-1 bg-blue-500 rounded-full"></div> {item}
                   </span>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section id="beneficios" className="py-24 bg-white px-6 border-t border-slate-200">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-center mb-16">
              Benefícios para quem vive a cidade <br className="hidden md:block" /> e para quem cuida dela.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Para o cidadão */}
              <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 relative overflow-hidden">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl mb-6 shadow-sm">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Para o cidadão</h3>
                <ul className="space-y-4">
                  {[
                    "Registro simples pelo celular.",
                    "Envio de foto e localização exata.",
                    "Protocolo de acompanhamento online.",
                    "Transparência no andamento (status).",
                    "Canal oficial e direto com a prefeitura.",
                    "Participação ativa na melhoria da cidade."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-xs font-bold shrino-0">
                        ✓
                      </div>
                      <span className="text-slate-700 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Para a prefeitura */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative overflow-hidden">
                <div className="w-16 h-16 bg-slate-200 text-slate-700 flex items-center justify-center rounded-xl mb-6 shadow-sm">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Para a prefeitura</h3>
                <ul className="space-y-4">
                  {[
                    "Demandas organizadas em um único painel.",
                    "Encaminhamento automatizado por secretaria.",
                    "Relatórios gerenciais por bairro e categoria.",
                    "Dashboard para tomada de decisão.",
                    "Mapa de calor das ocorrências críticas.",
                    "Mais controle sobre prazos e equipes.",
                    "Redução de reclamações perdidas."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-slate-800 text-xs font-bold shrino-0">
                        ✓
                      </div>
                      <span className="text-slate-700 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARÊNCIA */}
        <section className="py-24 bg-slate-900 text-white px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1 space-y-6 text-center md:text-left">
               <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                 Mais transparência para a população. <br className="hidden lg:block"/> Mais controle para a gestão.
               </h2>
               <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto md:mx-0">
                 Com histórico de atendimento, fotos de antes e depois, relatórios e indicadores, a prefeitura consegue mostrar o que foi recebido, encaminhado, resolvido e quais regiões receberam mais ações.
               </p>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-lg mx-auto md:mx-0">
                {[
                  "Antes e depois", "Relatórios mensais", "Histórico de chamado",
                  "Mapeamento por bairro", "Indicadores produtivos", "Prestação de contas"
                ].map((item, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center text-sm font-semibold text-slate-200">
                    {item}
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* MULTICIDADE / ESCALABILIDADE */}
        <section className="py-24 bg-white px-6 border-b border-slate-200">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Uma plataforma preparada para qualquer município.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto mb-12">
              O reportaAI pode ser configurado para diferentes cidades, com seus próprios bairros, secretarias, categorias, usuários internos, prazos de atendimento e regras de encaminhamento locais.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Cuiabá</span>
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Rondonópolis</span>
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Jaciara</span>
              <span className="px-6 py-3 rounded-full bg-[#1E3A8A] border border-[#1E3A8A] text-sm font-bold text-white shadow-md">reportaAI Brasil</span>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-28 bg-slate-50 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Viu um problema na cidade? <br className="hidden md:block"/> <span className="text-[#1E3A8A]">reportaAI.</span>
            </h2>
            <p className="text-xl font-medium text-slate-500 uppercase tracking-wider">
              O cidadão informa. A prefeitura acompanha. A cidade melhora.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Com o reportaAI, municípios ganham uma solução moderna para transformar demandas urbanas em chamados organizados, geolocalizados e acompanhados em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" className="bg-[#1E3A8A] text-white hover:bg-[#152c6e] text-sm px-10 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?flow=register')}>
                Registrar problema
              </Button>
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-sm px-10 uppercase tracking-wide font-bold h-14" onClick={() => navigate('/login?role=admin')}>
                Acessar gestão
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
             </div>
             <div>
                <p className="font-bold text-lg leading-none tracking-tight text-slate-800">
                  reporta<span className="text-[#1E3A8A]">AI</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Plataforma inteligente de gestão urbana</p>
             </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-[#1E3A8A]">Início</a>
            <a href="#como-funciona" className="hover:text-[#1E3A8A]">Como funciona</a>
            <a href="#gestao-publica" className="hover:text-[#1E3A8A]">Para prefeituras</a>
            <a href="#ia" className="hover:text-[#1E3A8A]">Inteligência artificial</a>
            <a href="#mapa" className="hover:text-[#1E3A8A]">Mapa inteligente</a>
            <a onClick={() => navigate('/login')} className="hover:text-[#1E3A8A] cursor-pointer">Acessar plataforma</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center mt-12 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Tecnologia para aproximar cidadãos, prefeituras e soluções.</p>
        </div>
      </footer>
    </div>
  );
}
