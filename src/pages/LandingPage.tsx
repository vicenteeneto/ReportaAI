import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  MapPin, Camera, ClipboardCheck, 
  BarChart3, Smartphone, Sparkles, Navigation, CheckCircle2, ShieldCheck,
  HardHat, PlaySquare, ArrowRight
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 shrink-0 sticky top-0 z-50 shadow-sm" id="topo">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h1 className="font-extrabold text-2xl leading-none tracking-tight text-slate-800">
              reporta<span className="text-[#1E3A8A]">AI</span>
            </h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Gestão urbana inteligente</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Como funciona</a>
          <a href="#gestao-publica" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Para prefeituras</a>
          <a href="#mapa" className="text-sm font-semibold text-slate-600 hover:text-[#1E3A8A] transition-colors">Mapa e dashboard</a>
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
        {/* 1. HERO PRINCIPAL */}
        <section className="bg-gradient-to-b from-[#1E3A8A] to-[#0f1d45] text-white pt-20 pb-28 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Viu um problema na cidade? reportaAI.
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                A plataforma que transforma solicitações da população em chamados com foto, localização, protocolo e gestão em tempo real para prefeituras.
              </p>
              
              <div className="pt-2">
                <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest mb-6">O cidadão informa. A prefeitura acompanha. A cidade melhora.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-white text-[#1E3A8A] hover:bg-slate-100 text-sm px-8 uppercase tracking-wide font-bold h-14 w-full sm:w-auto shadow-lg" onClick={() => navigate('/login?flow=register')}>
                    Registrar problema
                  </Button>
                  <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-sm px-8 uppercase tracking-wide font-bold h-14 border border-blue-500 w-full sm:w-auto shadow-lg" onClick={() => navigate('/login?role=admin')}>
                    Acessar gestão
                  </Button>
                  <Button variant="outline" size="lg" className="border-blue-400/50 hover:bg-blue-900/50 text-white text-sm px-8 uppercase tracking-wide font-bold h-14 w-full sm:w-auto" onClick={() => navigate('/login?role=admin')}>
                    <PlaySquare className="w-4 h-4 mr-2"/>
                    Ver demonstração
                  </Button>
                </div>
              </div>

              <div className="pt-8">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-blue-200 font-medium">
                  <div className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-blue-400"/> Foto do local</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400"/> Localização por GPS</div>
                  <div className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-blue-400"/> Protocolo</div>
                  <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-blue-400"/> Dashboard para gestores</div>
                  <div className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-400"/> Triagem com IA</div>
                </div>
              </div>
            </div>

            {/* 4. VISUAL DO HERO */}
            <div className="flex-1 w-full max-w-xl relative hidden md:block">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2 rounded-t-2xl">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 h-4 w-40 bg-slate-200 rounded-sm"></div>
                </div>
                
                <div className="p-5 flex flex-col gap-4 relative">
                  <div className="grid grid-cols-4 gap-2 mb-1">
                     <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                        <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Chamados/Mês</p>
                        <p className="text-lg font-black text-slate-800 leading-none">1.248</p>
                     </div>
                     <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-center">
                        <p className="text-[8px] text-blue-600 font-bold uppercase mb-1">Em Atendimento</p>
                        <p className="text-lg font-black text-blue-800 leading-none">76%</p>
                     </div>
                     <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                        <p className="text-[8px] text-emerald-600 font-bold uppercase mb-1">Bairros</p>
                        <p className="text-lg font-black text-emerald-800 leading-none">42</p>
                     </div>
                     <div className="bg-purple-50 p-2 rounded-lg border border-purple-100 text-center">
                        <p className="text-[8px] text-purple-600 font-bold uppercase mb-1">Triagem IA</p>
                        <p className="text-lg font-black text-purple-800 leading-none">93%</p>
                     </div>
                  </div>

                  {/* Map Mockup Area */}
                  <div className="w-full h-48 bg-slate-100 relative rounded-xl overflow-hidden border border-slate-200">
                     <div className="absolute inset-0 bg-[#f8fafc] z-0 overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                          <path d="M-100,200 Q150,300 300,450 T800,550" fill="none" stroke="#94a3b8" strokeWidth="8" />
                          <path d="M200,-50 L350,650" fill="none" stroke="#cbd5e1" strokeWidth="12" />
                          <path d="M100,-50 L250,650" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                          <path d="M500,-50 L400,650" fill="none" stroke="#bae6fd" strokeWidth="24" strokeLinecap="round" />
                        </svg>
                     </div>

                    <div className="absolute top-[35%] left-[45%] z-10 w-6 h-6 -translate-x-1/2 -translate-y-full bg-red-600 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                    <div className="absolute top-[45%] left-[25%] z-10 w-5 h-5 -translate-x-1/2 -translate-y-full bg-amber-500 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                    <div className="absolute top-[60%] left-[55%] z-10 w-6 h-6 -translate-x-1/2 -translate-y-full bg-green-500 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                    <div className="absolute top-[25%] left-[75%] z-10 w-5 h-5 -translate-x-1/2 -translate-y-full bg-purple-500 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                  </div>

                  {/* Occurrence Card floating */}
                  <div className="absolute top-1/2 right-[-20px] lg:right-[-40px] bg-white rounded-xl shadow-2xl border border-slate-100 p-4 w-80 z-40 transform -translate-y-1/2 rotate-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">REP-2026-001248</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Em Análise</span>
                    </div>
                    <p className="font-extrabold text-slate-800 text-sm mb-1">Buraco na via</p>
                    <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3"/> Avenida Principal, Centro</p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 mb-3 gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 px-2 py-1 rounded">Sec. Infraestrutura</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded">Prioridade: Alta</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-2.5 rounded flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-purple-800 font-medium leading-tight">IA: Encaminhamento sugerido.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROBLEMA ATUAL */}
        <section id="problema" className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight mb-4">
              Hoje, muitas reclamações se perdem em canais informais.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              WhatsApp, redes sociais, ligações e comentários espalhados dificultam o controle, a localização, os prazos e a resposta ao cidadão.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 flex flex-col gap-3 items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                <Smartphone className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">1. Reclamações espalhadas</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Demandas chegam por canais diferentes e podem se perder.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-slate-200 flex flex-col gap-3 items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">2. Falta de localização exata</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Equipes perdem tempo tentando encontrar o problema.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-slate-200 flex flex-col gap-3 items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                <ClipboardCheck className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">3. Ausência de protocolo</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">O cidadão não sabe como acompanhar sua solicitação.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-slate-200 flex flex-col gap-3 items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-bold text-lg text-slate-800">4. Pouca visão por bairro</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">A gestão não enxerga com clareza onde estão os maiores problemas.</p>
            </div>
          </div>
        </section>

        {/* 3. SOLUÇÃO REPORTAAI */}
        <section id="como-funciona" className="py-24 bg-white px-6 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              O reportaAI transforma cada solicitação em um chamado inteligente.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Cada demanda registrada pelo cidadão vira um chamado georreferenciado, com foto, categoria, protocolo, secretaria responsável, status e histórico de atendimento.
            </p>
          </div>

          <div className="max-w-6xl mx-auto w-full relative">
            <div className="hidden md:block absolute top-[45%] left-[5%] right-[5%] h-0.5 bg-slate-200 z-0"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative z-10 w-full px-4">
              {[
                { icon: Camera, title: "Foto", desc: "Evidência" },
                { icon: MapPin, title: "Localização", desc: "GPS Exato" },
                { icon: ClipboardCheck, title: "Protocolo", desc: "Transparência" },
                { icon: Navigation, title: "Secretaria", desc: "Encaminhamento" },
                { icon: BarChart3, title: "Acompanhamento", desc: "Gestão" },
                { icon: CheckCircle2, title: "Resolução", desc: "Fim do chamado" }
              ].map((step, idx) => (
                 <div key={idx} className="flex flex-col items-center bg-white px-2 py-6 rounded-2xl md:border-none border border-slate-100 shadow-sm md:shadow-none hover:bg-slate-50 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-[#1E3A8A] flex items-center justify-center text-[#1E3A8A] mb-4 shadow-md group-hover:scale-105 transition-transform relative">
                      <step.icon className="w-8 h-8" />
                      {idx < 5 && <div className="hidden md:block absolute -right-10 top-1/2 -translate-y-1/2"><ArrowRight className="text-slate-300 w-6 h-6"/></div>}
                    </div>
                    <span className="text-base font-bold text-slate-800">{step.title}</span>
                    <span className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 px-3 py-1 rounded-full">{step.desc}</span>
                 </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PARA O CIDADÃO E PREFEITURA */}
        <section className="py-24 bg-slate-50 border-t border-slate-200 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight mb-4">
              Simples para o cidadão. <br className="hidden md:block" /> Estratégico para a prefeitura.
            </h2>
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm relative overflow-hidden h-full">
               <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner"><Smartphone className="w-6 h-6"/></div>
                 Para o cidadão
               </h3>
               <ul className="space-y-6">
                 {[
                   "Registra pelo celular.",
                   "Envia foto e localização.",
                   "Recebe protocolo.",
                   "Acompanha o andamento.",
                   "Usa um canal oficial com a prefeitura."
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-center gap-4 text-slate-700 font-medium text-lg">
                     <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> 
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="bg-[#1E3A8A] text-white rounded-2xl p-10 border border-[#152c6e] shadow-xl relative overflow-hidden h-full">
               <h3 className="text-2xl font-bold mb-8 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center shadow-inner"><ShieldCheck className="w-6 h-6 text-blue-200"/></div>
                 Para a prefeitura
               </h3>
               <ul className="space-y-6">
                 {[
                   "Recebe demandas organizadas.",
                   "Encaminha por secretaria.",
                   "Acompanha tudo no mapa.",
                   "Controla prazos e status.",
                   "Gera relatórios e indicadores."
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-center gap-4 text-blue-50 font-medium text-lg">
                     <div className="w-2 h-2 rounded-full bg-blue-300 shrink-0"></div>
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </section>

        {/* NOVA SEÇÃO: POR QUE CONTRATAR */}
        <section className="py-20 bg-white px-6">
          <div className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Por que sua prefeitura precisa do reportaAI?
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Porque a cidade já recebe demandas todos os dias. A diferença é transformar essas reclamações em dados organizados, protocolos rastreáveis e decisões mais eficientes.
            </p>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-blue-600"><Smartphone className="w-7 h-7"/></div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">Menos reclamações perdidas.</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Centralize demandas que hoje chegam por WhatsApp, redes sociais e ligações.</p>
             </div>
             <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-blue-600"><Navigation className="w-7 h-7"/></div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">Mais controle por secretaria.</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Cada chamado é encaminhado para o setor responsável, com status e histórico.</p>
             </div>
             <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-blue-600"><ClipboardCheck className="w-7 h-7"/></div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">Mais transparência ao cidadão.</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Toda solicitação recebe protocolo e pode ser acompanhada.</p>
             </div>
             <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-blue-600"><BarChart3 className="w-7 h-7"/></div>
                <h4 className="text-lg font-bold text-slate-800 mb-3">Mais dados para decidir.</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Gestores visualizam bairros críticos, prazos, categorias e produtividade.</p>
             </div>
          </div>
        </section>

        {/* NOVA SEÇÃO: USO REAL */}
        <section className="py-24 bg-slate-900 text-white px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
              Do registro à solução, tudo acompanhado.
            </h2>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] bg-slate-800 rounded-2xl mb-6 flex flex-col items-center justify-center border border-slate-700 shadow-inner px-6">
                <Smartphone className="w-12 h-12 text-blue-400 mb-4 opacity-70" />
                <span className="text-sm text-slate-400 font-medium">Cidadão registrando ocorrência pelo celular.</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">1. O cidadão registra</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Foto, localização e descrição pelo celular.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] bg-slate-800 rounded-2xl mb-6 flex flex-col items-center justify-center border border-slate-700 shadow-inner px-6">
                <BarChart3 className="w-12 h-12 text-blue-400 mb-4 opacity-70" />
                <span className="text-sm text-slate-400 font-medium">Gestores acompanhando painel de demandas.</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">2. A prefeitura acompanha</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Triagem, secretaria responsável e status em tempo real.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] bg-slate-800 rounded-2xl mb-6 flex flex-col items-center justify-center border border-slate-700 shadow-inner px-6">
                <HardHat className="w-12 h-12 text-blue-400 mb-4 opacity-70" />
                <span className="text-sm text-slate-400 font-medium">Equipe de campo atualizando chamado.</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">3. A equipe resolve</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Atualização do chamado, histórico e comprovação do atendimento.</p>
            </div>
          </div>
        </section>

        {/* 5. MAPA E DASHBOARD */}
        <section id="mapa" className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full">
            <div className="flex-1 w-full space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                 Mapa, indicadores e relatórios em uma única plataforma.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                 A prefeitura acompanha os chamados por bairro, categoria, prioridade, secretaria e status, visualizando pontos críticos da cidade e tomando decisões com base em dados reais.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-6">
                <div className="flex flex-wrap gap-2">
                  {["Bairro", "Categoria", "Status", "Secretaria"].map(filter => (
                    <span key={filter} className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full shadow-sm">{filter} ▾</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="border border-slate-200 rounded-lg p-5">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Chamados Abertos</p>
                   <p className="text-3xl font-black text-[#1E3A8A]">842</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tempo Médio</p>
                   <p className="text-3xl font-black text-green-600">3,2 <span className="text-sm font-bold opacity-70">dias</span></p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Chamados Resolvidos</p>
                   <p className="text-3xl font-black text-slate-800">4.105</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Demandas Atrasadas</p>
                   <p className="text-3xl font-black text-red-600">12%</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="w-full aspect-square md:aspect-[4/3] bg-slate-100 rounded-2xl relative overflow-hidden border border-slate-300 shadow-xl">
                 <div className="absolute inset-0 bg-[#f8fafc] z-0 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-100,200 Q150,300 300,450 T800,550" fill="none" stroke="#94a3b8" strokeWidth="8" />
                      <path d="M200,-50 L350,650" fill="none" stroke="#cbd5e1" strokeWidth="12" />
                      <path d="M100,-50 L250,650" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                      <path d="M500,-50 L400,650" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    </svg>
                 </div>

                 {/* Simulated Map Pins */}
                 <div className="absolute top-[35%] left-[45%] z-10 w-7 h-7 -translate-x-1/2 -translate-y-full bg-red-600 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                 <div className="absolute top-[45%] left-[25%] z-10 w-6 h-6 -translate-x-1/2 -translate-y-full bg-amber-500 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                 <div className="absolute top-[60%] left-[55%] z-10 w-8 h-8 -translate-x-1/2 -translate-y-full bg-green-500 rounded-t-full rounded-bl-full border-2 border-white shadow-xl transform -rotate-45 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
                 <div className="absolute top-[25%] left-[75%] z-10 w-6 h-6 -translate-x-1/2 -translate-y-full bg-blue-500 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>
                 <div className="absolute top-[75%] left-[30%] z-10 w-7 h-7 -translate-x-1/2 -translate-y-full bg-purple-500 rounded-t-full rounded-bl-full border-2 border-white shadow-md transform -rotate-45"></div>

                 {/* Simulated Top Bairros Ranking Card */}
                 <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-slate-200 p-3 z-10 w-48">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Top Bairros</p>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center"><span className="text-[11px] font-medium text-slate-700">Centro</span><span className="text-[11px] font-bold text-slate-900">145</span></div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 w-[80%] h-full"></div></div>
                       <div className="flex justify-between items-center"><span className="text-[11px] font-medium text-slate-700">Vila Aurora</span><span className="text-[11px] font-bold text-slate-900">98</span></div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 w-[60%] h-full"></div></div>
                       <div className="flex justify-between items-center"><span className="text-[11px] font-medium text-slate-700">Sagrada Fam.</span><span className="text-[11px] font-bold text-slate-900">42</span></div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-400 w-[30%] h-full"></div></div>
                    </div>
                 </div>

                 {/* Legend */}
                 <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-slate-200 p-4 z-10 pointer-events-none">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Infraestrutura</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm border border-amber-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Iluminação</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm border border-orange-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Limpeza</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm border border-green-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Meio ambiente</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm border border-purple-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Trânsito</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-blue-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Saúde</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm border border-cyan-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Educação</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500 shadow-sm border border-slate-600/20"></div><span className="text-[11px] font-bold text-slate-700 truncate">Outros</span></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. INTELIGÊNCIA ARTIFICIAL */}
        <section id="ia" className="py-24 bg-slate-50 px-6 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 w-full text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
                <Sparkles className="w-4 h-4"/> Diferencial
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
                AI para acelerar a triagem e apoiar decisões.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A inteligência artificial do reportaAI ajuda a classificar demandas, sugerir prioridades, identificar chamados duplicados e gerar resumos para gestores públicos.
              </p>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <h4 className="font-bold text-slate-800 mb-2">1. Classificação automática</h4>
                <p className="text-sm text-slate-600">A IA sugere categoria, subcategoria e secretaria responsável.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <h4 className="font-bold text-slate-800 mb-2">2. Priorização inteligente</h4>
                <p className="text-sm text-slate-600">O sistema ajuda a identificar demandas mais urgentes.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <h4 className="font-bold text-slate-800 mb-2">3. Detecção de duplicidade</h4>
                <p className="text-sm text-slate-600">Chamados próximos e semelhantes podem ser agrupados.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <h4 className="font-bold text-slate-800 mb-2">4. Resumos executivos</h4>
                <p className="text-sm text-slate-600">Gestores recebem visões claras sobre bairros, categorias e gargalos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PARA QUALQUER MUNICÍPIO */}
        <section id="gestao-publica" className="py-24 bg-white px-6">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Adaptável à realidade de cada município.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto mb-12">
              Cada prefeitura pode configurar sua própria operação: bairros, secretarias, categorias, prazos, usuários e regras de encaminhamento. O reportaAI se adapta ao município, sem engessar a gestão.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Rondonópolis</span>
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Cuiabá</span>
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Primavera do Leste</span>
              <span className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">reportaAI Jaciara</span>
              <span className="px-6 py-3 rounded-full bg-[#1E3A8A] border border-[#1E3A8A] text-sm font-bold text-white shadow-md">reportaAI Brasil</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {["Bairros", "Secretarias", "Categorias", "Prazos", "Usuários internos", "Fluxos de atendimento"].map((item, idx) => (
                 <div key={idx} className="border border-slate-200 bg-white rounded-lg p-3 text-sm font-bold text-slate-700 shadow-sm">{item}</div>
              ))}
            </div>
          </div>
        </section>

        {/* NOVA SEÇÃO: IMPLANTAÇÃO */}
        <section className="py-24 bg-slate-50 px-6 border-t border-slate-200">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3A8A] tracking-tight mb-4">
              Implantação rápida, com operação personalizada.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              O reportaAI pode ser configurado conforme a estrutura da prefeitura, respeitando os setores, bairros, prazos e fluxos internos de atendimento.
            </p>
          </div>
          <div className="max-w-5xl mx-auto w-full relative">
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-blue-200 z-0"></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative z-10">
               <div className="flex flex-col items-center text-center bg-transparent group">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform z-10 border-4 border-slate-50">1</div>
                  <h4 className="font-bold text-slate-900 mb-2">Diagnóstico</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Entendimento da operação e dos setores da prefeitura.</p>
               </div>
               <div className="flex flex-col items-center text-center bg-transparent group">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform z-10 border-4 border-slate-50">2</div>
                  <h4 className="font-bold text-slate-900 mb-2">Configuração</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Cadastro de bairros, secretarias, categorias e usuários.</p>
               </div>
               <div className="flex flex-col items-center text-center bg-transparent group">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform z-10 border-4 border-slate-50">3</div>
                  <h4 className="font-bold text-slate-900 mb-2">Treinamento</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Orientação para equipes de triagem, secretarias e gestores.</p>
               </div>
               <div className="flex flex-col items-center text-center bg-transparent group">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform z-10 border-4 border-slate-50">4</div>
                  <h4 className="font-bold text-slate-900 mb-2">Publicação</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Liberação da plataforma para a população.</p>
               </div>
               <div className="flex flex-col items-center text-center bg-transparent group">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform z-10 border-4 border-slate-50">5</div>
                  <h4 className="font-bold text-slate-900 mb-2">Acompanhamento</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Suporte e ajustes para melhorar a operação.</p>
               </div>
            </div>
          </div>
        </section>

        {/* 8. CTA FINAL */}
        <section className="py-28 bg-[#1E3A8A] text-white px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              O cidadão informa. A prefeitura acompanha. A cidade melhora.
            </h2>
            <p className="text-xl font-medium text-blue-200 leading-relaxed">
              Com o reportaAI, municípios transformam reclamações espalhadas em chamados organizados, geolocalizados e acompanhados em tempo real.
            </p>
            <div className="pt-2 pb-4">
              <p className="text-3xl font-bold italic opacity-90">"Viu um problema na cidade? reportaAI."</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-[#1E3A8A] hover:bg-slate-100 text-sm px-8 uppercase tracking-wide font-bold h-14 w-full sm:w-auto" onClick={() => navigate('/login?flow=register')}>
                Registrar problema
              </Button>
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-sm px-8 uppercase tracking-wide font-bold h-14 border border-blue-500 w-full sm:w-auto" onClick={() => navigate('/login?role=admin')}>
                Acessar gestão
              </Button>
              <Button variant="outline" size="lg" className="border-blue-400 text-white hover:bg-blue-800 text-sm px-8 uppercase tracking-wide font-bold h-14 w-full sm:w-auto" onClick={() => navigate('/login?role=admin')}>
                Conhecer painel
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* 9. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <h3 className="font-bold text-2xl text-white">
              reporta<span className="text-blue-500">AI</span>
            </h3>
            <p className="text-sm">Plataforma inteligente de gestão urbana para prefeituras.</p>
          </div>
          
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm font-medium">
            <a href="#topo" className="hover:text-white transition-colors">Início</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#gestao-publica" className="hover:text-white transition-colors">Para prefeituras</a>
            <a href="#mapa" className="hover:text-white transition-colors">Mapa e dashboard</a>
            <a href="#ia" className="hover:text-white transition-colors">Inteligência artificial</a>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/login')}>Acessar plataforma</span>
          </nav>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          <p>Tecnologia para aproximar cidadãos, prefeituras e soluções.</p>
        </div>
      </footer>
    </div>
  );
}
