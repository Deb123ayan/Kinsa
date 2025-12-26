import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { useLocation } from 'wouter';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect to dashboard after successful sign in
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if we're not already on dashboard to avoid infinite redirects
        if (window.location.pathname !== '/dashboard') {
          setLocation('/dashboard');
        }
      }
      
      // Redirect to auth page after sign out
      if (event === 'SIGNED_OUT') {
        setLocation('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Redirect will be handled by the auth state change listener
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
    // Redirect will be handled by the auth state change listener
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
    // Redirect will be handled by the auth state change listener
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

  const value = {
    user,
    session,
    isLoggedIn: !!user,
    loading,
    login,
    signUp,
    signInWithGoogle,
    logout,
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