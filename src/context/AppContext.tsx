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
  addTicket: (t: Ticket) => Promise<void>;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  categories: Category[];
  departments: Department[];
  cities: any[];
  loading?: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authListener: any;
    
    // Subscribe to database changes (optional depending on needs, but let's implement basic fetch for now)
    const loadData = async (userProfile?: User) => {
      setLoading(true);
      let deptQuery = supabase.from('departments').select('*').order('name');
      let catQuery = supabase.from('categories').select('*').order('name');
      let ticketQuery = supabase.from('tickets').select('*');

      if (userProfile && userProfile.role !== 'superadmin' && userProfile.cityId) {
        deptQuery = deptQuery.eq('cityId', userProfile.cityId);
        catQuery = catQuery.eq('cityId', userProfile.cityId);
        ticketQuery = ticketQuery.eq('cityId', userProfile.cityId);
      }

      const [depsRes, catsRes, ticketsRes, citiesRes] = await Promise.all([
        deptQuery,
        catQuery,
        ticketQuery,
        supabase.from('cities').select('*').order('name')
      ]);
      
      const allTickets = ticketsRes.data || [];
      const allCities = citiesRes.data || [];
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

      setTickets(fetchedTickets);
      setDepartments(deps);
      setCategories(mappedCats);
      setCities(allCities);
      
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
        const { data: userRow } = await supabase.from('users').select('*').eq('id', userId).single();
        if (userRow) {
          const isHardcodedSuperadmin = userRow.email === 'contato@kngflow.com';
          const mappedUser = {
            ...userRow,
            role: isHardcodedSuperadmin ? 'superadmin' : userRow.role,
            departmentId: userRow.departmentId || userRow.department_id || userRow.departmentid,
            avatarUrl: userRow.avatarUrl || userRow.avatar_url || userRow.avatarurl,
            pointsValidating: userRow.pointsValidating || userRow.points_validating || userRow.pointsvalidating,
            pointsValidated: userRow.pointsValidated || userRow.points_validated || userRow.pointsvalidated,
            cityId: userRow.cityId || userRow.city_id || userRow.cityid,
          } as User;
          
          if (isHardcodedSuperadmin && userRow.role !== 'superadmin') {
            supabase.from('users').update({ role: 'superadmin' }).eq('id', userId).then();
          }

          setCurrentUser(mappedUser);
          return mappedUser;
        } else {
          // In case user hasn't synced to users table, fetch profile email
           const { data: authData } = await supabase.auth.getUser();
           if (authData.user) {
             const email = authData.user.email || '';
             // Ensure contato@kngflow is always superadmin
             const isSuper = email === 'contato@kngflow.com';
             
             // Check if user exists by email but with different auth ID (sync issue)
             const { data: existingEmailUser } = await supabase.from('users').select('*').eq('email', email).single();
             
             if (existingEmailUser) {
               // Update the existing user row with the new auth ID if possible, or just use their role
               const mappedUser = {
                 ...existingEmailUser,
                 id: userId,
                 role: isSuper ? 'superadmin' : existingEmailUser.role,
               } as User;
               // Try to update DB to sync ID
               supabase.from('users').update({ id: userId, role: mappedUser.role }).eq('email', email).then();
               setCurrentUser(mappedUser);
               return mappedUser;
             }

             const metadata = authData.user.user_metadata || {};
             const name = metadata.full_name || metadata.name || email.split('@')[0] || 'Usuário';
             const avatarUrl = metadata.avatar_url || metadata.picture || null;
             
             const newUser = {
               id: userId,
               name: name,
               email: email,
               role: isSuper ? 'superadmin' : 'citizen',
               avatar_url: avatarUrl,
               cityId: '11111111-1111-1111-1111-111111111111' // Fallback para a cidade padrão por enquanto
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

  const addTicket = async (t: Ticket): Promise<void> => {
    // ── Bypass Supabase JS Client for this operation ──
    // The Supabase JS client on Android WebViews/PWA sometimes hangs indefinitely 
    // due to internal auth token refresh locks. We bypass it by using native fetch.
    
    // 1. Get token synchronously from localStorage to avoid any async locks
    let token = '';
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('-auth-token')) {
          const val = localStorage.getItem(key);
          if (val) {
            token = JSON.parse(val).access_token || '';
            break;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao ler token do localStorage', e);
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const apiUrl = `${supabaseUrl}/rest/v1/tickets`;

    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${token || anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal' // Don't ask for the row back, just insert
    };

    // Helper: raw fetch with hard abort
    const doFetch = async (payload: any): Promise<{ error: string | null }> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
      
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errText = await res.text();
          return { error: `HTTP ${res.status}: ${errText}` };
        }
        return { error: null };
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') return { error: 'Timeout de conexão (12s)' };
        return { error: err.message || String(err) };
      }
    };

    // ── Insert with exact schema (camelCase columns, bigint timestamps) ──
    const payload = {
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
      photoUrl: t.photoUrl ?? null,
      cityId: t.cityId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const res = await doFetch(payload);
    if (!res.error) {
      setTickets((prev) => [{ ...t, createdAt: Date.now() }, ...prev]);
      return;
    }

    throw new Error(`Falha ao salvar: ${res.error}`);
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
    <AppContext.Provider value={{ currentUser, loginWithEmail, registerWithEmail, loginWithGoogle, logout, tickets, addTicket, updateTicketStatus, categories, departments, cities, loading }}>
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
