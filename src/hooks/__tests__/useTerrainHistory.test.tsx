import { describe, it, expect, beforeEach } from 'vitest';
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

// Import after mocks
import { useTerrainHistory } from '../useTerrainHistory';

const STORAGE_KEY = 'terrain-realities-history';

describe('useTerrainHistory', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
  });

  describe('initialization', () => {
    it('should start with empty history', () => {
      const { result } = renderHook(() => useTerrainHistory());

      expect(result.current.history).toEqual([]);
    });

    it('should load existing history from localStorage', () => {
      const existingHistory = [
        { countryId: 'france', countryName: 'France', consultedAt: '2024-01-15T10:00:00Z' }
      ];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(existingHistory);

      const { result } = renderHook(() => useTerrainHistory());

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].countryId).toBe('france');
    });

    it('should handle corrupted localStorage gracefully', () => {
      mockLocalStorage[STORAGE_KEY] = 'invalid-json';

      const { result } = renderHook(() => useTerrainHistory());

      expect(result.current.history).toEqual([]);
    });
  });

  describe('addToHistory', () => {
    it('should add new entry to history', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].countryId).toBe('france');
    });

    it('should add consultedAt timestamp automatically', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      expect(result.current.history[0].consultedAt).toBeDefined();
      expect(new Date(result.current.history[0].consultedAt).getTime()).not.toBeNaN();
    });

    it('should place new entries at the beginning', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.addToHistory({ countryId: 'usa', countryName: 'USA' });
      });

      expect(result.current.history[0].countryId).toBe('usa');
      expect(result.current.history[1].countryId).toBe('france');
    });

    it('should prevent duplicate countryIds', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France Updated' });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].countryName).toBe('France Updated');
    });

    it('should limit history to 20 items', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        for (let i = 0; i < 25; i++) {
          result.current.addToHistory({ countryId: `country-${i}`, countryName: `Country ${i}` });
        }
      });

      expect(result.current.history).toHaveLength(20);
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      const stored = JSON.parse(mockLocalStorage[STORAGE_KEY]);
      expect(stored).toHaveLength(1);
      expect(stored[0].countryId).toBe('france');
    });
  });

  describe('updateRiskLevel', () => {
    it('should update risk level for existing entry', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.updateRiskLevel('france', 'high');
      });

      expect(result.current.history[0].riskLevel).toBe('high');
    });

    it('should persist updated risk level to localStorage', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.updateRiskLevel('france', 'medium');
      });

      const stored = JSON.parse(mockLocalStorage[STORAGE_KEY]);
      expect(stored[0].riskLevel).toBe('medium');
    });

    it('should not affect other entries', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
        result.current.addToHistory({ countryId: 'usa', countryName: 'USA' });
      });

      act(() => {
        result.current.updateRiskLevel('france', 'high');
      });

      const franceEntry = result.current.history.find(h => h.countryId === 'france');
      const usaEntry = result.current.history.find(h => h.countryId === 'usa');
      
      expect(franceEntry?.riskLevel).toBe('high');
      expect(usaEntry?.riskLevel).toBeUndefined();
    });
  });

  describe('removeFromHistory', () => {
    it('should remove entry by countryId', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
        result.current.addToHistory({ countryId: 'usa', countryName: 'USA' });
      });

      act(() => {
        result.current.removeFromHistory('france');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].countryId).toBe('usa');
    });

    it('should persist removal to localStorage', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.removeFromHistory('france');
      });

      const stored = JSON.parse(mockLocalStorage[STORAGE_KEY]);
      expect(stored).toHaveLength(0);
    });

    it('should handle non-existent countryId gracefully', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.removeFromHistory('nonexistent');
      });

      expect(result.current.history).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history entries', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
        result.current.addToHistory({ countryId: 'usa', countryName: 'USA' });
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should remove localStorage entry', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(mockLocalStorage[STORAGE_KEY]).toBeUndefined();
    });
  });

  describe('isInHistory', () => {
    it('should return true for existing countryId', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      expect(result.current.isInHistory('france')).toBe(true);
    });

    it('should return false for non-existing countryId', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      expect(result.current.isInHistory('usa')).toBe(false);
    });

    it('should return false for empty history', () => {
      const { result } = renderHook(() => useTerrainHistory());

      expect(result.current.isInHistory('france')).toBe(false);
    });
  });

  describe('RGPD compliance', () => {
    it('should allow complete data deletion via clearHistory', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
      expect(mockLocalStorage[STORAGE_KEY]).toBeUndefined();
    });

    it('should store only necessary data (no PII)', () => {
      const { result } = renderHook(() => useTerrainHistory());

      act(() => {
        result.current.addToHistory({ countryId: 'france', countryName: 'France' });
      });

      const entry = result.current.history[0];
      expect(Object.keys(entry)).toEqual(['countryId', 'countryName', 'consultedAt']);
    });
  });
});
