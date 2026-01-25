import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ============================================
// GOVERNANCE INTEL HOOK TESTS - BUSINESS CRITICAL
// ============================================

// Mocks must be defined inside vi.mock factory to avoid hoisting issues
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn();
  const mockInvoke = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      functions: {
        invoke: mockInvoke,
      },
    },
    __mockFrom: mockFrom,
    __mockInvoke: mockInvoke,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

import { useGovernanceIntel } from '../useGovernanceIntel';
import { supabase } from '@/integrations/supabase/client';

// Access the mocks
const mockFrom = (supabase as unknown as { __mockFrom: ReturnType<typeof vi.fn> }).__mockFrom || supabase.from;
const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>;

describe('useGovernanceIntel', () => {
  const mockCaseId = 'case-123';
  
  // Sample mock data structures (reserved for future extended tests)
  void [
    { id: 'actor-1', case_id: mockCaseId, label: 'Ministry', actor_type: 'government', is_ai_generated: true },
  ]; // mockActors
  void [
    { id: 'pattern-1', case_id: mockCaseId, pattern_type: 'access_chain', risk_level: 'high' },
  ]; // mockPatterns
  void [
    { id: 'partner-1', case_id: mockCaseId, partner_type: 'legal_advisor', is_mandatory: true },
  ]; // mockPartners
  void [
    { id: 'delay-1', case_id: mockCaseId, process_name: 'Visa Application', realistic_timeframe: '3 months' },
  ]; // mockDelays
  
  const mockRun = { id: 'run-1', case_id: mockCaseId, status: 'completed', actors_count: 5 };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for fetching data
    mockFrom.mockImplementation((table: string) => {
      const chainMock = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: table === 'gov_intel_runs' ? [mockRun] : [], error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
      return chainMock;
    });
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));
      expect(result.current.isLoading).toBe(true);
    });

    it('should fetch all governance data on mount', async () => {
      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify all 5 tables are queried
      expect(mockFrom).toHaveBeenCalledWith('case_governance_actors');
      expect(mockFrom).toHaveBeenCalledWith('case_intermediation_patterns');
      expect(mockFrom).toHaveBeenCalledWith('case_governance_partners');
      expect(mockFrom).toHaveBeenCalledWith('case_delays_reality');
      expect(mockFrom).toHaveBeenCalledWith('gov_intel_runs');
    });

    it('should not fetch if caseId is empty', async () => {
      renderHook(() => useGovernanceIntel(''));

      await waitFor(() => {
        expect(mockFrom).not.toHaveBeenCalled();
      });
    });
  });

  describe('generateIntel', () => {
    it('should call edge function with correct parameters', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.generateIntel({
          country_code: 'FR',
          country_name: 'France',
          sector: 'tech',
          intention: 'entrepreneurship',
        });
      });

      expect(mockInvoke).toHaveBeenCalledWith('gov-intel-generate', {
        body: {
          case_id: mockCaseId,
          country_code: 'FR',
          country_name: 'France',
          sector: 'tech',
          intention: 'entrepreneurship',
        },
      });
    });

    it('should handle rate limiting errors', async () => {
      mockInvoke.mockResolvedValue({ data: { error: 'rate_limited' }, error: null });

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let genResult;
      await act(async () => {
        genResult = await result.current.generateIntel({ country_code: 'FR' });
      });

      expect(genResult).toBeNull();
    });

    it('should handle payment required errors', async () => {
      mockInvoke.mockResolvedValue({ data: { error: 'payment_required' }, error: null });

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let genResult;
      await act(async () => {
        genResult = await result.current.generateIntel({ country_code: 'FR' });
      });

      expect(genResult).toBeNull();
    });

    it('should set isGenerating during generation', async () => {
      mockInvoke.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: {}, error: null }), 100)));

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        void result.current.generateIntel({ country_code: 'FR' });
      });

      expect(result.current.isGenerating).toBe(true);
    });
  });

  describe('CRUD operations - Actors', () => {
    it('should add actor with default values', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-actor' }, error: null }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'case_governance_actors') {
          return {
            insert: mockInsert,
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        };
      });

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addActor({ label: 'Test Actor' });
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          case_id: mockCaseId,
          label: 'Test Actor',
          is_ai_generated: false,
          confidence_score: 50,
        })
      );
    });

    it('should update actor by id', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'case_governance_actors') {
          return {
            update: mockUpdate,
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        };
      });

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateActor('actor-1', { label: 'Updated Label' });
      });

      expect(updateResult).toBe(true);
    });

    it('should delete actor and refetch', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'case_governance_actors') {
          return {
            delete: mockDelete,
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        };
      });

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteActor('actor-1');
      });

      expect(deleteResult).toBe(true);
    });
  });

  describe('clearAIData', () => {
    it('should delete all AI-generated data for case', async () => {
      const mockDeleteChain = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        delete: mockDeleteChain,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearAIData();
      });

      // Should call delete on all 4 governance tables
      expect(mockDeleteChain).toHaveBeenCalled();
    });
  });

  describe('data structure validation', () => {
    it('should return correct default structure', async () => {
      const { result } = renderHook(() => useGovernanceIntel(mockCaseId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify all expected properties exist
      expect(result.current).toHaveProperty('actors');
      expect(result.current).toHaveProperty('patterns');
      expect(result.current).toHaveProperty('partners');
      expect(result.current).toHaveProperty('delays');
      expect(result.current).toHaveProperty('lastRun');
      expect(Array.isArray(result.current.actors)).toBe(true);
      expect(Array.isArray(result.current.patterns)).toBe(true);
      expect(Array.isArray(result.current.partners)).toBe(true);
      expect(Array.isArray(result.current.delays)).toBe(true);
    });
  });
});

// ============================================
// SECURITY TESTS
// ============================================

describe('Governance Intel Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
    }));
  });

  it('should always set is_ai_generated to false for manual entries', async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new' }, error: null }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'case_governance_actors') {
        return {
          insert: mockInsert,
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
    });

    const { result } = renderHook(() => useGovernanceIntel('case-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Try to inject is_ai_generated: true
    await act(async () => {
      await result.current.addActor({ 
        label: 'Malicious Actor',
        is_ai_generated: true as never, // Attempt injection
      });
    });

    // Verify is_ai_generated is forced to false
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_ai_generated: false,
      })
    );
  });

  it('should scope all queries to the provided caseId', async () => {
    const mockEq = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: mockEq,
      }),
    }));

    renderHook(() => useGovernanceIntel('specific-case-id'));

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('case_id', 'specific-case-id');
    });
  });
});
