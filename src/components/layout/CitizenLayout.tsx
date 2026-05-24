import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, MapPinned, List, LogOut, Trophy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function CitizenLayout() {
  const location = useLocation();
  const { currentUser, logout } = useAppContext();

  const navItems = [
    { label: 'Início', icon: Home, path: '/citizen' },
    { label: 'Novo', icon: PlusSquare, path: '/citizen/new' },
    { label: 'Mapa', icon: MapPinned, path: '/citizen/map' },
    { label: 'Ranking', icon: Trophy, path: '/citizen/ranking' },
    { label: 'Meus', icon: List, path: '/citizen/tickets' },
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="h-14 bg-[#1E3A8A] flex items-center justify-between px-4 text-white shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <div className="w-4 h-4 border-[3px] border-[#1E3A8A] rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight tracking-tight">reporta<span className="text-blue-500">AI</span></h1>
            <p className="text-[9px] opacity-80 uppercase tracking-widest leading-none">Cidadão</p>
          </div>
        </div>
        {currentUser && (
          <div className="flex items-center gap-2">
            <Link to="/citizen/profile" className="flex items-center justify-center w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors overflow-hidden">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold uppercase">{currentUser.name.charAt(0)}</span>
              )}
            </Link>
            <button type="button" onClick={logout} className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-white relative z-50 cursor-pointer pointer-events-auto" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 pb-[60px] md:pb-0 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 md:hidden pb-safe z-20 h-[60px]">
        <ul className="flex justify-around items-center h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/citizen' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path} className="flex-1 h-full flex">
                <Link
                  to={item.path}
                  className={`flex-1 flex flex-col items-center justify-center transition-colors ${isActive ? 'text-[#1E3A8A] bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
