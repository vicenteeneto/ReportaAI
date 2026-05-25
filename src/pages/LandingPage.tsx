import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  HardHat,
  Layers3,
  MapPin,
  Megaphone,
  Navigation,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import heroCitizenReporting from '../assets/images/hero-citizen-reporting.png';
import citizenReportingImage from '../assets/images/citizen-reporting.png';
import cityDashboardImage from '../assets/images/city-dashboard-operations.png';
import fieldTeamImage from '../assets/images/field-team.png';

const imageScenes = {
  citizenReporting: {
    title: 'Cidadão registrando ocorrência',
    alt: 'Cidadão registrando uma ocorrência urbana pelo celular.',
    src: citizenReportingImage,
  },
  fieldTeam: {
    title: 'Equipe em atendimento',
    alt: 'Equipe de campo atendendo uma solicitação registrada na plataforma.',
    src: fieldTeamImage,
  },
  cityDashboard: {
    title: 'Gestão por dados',
    alt: 'Gestores acompanhando indicadores e chamados no dashboard.',
    src: cityDashboardImage,
  },
  cityStreet: {
    title: 'Problema urbano identificado',
    alt: 'Problema urbano registrado com foto e localização.',
  },
  smartCity: {
    title: 'Mapa inteligente da cidade',
    alt: 'Mapa inteligente com ocorrências urbanas geolocalizadas.',
  },
};

const problemCards = [
  ['Reclamações espalhadas', 'Demandas chegam por canais diferentes e podem se perder.', Megaphone],
  ['Falta de localização exata', 'Equipes perdem tempo tentando encontrar o problema.', MapPin],
  ['Ausência de protocolo', 'O cidadão não sabe como acompanhar sua solicitação.', ClipboardCheck],
  ['Pouca visão por bairro', 'A gestão não enxerga com clareza onde estão os maiores problemas.', BarChart3],
] as const;

const flowSteps = [
  ['Foto', 'Evidência', Camera],
  ['Localização', 'GPS exato', MapPin],
  ['Protocolo', 'Rastreável', ClipboardCheck],
  ['Secretaria', 'Encaminhamento', Building2],
  ['Acompanhamento', 'Status e prazos', Route],
  ['Resolução', 'Histórico completo', CheckCircle2],
] as const;

const whyCards = [
  ['Menos reclamações perdidas', 'Centralize demandas que hoje chegam por WhatsApp, redes sociais e ligações.', Layers3],
  ['Mais controle por secretaria', 'Cada chamado é encaminhado para o setor responsável, com status e histórico.', Building2],
  ['Mais transparência ao cidadão', 'Toda solicitação recebe protocolo e pode ser acompanhada.', ShieldCheck],
  ['Mais dados para decidir', 'Gestores visualizam bairros críticos, prazos, categorias e produtividade.', BarChart3],
] as const;

const aiCards = [
  ['Classificação automática', 'A IA sugere categoria, subcategoria e secretaria responsável.'],
  ['Priorização inteligente', 'O sistema ajuda a identificar demandas mais urgentes.'],
  ['Detecção de duplicidade', 'Chamados próximos e semelhantes podem ser agrupados.'],
  ['Resumos executivos', 'Gestores recebem visões claras sobre bairros, categorias e gargalos.'],
] as const;

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E3A8A] shadow-sm">
        <span className="text-base font-black text-white">AI</span>
      </div>
      <div>
        <p className="text-2xl font-black leading-none tracking-tight text-slate-900">
          reporta<span className="text-[#1E3A8A]">AI</span>
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Gestão urbana inteligente
        </p>
      </div>
    </div>
  );
}

