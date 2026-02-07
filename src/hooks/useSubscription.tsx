import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'premium' | 'pro';

interface SubscriptionState {
  tier: SubscriptionTier;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckout: (tier: 'premium' | 'pro') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  canAccessPremium: boolean;
  canAccessPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// Stripe tier configuration (for display)
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Gratuit',
    price: 0,
    features: [
      'Aperçu de 38+ pays',
      'Quiz de profil',
      'Détails par pays',
    ],
  },
  premium: {
    name: 'Premium',
    price: 9.90,
    priceId: 'price_1SxpOSDFa5Y9NR1I05modzpV',
    features: [
      'Analyse système avancée',
      'Gouvernance & Terrain',
      'Comparaison illimitée',
      'Export PDF',
      'Calculateur fiscal',
    ],
  },
  pro: {
    name: 'Pro / B2B',
    price: null, // Sur devis
    priceId: null,
    features: [
      'Tout Premium inclus',
      'Analyse projet personnalisée',
      'Accès multi-utilisateurs',
      'Support dédié',
    ],
  },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    subscribed: false,
    subscriptionEnd: null,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    // Don't check subscription if user is not authenticated
    if (!user) {
      setState(prev => ({ ...prev, tier: 'free', subscribed: false, loading: false, error: null }));
      return;
    }

    // Verify we have a valid session before calling the edge function
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      // No valid session, treat as free tier without error
      setState(prev => ({ ...prev, tier: 'free', subscribed: false, loading: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        // Handle auth errors gracefully - treat as free tier
        if (error.message?.includes('Auth') || error.message?.includes('authentication')) {
          setState({
            tier: 'free',
            subscribed: false,
            subscriptionEnd: null,
            loading: false,
            error: null,
          });
          return;
        }
        throw error;
      }

      setState({
        tier: data.tier || 'free',
        subscribed: data.subscribed || false,
        subscriptionEnd: data.subscription_end,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Failed to check subscription:', err);
      // For auth-related errors, don't show error to user - just default to free
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      if (errorMessage.includes('Auth') || errorMessage.includes('session') || errorMessage.includes('2xx')) {
        setState(prev => ({
          ...prev,
          tier: 'free',
          subscribed: false,
          loading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    }
  }, [user]);

  const createCheckout = useCallback(async (tier: 'premium' | 'pro') => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to create checkout:', err);
      throw err;
    }
  }, [user]);

  const openCustomerPortal = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to open customer portal:', err);
      throw err;
    }
  }, [user]);

  // Check subscription on auth change
  useEffect(() => {
    if (!authLoading) {
      checkSubscription();
    }
  }, [user, authLoading, checkSubscription]);

  // Periodic refresh every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 300000); // 5 minutes instead of 60s to reduce backend load

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const value: SubscriptionContextValue = {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    canAccessPremium: state.tier === 'premium' || state.tier === 'pro',
    canAccessPro: state.tier === 'pro',
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
