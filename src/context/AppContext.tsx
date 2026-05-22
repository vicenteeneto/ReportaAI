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
      try {
        const [depsRes, catsRes, ticketsRes] = await Promise.all([
          supabase.from('departments').select('*').order('name'),
          supabase.from('categories').select('*').order('name'),
          supabase.from('tickets').select('*')
        ]);
        
        const allTickets = ticketsRes.data || [];
        const parseSafeDate = (val: any) => {
          if (!val) return 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            if (/^\d+$/.test(val)) return parseInt(val, 10);
            return new Date(val).getTime();
          }
          return 0;
        };

        const sortedTickets = allTickets.sort((a, b) => {
          const dateA = parseSafeDate(a.createdAt || a.created_at || a.createdat);
          const dateB = parseSafeDate(b.createdAt || b.created_at || b.createdat);
          return dateB - dateA;
        });

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
          iconName: c.iconName || c.icon_name || c.iconname || 'HelpCircle',
          defaultDepartmentId: c.defaultDepartmentId || c.default_department_id || c.defaultdepartmentid,
          defaultPriority: c.defaultPriority || c.default_priority || c.defaultpriority || 'low',
        }));

        const fetchedTickets = sortedTickets.map(t => {
          const mappedTicket = {
            ...t,
            categoryId: t.categoryId || t.categoryid || t.category_id,
            departmentId: t.departmentId || t.departmentid || t.department_id,
            photoUrl: t.photoUrl || t.photourl || t.photo_url,
            resolvedPhotoUrl: t.resolvedPhotoUrl || t.resolvedphotourl || t.resolved_photo_url,
            userId: t.userId || t.userid || t.user_id,
            createdAt: parseSafeDate(t.createdAt || t.created_at || t.createdat) || Date.now(),
            updatedAt: parseSafeDate(t.updatedAt || t.updated_at || t.updatedat) || Date.now(),
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
      } catch (err) {
        console.error("Error in loadData:", err);
      } finally {
        setLoading(false);
      }
    };

    const subscribeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const fetchUserProfile = async (userId: string) => {
          try {
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
               if (authData?.user) {
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
          } catch (err) {
            console.error("Error in fetchUserProfile:", err);
          }
          return null;
        };

        if (session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            await loadData(profile);
          }
        }
      } catch (err) {
        console.error("Error during auth init:", err);
      } finally {
        setLoading(false);
      }

      const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          try {
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            if (data) {
              const mappedUser: User = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as any,
                avatarUrl: data.avatar_url || data.avatarurl || data.avatarUrl || null,
                departmentId: data.department_id || data.departmentid || data.departmentId || null
              };
              await loadData(mappedUser);
            }
          } catch(e) {
            console.error(e);
          }
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    // Força limpeza de estado imediata:
    setCurrentUser(null);
    setTickets([]);
    setDepartments([]);
    setCategories([]);
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
      status: t.status,
      priority: t.priority,
      latitude: t.latitude,
      longitude: t.longitude,
      address: t.address,
      neighborhood: t.neighborhood,
      photoUrl: t.photoUrl,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const { error, data } = await supabase.from('tickets').insert(insertPayload).select().single();

    if (error) {
      console.error('Error saving ticket:', error);
      throw error;
    }

    const savedTicket = data ? { 
      ...t, 
      id: data.id, 
      userId: data.userId || data.user_id || data.userid,
      createdAt: data.createdAt ? (typeof data.createdAt === 'string' && /^\d+$/.test(data.createdAt) ? parseInt(data.createdAt, 10) : new Date(data.createdAt).getTime()) : Date.now()
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
