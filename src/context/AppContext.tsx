import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Ticket, Category, Department, TicketStatus } from '../data/types';
import { mockCategories, mockDepartments } from '../data/mockData';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  login: (email: string) => Promise<void> | void; // Keeping for compatibility, but we prefer Google Login
  loginWithGoogle: () => Promise<void>;
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
    let depsUnsub: () => void = () => {};
    let catsUnsub: () => void = () => {};
    let ticketsUnsub: () => void = () => {};

    const loadStaticData = () => {
      depsUnsub = onSnapshot(collection(db, 'departments'), async (snapshot) => {
        if (!snapshot.empty) {
          setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
        } else {
          console.log('Seeding departments...');
          for (const dep of mockDepartments) {
            await setDoc(doc(db, 'departments', dep.id), dep);
          }
        }
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'departments'));

      catsUnsub = onSnapshot(collection(db, 'categories'), async (snapshot) => {
        if (!snapshot.empty) {
          setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        } else {
          console.log('Seeding categories...');
          for (const cat of mockCategories) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
        }
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));
    };

    const fetchTickets = () => {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      ticketsUnsub = onSnapshot(q, (snapshot) => {
        setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket)));
        setLoading(false);
      }, (error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      });
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let userData: User;
        if (userSnap.exists()) {
          userData = userSnap.data() as User;
        } else {
          userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário Cidadão',
            email: firebaseUser.email || '',
            role: 'citizen',
            avatarUrl: firebaseUser.photoURL || undefined,
            createdAt: Date.now()
          } as any;
          await setDoc(userRef, userData);
        }
        setCurrentUser(userData);
        loadStaticData();
        fetchTickets();
      } else {
        setCurrentUser(null);
        setTickets([]);
        setDepartments([]);
        setCategories([]);
        setLoading(false);
        depsUnsub();
        catsUnsub();
        ticketsUnsub();
      }
    });

    return () => {
      unsubscribeAuth();
      depsUnsub();
      catsUnsub();
      ticketsUnsub();
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const login = async (email: string) => {
    // For local prototype mockup bypass if needed, but in standard FB Auth we use real login.
    console.log('Login by email not implemented, use Google Auth');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const addTicket = async (t: Ticket) => {
    try {
      const ticketRef = doc(db, 'tickets', t.id); // Forcing using the same ID as generated locally
      await setDoc(ticketRef, {
        ...t,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      // add history
      await addDoc(collection(db, 'ticketHistory'), {
        ticketId: t.id,
        userId: currentUser?.id,
        action: 'Chamado Aberto',
        newStatus: 'received',
        createdAt: Date.now()
      });
    } catch (err) {
      console.error('Error saving ticket:', err);
    }
  };

  const updateTicketStatus = async (id: string, status: TicketStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      const ticketObj = tickets.find(t => t.id === id);
      await updateDoc(ticketRef, { 
        status, 
        updatedAt: Date.now() 
      });

      // add history
      if (ticketObj) {
        await addDoc(collection(db, 'ticketHistory'), {
          ticketId: id,
          userId: currentUser?.id,
          action: `Status alterado para ${status}`,
          oldStatus: ticketObj.status,
          newStatus: status,
          createdAt: Date.now()
        });
      }
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
