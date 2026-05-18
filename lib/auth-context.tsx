import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isEmailVerified: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH_CONTEXT] initial session:', session ? 'exists' : 'null');
      console.log('[AUTH_CONTEXT] initial email_confirmed_at:', session?.user?.email_confirmed_at);
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AUTH_CONTEXT] onAuthStateChange event:', _event, 'session:', session ? 'exists' : 'null');
      console.log('[AUTH_CONTEXT] onAuthStateChange email_confirmed_at:', session?.user?.email_confirmed_at);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const isEmailVerified = !!user?.email_confirmed_at;

  return (
    <AuthContext.Provider value={{ session, user, loading, isEmailVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
