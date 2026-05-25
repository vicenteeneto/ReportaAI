import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPinned, ListTodo, Filter, Briefcase, FileBarChart, Users, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function AdminLayout() {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();
  const canManageTickets = ['admin', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'].includes(currentUser?.role || '');

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'superadmin'] },
    { label: 'Mapa Georreferenciado', icon: MapPinned, path: '/admin/map', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'superadmin'] },
    { label: 'Gestão de Chamados', icon: ListTodo, path: '/admin/tickets', showFor: ['admin', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'] },
    { label: 'Triagem', icon: Filter, path: '/admin/triage', showFor: ['admin', 'triage', 'superadmin'] },
    { label: 'Painel Executivo', icon: Briefcase, path: '/admin/executive', showFor: ['mayor', 'admin', 'superadmin'] },
  ];

  const manageItems = [
    { label: 'KNG Flow', path: '/admin/system', showFor: ['superadmin'] },
    { label: 'Secretarias', path: '/admin/settings', showFor: ['admin', 'superadmin'] },
    { label: 'Relatórios PDF', path: '/admin/reports', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'superadmin'] },
    { label: 'Usuários', path: '#', showFor: ['admin'] },
  ];

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-[#1E3A8A] flex items-center justify-between px-6 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-[#1E3A8A] rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">reporta<span className="text-blue-500">AI</span></h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest">Gestão Urbana Inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4 text-sm font-medium">
            <span className="opacity-100 border-b-2 border-white pb-1">Visão Administrativa</span>
            <span className="opacity-60 cursor-pointer hover:opacity-100">Portal do Cidadão</span>
          </nav>
          <div className="flex items-center gap-3 pl-6 border-l border-white/20">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold">{currentUser?.name}</p>
              <p className="text-[10px] opacity-70 italic">Logado como {
                currentUser?.role === 'superadmin' ? 'Super Admin' :
                currentUser?.role === 'admin' ? 'Administrador' :
                currentUser?.role === 'mayor' ? 'Prefeito' :
                currentUser?.role === 'secretary' ? 'Secretário' :
                currentUser?.role === 'coordinator' ? 'Coordenador' :
                currentUser?.role === 'triage' ? 'Triagem' :
                currentUser?.role === 'field' ? 'Campo' :
                currentUser?.role === 'citizen' ? 'Cidadão' : currentUser?.role
              }</p>
            </div>
            <button type="button" onClick={logout} className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-[#1E3A8A] hover:bg-white transition-colors relative z-50 cursor-pointer pointer-events-auto" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col py-4 shrink-0 overflow-y-auto hidden md:flex">
          {canManageTickets && (
            <div className="px-4 mb-6">
              <button
                type="button"
                onClick={() => navigate('/admin/tickets')}
                className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Novo Chamado
              </button>
            </div>
          )}
          <nav className="flex-1">
            <div className="px-3 mb-2">
              <p className="text-[10px] font-bold text-slate-400 hover:text-slate-500 uppercase tracking-wider mb-2">Principal</p>
              <div className="space-y-1">
                {navItems.filter(item => item.showFor.includes(currentUser?.role || '')).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive 
                          ? 'bg-slate-100 text-[#1E3A8A] font-semibold' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#1E3A8A]' : 'bg-slate-300'}`}></div>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
            
            <div className="px-3 mt-6">
              <p className="text-[10px] font-bold text-slate-400 hover:text-slate-500 uppercase tracking-wider mb-2">Gestão</p>
              <div className="space-y-1">
                {manageItems.filter(item => item.showFor.includes(currentUser?.role || '')).map((item) => (
                   <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive && item.path !== '#'
                          ? 'bg-slate-100 text-[#1E3A8A] font-semibold' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                   {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
          
          <div className="mt-auto p-4 border-t border-slate-100 shrink-0">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">Status do Sistema</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                <span className="text-xs text-blue-800 font-medium">Servidores Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
