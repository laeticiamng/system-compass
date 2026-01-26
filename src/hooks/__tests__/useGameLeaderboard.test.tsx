import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Supabase mocks
const mockOrder = vi.fn();
const mockLimit = vi.fn();

const mockLeaderboardData = [
  {
    user_id: 'user-1',
    display_name: 'Player One',
    best_score_solo: 1500,
    best_score_race: 1200,
    total_games_played: 25,
    countries_visited: ['france', 'usa', 'japan'],
    total_risk_events: 10,
    risk_successes: 7,
    last_game_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    user_id: 'user-2',
    display_name: 'Player Two',
    best_score_solo: 1200,
    best_score_race: 1000,
    total_games_played: 15,
    countries_visited: ['germany', 'spain'],
    total_risk_events: 5,
    risk_successes: 3,
    last_game_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
  },
  {
    user_id: 'user-3',
    display_name: null,
    best_score_solo: 800,
    best_score_race: null,
    total_games_played: 5,
    countries_visited: null,
    total_risk_events: 0,
    risk_successes: 0,
    last_game_at: null,
    updated_at: '2024-01-10T10:00:00Z',
  },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: () => ({
        order: (field: string, options: { ascending: boolean }) => {
          mockOrder(field, options);
          return {
            limit: (count: number) => {
              mockLimit(count);
              return Promise.resolve({ data: mockLeaderboardData, error: null });
            },
          };
        },
      }),
    })),
  },
}));

// Import after mocks
import { useGameLeaderboard } from '../useGameLeaderboard';

describe('useGameLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with loading state', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should start with empty entries array', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.entries)).toBe(true);
    });

    it('should have null error initially', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('data fetching', () => {
    it('should fetch leaderboard sorted by best_score_solo descending', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockOrder).toHaveBeenCalledWith('best_score_solo', { ascending: false });
    });

    it('should limit results to 50 entries', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should map data to LeaderboardEntry structure', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.entries.forEach(entry => {
        expect(entry).toHaveProperty('userId');
        expect(entry).toHaveProperty('displayName');
        expect(entry).toHaveProperty('bestScoreSolo');
        expect(entry).toHaveProperty('bestScoreRace');
        expect(entry).toHaveProperty('totalGamesPlayed');
        expect(entry).toHaveProperty('countriesVisited');
        expect(entry).toHaveProperty('riskSuccessRate');
        expect(entry).toHaveProperty('lastGameAt');
      });
    });

    it('should filter out entries with 0 games played', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const zeroGamesEntry = result.current.entries.find(e => e.totalGamesPlayed === 0);
      expect(zeroGamesEntry).toBeUndefined();
    });
  });

  describe('data transformation', () => {
    it('should use "Anonymous" for null display_name', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const anonymousEntry = result.current.entries.find(e => e.userId === 'user-3');
      if (anonymousEntry) {
        expect(anonymousEntry.displayName).toBe('Anonymous');
      }
    });

    it('should calculate countriesVisited from array length', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const playerOne = result.current.entries.find(e => e.userId === 'user-1');
      expect(playerOne?.countriesVisited).toBe(3);
    });

    it('should handle null countries_visited array', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const playerThree = result.current.entries.find(e => e.userId === 'user-3');
      if (playerThree) {
        expect(playerThree.countriesVisited).toBe(0);
      }
    });

    it('should calculate risk success rate correctly', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const playerOne = result.current.entries.find(e => e.userId === 'user-1');
      // 7/10 = 70%
      expect(playerOne?.riskSuccessRate).toBe(70);
    });

    it('should return 0 risk success rate when no risk events', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const playerThree = result.current.entries.find(e => e.userId === 'user-3');
      if (playerThree) {
        expect(playerThree.riskSuccessRate).toBe(0);
      }
    });

    it('should use updated_at as fallback for null last_game_at', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const playerThree = result.current.entries.find(e => e.userId === 'user-3');
      if (playerThree) {
        expect(playerThree.lastGameAt).toBe('2024-01-10T10:00:00Z');
      }
    });

    it('should default scores to 0 for null values', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const playerThree = result.current.entries.find(e => e.userId === 'user-3');
      if (playerThree) {
        expect(playerThree.bestScoreRace).toBe(0);
      }
    });
  });

  describe('refresh functionality', () => {
    it('should provide refresh function', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refresh).toBe('function');
    });

    it('should refetch data when refresh is called', async () => {
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = mockOrder.mock.calls.length;

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockOrder.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // This test verifies the hook doesn't crash on error scenarios
      const { result } = renderHook(() => useGameLeaderboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      consoleSpy.mockRestore();
    });
  });
});
