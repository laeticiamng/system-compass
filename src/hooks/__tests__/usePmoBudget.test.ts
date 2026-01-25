import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
    session: { access_token: 'test-token' },
    loading: false,
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { usePmoBudget } from '../usePmoBudget';
import { supabase } from '@/integrations/supabase/client';
import { formatBudgetAmount, calculateRunway } from '@/lib/pmo-types';

describe('usePmoBudget', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should not fetch when caseId is null', async () => {
      const { result } = renderHook(() => usePmoBudget(null), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.budgetLines).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('dashboard calculations', () => {
    it('should provide dashboard with correct structure', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify dashboard structure
      expect(result.current.dashboard).toBeDefined();
      expect(result.current.dashboard).toHaveProperty('total_budget');
      expect(result.current.dashboard).toHaveProperty('total_capex');
      expect(result.current.dashboard).toHaveProperty('total_opex');
      expect(result.current.dashboard).toHaveProperty('monthly_burn_rate');
      expect(result.current.dashboard).toHaveProperty('by_category');
      expect(result.current.dashboard).toHaveProperty('by_month');
      expect(result.current.dashboard).toHaveProperty('alerts');
    });
  });

  describe('CRUD operations', () => {
    it('should provide createBudgetLine function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.createBudgetLine).toBe('function');
    });

    it('should provide deleteBudgetLine function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.deleteBudgetLine).toBe('function');
    });
  });

  describe('scenario management', () => {
    it('should provide scenarios array', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.scenarios)).toBe(true);
    });

    it('should provide activeScenarioId state', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activeScenarioId).toBeDefined();
      expect(typeof result.current.setActiveScenarioId).toBe('function');
    });

    it('should provide createScenario function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.createScenario).toBe('function');
    });
  });
});

describe('Budget utility functions', () => {
  describe('formatBudgetAmount', () => {
    it('should format amounts correctly in EUR', () => {
      const result = formatBudgetAmount(15000);
      expect(result).toContain('€');
      expect(result).toMatch(/15[\s\u202F]?000/);
    });

    it('should handle zero', () => {
      const result = formatBudgetAmount(0);
      expect(result).toContain('0');
    });

    it('should handle decimals by rounding', () => {
      const result = formatBudgetAmount(1234.56);
      // Should round to nearest integer
      expect(result).not.toContain('.');
    });
  });

  describe('calculateRunway', () => {
    it('should calculate runway correctly', () => {
      expect(calculateRunway(120000, 10000)).toBe(12);
      expect(calculateRunway(60000, 10000)).toBe(6);
      expect(calculateRunway(30000, 10000)).toBe(3);
    });

    it('should return 999 for zero burn rate', () => {
      expect(calculateRunway(100000, 0)).toBe(999);
    });

    it('should floor the result', () => {
      expect(calculateRunway(15000, 4000)).toBe(3); // 3.75 -> 3
    });
  });
});

describe('usePmoBudget alerts', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should handle empty budget lines gracefully', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.budgetLines).toEqual([]);
      expect(result.current.dashboard.total_budget).toBe(0);
      expect(result.current.dashboard.alerts).toEqual([]);
    });
  });

  it('should handle database errors gracefully', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ 
          data: null, 
          error: new Error('Connection failed') 
        }),
      }),
    });

    const { result } = renderHook(() => usePmoBudget('case-123'), { wrapper });

    // The hook doesn't expose error directly - it returns empty arrays on error
    await waitFor(() => {
      expect(result.current.budgetLines).toEqual([]);
    });
  });
});
