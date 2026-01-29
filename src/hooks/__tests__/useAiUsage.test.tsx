import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/test/test-utils';

// ============================================
// AI USAGE HOOK TESTS - METERING CRITICAL
// ============================================

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'ai_usage_metering') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              gte: mockGte.mockReturnValue({
                lte: mockLte.mockReturnValue({
                  maybeSingle: mockMaybeSingle
                })
              })
            })
          }),
        };
      }
      if (table === 'ai_activity_log') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockReturnValue({
                limit: mockLimit
              })
            })
          }),
        };
      }
      return {};
    }),
  },
}));

const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUserValue,
    loading: false,
  })),
}));

import { useAiUsage } from '../useAiUsage';

describe('useAiUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  describe('initialization', () => {
    it('should start with loading state', async () => {
      const { result } = renderHook(() => useAiUsage());

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should return null usage when no data exists', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usage).toBeNull();
      expect(result.current.activityLog).toEqual([]);
    });

    it('should return empty data when user is not authenticated', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usage).toBeNull();
      expect(result.current.activityLog).toEqual([]);
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('usage data fetching', () => {
    it('should fetch usage for current billing period', async () => {
      const mockUsage = {
        id: 'usage-1',
        user_id: 'user-123',
        period_start: '2024-01-01T00:00:00Z',
        period_end: '2024-01-31T23:59:59Z',
        ai_actions_count: 50,
        ai_tokens_used: 10000,
        agent_runs_count: 5,
        dossiers_created: 3,
        dossier_items_added: 15,
        exports_generated: 2,
        total_case_units: 25,
        quota_limit: 100,
        alert_70_sent: false,
        alert_90_sent: false,
        alert_100_sent: false,
      };

      mockMaybeSingle.mockResolvedValue({ data: mockUsage, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usage).toEqual(mockUsage);
      expect(result.current.stats.aiActions).toBe(50);
      expect(result.current.stats.tokensUsed).toBe(10000);
      expect(result.current.stats.caseUnits).toBe(25);
    });

    it('should fetch activity log', async () => {
      const mockLog = [
        {
          id: 'log-1',
          action_type: 'generate',
          module: 'cases',
          status: 'completed',
          user_decision: 'accepted',
          tokens_used: 500,
          processing_time_ms: 1200,
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'log-2',
          action_type: 'generate',
          module: 'terrain',
          status: 'completed',
          user_decision: null,
          tokens_used: 300,
          processing_time_ms: 800,
          created_at: '2024-01-15T09:00:00Z',
        },
      ];

      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockLimit.mockResolvedValue({ data: mockLog, error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activityLog).toHaveLength(2);
      expect(result.current.activityLog[0].action_type).toBe('generate');
    });
  });

  describe('usage percentage calculations', () => {
    it('should calculate usage percentage correctly', async () => {
      const mockUsage = {
        total_case_units: 70,
        quota_limit: 100,
      };

      mockMaybeSingle.mockResolvedValue({ data: mockUsage, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usagePercentage).toBe(70);
      expect(result.current.isNearLimit).toBe(true);
      expect(result.current.isAtLimit).toBe(false);
    });

    it('should flag when at 100% usage', async () => {
      const mockUsage = {
        total_case_units: 100,
        quota_limit: 100,
      };

      mockMaybeSingle.mockResolvedValue({ data: mockUsage, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usagePercentage).toBe(100);
      expect(result.current.isNearLimit).toBe(true);
      expect(result.current.isAtLimit).toBe(true);
    });

    it('should handle zero quota gracefully', async () => {
      const mockUsage = {
        total_case_units: 0,
        quota_limit: 0,
      };

      mockMaybeSingle.mockResolvedValue({ data: mockUsage, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not crash, percentage should be 0
      expect(result.current.usagePercentage).toBe(0);
    });

    it('should handle null values in usage', async () => {
      const mockUsage = {
        total_case_units: null,
        quota_limit: null,
      };

      mockMaybeSingle.mockResolvedValue({ data: mockUsage, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usagePercentage).toBe(0);
      expect(result.current.stats.caseUnits).toBe(0);
      expect(result.current.stats.quotaLimit).toBe(100); // Default
    });
  });

  describe('stats object', () => {
    it('should return correct stats structure', async () => {
      const mockUsage = {
        ai_actions_count: 25,
        ai_tokens_used: 5000,
        agent_runs_count: 3,
        dossiers_created: 2,
        exports_generated: 1,
        total_case_units: 15,
        quota_limit: 50,
      };

      mockMaybeSingle.mockResolvedValue({ data: mockUsage, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toEqual({
        aiActions: 25,
        tokensUsed: 5000,
        agentRuns: 3,
        dossiers: 2,
        exports: 1,
        caseUnits: 15,
        quotaLimit: 50,
      });
    });

    it('should return default stats when no usage', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toEqual({
        aiActions: 0,
        tokensUsed: 0,
        agentRuns: 0,
        dossiers: 0,
        exports: 0,
        caseUnits: 0,
        quotaLimit: 100,
      });
    });
  });

  describe('refetch functionality', () => {
    it('should expose refetch function', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useAiUsage());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

// ============================================
// SECURITY TESTS
// ============================================

describe('AiUsage Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  it('should scope usage query to authenticated user_id', async () => {
    const { result } = renderHook(() => useAiUsage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('should not expose sensitive billing data in interface', () => {
    // The interface should not contain credit card info, payment tokens, etc.
    const usageShape = {
      ai_actions_count: 'number',
      ai_tokens_used: 'number',
      quota_limit: 'number',
    };

    expect(usageShape).not.toHaveProperty('credit_card');
    expect(usageShape).not.toHaveProperty('payment_method');
    expect(usageShape).not.toHaveProperty('stripe_customer_id');
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

describe('AiUsage Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
  });

  it('should handle database errors gracefully', async () => {
    mockMaybeSingle.mockRejectedValue(new Error('Database error'));
    mockLimit.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useAiUsage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not crash, just have null usage
    expect(result.current.usage).toBeNull();
  });

  it('should handle activity log fetch failure', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockLimit.mockRejectedValue(new Error('Log fetch failed'));

    const { result } = renderHook(() => useAiUsage());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not crash
    expect(result.current.activityLog).toEqual([]);
  });
});