function VisualScene({
  scene,
  variant = 'street',
  className = '',
}: {
  scene: keyof typeof imageScenes;
  variant?: 'street' | 'field' | 'dashboard' | 'map' | 'phone';
  className?: string;
}) {
  const data = imageScenes[scene];

  if ('src' in data && data.src) {
    return (
      <figure className={`relative min-h-[260px] overflow-hidden rounded-2xl border border-white/70 bg-slate-100 shadow-xl ${className}`}>
        <img
          src={data.src}
          alt={data.alt}
          loading="lazy"
          className="h-full min-h-[260px] w-full object-cover"
        />
        <figcaption className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">
          {data.title}
        </figcaption>
      </figure>
    );
  }

  return (
    <div
      role="img"
      aria-label={data.alt}
      className={`relative min-h-[260px] overflow-hidden rounded-2xl border border-white/70 bg-slate-100 shadow-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#dbeafe_0%,#f8fafc_42%,#d1fae5_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-slate-300/70" />
      <div className="absolute bottom-16 left-0 right-0 h-4 bg-slate-500/20" />
      <div className="absolute bottom-10 left-0 right-0 h-1 bg-white/80" />
      <div className="absolute left-8 top-10 h-24 w-16 rounded-t-xl bg-white/70 shadow-sm" />
      <div className="absolute left-28 top-5 h-32 w-20 rounded-t-xl bg-blue-100/80 shadow-sm" />
      <div className="absolute right-10 top-12 h-28 w-24 rounded-t-xl bg-slate-200/90 shadow-sm" />

      {(variant === 'phone' || variant === 'street') && (
        <div className="absolute bottom-14 left-10 flex items-end gap-4">
          <div className="relative h-28 w-16">
            <div className="absolute left-5 top-0 h-10 w-10 rounded-full bg-amber-200 shadow-sm" />
            <div className="absolute bottom-0 left-3 h-20 w-12 rounded-t-3xl bg-[#1E3A8A] shadow-lg" />
            <div className="absolute bottom-10 right-0 h-14 w-8 rounded-lg border-2 border-slate-800 bg-white shadow-md" />
          </div>
          <div className="rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-lg">
            <p className="text-[10px] font-black uppercase text-slate-500">Foto + GPS</p>
            <p className="text-sm font-black text-slate-900">REP-2026-001248</p>
          </div>
        </div>
      )}

      {variant === 'field' && (
        <div className="absolute bottom-12 left-10 right-8 flex items-end justify-between">
          <div className="flex gap-3">
            {[0, 1].map((item) => (
              <div key={item} className="relative h-28 w-14">
                <div className="absolute left-3 top-0 h-8 w-8 rounded-full bg-amber-200" />
                <div className="absolute bottom-0 h-20 w-14 rounded-t-2xl bg-orange-500 shadow-lg" />
                <HardHat className="absolute left-2 top-[-8px] h-10 w-10 text-yellow-400" />
              </div>
            ))}
          </div>
          <div className="h-12 w-28 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-lg">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Resolvido</p>
            <div className="mt-1 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      )}

      {variant === 'dashboard' && (
        <div className="absolute bottom-10 left-8 right-8 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-blue-50 p-3"><p className="text-lg font-black text-blue-900">842</p></div>
            <div className="rounded-lg bg-emerald-50 p-3"><p className="text-lg font-black text-emerald-700">76%</p></div>
            <div className="rounded-lg bg-amber-50 p-3"><p className="text-lg font-black text-amber-700">3,2d</p></div>
          </div>
          <div className="mt-3 flex h-16 items-end gap-2">
            {[50, 70, 42, 85, 60, 74].map((height) => (
              <div key={height} className="flex-1 rounded-t bg-[#1E3A8A]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      )}

      {variant === 'map' && <MapCanvas compact />}

      <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">
        {data.title}
      </div>
    </div>
  );
}

function MapCanvas({ compact = false }: { compact?: boolean }) {
  const pins = [
    ['bg-red-500', 'left-[46%] top-[34%]'],
    ['bg-amber-400', 'left-[25%] top-[48%]'],
    ['bg-orange-500', 'left-[62%] top-[57%]'],
    ['bg-emerald-500', 'left-[74%] top-[30%]'],
    ['bg-purple-500', 'left-[34%] top-[72%]'],
    ['bg-blue-500', 'left-[82%] top-[68%]'],
    ['bg-cyan-500', 'left-[54%] top-[78%]'],
  ];

  return (
    <div className={`${compact ? 'absolute inset-0' : 'relative min-h-[420px]'} overflow-hidden rounded-2xl bg-[#f8fafc]`}>
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice">
        <path d="M-60 150 C130 240 190 260 380 460 S720 560 880 500" fill="none" stroke="#94a3b8" strokeWidth="9" />
        <path d="M120 -80 L300 640" fill="none" stroke="#cbd5e1" strokeWidth="16" />
        <path d="M520 -80 L410 640" fill="none" stroke="#bae6fd" strokeWidth="28" strokeLinecap="round" />
        <path d="M-40 390 L850 140" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <path d="M20 90 L780 360" fill="none" stroke="#e2e8f0" strokeWidth="7" />
      </svg>
      {pins.map(([color, pos]) => (
        <span
          key={`${color}-${pos}`}
          className={`absolute ${pos} z-10 h-7 w-7 -translate-x-1/2 -translate-y-full rounded-full border-2 border-white ${color} shadow-lg`}
        >
          <span className={`absolute left-1/2 top-[18px] h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-white ${color}`} />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm" />
        </span>
      ))}
    </div>
  );
}

function HeroProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <figure className="relative min-h-[520px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-200 shadow-2xl">
        <img
          src={heroCitizenReporting}
          alt="Cidadão usando o celular na rua para registrar uma ocorrência urbana."
          className="h-full min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
        <figcaption className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/92 p-4 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Chamado em análise</p>
              <p className="mt-1 text-lg font-black text-slate-950">REP-2026-001248 · Buraco na via</p>
            </div>
            <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-2 text-xs font-black text-purple-700">
              IA: secretaria sugerida
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['1.248', 'chamados/mês'],
              ['76%', 'em atendimento'],
              ['42', 'bairros'],
              ['93%', 'triagem IA'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-xl font-black text-[#1E3A8A]">{value}</p>
                <p className="text-[10px] font-black uppercase text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

function SectionTitle({ kicker, title, text, align = 'center' }: { kicker?: string; title: string; text?: string; align?: 'center' | 'left' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl`}>
      {kicker && <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-blue-700">{kicker}</p>}
      <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      {text && <p className="mt-5 text-lg font-medium leading-relaxed text-slate-600">{text}</p>}
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header id="topo" className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <LogoMark />
          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#como-funciona" className="text-sm font-bold text-slate-600 hover:text-[#1E3A8A]">Como funciona</a>
            <a href="#gestao-publica" className="text-sm font-bold text-slate-600 hover:text-[#1E3A8A]">Para prefeituras</a>
            <a href="#mapa" className="text-sm font-bold text-slate-600 hover:text-[#1E3A8A]">Mapa e dashboard</a>
            <a href="#ia" className="flex items-center gap-1 text-sm font-bold text-[#1E3A8A] hover:text-blue-600">
              <Sparkles className="h-4 w-4" /> Inteligência artificial
            </a>
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-[#1E3A8A]">Acessar</button>
          </nav>
          <Button className="h-11 bg-[#1E3A8A] px-4 text-xs font-black uppercase tracking-wide text-white hover:bg-[#152c6e] sm:px-6" onClick={() => navigate('/login')}>
            Acessar plataforma
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#10245d] px-4 py-16 text-white md:px-8 lg:py-24">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Viu um problema na cidade? reportaAI.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-blue-100 lg:mx-0">
                A plataforma que transforma solicitações da população em chamados com foto, localização, protocolo e gestão em tempo real para prefeituras.
              </p>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                O cidadão informa. A prefeitura acompanha. A cidade melhora.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button size="lg" className="h-14 bg-white px-7 text-sm font-black uppercase tracking-wide text-[#1E3A8A] hover:bg-slate-100" onClick={() => navigate('/login?flow=register')}>
                  Registrar problema
                </Button>
                <Button size="lg" className="h-14 border border-blue-400 bg-blue-600 px-7 text-sm font-black uppercase tracking-wide text-white hover:bg-blue-700" onClick={() => navigate('/login?role=admin')}>
                  Acessar gestão
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {[
                  [Camera, 'Foto do local'],
                  [MapPin, 'Localização por GPS'],
                  [ClipboardCheck, 'Protocolo de atendimento'],
                  [BarChart3, 'Dashboard para gestores'],
                  [Sparkles, 'Triagem com IA'],
                ].map(([Icon, label]) => (
                  <span key={label as string} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[10px] font-bold leading-none text-blue-50">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-200" /> {label as string}
                  </span>
                ))}
              </div>
            </div>
            <HeroProductMockup />
          </div>
        </section>

        <section id="problema" className="px-4 py-20 md:px-8">
          <SectionTitle
            title="Hoje, muitas reclamações se perdem em canais informais."
            text="WhatsApp, redes sociais, ligações e comentários espalhados dificultam o controle, a localização, os prazos e a resposta ao cidadão."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-4">
            {problemCards.map(([title, text, Icon]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="border-y border-slate-200 bg-white px-4 py-20 md:px-8">
          <SectionTitle
            title="O reportaAI transforma cada solicitação em um chamado inteligente."
            text="Cada demanda registrada pelo cidadão vira um chamado georreferenciado, com foto, categoria, protocolo, secretaria responsável, status e histórico de atendimento."
          />
          <div className="relative mx-auto mt-14 max-w-6xl">
            <div className="absolute left-12 right-12 top-10 hidden h-0.5 bg-slate-200 md:block" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              {flowSteps.map(([title, desc, Icon], index) => (
                <div key={title} className="relative rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] shadow-sm">
                    <Icon className="h-7 w-7" />
                  </div>
                  {index < flowSteps.length - 1 && <ArrowRight className="absolute -right-5 top-9 z-10 hidden h-5 w-5 text-slate-300 md:block" />}
                  <p className="font-black text-slate-900">{title}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle title="Do registro à solução, tudo acompanhado." text="Cada etapa do atendimento fica registrada, desde o envio da solicitação pelo cidadão até a resolução pela equipe responsável." />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {[
                ['O cidadão registra', 'Foto, localização e descrição pelo celular.', 'citizenReporting', 'phone'],
                ['A prefeitura acompanha', 'Triagem, secretaria responsável e status em tempo real.', 'cityDashboard', 'dashboard'],
                ['A equipe resolve', 'Atualização do chamado, histórico e comprovação do atendimento.', 'fieldTeam', 'field'],
              ].map(([title, text, scene, variant]) => (
                <article key={title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <VisualScene scene={scene as keyof typeof imageScenes} variant={variant as 'street' | 'field' | 'dashboard' | 'map' | 'phone'} className="rounded-none border-0 shadow-none" />
                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-950">{title}</h3>
                    <p className="mt-2 font-medium leading-relaxed text-slate-600">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-20 md:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="flex items-center gap-4 text-2xl font-black text-slate-950">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Smartphone className="h-6 w-6" /></span>
                Para o cidadão
              </h2>
              <ul className="mt-7 space-y-4">
                {['Registra pelo celular.', 'Envia foto e localização.', 'Recebe protocolo.', 'Acompanha o andamento.', 'Usa um canal oficial com a prefeitura.'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base font-bold text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#1E3A8A] bg-[#1E3A8A] p-8 text-white shadow-xl">
              <h2 className="flex items-center gap-4 text-2xl font-black">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-cyan-200"><ShieldCheck className="h-6 w-6" /></span>
                Para a prefeitura
              </h2>
              <ul className="mt-7 space-y-4">
                {['Recebe demandas organizadas.', 'Encaminha por secretaria.', 'Acompanha tudo no mapa.', 'Controla prazos e status.', 'Gera relatórios e indicadores.'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base font-bold text-blue-50">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="gestao-publica" className="bg-slate-50 px-4 py-20 md:px-8">
          <SectionTitle
            title="Por que sua prefeitura precisa do reportaAI?"
            text="Porque a cidade já recebe demandas todos os dias. A diferença é transformar essas reclamações em dados organizados, protocolos rastreáveis e decisões mais eficientes."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whyCards.map(([title, text, Icon]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Icon className="mb-5 h-7 w-7 text-[#1E3A8A]" />
                <h3 className="text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="mapa" className="border-y border-slate-200 bg-white px-4 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionTitle
                align="left"
                title="Mapa, indicadores e relatórios em uma única plataforma."
                text="A prefeitura acompanha os chamados por bairro, categoria, prioridade, secretaria e status, visualizando pontos críticos da cidade e tomando decisões com base em dados reais."
              />
              <VisualScene scene="cityDashboard" variant="dashboard" className="mt-8 min-h-[300px]" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-xl">
              <div className="mb-4 flex flex-wrap gap-2">
                {['Bairro', 'Categoria', 'Status', 'Secretaria'].map((filter) => (
                  <span key={filter} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">
                    <Filter className="h-3.5 w-3.5" /> {filter}
                  </span>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <MapCanvas />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['842', 'Abertos', 'text-[#1E3A8A]'],
                      ['4.105', 'Resolvidos', 'text-emerald-700'],
                      ['12%', 'Atrasados', 'text-red-600'],
                      ['3,2d', 'Tempo médio', 'text-slate-900'],
                    ].map(([value, label, color]) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                        <p className="mt-1 text-[10px] font-black uppercase text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-black uppercase text-slate-500">Chamados por categoria</p>
                    <div className="flex h-28 items-end gap-2">
                      {[80, 54, 66, 38, 44, 30].map((height) => (
                        <div key={height} className="flex-1 rounded-t bg-[#1E3A8A]" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-black uppercase text-slate-500">Bairros com mais demandas</p>
                    {['Centro', 'Vila Aurora', 'Jardim Atlântico'].map((bairro, index) => (
                      <div key={bairro} className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
                        <span>{bairro}</span><span>{[145, 98, 42][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] font-black text-slate-700 md:grid-cols-4">
                {[
                  ['bg-red-500', 'Infraestrutura'],
                  ['bg-amber-400', 'Iluminação pública'],
                  ['bg-orange-500', 'Limpeza urbana'],
                  ['bg-emerald-500', 'Meio ambiente'],
                  ['bg-purple-500', 'Trânsito'],
                  ['bg-blue-500', 'Saúde'],
                  ['bg-cyan-500', 'Educação'],
                  ['bg-slate-500', 'Outros'],
                ].map(([color, label]) => (
                  <span key={label} className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${color}`} /> {label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="ia" className="bg-slate-50 px-4 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-purple-700">
                <BrainCircuit className="h-4 w-4" /> Diferencial
              </p>
              <SectionTitle
                align="left"
                title="AI para acelerar a triagem e apoiar decisões."
                text="A inteligência artificial do reportaAI ajuda a classificar demandas, sugerir prioridades, identificar chamados duplicados e gerar resumos para gestores públicos."
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {aiCards.map(([title, text]) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Sparkles className="mb-5 h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-black text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#1E3A8A] px-4 py-24 text-center text-white md:px-8">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
          <div className="relative mx-auto max-w-4xl">
            <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
              O cidadão informa. A prefeitura acompanha. A cidade melhora.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl font-medium leading-relaxed text-blue-100">
              Com o reportaAI, municípios transformam reclamações espalhadas em chamados organizados, geolocalizados e acompanhados em tempo real.
            </p>
            <p className="mt-8 text-2xl font-black italic text-white">"Viu um problema na cidade? reportaAI."</p>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-4 py-12 text-slate-400 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-2xl font-black text-white">reporta<span className="text-blue-500">AI</span></p>
            <p className="mt-2 text-sm">Plataforma inteligente de gestão urbana para prefeituras.</p>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-800 pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <p>© 2026 reportaAI. Todos os direitos reservados.</p>
          <p>Desenvolvido por KNGflow.</p>
        </div>
      </footer>
    </div>
  );
}
