import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Ticket, Category, Department } from '../data/types';
import { mockUsers, mockTickets, mockCategories, mockDepartments } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  login: (email: string) => void;
  logout: () => void;
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  categories: Category[];
  departments: Department[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [categories] = useState<Category[]>(mockCategories);
  const [departments] = useState<Department[]>(mockDepartments);

  const login = (email: string) => {
    // Simple mock login
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      // Default to citizen if not found, just for prototype ease
      setCurrentUser(mockUsers[0]);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addTicket = (t: Ticket) => {
    setTickets(prev => [t, ...prev]);
  };

  const updateTicketStatus = (id: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
  };

  return (
    <AppContext.Provider value={{ currentUser, login, logout, tickets, addTicket, updateTicketStatus, categories, departments }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
