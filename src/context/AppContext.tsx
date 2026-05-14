import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Ticket, Category, Department, TicketStatus } from '../data/types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void> | void;
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  categories: Category[];
  departments: Department[];
  loading?: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authListener: any;
    
    // Subscribe to database changes (optional depending on needs, but let's implement basic fetch for now)
    const loadData = async () => {
      setLoading(true);
      const [depsRes, catsRes, ticketsRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('tickets').select('*').order('createdAt', { ascending: false })
      ]);
      
      let deps = depsRes.data || [];
      let cats = catsRes.data || [];

      // Auto-seed para não ficar em branco caso o SQL não tenha rodado
      if (deps.length === 0) {
        const defaultDeps = [
          { id: 'dep-infra', name: 'Secretaria Municipal de Infraestrutura', acronym: 'SINFRA', active: true, color: '#eab308' },
          { id: 'dep-saude', name: 'Secretaria Municipal de Saúde', acronym: 'SMS', active: true, color: '#ef4444' },
          { id: 'dep-meio', name: 'Secretaria Municipal de Meio Ambiente', acronym: 'SEMMA', active: true, color: '#22c55e' },
          { id: 'dep-mobilidade', name: 'Secretaria de Transporte e Trânsito', acronym: 'SETAT', active: true, color: '#3b82f6' }
        ];
        deps = defaultDeps;
        try { await supabase.from('departments').insert(defaultDeps); } catch(e) {}
      }

      if (cats.length === 0) {
        const defaultCatsDb = [
          { id: 'cat-buraco', name: 'Buraco na rua', iconname: 'AlertTriangle', color: 'bg-orange-500', defaultdepartmentid: 'dep-infra', defaultpriority: 'high' },
          { id: 'cat-iluminacao', name: 'Iluminação pública', iconname: 'Lightbulb', color: 'bg-yellow-500', defaultdepartmentid: 'dep-infra', defaultpriority: 'medium' },
          { id: 'cat-lixo', name: 'Lixo ou entulho', iconname: 'Trash2', color: 'bg-amber-700', defaultdepartmentid: 'dep-infra', defaultpriority: 'medium' },
          { id: 'cat-mato', name: 'Mato alto', iconname: 'Leaf', color: 'bg-green-500', defaultdepartmentid: 'dep-meio', defaultpriority: 'low' },
          { id: 'cat-arvore', name: 'Risco Ambiental / Árvore', iconname: 'TreePine', color: 'bg-emerald-700', defaultdepartmentid: 'dep-meio', defaultpriority: 'high' }
        ];
        cats = defaultCatsDb;
        try { await supabase.from('categories').insert(defaultCatsDb); } catch(e) { console.error('Failed to seed categories', e); }
      }

      // Handle raw cases from DB due to postgres unquoted columns
      const mappedCats = cats.map(c => ({
        ...c,
        iconName: c.iconName || c.iconname || 'HelpCircle',
        defaultDepartmentId: c.defaultDepartmentId || c.defaultdepartmentid,
        defaultPriority: c.defaultPriority || c.defaultpriority || 'low',
      }));

      const mappedTickets = (ticketsRes.data || []).map(t => ({
        ...t,
        categoryId: t.categoryId || t.categoryid,
        departmentId: t.departmentId || t.departmentid,
        photoUrl: t.photoUrl || t.photourl,
        resolvedPhotoUrl: t.resolvedPhotoUrl || t.resolvedphotourl,
        userId: t.userId || t.userid,
      }));

      setDepartments(deps);
      setCategories(mappedCats);
      setTickets(mappedTickets);
      
      setLoading(false);
    };

    const subscribeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const fetchUserProfile = async (userId: string) => {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        if (data) {
          setCurrentUser(data as User);
        } else {
          // In case user hasn't synced to users table, fetch profile email
           const { data: authData } = await supabase.auth.getUser();
           if (authData.user) {
             const metadata = authData.user.user_metadata || {};
             const name = metadata.full_name || metadata.name || authData.user.email?.split('@')[0] || 'Usuário';
             const avatarUrl = metadata.avatar_url || metadata.picture || null;
             
             const newUser = {
               id: userId,
               name: name,
               email: authData.user.email || '',
               role: 'citizen',
               avatarUrl: avatarUrl
             };
             const { error: insErr } = await supabase.from('users').upsert(newUser);
             if (insErr) console.error("Error creating user", insErr);
             setCurrentUser(newUser as any);
           }
        }
      };

      if (session) {
        await fetchUserProfile(session.user.id);
        loadData();
      } else {
        setLoading(false);
      }

      const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          await fetchUserProfile(session.user.id);
          loadData();
        } else {
          setCurrentUser(null);
          setTickets([]);
          setDepartments([]);
          setCategories([]);
        }
      });
      authListener = authSubscription;
    };

    subscribeAuth();

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const registerWithEmail = async (email: string, password: string, role: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (authError) throw authError;

    if (authData.user) {
      await supabase.from('users').upsert({
        id: authData.user.id,
        name: email.split('@')[0], 
        email: authData.user.email,
        role: role,
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addTicket = async (t: Ticket) => {
    const insertPayload: any = {
      id: t.id,
      protocol: t.protocol,
      userId: t.userId,
      categoryId: t.categoryId,
      departmentId: t.departmentId,
      title: t.title,
      description: t.description,
      address: t.address,
      neighborhood: t.neighborhood,
      priority: t.priority,
      status: t.status,
      latitude: t.latitude,
      longitude: t.longitude,
      photoUrl: t.photoUrl
    };

    const { error, data } = await supabase.from('tickets').insert(insertPayload).select().single();

    if (error) {
      console.error('Error saving ticket:', error);
      throw error;
    }

    // Refresh tickets locally
    const savedTicket = data ? { 
      ...t, 
      id: data.id, 
      createdAt: new Date(data.createdAt || data.createdat || Date.now()).getTime() 
    } : { ...t, createdAt: Date.now() };

    setTickets(prev => [savedTicket, ...prev]);
  };

  const updateTicketStatus = async (id: string, status: TicketStatus) => {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (!error) {
       setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
       await supabase.from('ticket_history').insert({
          ticketId: id,
          userId: currentUser?.id,
          action: `Status alterado para ${status}`,
          newStatus: status
       });
    } else {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <AppContext.Provider value={{ currentUser, loginWithEmail, registerWithEmail, loginWithGoogle, logout, tickets, addTicket, updateTicketStatus, categories, departments, loading }}>
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
