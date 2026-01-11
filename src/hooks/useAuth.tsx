import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// SÉCURITÉ: Mode test désactivé en production
// Pour réactiver le mode test en développement uniquement, 
// décommenter et ajouter une vérification d'environnement
const isTestMode = () => {
  // Mode test désactivé pour des raisons de sécurité
  // Ne pas activer en production!
  return false;
};

// Ces constantes ne sont plus utilisées mais conservées pour référence
const TEST_USER: User | null = null;
const TEST_SESSION: Session | null = null;

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
