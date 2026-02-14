import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';

// ============================================
// SUBSCRIPTION HOOK TESTS - PAYMENT CRITICAL
// ============================================

// Mock Supabase
const mockFunctionsInvoke = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockFunctionsInvoke(...args),
    },
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: () => mockGetSession(),
    },
  },
}));

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@test.com' };
let mockAuthLoading = false;
let mockUserValue: typeof mockUser | null = mockUser;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUserValue,
    loading: mockAuthLoading,
  }),
}));

import { SubscriptionProvider, useSubscription, SUBSCRIPTION_TIERS } from '../useSubscription';

// Wrapper component
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <SubscriptionProvider>{children}</SubscriptionProvider>;
  };
}

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockAuthLoading = false;
    // Default to valid session for authenticated tests
    mockGetSession.mockResolvedValue({ 
      data: { session: { user: mockUser, access_token: 'test-token' } } 
    });
  });

  describe('initialization', () => {
    it('should start with free tier and loading state', async () => {
      mockFunctionsInvoke.mockResolvedValue({ data: { tier: 'free', subscribed: false }, error: null });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      expect(result.current.tier).toBe('free');
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should call check-subscription edge function on mount', async () => {
      mockFunctionsInvoke.mockResolvedValue({ data: { tier: 'premium', subscribed: true }, error: null });
      
      renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(mockFunctionsInvoke).toHaveBeenCalledWith('check-subscription');
      });
    });

    it('should set free tier when user is not authenticated', async () => {
      mockUserValue = null;
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockFunctionsInvoke.mockResolvedValue({ data: { tier: 'free' }, error: null });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.tier).toBe('free');
        expect(result.current.subscribed).toBe(false);
      });
    });
  });

  describe('tier access logic', () => {
    it('should set canAccessPremium true for premium tier', async () => {
      mockFunctionsInvoke.mockResolvedValue({ 
        data: { tier: 'premium', subscribed: true, subscription_end: '2025-12-31' }, 
        error: null 
      });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
        expect(result.current.canAccessPremium).toBe(true);
        expect(result.current.canAccessPro).toBe(false);
      });
    });

    it('should set canAccessPremium AND canAccessPro true for pro tier', async () => {
      mockFunctionsInvoke.mockResolvedValue({ 
        data: { tier: 'pro', subscribed: true, subscription_end: '2025-12-31' }, 
        error: null 
      });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.tier).toBe('pro');
        expect(result.current.canAccessPremium).toBe(true);
        expect(result.current.canAccessPro).toBe(true);
      });
    });

    it('should set both access flags to false for free tier', async () => {
      mockFunctionsInvoke.mockResolvedValue({ 
        data: { tier: 'free', subscribed: false }, 
        error: null 
      });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.tier).toBe('free');
        expect(result.current.canAccessPremium).toBe(false);
        expect(result.current.canAccessPro).toBe(false);
      });
    });
  });

  describe('createCheckout', () => {
    it('should call create-checkout edge function with tier', async () => {
      const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
      mockFunctionsInvoke
        .mockResolvedValueOnce({ data: { tier: 'free' }, error: null })
        .mockResolvedValueOnce({ data: { url: 'https://checkout.stripe.com/test' }, error: null });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.createCheckout('premium');
      });
      
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('create-checkout', { body: { tier: 'premium' } });
      expect(mockOpen).toHaveBeenCalledWith('https://checkout.stripe.com/test', '_blank', 'noopener,noreferrer');

      mockOpen.mockRestore();
    });

    it('should throw error when user is not authenticated', async () => {
      mockUserValue = null;
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockFunctionsInvoke.mockResolvedValue({ data: { tier: 'free' }, error: null });

      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.createCheckout('premium')).rejects.toThrow('User must be logged in to subscribe');
    });
  });

  describe('openCustomerPortal', () => {
    it('should call customer-portal edge function', async () => {
      const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
      mockFunctionsInvoke
        .mockResolvedValueOnce({ data: { tier: 'premium', subscribed: true }, error: null })
        .mockResolvedValueOnce({ data: { url: 'https://billing.stripe.com/portal' }, error: null });

      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.openCustomerPortal();
      });

      expect(mockFunctionsInvoke).toHaveBeenCalledWith('customer-portal');
      expect(mockOpen).toHaveBeenCalledWith('https://billing.stripe.com/portal', '_blank', 'noopener,noreferrer');
      
      mockOpen.mockRestore();
    });

    it('should throw error when user is not authenticated', async () => {
      mockUserValue = null;
      mockGetSession.mockResolvedValue({ data: { session: null } });
      mockFunctionsInvoke.mockResolvedValue({ data: { tier: 'free' }, error: null });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await expect(result.current.openCustomerPortal()).rejects.toThrow('User must be logged in');
    });
  });

  describe('error handling', () => {
    it('should set error state on subscription check failure', async () => {
      mockFunctionsInvoke.mockResolvedValue({ data: null, error: new Error('Network error') });
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should handle edge function errors gracefully', async () => {
      mockFunctionsInvoke.mockRejectedValue(new Error('Server timeout'));
      
      const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toContain('Server timeout');
      });
    });
  });

  describe('context validation', () => {
    it('should throw error when used outside provider', () => {
      // Suppress error boundary console output
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useSubscription());
      }).toThrow('useSubscription must be used within a SubscriptionProvider');
      
      spy.mockRestore();
    });
  });
});

// ============================================
// TIER CONFIGURATION TESTS
// ============================================

describe('SUBSCRIPTION_TIERS configuration', () => {
  it('should have correct tier hierarchy (free < premium)', () => {
    expect(SUBSCRIPTION_TIERS.free.price).toBeLessThan(SUBSCRIPTION_TIERS.premium.price);
  });

  it('should have priceId for premium tier only', () => {
    expect(SUBSCRIPTION_TIERS.free).not.toHaveProperty('priceId');
    expect(SUBSCRIPTION_TIERS.premium.priceId).toBeDefined();
  });

  it('should have features array for all tiers', () => {
    expect(Array.isArray(SUBSCRIPTION_TIERS.free.features)).toBe(true);
    expect(Array.isArray(SUBSCRIPTION_TIERS.premium.features)).toBe(true);
    expect(Array.isArray(SUBSCRIPTION_TIERS.pro.features)).toBe(true);
  });

  it('should have correct Stripe price IDs format', () => {
    expect(SUBSCRIPTION_TIERS.premium.priceId).toMatch(/^price_/);
    // Pro has null priceId (sur devis)
    expect(SUBSCRIPTION_TIERS.pro.priceId).toBeNull();
  });
});
