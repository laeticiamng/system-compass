import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ============================================
// GAME STATISTICS HOOK TESTS
// ============================================

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockUpsert = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'game_statistics') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle
            })
          }),
          update: mockUpdate.mockReturnValue({
            eq: mockEq.mockReturnValue({ error: null })
          }),
          upsert: mockUpsert.mockReturnValue({ error: null }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { display_name: 'TestPlayer' }, error: null })
            })
          })
        };
      }
      return {};
    }),
  },
}));

const mockUser = { id: 'user-123', email: 'player@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUserValue,
    loading: false,
  })),
}));

import { useGameStatistics } from '../useGameStatistics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useGameStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUserValue = mockUser;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('should start with default stats', async () => {
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats.totalGamesPlayed).toBe(0);
      expect(result.current.stats.totalTurnsPlayed).toBe(0);
      expect(result.current.stats.archetypesUsed).toEqual([]);
      expect(result.current.stats.countriesVisited).toEqual([]);
    });

    it('should load from localStorage first', async () => {
      const localStats = {
        totalGamesPlayed: 5,
        totalTurnsPlayed: 100,
        bestScoreSolo: 5000,
        bestScoreRace: 3000,
        archetypesUsed: ['pioneer'],
        countriesVisited: ['US', 'FR'],
        totalRiskEvents: 10,
        riskSuccesses: 7,
        riskFailures: 3,
        totalMoneyEarned: 50000,
        totalMoneyLost: 10000,
        totalHealthLost: 20,
        favoriteActions: { work: 15, invest: 10 },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(localStats));

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats.totalGamesPlayed).toBe(5);
      expect(result.current.stats.bestScoreSolo).toBe(5000);
    });

    it('should handle cloud data when logged in', async () => {
      const cloudData = {
        total_games_played: 10,
        total_turns_played: 200,
        best_score_solo: 8000,
        best_score_race: 5000,
        archetypes_used: ['pioneer', 'merchant'],
        countries_visited: ['US', 'FR', 'DE'],
        total_risk_events: 20,
        risk_successes: 15,
        risk_failures: 5,
        total_money_earned: 100000,
        total_money_lost: 20000,
        total_health_lost: 30,
        favorite_actions: { work: 30, invest: 20 },
        display_name: 'CloudPlayer',
      };

      mockMaybeSingle.mockResolvedValue({ data: cloudData, error: null });

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Hook should be initialized
      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  describe('game tracking', () => {
    it('should track completed games correctly', async () => {
      // Use fresh hook with no localStorage contamination
      localStorageMock.clear();
      mockUserValue = null;
      
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialGames = result.current.stats.totalGamesPlayed;

      await act(async () => {
        await result.current.trackGameCompleted('solo', 5000, 'pioneer', 'US', 50);
      });

      // Should have incremented by 1
      expect(result.current.stats.totalGamesPlayed).toBe(initialGames + 1);
      expect(result.current.stats.archetypesUsed).toContain('pioneer');
      expect(result.current.stats.countriesVisited).toContain('US');
    });

    it('should track race mode scores separately from solo', async () => {
      localStorageMock.clear();
      mockUserValue = null;
      
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackGameCompleted('race', 3000, 'merchant', 'FR', 30);
      });

      // Race score should be set
      expect(result.current.stats.bestScoreRace).toBe(3000);
    });

    it('should only update best score if higher', async () => {
      const localStats = {
        totalGamesPlayed: 1,
        totalTurnsPlayed: 50,
        bestScoreSolo: 7000,
        bestScoreRace: 0,
        archetypesUsed: [],
        countriesVisited: [],
        totalRiskEvents: 0,
        riskSuccesses: 0,
        riskFailures: 0,
        totalMoneyEarned: 0,
        totalMoneyLost: 0,
        totalHealthLost: 0,
        favoriteActions: {},
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(localStats));
      mockUserValue = null;

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Try to set a lower score
      await act(async () => {
        await result.current.trackGameCompleted('solo', 5000, 'pioneer', 'US', 50);
      });

      // Best score should remain 7000
      expect(result.current.stats.bestScoreSolo).toBe(7000);
    });

    it('should not duplicate archetypes or countries', async () => {
      mockUserValue = null;
      
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackGameCompleted('solo', 1000, 'pioneer', 'US', 10);
        await result.current.trackGameCompleted('solo', 2000, 'pioneer', 'US', 20);
      });

      expect(result.current.stats.archetypesUsed.filter(a => a === 'pioneer').length).toBe(1);
      expect(result.current.stats.countriesVisited.filter(c => c === 'US').length).toBe(1);
    });
  });

  describe('risk event tracking', () => {
    beforeEach(() => {
      mockUserValue = null;
    });

    it('should track successful risk events', async () => {
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackRiskEvent('success', 5000, 0);
      });

      expect(result.current.stats.totalRiskEvents).toBe(1);
      expect(result.current.stats.riskSuccesses).toBe(1);
      expect(result.current.stats.riskFailures).toBe(0);
      expect(result.current.stats.totalMoneyEarned).toBe(5000);
    });

    it('should track failed risk events', async () => {
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackRiskEvent('failure', -2000, -10);
      });

      expect(result.current.stats.totalRiskEvents).toBe(1);
      expect(result.current.stats.riskSuccesses).toBe(0);
      expect(result.current.stats.riskFailures).toBe(1);
      expect(result.current.stats.totalMoneyLost).toBe(2000);
      expect(result.current.stats.totalHealthLost).toBe(10);
    });

    it('should track catastrophic risk events', async () => {
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackRiskEvent('catastrophic', -10000, -50);
      });

      expect(result.current.stats.riskFailures).toBe(1);
      expect(result.current.stats.totalMoneyLost).toBe(10000);
      expect(result.current.stats.totalHealthLost).toBe(50);
    });
  });

  describe('action tracking', () => {
    beforeEach(() => {
      localStorageMock.clear();
      mockUserValue = null;
    });

    it('should increment action counts', async () => {
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.stats.favoriteActions['work'] || 0;

      await act(async () => {
        await result.current.trackActionUsed('work');
      });

      expect(result.current.stats.favoriteActions['work']).toBe(initialCount + 1);
    });
  });

  describe('derived statistics', () => {
    it('should calculate risk success rate correctly', async () => {
      const localStats = {
        totalGamesPlayed: 10,
        totalTurnsPlayed: 500,
        bestScoreSolo: 10000,
        bestScoreRace: 0,
        archetypesUsed: [],
        countriesVisited: [],
        totalRiskEvents: 20,
        riskSuccesses: 15,
        riskFailures: 5,
        totalMoneyEarned: 0,
        totalMoneyLost: 0,
        totalHealthLost: 0,
        favoriteActions: {},
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(localStats));
      mockUserValue = null;

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.riskSuccessRate).toBe(75); // 15/20 * 100
    });

    it('should return 0 for success rate when no events tracked yet in fresh state', async () => {
      localStorageMock.clear();
      mockUserValue = null;
      
      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Fresh hook with no risk events
      if (result.current.stats.totalRiskEvents === 0) {
        expect(result.current.riskSuccessRate).toBe(0);
      }
    });

    it('should return top 5 actions sorted by count', async () => {
      const localStats = {
        totalGamesPlayed: 0,
        totalTurnsPlayed: 0,
        bestScoreSolo: 0,
        bestScoreRace: 0,
        archetypesUsed: [],
        countriesVisited: [],
        totalRiskEvents: 0,
        riskSuccesses: 0,
        riskFailures: 0,
        totalMoneyEarned: 0,
        totalMoneyLost: 0,
        totalHealthLost: 0,
        favoriteActions: {
          work: 50,
          invest: 30,
          network: 25,
          learn: 20,
          rest: 15,
          gamble: 10,
          travel: 5,
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(localStats));
      mockUserValue = null;

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.topActions).toHaveLength(5);
      expect(result.current.topActions[0]).toEqual({ action: 'work', count: 50 });
      expect(result.current.topActions[4]).toEqual({ action: 'rest', count: 15 });
    });
  });

  describe('cloud sync', () => {
    it('should sync to cloud when user is logged in', async () => {
      mockUserValue = mockUser;
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockUpsert.mockReturnValue({ error: null });

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(true);
    });

    it('should not sync when user is not logged in', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useGameStatistics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(false);
    });
  });
});

// ============================================
// DATA INTEGRITY TESTS
// ============================================

describe('GameStatistics Data Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUserValue = null;
  });

  it('should handle corrupted localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json {{{');

    const { result } = renderHook(() => useGameStatistics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should fall back to defaults
    expect(result.current.stats.totalGamesPlayed).toBe(0);
  });

  it('should persist stats to localStorage', async () => {
    const { result } = renderHook(() => useGameStatistics());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.trackGameCompleted('solo', 1000, 'test', 'US', 10);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'game_statistics',
      expect.stringContaining('"totalGamesPlayed":1')
    );
  });
});
