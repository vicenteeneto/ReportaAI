import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MapPin, Camera, ClipboardCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'secretary' || currentUser.role === 'mayor') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/citizen', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="h-16 bg-[#1E3A8A] flex items-center justify-between px-6 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-[#1E3A8A] rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tight">Cidade Conecta</h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest">Rondonópolis</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-[#1E3A8A] h-9 px-4 text-xs font-semibold uppercase tracking-wider" 
          onClick={() => navigate('/login')}
        >
          Acessar
        </Button>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 w-full">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              Zeladoria urbana <br className="hidden md:block"/> colaborativa.
            </h2>
            <p className="text-base text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
              Aponte problemas na infraestrutura da cidade. Sua solicitação vai direto para a secretaria responsável, e você acompanha a resolução em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <Button size="lg" className="w-full sm:w-auto text-sm px-8 uppercase tracking-wide font-bold" onClick={() => navigate('/login?flow=register')}>
                Registrar Problema
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-8 uppercase tracking-wide font-bold" onClick={() => navigate('/login?role=admin')}>
                Acesso Gestão
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md relative hidden md:flex items-center justify-center">
            <div className="w-full max-w-[320px] bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col items-center">
               <div className="w-full h-48 bg-slate-100 relative overflow-hidden">
                  {/* CSS Grid Pattern simulating a local map */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <div className="absolute right-4 top-4 bottom-4 w-6 bg-slate-200/50 transform rotate-12"></div>
                  <div className="absolute left-8 top-0 bottom-0 w-8 bg-slate-200/50 transform -rotate-12"></div>
                  <div className="absolute bottom-4 right-4 bg-[#1E3A8A] text-white p-2 rounded-lg shadow-lg z-10">
                     <MapPin className="w-5 h-5" />
                  </div>
               </div>
               <div className="p-5 w-full text-left space-y-1 bg-white relative z-10 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">Resolvido</span>
                    <span className="text-[10px] text-slate-400 font-mono">HOJE 09:42</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">Buraco na Via</p>
                  <p className="text-xs text-slate-500 truncate">Av. Marechal Rondon, Centro</p>
               </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-t border-slate-200 py-16 flex-1 flex flex-col justify-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-[#1E3A8A] rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Evidência Fotográfica</h4>
                  <p className="text-slate-600 text-sm leading-snug">O cidadão anexa fotos do local, agilizando a triagem pela equipe técnica da prefeitura.</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-[#1E3A8A] rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Georreferenciamento</h4>
                  <p className="text-slate-600 text-sm leading-snug">Localização exata via GPS no momento da abertura do chamado para as equipes de campo.</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-[#1E3A8A] rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Rastreabilidade Total</h4>
                  <p className="text-slate-600 text-sm leading-snug">O protocolo gerado acompanha cada movimentação do chamado até a conclusão.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
