import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Ticket, Category, Department, TicketStatus, City } from '../data/types';
import { supabase } from '../lib/supabase';
import { CATEGORY_OPTIONS, sortCategoriesByRequestedOrder } from '../data/categoryOptions';

interface AppContextType {
  currentUser: User | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, role: string) => Promise<'signed_in' | 'confirmation_required'>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void> | void;
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  categories: Category[];
  departments: Department[];
  cities: City[];
  loading?: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mapDbUser = (data: any): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role as any,
  phone: data.phone || null,
  cpf: data.cpf || null,
  neighborhood: data.neighborhood || null,
  avatarUrl: data.avatar_url || data.avatarurl || data.avatarUrl || null,
  departmentId: data.department_id || data.departmentid || data.departmentId || null,
  cityId: data.city_id || data.cityid || data.cityId || null,
});

const rejectAfter = async <T,>(promise: PromiseLike<T>, label: string, timeoutMs = 15000): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label}: tempo de resposta excedido. Tente novamente.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const authLoadSeq = useRef(0);

  useEffect(() => {
    let authListener: any;

    const withTimeout = async <T,>(promise: PromiseLike<T>, fallback: T, label: string, timeoutMs = 15000): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => {
          console.warn(`${label} timed out`);
          resolve(fallback);
        }, timeoutMs);
      });

      try {
        return await Promise.race([promise, timeoutPromise]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data } = await withTimeout(
          supabase.from('users').select('*').eq('id', userId).single(),
          { data: null, error: null } as any,
          'fetchUserProfile',
          10000
        );

        if (data) {
          return mapDbUser(data);
        }

        const { data: authData } = await withTimeout(
          supabase.auth.getUser(),
          { data: { user: null }, error: null } as any,
          'getUser',
          10000
        );

        if (authData?.user) {
          const metadata = authData.user.user_metadata || {};
          const name = metadata.full_name || metadata.name || authData.user.email?.split('@')[0] || 'Usuario';
          const avatarUrl = metadata.avatar_url || metadata.picture || null;
          const newUser = {
            id: userId,
            name,
            email: authData.user.email || '',
            role: 'citizen',
            avatar_url: avatarUrl
          };

          const { error: insErr } = await supabase.from('users').upsert(newUser);
          if (insErr) console.error("Error creating user", insErr);

          return {
            ...newUser,
            avatarUrl: newUser.avatar_url,
            cityId: null,
            departmentId: null,
            role: newUser.role as any
          } as User;
        }
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
      }
      return null;
    };
    
    // Subscribe to database changes (optional depending on needs, but let's implement basic fetch for now)
    const loadData = async (userProfile?: User, seq?: number) => {
      setLoading(true);
      try {
        const [depsRes, catsRes, ticketsRes, citiesRes] = await withTimeout(
          Promise.all([
            supabase.from('departments').select('*').order('name'),
            supabase.from('categories').select('*').order('name'),
            supabase.from('tickets').select('*'),
            supabase.from('cities').select('*').order('name')
          ]),
          [
            { data: [], error: null },
            { data: [], error: null },
            { data: [], error: null },
            { data: [], error: null }
          ] as any,
          'loadData'
        );
        
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
          const defaultCatsDb = CATEGORY_OPTIONS.map(category => ({
            id: category.id,
            name: category.name,
            icon_name: category.iconName,
            color: category.color,
            default_department_id: category.defaultDepartmentId,
            default_priority: category.defaultPriority
          }));
          cats = defaultCatsDb;
          try { await supabase.from('categories').insert(defaultCatsDb); } catch(e) { console.error('Failed to seed categories', e); }
        }

        const mappedDeps = deps.map(d => ({
          ...d,
          cityId: d.cityId || d.city_id || d.cityid
        }));

        // Handle raw cases from DB due to postgres unquoted columns
        const mappedCats = sortCategoriesByRequestedOrder(cats.map(c => ({
          ...c,
          iconName: c.iconName || c.icon_name || c.iconname || 'HelpCircle',
          defaultDepartmentId: c.defaultDepartmentId || c.default_department_id || c.defaultdepartmentid,
          defaultPriority: c.defaultPriority || c.default_priority || c.defaultpriority || 'low',
          cityId: c.cityId || c.city_id || c.cityid
        }))) as Category[];

        const fetchedTickets = sortedTickets.map(t => {
          const mappedTicket = {
            ...t,
            categoryId: t.categoryId || t.categoryid || t.category_id,
            departmentId: t.departmentId || t.departmentid || t.department_id,
            photoUrl: t.photoUrl || t.photourl || t.photo_url,
            resolvedPhotoUrl: t.resolvedPhotoUrl || t.resolvedphotourl || t.resolved_photo_url,
            userId: t.userId || t.userid || t.user_id,
            cityId: t.cityId || t.cityid || t.city_id,
            createdAt: parseSafeDate(t.createdAt || t.created_at || t.createdat) || Date.now(),
            updatedAt: parseSafeDate(t.updatedAt || t.updated_at || t.updatedat) || Date.now(),
          };
          return mappedTicket;
        });

        const activeUser = userProfile || currentUser;
        if (seq && seq !== authLoadSeq.current) return;

        let finalTickets = fetchedTickets;
        if (activeUser && activeUser.role !== 'superadmin' && activeUser.cityId) {
           finalTickets = fetchedTickets.filter(t => t.cityId === activeUser.cityId);
        }

        setDepartments(activeUser && activeUser.role !== 'superadmin' && activeUser.cityId 
          ? mappedDeps.filter(d => !d.cityId || d.cityId === activeUser.cityId) : mappedDeps);
        
        setCategories(activeUser && activeUser.role !== 'superadmin' && activeUser.cityId 
          ? mappedCats.filter(c => !c.cityId || c.cityId === activeUser.cityId) : mappedCats);
        
        setTickets(finalTickets);
        if (citiesRes && citiesRes.data) {
          setCities(citiesRes.data);
        }
        
        // Calculate points for current user if available
        if (activeUser) {
          const userTickets = finalTickets.filter(t => t.userId === activeUser.id);
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
        if (!seq || seq === authLoadSeq.current) {
          setLoading(false);
        }
      }
    };

    const subscribeAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          { data: { session: null }, error: null } as any,
          'getSession',
          10000
        );
        
        const fetchUserProfile = async (userId: string) => {
          try {
            const { data } = await withTimeout(
              supabase.from('users').select('*').eq('id', userId).single(),
              { data: null, error: null } as any,
              'fetchUserProfile',
              10000
            );
            if (data) {
              return mapDbUser(data);
            } else {
              // In case user hasn't synced to users table, fetch profile email
               const { data: authData } = await withTimeout(
                 supabase.auth.getUser(),
                 { data: { user: null }, error: null } as any,
                 'getUser',
                 10000
               );
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
                   cityId: null,
                   departmentId: null,
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
          const seq = ++authLoadSeq.current;
          const profile = await fetchUserProfile(session.user.id);
          if (seq !== authLoadSeq.current) return;
          if (profile) {
            await loadData(profile, seq);
          } else if (seq === authLoadSeq.current) {
            setLoading(false);
          }
        } else {
          authLoadSeq.current++;
          setLoading(false);
        }
      } catch (err) {
        console.error("Error during auth init:", err);
        setLoading(false);
      }

      const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        const seq = ++authLoadSeq.current;
        if (session) {
          setLoading(true);
          try {
            const profile = await fetchUserProfile(session.user.id);
            if (seq !== authLoadSeq.current) return;
            if (profile) {
              await loadData(profile, seq);
            } else if (seq === authLoadSeq.current) {
              setLoading(false);
            }
          } catch(e) {
            console.error(e);
            if (seq === authLoadSeq.current) setLoading(false);
          }
        } else {
          setCurrentUser(null);
          setTickets([]);
          setDepartments([]);
          setCategories([]);
          setCities([]);
          setLoading(false);
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
      const redirectUrl = import.meta.env.VITE_APP_URL || 'https://reportaai.kngflow.com';
      await rejectAfter(supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      }), 'Login com Google');
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await rejectAfter(
      supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }),
      'Login'
    );
    if (error) throw error;
  };

  const registerWithEmail = async (email: string, password: string, role: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: authData, error: authError } = await rejectAfter(
      supabase.auth.signUp({ 
        email: normalizedEmail, 
        password 
      }),
      'Criacao de conta'
    );
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Não foi possível criar a conta. Tente novamente.');
    if (authData.user.identities && authData.user.identities.length === 0) {
      throw new Error('Este e-mail já está cadastrado. Use "Faça login" para entrar.');
    }

    if (!authData.session) {
      return 'confirmation_required';
    }

    const { error: profileError } = await rejectAfter(
      supabase.from('users').upsert({
        id: authData.user.id,
        name: normalizedEmail.split('@')[0],
        email: authData.user.email || normalizedEmail,
        role: role,
      }),
      'Criacao de perfil'
    );
    if (profileError) throw profileError;

    return 'signed_in';
  };

  const resetPassword = async (email: string) => {
    const appUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? window.location.origin
      : (import.meta.env.VITE_APP_URL || window.location.origin);
    const redirectTo = `${appUrl}/login?mode=recovery`;
    const { error } = await rejectAfter(
      supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      }),
      'Recuperacao de senha'
    );
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await rejectAfter(supabase.auth.updateUser({ password }), 'Atualizacao de senha');
    if (error) throw error;
  };

  const logout = async () => {
    setCurrentUser(null);
    setTickets([]);
    setDepartments([]);
    setCategories([]);
    setCities([]);
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.replace('/login');
  };

  const addTicket = async (t: Ticket) => {
    const insertPayload: any = {
      id: t.id,
      protocol: t.protocol,
      userId: t.userId,
      categoryId: t.categoryId,
      departmentId: t.departmentId,
      cityId: t.cityId,
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

    const timeoutPromise = new Promise<{error: any, data: any}>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout de rede ao salvar chamado. Tente novamente.')), 35000)
    );
    
    let result: { error: any, data: any } = { error: null, data: null };
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      let token = anonKey;
      try {
        const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
        const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.access_token) token = parsed.access_token;
        }
      } catch (e) {}

      const fetchPromise = fetch(`${supabaseUrl}/rest/v1/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(insertPayload)
      }).then(async res => {
        if (!res.ok) {
          let errBody;
          try { errBody = await res.json(); } catch(e) {}
          return { error: errBody || new Error(`HTTP ${res.status}`), data: null };
        }
        const dataArr = await res.json();
        return { error: null, data: dataArr[0] };
      });

      result = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]);
    } catch (err) {
      console.error('Error saving ticket (timeout/network):', err);
      throw err;
    }
    const { error, data } = result;

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
    const statusLabels: Record<string, string> = {
      received: 'Recebido', triage: 'Em Triagem', forwarded: 'Encaminhado', analyzing: 'Em Análise',
      scheduled: 'Programado', in_progress: 'Em Execução', resolved: 'Resolvido', closed: 'Finalizado',
      duplicated: 'Duplicado', rejected: 'Indeferido', waiting_info: 'Aguardando Info'
    };
    const translatedStatus = statusLabels[status] || status;
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (!error) {
       setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
       await supabase.from('ticket_history').insert({
          ticketId: id,
          userId: currentUser?.id,
          action: `Status alterado para ${translatedStatus}`,
          newStatus: status
       });
    } else {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <AppContext.Provider value={{ currentUser, loginWithEmail, registerWithEmail, resetPassword, updatePassword, loginWithGoogle, logout, tickets, addTicket, updateTicketStatus, categories, departments, cities, loading }}>
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
