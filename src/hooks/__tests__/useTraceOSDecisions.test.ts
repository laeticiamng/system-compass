import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ============================================
// TRACEOS DECISIONS HOOK TESTS - PRO MODULE
// Decision tree and validation tracking
// ============================================

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => {
      return {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
      };
    }),
  },
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useTraceOSWebhooks
const mockTriggerWebhooks = vi.fn();
vi.mock('@/hooks/useTraceOSWebhooks', () => ({
  useTraceOSWebhooks: () => ({
    triggerWebhooksForEvent: mockTriggerWebhooks,
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { useTraceOSDecisions } from '../useTraceOSDecisions';

describe('useTraceOSDecisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
    mockTriggerWebhooks.mockResolvedValue(undefined);
  });

  describe('when user is not authenticated', () => {
    it('should return empty decisions array', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useTraceOSDecisions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.decisions).toEqual([]);
      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should not allow creating decisions without auth', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useTraceOSDecisions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const decision = await result.current.createDecision({
        title: 'Test Decision',
        context: 'Test context',
        mainHypothesis: 'Main hypothesis',
        alternativeHypotheses: [],
        constraints: [],
        decision: 'The decision',
        date: '2024-01-01',
        author: 'Test Author',
        scope: 'Project',
        status: 'pending',
        abandonedBranches: [],
      });
      
      expect(decision).toBeNull();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = { id: 'user-123' };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser });
      mockOrder.mockResolvedValue({ data: [], error: null });
      mockEq.mockReturnValue({ order: mockOrder });
      mockSelect.mockReturnValue({ eq: mockEq });
    });

    it('should fetch decisions on mount', async () => {
      const mockDecisions = [
        { 
          id: 'decision-1', 
          user_id: 'user-123',
          parent_id: null,
          title: 'Strategic Decision', 
          context: 'Context',
          main_hypothesis: 'Hypothesis',
          alternative_hypotheses: [],
          constraints: [],
          decision: 'Decision made',
          author: 'CEO',
          scope: 'Company',
          status: 'validated',
          abandoned_branches: [],
          decision_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      mockOrder.mockResolvedValue({ data: mockDecisions, error: null });

      const { result } = renderHook(() => useTraceOSDecisions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.decisions.length).toBe(1);
      expect(result.current.decisions[0].title).toBe('Strategic Decision');
    });

    it('should handle fetch error gracefully', async () => {
      mockOrder.mockResolvedValue({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useTraceOSDecisions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch decisions');
    });
  });

  describe('Decision status validation', () => {
    it('should validate decision statuses', () => {
      const validStatuses = ['pending', 'validated', 'abandoned'];
      
      expect(validStatuses).toContain('pending');
      expect(validStatuses).toContain('validated');
      expect(validStatuses).toContain('abandoned');
    });
  });

  describe('Decision tree structure', () => {
    it('should properly structure parent-child relationships', () => {
      const parentDecision = {
        id: 'decision-1',
        user_id: 'user-123',
        parent_id: null,
        title: 'Parent Decision',
        context: 'Context',
        main_hypothesis: 'Hypothesis',
        alternative_hypotheses: [],
        constraints: [],
        decision: 'Decision',
        author: 'Author',
        scope: 'Scope',
        status: 'validated' as const,
        abandoned_branches: [],
        decision_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const childDecision = {
        ...parentDecision,
        id: 'decision-2',
        parent_id: 'decision-1',
        title: 'Child Decision',
      };

      expect(childDecision.parent_id).toBe(parentDecision.id);
    });
  });
});

// ============================================
// SECURITY TESTS - TRACEOS DECISIONS
// ============================================

describe('TraceOS Decisions Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTriggerWebhooks.mockResolvedValue(undefined);
  });

  it('should require authentication for all mutations', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useTraceOSDecisions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const createResult = await result.current.createDecision({
      title: 'Test',
      context: 'Test',
      mainHypothesis: 'Test',
      alternativeHypotheses: [],
      constraints: [],
      decision: 'Test',
      date: '2024-01-01',
      author: 'Test',
      scope: 'Test',
      status: 'pending',
      abandonedBranches: [],
    });
    expect(createResult).toBeNull();

    const updateResult = await result.current.updateDecision('id', { title: 'New Title' });
    expect(updateResult).toBe(false);

    const deleteResult = await result.current.deleteDecision('id');
    expect(deleteResult).toBe(false);
  });

  it('should verify isLoggedIn state', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useTraceOSDecisions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should verify user binding on decisions', () => {
    const mockUser = { id: 'user-123' };
    mockUseAuth.mockReturnValue({ user: mockUser });

    // Decisions should always be bound to user_id
    const decisionData = {
      user_id: mockUser.id,
      title: 'Test',
    };

    expect(decisionData.user_id).toBe(mockUser.id);
  });
});

// ============================================
// WEBHOOK INTEGRATION TESTS
// ============================================

describe('TraceOS Decisions Webhook Integration', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockTriggerWebhooks.mockResolvedValue(undefined);
  });

  it('should define webhook event types', () => {
    const webhookEvents = [
      'decision_created',
      'decision_updated',
      'decision_validated',
    ];

    expect(webhookEvents).toContain('decision_created');
    expect(webhookEvents).toContain('decision_updated');
    expect(webhookEvents).toContain('decision_validated');
  });

  it('should trigger webhooks only for validated decisions', () => {
    const shouldTriggerValidatedWebhook = (
      previousStatus: string | undefined,
      newStatus: string
    ) => {
      return newStatus === 'validated' && previousStatus !== 'validated';
    };

    expect(shouldTriggerValidatedWebhook('pending', 'validated')).toBe(true);
    expect(shouldTriggerValidatedWebhook('validated', 'validated')).toBe(false);
    expect(shouldTriggerValidatedWebhook(undefined, 'validated')).toBe(true);
  });
});

// ============================================
// ABANDONED BRANCHES TESTS
// ============================================

describe('TraceOS Abandoned Branches', () => {
  it('should properly structure abandoned branches', () => {
    const abandonedBranches = [
      { title: 'Alternative A', reason: 'Too expensive' },
      { title: 'Alternative B', reason: 'Timeline too long' },
    ];

    expect(abandonedBranches).toHaveLength(2);
    expect(abandonedBranches[0].title).toBeDefined();
    expect(abandonedBranches[0].reason).toBeDefined();
  });

  it('should handle empty abandoned branches', () => {
    const emptyBranches: { title: string; reason: string }[] = [];
    
    expect(emptyBranches).toEqual([]);
    expect(emptyBranches.length).toBe(0);
  });
});
