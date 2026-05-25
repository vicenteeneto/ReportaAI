import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { CitizenLayout } from './components/layout/CitizenLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { CitizenHome } from './pages/citizen/CitizenHome';
import { CitizenNewTicket } from './pages/citizen/CitizenNewTicket';
import { CitizenTickets } from './pages/citizen/CitizenTickets';
import { CitizenMap } from './pages/citizen/CitizenMap';
import { CitizenProfile } from './pages/citizen/CitizenProfile';
import { CitizenRanking } from './pages/citizen/CitizenRanking';
import { CitizenNews } from './pages/citizen/CitizenNews';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ExecDashboard } from './pages/admin/ExecDashboard';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminTriage } from './pages/admin/AdminTriage';
import { AdminMap } from './pages/admin/AdminMap';
import { AdminSettings } from './pages/admin/AdminSettings';
import { SystemSettings } from './pages/admin/SystemSettings';
import { AdminSetup } from './pages/AdminSetup';

import { AdminReports } from './pages/admin/AdminReports';

const AppRoutes = () => {
  const { currentUser, loading } = useAppContext();
  const role = currentUser?.role;
  const adminRoles = ['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'];
  const canAccessAdmin = !!role && adminRoles.includes(role);

  // Se o contexto ainda estiver carregando a sessão, mostramos um loader para evitar redirecionamentos errados
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold tracking-widest text-xs">Carregando reportaAI...</p>
      </div>
    );
  }

  // Determine the default dashboard route based on user role
  const getDashboardRoute = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'superadmin') {
      return '/admin/system';
    }
    if (currentUser.role === 'admin' || currentUser.role === 'coordinator' || currentUser.role === 'mayor' || currentUser.role === 'secretary') {
      return '/admin/dashboard';
    }
    return '/citizen';
  };

  const requireRole = (allowedRoles: string[], element: React.ReactNode) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(currentUser.role)) return <Navigate to={getDashboardRoute()} replace />;
    return element;
  };

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />} />
      <Route path="/login" element={currentUser ? <Navigate to={getDashboardRoute()} replace /> : <LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Citizen Area */}
      <Route path="/citizen" element={requireRole(['citizen'], <CitizenLayout />)}>
        <Route index element={<CitizenHome />} />
        <Route path="new" element={<CitizenNewTicket />} />
        <Route path="tickets" element={<CitizenTickets />} />
        <Route path="tickets/:id" element={<CitizenTickets />} />
        <Route path="map" element={<CitizenMap />} />
        <Route path="profile" element={<CitizenProfile />} />
        <Route path="ranking" element={<CitizenRanking />} />
        <Route path="news" element={<CitizenNews />} />
      </Route>

      {/* Admin Area */}
      <Route path="/admin" element={canAccessAdmin ? <AdminLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={requireRole(['admin', 'mayor', 'secretary', 'coordinator', 'superadmin'], <AdminDashboard />)} />
        <Route path="executive" element={requireRole(['mayor', 'admin', 'superadmin'], <ExecDashboard />)} />
        <Route path="new" element={requireRole(['admin', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'], <CitizenNewTicket />)} />
        <Route path="tickets" element={requireRole(['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'], <AdminTickets />)} />
        <Route path="tickets/:id" element={requireRole(['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'field', 'superadmin'], <AdminTickets />)} />
        <Route path="triage" element={requireRole(['admin', 'triage', 'superadmin'], <AdminTriage />)} />
        <Route path="map" element={requireRole(['admin', 'mayor', 'secretary', 'coordinator', 'triage', 'superadmin'], <AdminMap />)} />
        <Route path="reports" element={requireRole(['admin', 'mayor', 'secretary', 'coordinator', 'superadmin'], <AdminReports />)} />
        <Route path="settings" element={requireRole(['admin', 'superadmin'], <AdminSettings />)} />
        <Route path="system" element={requireRole(['superadmin'], <SystemSettings />)} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

