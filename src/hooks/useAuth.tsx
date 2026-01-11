import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Check if test mode is enabled via URL parameter
const isTestMode = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('test') === 'true';
  }
  return false;
};

// Mock user for test mode
const TEST_USER: User = {
  id: 'test-user-id-12345',
  email: 'testeur@pyramidcompass.com',
  app_metadata: {},
  user_metadata: { display_name: 'Testeur' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const TEST_SESSION: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: TEST_USER,
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTestMode: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [testModeEnabled] = useState(isTestMode);

  useEffect(() => {
    // If test mode is enabled, use mock user/session
    if (testModeEnabled) {
      console.log('🧪 Mode test activé - Authentification contournée');
      setUser(TEST_USER);
      setSession(TEST_SESSION);
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [testModeEnabled]);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (testModeEnabled) {
      return { error: null };
    }
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (testModeEnabled) {
      return { error: null };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (testModeEnabled) {
      // In test mode, just reload without the test param
      window.location.href = window.location.pathname;
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isTestMode: testModeEnabled, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
