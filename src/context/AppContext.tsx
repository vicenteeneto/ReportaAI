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
    const loadData = async (userProfile?: User) => {
      setLoading(true);
      const [depsRes, catsRes, ticketsRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('tickets').select('*').order('created_at', { ascending: false })
      ]);
      
      if (ticketsRes.error) {
        console.error("Error fetching tickets:", ticketsRes.error);
      }

      let deps = depsRes.data || [];
      let cats = catsRes.data || [];

      // Auto-seed para não ficar em branco caso o SQL não tenha rodado
      if (deps.length === 0 && !depsRes.error) {
        const defaultDeps = [
          { id: 'dep-infra', name: 'Secretaria Municipal de Infraestrutura', acronym: 'SINFRA', active: true, color: '#eab308' },
          { id: 'dep-saude', name: 'Secretaria Municipal de Saúde', acronym: 'SMS', active: true, color: '#ef4444' },
          { id: 'dep-meio', name: 'Secretaria Municipal de Meio Ambiente', acronym: 'SEMMA', active: true, color: '#22c55e' },
          { id: 'dep-mobilidade', name: 'Secretaria de Transporte e Trânsito', acronym: 'SETAT', active: true, color: '#3b82f6' }
        ];
        deps = defaultDeps;
        try { await supabase.from('departments').insert(defaultDeps); } catch(e) {}
      }

      if (cats.length === 0 && !catsRes.error) {
        const defaultCatsDb = [
          { id: 'cat-buraco', name: 'Buraco na rua', icon_name: 'AlertTriangle', color: 'bg-orange-500', default_department_id: 'dep-infra', default_priority: 'high' },
          { id: 'cat-iluminacao', name: 'Iluminação pública', icon_name: 'Lightbulb', color: 'bg-yellow-500', default_department_id: 'dep-infra', default_priority: 'medium' },
          { id: 'cat-lixo', name: 'Lixo ou entulho', icon_name: 'Trash2', color: 'bg-amber-700', default_department_id: 'dep-infra', default_priority: 'medium' },
          { id: 'cat-mato', name: 'Mato alto', icon_name: 'Leaf', color: 'bg-green-500', default_department_id: 'dep-meio', default_priority: 'low' },
          { id: 'cat-arvore', name: 'Risco Ambiental / Árvore', icon_name: 'TreePine', color: 'bg-emerald-700', default_department_id: 'dep-meio', default_priority: 'high' }
        ];
        cats = defaultCatsDb;
        try { await supabase.from('categories').insert(defaultCatsDb); } catch(e) { console.error('Failed to seed categories', e); }
      }

      // Handle raw cases from DB due to postgres unquoted columns
      const mappedCats = cats.map(c => ({
        ...c,
        iconName: c.icon_name || c.iconName || c.iconname || 'HelpCircle',
        defaultDepartmentId: c.default_department_id || c.defaultDepartmentId || c.defaultdepartmentid,
        defaultPriority: c.default_priority || c.defaultPriority || c.defaultpriority || 'low',
      }));

      const fetchedTickets = (ticketsRes.data || []).map(t => {
        const mappedTicket = {
          ...t,
          categoryId: t.categoryid || t.categoryId || t.category_id,
          departmentId: t.departmentid || t.departmentId || t.department_id,
          photoUrl: t.photourl || t.photoUrl || t.photo_url,
          resolvedPhotoUrl: t.resolvedphotourl || t.resolvedPhotoUrl || t.resolved_photo_url,
          userId: t.userid || t.userId || t.user_id,
          createdAt: new Date(t.created_at || t.createdAt || Date.now()).getTime(),
          updatedAt: new Date(t.updated_at || t.updatedAt || Date.now()).getTime(),
        };
        return mappedTicket;
      });

      console.log("Fetched and mapped tickets:", fetchedTickets.length);
      if (fetchedTickets.length > 0) {
        console.log("First ticket sample:", { 
          id: fetchedTickets[0].id, 
          userId: fetchedTickets[0].userId,
          protocol: fetchedTickets[0].protocol
        });
      }

      setDepartments(deps);
      setCategories(mappedCats);
      setTickets(fetchedTickets);
      
      // Calculate points for current user if available
      const activeUser = userProfile || currentUser;
      if (activeUser) {
        const userTickets = fetchedTickets.filter(t => t.userId === activeUser.id);
        const validating = userTickets.filter(t => !['resolved', 'closed', 'rejected', 'duplicated'].includes(t.status)).length * 10;
        const validated = userTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length * 50;
        
        setCurrentUser({
          ...activeUser,
          pointsValidating: validating,
          pointsValidated: validated
        });
      }
      
      setLoading(false);
    };

    const subscribeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const fetchUserProfile = async (userId: string) => {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        if (data) {
          const mappedUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as any,
            avatarUrl: data.avatar_url || data.avatarurl || data.avatarUrl || null,
            departmentId: data.department_id || data.departmentid || data.departmentId || null
          };
          return mappedUser;
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
               avatar_url: avatarUrl
             };
             const { error: insErr } = await supabase.from('users').upsert(newUser);
             if (insErr) console.error("Error creating user", insErr);
             
             return {
               ...newUser,
               avatarUrl: newUser.avatar_url,
               role: newUser.role as any
             } as User;
           }
        }
        return null;
      };

      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          await loadData(profile);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) await loadData(profile);
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
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  const addTicket = async (t: Ticket) => {
    const insertPayload: any = {
      id: t.id,
      protocol: t.protocol,
      user_id: t.userId,
      category_id: t.categoryId,
      department_id: t.departmentId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      latitude: t.latitude,
      longitude: t.longitude,
      address: t.address,
      neighborhood: t.neighborhood,
      photo_url: t.photoUrl,
    };

    const { error, data } = await supabase.from('tickets').insert(insertPayload).select().single();

    if (error) {
      console.error('Error saving ticket:', error);
      throw error;
    }

    const savedTicket = data ? { 
      ...t, 
      id: data.id, 
      userId: data.user_id || data.userId || data.userid,
      createdAt: new Date(data.created_at || Date.now()).getTime() 
    } : { ...t, createdAt: Date.now() };

    setTickets(prev => [savedTicket, ...prev]);
  };

  const updateTicketStatus = async (id: string, status: TicketStatus) => {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (!error) {
       setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
       await supabase.from('ticket_history').insert({
          ticket_id: id,
          user_id: currentUser?.id,
          action: `Status alterado para ${status}`,
          new_status: status
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
