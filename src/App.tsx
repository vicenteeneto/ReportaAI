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
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ExecDashboard } from './pages/admin/ExecDashboard';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminTriage } from './pages/admin/AdminTriage';
import { AdminMap } from './pages/admin/AdminMap';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSetup } from './pages/AdminSetup';

// Placeholder for reports
const AdminReports = () => <div className="p-8">Relatórios em desenvolvimento</div>;

const AppRoutes = () => {
  const { currentUser } = useAppContext();

  // Determine the default dashboard route based on user role
  const getDashboardRoute = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin' || currentUser.role === 'secretary' || currentUser.role === 'mayor') {
      return '/admin/dashboard';
    }
    return '/citizen';
  };

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />} />
      <Route path="/login" element={currentUser ? <Navigate to={getDashboardRoute()} replace /> : <LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Citizen Area */}
      <Route path="/citizen" element={currentUser ? <CitizenLayout /> : <Navigate to="/login" />}>
        <Route index element={<CitizenHome />} />
        <Route path="new" element={<CitizenNewTicket />} />
        <Route path="tickets" element={<CitizenTickets />} />
        <Route path="tickets/:id" element={<CitizenTickets />} />
        <Route path="map" element={<CitizenMap />} />
      </Route>

      {/* Admin Area */}
      <Route path="/admin" element={currentUser?.role !== 'citizen' && currentUser ? <AdminLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="executive" element={<ExecDashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="triage" element={<AdminTriage />} />
        <Route path="map" element={<AdminMap />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
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

