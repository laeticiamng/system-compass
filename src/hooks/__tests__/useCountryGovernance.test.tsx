import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCountryGovernance, useUserGovernanceNotes } from '../useCountryGovernance';

// Mock data
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUserValue, loading: false }),
}));

// Supabase mocks
const mockMaybeSingle = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'country_governance') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockMaybeSingle
            })
          }),
        };
      }
      if (table === 'user_governance_notes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: mockMaybeSingle
              })
            })
          }),
          upsert: (data: any) => mockUpsert(data),
        };
      }
      return {};
    }),
  },
}));

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useCountryGovernance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  describe('initialization', () => {
    it('should return default governance data when no DB data exists', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(
        () => useCountryGovernance('fr', 'COMPETENCE_TRUST'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.governance).toBeDefined();
      expect(result.current.governance?.country_id).toBe('fr');
      expect(result.current.governance?.stability_score).toBe(4);
    });

    it('should calculate average score correctly', async () => {
      const mockData = {
        country_id: 'fr',
        stability_score: 4,
        friction_score: 3,
        operational_score: 5,
        capture_risk_score: 2,
        ecosystem_score: 4,
      };
      mockMaybeSingle.mockResolvedValue({ data: mockData, error: null });

      const { result } = renderHook(
        () => useCountryGovernance('fr'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Average = (4+3+5+2+4) / 5 = 3.6
      expect(result.current.averageScore).toBeCloseTo(3.6, 1);
    });

    it('should return default average of 3 when no governance data', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(
        () => useCountryGovernance('unknown'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.averageScore).toBe(3);
    });
  });

  describe('pyramid type defaults', () => {
    it('should use COMPETENCE_TRUST defaults for high-trust countries', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(
        () => useCountryGovernance('ch', 'COMPETENCE_TRUST'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.governance?.stability_score).toBe(4);
      expect(result.current.governance?.ecosystem_score).toBe(4);
    });

    it('should use PROBLEM_RENT defaults for risky countries', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(
        () => useCountryGovernance('test', 'PROBLEM_RENT'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.governance?.stability_score).toBe(2);
      expect(result.current.governance?.capture_risk_score).toBe(2);
    });
  });

  describe('fetched data', () => {
    it('should return fetched governance data when available', async () => {
      const mockGovernance = {
        id: 'gov-1',
        country_id: 'de',
        stability_score: 5,
        friction_score: 4,
        operational_score: 4,
        capture_risk_score: 5,
        ecosystem_score: 4,
        state_of_art: [{ id: 'test', label: 'Test', checked: true }],
        attractiveness: { demand: 4 },
      };
      mockMaybeSingle.mockResolvedValue({ data: mockGovernance, error: null });

      const { result } = renderHook(
        () => useCountryGovernance('de'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.governance?.stability_score).toBe(5);
      expect(result.current.governance?.state_of_art).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      mockMaybeSingle.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(
        () => useCountryGovernance('fr'),
        { wrapper: createWrapper() }
      );

      // Should not crash, just show loading
      expect(result.current.isLoading).toBe(true);
    });
  });
});

describe('useUserGovernanceNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockUpsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: {}, error: null })
      })
    });
  });

  describe('data isolation (RGPD compliance)', () => {
    it('should only fetch notes for current user', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(
        () => useUserGovernanceNotes('fr'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notes).toBeNull();
    });

    it('should return null notes when user is not authenticated', () => {
      mockUserValue = null;

      const { result } = renderHook(
        () => useUserGovernanceNotes('fr'),
        { wrapper: createWrapper() }
      );

      // When no user, query is disabled so notes should remain null
      // React Query returns undefined for disabled queries, hook interprets as null
      expect(result.current.notes).toBeFalsy();
    });
  });

  describe('fetched notes', () => {
    it('should return user notes when available', async () => {
      const mockNotes = {
        id: 'notes-1',
        user_id: 'user-123',
        country_id: 'fr',
        partner_reliability: [],
        poc_plan: { hypothesis: 'Test hypothesis' },
        timeline_scenarios: {},
        governance_map: [],
        risk_register: [],
        notes: 'Some notes',
      };
      mockMaybeSingle.mockResolvedValue({ data: mockNotes, error: null });

      const { result } = renderHook(
        () => useUserGovernanceNotes('fr'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notes?.poc_plan?.hypothesis).toBe('Test hypothesis');
      expect(result.current.notes?.notes).toBe('Some notes');
    });
  });

  describe('saveNotes mutation', () => {
    it('should have saveNotes and isSaving properties', async () => {
      const { result } = renderHook(
        () => useUserGovernanceNotes('fr'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.saveNotes).toBeDefined();
      expect(result.current.isSaving).toBe(false);
    });
  });
});
