import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Ticket, Category, Department } from '../data/types';
import { mockUsers, mockTickets, mockCategories, mockDepartments } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  login: (email: string) => Promise<void> | void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void> | void;
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  categories: Category[];
  departments: Department[];
  loading?: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, catRes, ticketRes] = await Promise.all([
          supabase.from('departments').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('tickets').select('*').order('created_at', { ascending: false }) // note: unquoted postgres names are lowercase
        ]);

        if (deptRes.data && deptRes.data.length > 0) {
          setDepartments(deptRes.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            acronym: d.acronym,
            active: d.active,
            color: d.color
          })));
        }

        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            iconName: c.iconname,
            color: c.color,
            defaultDepartmentId: c.defaultdepartmentid,
            defaultPriority: c.defaultpriority
          })));
        }

        if (ticketRes.data && ticketRes.data.length > 0) {
          setTickets(ticketRes.data.map((t: any) => ({
            id: t.id,
            protocol: t.protocol,
            userId: t.userid,
            categoryId: t.categoryid,
            departmentId: t.departmentid,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            latitude: t.latitude,
            longitude: t.longitude,
            address: t.address,
            neighborhood: t.neighborhood,
            createdAt: t.created_at || t.createdat,
            updatedAt: t.updated_at || t.updatedat,
            dueDate: t.due_date || t.duedate,
            resolvedAt: t.resolved_at || t.resolvedat,
            photoUrl: t.photourl,
            resolvedPhotoUrl: t.resolvedphotourl
          })));
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // User logged in via OAuth or Magic Link
        const { email, user_metadata } = session.user;
        if (email) {
          // Check if user exists in public.users
          let { data: user, error: fetchError } = await supabase.from('users').select('*').eq('email', email).single();
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
          }

          if (!user) {
            // Create user
            const newUser = {
              id: session.user.id, // Ensure we link Auth ID with Public User ID
              name: (user_metadata && user_metadata.full_name) || email.split('@')[0],
              email: email,
              role: 'citizen',
              avatarurl: user_metadata && user_metadata.avatar_url ? user_metadata.avatar_url : null
            };
            const { data: insertedUser, error: insertError } = await supabase.from('users').insert([newUser]).select().single();
            if (insertError) {
              console.error('Error creating user:', insertError);
            }
            user = insertedUser;
          }
          
          if (user) {
            console.log('User found or created:', user);
            setCurrentUser({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              cpf: user.cpf,
              neighborhood: user.neighborhood,
              role: user.role || 'citizen',
              departmentId: user.departmentid,
              avatarUrl: user.avatarurl
            });
          } else {
             console.error("User object is null after fetch and insert attempts.");
          }
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const login = async (email: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (data && !error) {
        setCurrentUser({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          cpf: data.cpf,
          neighborhood: data.neighborhood,
          role: data.role,
          departmentId: data.departmentid,
          avatarUrl: data.avatarurl
        });
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
    }

    // Fallback to mock login
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(mockUsers[0]);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addTicket = async (t: Ticket) => {
    // Optimistic UI update
    setTickets(prev => [t, ...prev]);

    try {
      await supabase.from('tickets').insert([{
        id: t.id,
        protocol: t.protocol,
        userid: t.userId,
        categoryid: t.categoryId,
        departmentid: t.departmentId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        latitude: t.latitude,
        longitude: t.longitude,
        address: t.address,
        neighborhood: t.neighborhood,
        photourl: t.photoUrl
      }]);
    } catch (err) {
      console.error('Error saving ticket:', err);
    }
  };

  const updateTicketStatus = async (id: string, status: Ticket['status']) => {
    const updatedAt = new Date().toISOString();
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt } : t));

    try {
      // we use updated_at because postgres columns without quotes are stored in lowercase if created as such, or match exactly what was defined. (Here defined as updatedAt, but unquoted, so updatedat).
      // well I defined updatedat in the schema script... wait, in schema script it was updatedAt unquoted which means updatedat. But I'll use updatedat to match raw postgres.
      await supabase.from('tickets').update({ status, updatedat: updatedAt }).eq('id', id);
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  return (
    <AppContext.Provider value={{ currentUser, login, loginWithGoogle, logout, tickets, addTicket, updateTicketStatus, categories, departments, loading }}>
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
