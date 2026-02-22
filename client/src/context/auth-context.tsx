import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserDisplayName: () => string;
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (data && !error) {
          setIsAdmin(true);
          return true;
        }
      } catch (e) {
        console.error("Admin status check failed");
      }
      return false;
    };

    const syncAuthState = async (currentSession: Session | null) => {
      const savedAdmin = localStorage.getItem('kinsa_admin');

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        await checkAdminStatus(currentSession.user.id);
      } else if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        setIsAdmin(true);
        setUser({ email: adminData.email, id: adminData.user_id } as any);
        setSession(null);
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }

      setLoading(false);
    };

    // Initial sync
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncAuthState(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // For initial SIGNED_IN event, session might already be handled by getSession
      // but syncAuthState handles it safely
      syncAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Redirect to home page after successful logout
    setLocation('/');
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const getUserDisplayName = () => {
    if (!user) return '';

    // Try to get first name from user metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) {
      const firstName = fullName.split(' ')[0];
      return firstName;
    }

    // Fallback to email if no name available
    return user.email?.split('@')[0] || 'User';
  };

  const adminLogin = async (email: string, password: string) => {
    // Call the RPC function we created in SQL
    const { data, error } = await supabase.rpc('verify_admin_credentials', {
      p_email: email,
      p_password: password
    });

    if (error) throw error;

    if (data && data.length > 0) {
      const adminData = data[0];
      // Store in localStorage for persistence
      localStorage.setItem('kinsa_admin', JSON.stringify(adminData));
      setIsAdmin(true);
      // We also set a dummy user state if not logged in to satisfy basic checks
      if (!user) {
        setUser({ email: adminData.email, id: adminData.user_id } as any);
      }
    } else {
      throw new Error('Invalid administrative credentials');
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('kinsa_admin');
    setIsAdmin(false);
    setLocation('/');
  };

  const value = {
    user,
    session,
    isLoggedIn: !!user || isAdmin,
    isAdmin,
    loading,
    login,
    adminLogin,
    adminLogout,
    signUp,
    signInWithGoogle,
    logout: async () => {
      if (isAdmin) {
        localStorage.removeItem('kinsa_admin');
        setIsAdmin(false);
      }

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setLocation('/');
    },
    resetPassword,
    getUserDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}