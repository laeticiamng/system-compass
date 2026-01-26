import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]),
  },
  writable: true,
});

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserState: typeof mockUser | null = null;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUserState,
    loading: false,
  }),
}));

// Import after mocks
import { useUserHistory } from '../useUserHistory';

const STORAGE_KEY = 'pyramid_compass_history';

describe('useUserHistory', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
    mockUserState = null;
  });

  describe('initialization', () => {
    it('should start with empty history', async () => {
      const { result } = renderHook(() => useUserHistory());

      expect(result.current.history).toEqual([]);
    });

    it('should load existing history from localStorage', async () => {
      const existingHistory = [
        { type: 'country_view', id: 'france', label: 'France', timestamp: new Date().toISOString() }
      ];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(existingHistory);

      const { result } = renderHook(() => useUserHistory());

      // Wait for loading
      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe('france');
    });

    it('should handle corrupted localStorage gracefully', async () => {
      mockLocalStorage[STORAGE_KEY] = 'invalid-json';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.history).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('trackCountryView', () => {
    it('should add country view to history', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].type).toBe('country_view');
      expect(result.current.history[0].id).toBe('france');
      expect(result.current.history[0].label).toBe('France');
    });

    it('should add timestamp to entries', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
      });

      expect(result.current.history[0].timestamp).toBeInstanceOf(Date);
    });

    it('should place new entries at beginning', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
      });

      act(() => {
        result.current.trackCountryView('usa', 'USA');
      });

      expect(result.current.history[0].id).toBe('usa');
      expect(result.current.history[1].id).toBe('france');
    });

    it('should prevent duplicate entries for same country', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
        result.current.trackCountryView('usa', 'USA');
        result.current.trackCountryView('france', 'France'); // duplicate
      });

      const franceEntries = result.current.history.filter(h => h.id === 'france');
      expect(franceEntries).toHaveLength(1);
      expect(result.current.history[0].id).toBe('france'); // Most recent
    });
  });

  describe('trackComparison', () => {
    it('should add comparison to history', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackComparison(['france', 'usa'], ['France', 'USA']);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].type).toBe('comparison');
      expect(result.current.history[0].label).toBe('France vs USA');
    });

    it('should store country IDs in metadata', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackComparison(['france', 'usa', 'japan'], ['France', 'USA', 'Japan']);
      });

      expect(result.current.history[0].metadata).toBeDefined();
    });
  });

  describe('trackSimulation', () => {
    it('should add simulation to history', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackSimulation('budget_simulation', { amount: 5000 });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].type).toBe('simulation');
      expect(result.current.history[0].label).toBe('budget_simulation');
      expect(result.current.history[0].metadata).toEqual({ amount: 5000 });
    });
  });

  describe('trackExitKey', () => {
    it('should add exit key to history', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackExitKey('key-123', 'Visa Entrepreneur');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].type).toBe('exit_key');
      expect(result.current.history[0].id).toBe('key-123');
      expect(result.current.history[0].label).toBe('Visa Entrepreneur');
    });
  });

  describe('clearHistory', () => {
    it('should clear all history entries', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
        result.current.trackCountryView('usa', 'USA');
      });

      expect(result.current.history).toHaveLength(2);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should remove localStorage entry', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
      });

      expect(mockLocalStorage[STORAGE_KEY]).toBeDefined();

      act(() => {
        result.current.clearHistory();
      });

      expect(mockLocalStorage[STORAGE_KEY]).toBeUndefined();
    });
  });

  describe('getRecentByType', () => {
    it('should filter entries by type', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
        result.current.trackComparison(['usa', 'uk'], ['USA', 'UK']);
        result.current.trackCountryView('japan', 'Japan');
      });

      const countryViews = result.current.getRecentByType('country_view');
      expect(countryViews).toHaveLength(2);
      expect(countryViews.every(h => h.type === 'country_view')).toBe(true);
    });

    it('should limit results to specified count', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.trackCountryView(`country-${i}`, `Country ${i}`);
        }
      });

      const recent = result.current.getRecentByType('country_view', 3);
      expect(recent).toHaveLength(3);
    });
  });

  describe('getMostViewedCountries', () => {
    it('should return empty array for no country views', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mostViewed = result.current.getMostViewedCountries();
      expect(mostViewed).toEqual([]);
    });

    it('should limit results', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.trackCountryView(`country-${i}`, `Country ${i}`);
        }
      });

      const mostViewed = result.current.getMostViewedCountries(3);
      expect(mostViewed.length).toBeLessThanOrEqual(3);
    });
  });

  describe('history limits', () => {
    it('should limit history to 50 entries', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        for (let i = 0; i < 60; i++) {
          result.current.trackCountryView(`country-${i}`, `Country ${i}`);
        }
      });

      expect(result.current.history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('RGPD compliance', () => {
    it('should allow complete data deletion via clearHistory', async () => {
      const { result } = renderHook(() => useUserHistory());

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackCountryView('france', 'France');
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
      expect(mockLocalStorage[STORAGE_KEY]).toBeUndefined();
    });
  });
});
