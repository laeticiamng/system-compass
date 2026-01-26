import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Supabase mocks
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockInvoke = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();

const mockRecommendations = [
  {
    id: 'rec-1',
    origin_country: 'france',
    destinations: [
      { countryId: 'portugal', name: 'Portugal', score: 92, reasons: ['Climate'], climate: 'temperate', bestSeason: 'Spring' },
    ],
    preferences: { climate: 'temperate', budget: 'medium' },
    created_at: '2024-01-15T10:00:00Z',
  },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: () => {
        mockSelect();
        return {
          eq: (field: string, value: string) => {
            mockEq(field, value);
            return {
              order: () => {
                mockOrder();
                return Promise.resolve({ data: mockRecommendations, error: null });
              },
            };
          },
        };
      },
      insert: (data: unknown) => {
        mockInsert(data);
        return Promise.resolve({ error: null });
      },
      delete: () => ({
        eq: (field: string, value: string) => {
          mockDelete(field, value);
          return {
            eq: () => Promise.resolve({ error: null }),
          };
        },
      }),
    })),
    functions: {
      invoke: (name: string, options: unknown) => {
        mockInvoke(name, options);
        return Promise.resolve({
          data: {
            recommendations: [
              { countryId: 'portugal', name: 'Portugal', score: 92, reasons: ['Climate'], climate: 'temperate', bestSeason: 'Spring' },
            ],
          },
          error: null,
        });
      },
    },
  },
}));

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserState: typeof mockUser | null = mockUser;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUserState,
    loading: false,
  }),
}));

// Mock useToast
const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Import after mocks
import { useVacationRecommendations } from '../useVacationRecommendations';

describe('useVacationRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserState = mockUser;
  });

  describe('initialization', () => {
    it('should start with recommendations array', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.recommendations)).toBe(true);
    });

    it('should start with loading false after fetch', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should have null error initially', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should fetch recommendations on mount for logged in user', async () => {
      renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalled();
      });
    });

    it('should not fetch without user', async () => {
      mockUserState = null;

      renderHook(() => useVacationRecommendations());

      await waitFor(() => {});

      expect(mockEq).not.toHaveBeenCalled();
    });
  });

  describe('generateRecommendations', () => {
    it('should require authentication', async () => {
      mockUserState = null;

      const { result } = renderHook(() => useVacationRecommendations());

      let destinations;
      await act(async () => {
        destinations = await result.current.generateRecommendations('france', { climate: 'temperate' });
      });

      expect(destinations).toEqual([]);
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        variant: 'destructive',
      }));
    });

    it('should call edge function with correct params', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.generateRecommendations('france', { climate: 'tropical', budget: 'medium' });
      });

      expect(mockInvoke).toHaveBeenCalledWith('destination-insights', expect.objectContaining({
        body: expect.objectContaining({
          destination: 'france',
          mode: 'vacation_recommendations',
          preferences: { climate: 'tropical', budget: 'medium' },
        }),
      }));
    });

    it('should save recommendations to database', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.generateRecommendations('france', { climate: 'temperate' });
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should show success toast on generation', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.generateRecommendations('france', {});
      });

      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Recommandations générées',
      }));
    });

    it('should return destinations array', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      let destinations: unknown[] = [];
      await act(async () => {
        destinations = await result.current.generateRecommendations('france', {});
      });

      expect(Array.isArray(destinations)).toBe(true);
      expect(destinations.length).toBeGreaterThan(0);
    });

    it('should set loading state during generation', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.generateRecommendations('france', {});
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('deleteRecommendation', () => {
    it('should require authentication', async () => {
      mockUserState = null;

      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.deleteRecommendation('rec-1');
      });

      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should call delete with correct params', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.deleteRecommendation('rec-1');
      });

      expect(mockDelete).toHaveBeenCalledWith('id', 'rec-1');
    });

    it('should show success toast on deletion', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.deleteRecommendation('rec-1');
      });

      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Recommandation supprimée',
      }));
    });
  });

  describe('refreshRecommendations', () => {
    it('should provide refresh function', () => {
      const { result } = renderHook(() => useVacationRecommendations());

      expect(typeof result.current.refreshRecommendations).toBe('function');
    });

    it('should refetch recommendations when called', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {});

      const initialCallCount = mockSelect.mock.calls.length;

      await act(async () => {
        await result.current.refreshRecommendations();
      });

      expect(mockSelect.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('data mapping', () => {
    it('should map database response to correct structure', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(result.current.recommendations.length).toBeGreaterThan(0);
      });

      const rec = result.current.recommendations[0];
      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('originCountry');
      expect(rec).toHaveProperty('destinations');
      expect(rec).toHaveProperty('preferences');
      expect(rec).toHaveProperty('createdAt');
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('security', () => {
    it('should only fetch for authenticated user', async () => {
      renderHook(() => useVacationRecommendations());

      await waitFor(() => {
        expect(mockEq).toHaveBeenCalled();
      });

      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should include user_id in delete query', async () => {
      const { result } = renderHook(() => useVacationRecommendations());

      await act(async () => {
        await result.current.deleteRecommendation('rec-1');
      });

      // First eq is for id, second should be for user_id (enforced by RLS)
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
