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
      'Tronc commun pyramide (gratuit)',
      'Accès aux fiches pays basiques',
      'Indicateurs de risque',
    ],
  },
  premium: {
    name: 'Premium',
    price: 7.99,
    priceId: 'price_1SnecEDFa5Y9NR1IjYEILvEh',
    features: [
      'Tout le contenu gratuit',
      'Variantes pays spécifiques',
      'Profils qui réussissent/souffrent',
      'Ce qui surprend les nouveaux',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    priceId: 'price_1SnecYDFa5Y9NR1Isyw5mEyQ',
    features: [
      'Tout le contenu Premium',
      'Analyse projet personnalisée',
      'Points aveugles spécifiques',
      'Clés de sortie personnalisées',
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
    if (!user) {
      setState(prev => ({ ...prev, tier: 'free', subscribed: false, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) throw error;

      setState({
        tier: data.tier || 'free',
        subscribed: data.subscribed || false,
        subscriptionEnd: data.subscription_end,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Failed to check subscription:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription',
      }));
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
    }, 60000);

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
