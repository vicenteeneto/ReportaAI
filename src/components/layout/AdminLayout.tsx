import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export function AdminLayout() {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const canManageTickets = ['admin', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'].includes(currentUser?.role || '');

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'superadmin'] },
    { label: 'Mapa Georreferenciado', path: '/admin/map', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'superadmin'] },
    { label: 'Gestao de Chamados', path: '/admin/tickets', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'] },
    { label: 'Triagem', path: '/admin/triage', showFor: ['admin', 'triage', 'superadmin'] },
    { label: 'Painel Executivo', path: '/admin/executive', showFor: ['mayor', 'admin', 'superadmin'] },
  ];

  const manageItems = [
    { label: 'KNG Flow', path: '/admin/system', showFor: ['superadmin'] },
    { label: 'Secretarias', path: '/admin/settings', showFor: ['admin', 'superadmin'] },
    { label: 'Relatorios PDF', path: '/admin/reports', showFor: ['admin', 'mayor', 'secretary', 'coordinator', 'superadmin'] },
  ];

  const roleLabel =
    currentUser?.role === 'superadmin' ? 'Super Admin' :
    currentUser?.role === 'admin' ? 'Administrador' :
    currentUser?.role === 'mayor' ? 'Prefeito' :
    currentUser?.role === 'secretary' ? 'Secretario' :
    currentUser?.role === 'coordinator' ? 'Coordenador' :
    currentUser?.role === 'triage' ? 'Triagem' :
    currentUser?.role === 'field' ? 'Campo' :
    currentUser?.role === 'citizen' ? 'Cidadao' : currentUser?.role;

  useEffect(() => {
    if (!currentUser?.id) return;

    const presenceScope = currentUser.role === 'superadmin' ? 'global' : currentUser.cityId || 'sem-cidade';
    const channel = supabase.channel(`reportaai-online-users:${presenceScope}`, {
      config: { presence: { key: currentUser.id } },
    });

    const updatePresenceCount = () => {
      const state = channel.presenceState();
      setOnlineUsers(Object.keys(state).length);
    };

    channel
      .on('presence', { event: 'sync' }, updatePresenceCount)
      .on('presence', { event: 'join' }, updatePresenceCount)
      .on('presence', { event: 'leave' }, updatePresenceCount)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            onlineAt: new Date().toISOString(),
          });
          updatePresenceCount();
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentUser?.name, currentUser?.role, currentUser?.cityId]);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      <header className="h-16 bg-[#1E3A8A] flex items-center justify-between px-6 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-[#1E3A8A] rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">reporta<span className="text-blue-500">AI</span></h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest">Gestao Urbana Inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4 text-sm font-medium">
            <span className="opacity-100 border-b-2 border-white pb-1">Visao Administrativa</span>
            {currentUser?.role !== 'superadmin' && <span className="opacity-50">Portal do Cidadao</span>}
          </nav>
          <div className="flex items-center gap-3 pl-6 border-l border-white/20">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold">{currentUser?.name}</p>
              <p className="text-[10px] opacity-70 italic">Logado como {roleLabel}</p>
            </div>
            <button type="button" onClick={logout} className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-[#1E3A8A] hover:bg-white transition-colors relative z-50 cursor-pointer pointer-events-auto" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white border-r border-slate-200 flex-col py-4 shrink-0 overflow-y-auto hidden md:flex transition-all duration-200`}>
          <div className="px-3 mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#1E3A8A] hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-colors"
              title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          {canManageTickets && (
            <div className={`${sidebarCollapsed ? 'px-2' : 'px-4'} mb-6`}>
              <button
                type="button"
                onClick={() => navigate('/admin/new')}
                className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                title="Novo Chamado"
              >
                <span className="text-lg leading-none">+</span>
                {!sidebarCollapsed && <span>Novo Chamado</span>}
              </button>
            </div>
          )}
          <nav className="flex-1">
            <div className="px-3 mb-2">
              {!sidebarCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Principal</p>}
              <div className="space-y-1">
                {navItems.filter(item => item.showFor.includes(currentUser?.role || '')).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${sidebarCollapsed ? 'justify-center' : ''} ${
                        isActive
                          ? 'bg-slate-100 text-[#1E3A8A] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#1E3A8A]' : 'bg-slate-300'}`}></div>
                        {!sidebarCollapsed && item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="px-3 mt-6">
              {!sidebarCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gestao</p>}
              <div className="space-y-1">
                {manageItems.filter(item => item.showFor.includes(currentUser?.role || '')).map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${sidebarCollapsed ? 'justify-center text-center' : ''} ${
                        isActive
                          ? 'bg-slate-100 text-[#1E3A8A] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    {sidebarCollapsed ? item.label.charAt(0) : item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {!sidebarCollapsed && <div className="mt-auto p-4 border-t border-slate-100 shrink-0">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">Usuários Online</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                <span className="text-xs text-blue-800 font-medium">{onlineUsers} online agora</span>
              </div>
            </div>
          </div>}
        </aside>

        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
