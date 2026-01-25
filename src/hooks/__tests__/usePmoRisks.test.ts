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
import { usePmoRisks } from '../usePmoRisks';
import { supabase } from '@/integrations/supabase/client';
import { calculateRiskScore } from '@/lib/pmo-types';

describe('usePmoRisks', () => {
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
      const { result } = renderHook(() => usePmoRisks(null), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.risks).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('KPI calculations', () => {
    it('should calculate correct KPIs for risks', async () => {
      const mockRisks = [
        { 
          id: 'risk-1', 
          impact: 5, 
          probability: 5, 
          owner_id: null, 
          mitigation_plan: null,
          next_review_date: '2020-01-01' // Overdue
        },
        { 
          id: 'risk-2', 
          impact: 2, 
          probability: 2, 
          owner_id: 'owner-1', 
          mitigation_plan: 'Plan exists',
          next_review_date: '2030-01-01' // Future
        },
        { 
          id: 'risk-3', 
          impact: 4, 
          probability: 4, 
          owner_id: null, 
          mitigation_plan: null,
          next_review_date: null
        },
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockRisks, error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.risks).toEqual(mockRisks);
      });

      // Verify KPI structure
      expect(result.current.kpis).toBeDefined();
      expect(result.current.kpis).toHaveProperty('total_risks');
      expect(result.current.kpis).toHaveProperty('critical_risks');
      expect(result.current.kpis).toHaveProperty('risks_without_owner');
      expect(result.current.kpis).toHaveProperty('risks_without_mitigation');
      expect(result.current.kpis).toHaveProperty('overdue_reviews');
    });
  });

  describe('risk score calculations', () => {
    it('should correctly identify critical risks (score > 16)', () => {
      // Score = 5 * 5 = 25 (critical)
      expect(calculateRiskScore(5, 5)).toBeGreaterThan(16);
      
      // Score = 4 * 5 = 20 (critical)
      expect(calculateRiskScore(4, 5)).toBeGreaterThan(16);
      
      // Score = 5 * 4 = 20 (critical)
      expect(calculateRiskScore(5, 4)).toBeGreaterThan(16);
    });

    it('should correctly identify high risks (score 10-16)', () => {
      // Score = 4 * 4 = 16 (high)
      expect(calculateRiskScore(4, 4)).toBe(16);
      expect(calculateRiskScore(4, 4)).toBeLessThanOrEqual(16);
      expect(calculateRiskScore(4, 4)).toBeGreaterThan(9);
    });

    it('should correctly identify medium risks (score 5-9)', () => {
      // Score = 3 * 3 = 9 (medium)
      expect(calculateRiskScore(3, 3)).toBe(9);
      expect(calculateRiskScore(3, 3)).toBeGreaterThan(4);
      expect(calculateRiskScore(3, 3)).toBeLessThanOrEqual(9);
    });

    it('should correctly identify low risks (score 1-4)', () => {
      // Score = 2 * 2 = 4 (low)
      expect(calculateRiskScore(2, 2)).toBe(4);
      expect(calculateRiskScore(2, 2)).toBeLessThanOrEqual(4);
    });
  });

  describe('CRUD operations', () => {
    it('should provide createRisk function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.createRisk).toBe('function');
    });

    it('should provide updateRisk function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.updateRisk).toBe('function');
    });

    it('should provide deleteRisk function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.deleteRisk).toBe('function');
    });
  });
});

describe('usePmoRisks edge cases', () => {
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

  it('should handle database error gracefully', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ 
          data: null, 
          error: new Error('Connection failed') 
        }),
      }),
    });

    const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should handle empty risks array', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.risks).toEqual([]);
      expect(result.current.kpis.total_risks).toBe(0);
    });
  });

  it('should handle risks with null impact/probability', async () => {
    const mockRisks = [
      { id: 'risk-1', impact: null, probability: null },
    ];

    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: mockRisks, error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoRisks('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.risks).toHaveLength(1);
    });
  });
});
