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

// Mock useCountries
const mockCountries = [
  { id: 'nigeria', name: 'Nigeria' },
  { id: 'france', name: 'France' },
  { id: 'usa', name: 'USA' },
  { id: 'japan', name: 'Japan' },
];

vi.mock('@/lib/countries-data', () => ({
  useCountries: () => ({
    countries: mockCountries,
    loading: false,
    error: null,
  }),
}));

// Import after mocks
import { useDefaultCountry } from '../useDefaultCountry';

const STORAGE_KEY = 'pyramid-compass-default-country';

describe('useDefaultCountry', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
  });

  describe('initialization', () => {
    it('should default to nigeria if no saved preference', () => {
      const { result } = renderHook(() => useDefaultCountry());

      expect(result.current.defaultCountryId).toBe('nigeria');
    });

    it('should load saved preference from localStorage', () => {
      mockLocalStorage[STORAGE_KEY] = 'france';

      const { result } = renderHook(() => useDefaultCountry());

      expect(result.current.defaultCountryId).toBe('france');
    });

    it('should provide getDefaultCountry function', () => {
      const { result } = renderHook(() => useDefaultCountry());

      expect(typeof result.current.getDefaultCountry).toBe('function');
    });

    it('should provide setDefaultCountry function', () => {
      const { result } = renderHook(() => useDefaultCountry());

      expect(typeof result.current.setDefaultCountry).toBe('function');
    });
  });

  describe('setDefaultCountry', () => {
    it('should update default country', () => {
      const { result } = renderHook(() => useDefaultCountry());

      act(() => {
        result.current.setDefaultCountry('france');
      });

      expect(result.current.defaultCountryId).toBe('france');
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useDefaultCountry());

      act(() => {
        result.current.setDefaultCountry('japan');
      });

      expect(mockLocalStorage[STORAGE_KEY]).toBe('japan');
    });

    it('should only accept valid country IDs', () => {
      const { result } = renderHook(() => useDefaultCountry());

      act(() => {
        result.current.setDefaultCountry('invalid-country');
      });

      // Should remain unchanged (nigeria is default)
      expect(result.current.defaultCountryId).toBe('nigeria');
    });

    it('should handle multiple country changes', () => {
      const { result } = renderHook(() => useDefaultCountry());

      act(() => {
        result.current.setDefaultCountry('france');
      });
      expect(result.current.defaultCountryId).toBe('france');

      act(() => {
        result.current.setDefaultCountry('usa');
      });
      expect(result.current.defaultCountryId).toBe('usa');

      act(() => {
        result.current.setDefaultCountry('japan');
      });
      expect(result.current.defaultCountryId).toBe('japan');
    });
  });

  describe('getDefaultCountry', () => {
    it('should return country object for default country', () => {
      const { result } = renderHook(() => useDefaultCountry());

      const country = result.current.getDefaultCountry();

      expect(country).toBeDefined();
      expect(country?.id).toBe('nigeria');
      expect(country?.name).toBe('Nigeria');
    });

    it('should return updated country after setDefaultCountry', () => {
      const { result } = renderHook(() => useDefaultCountry());

      act(() => {
        result.current.setDefaultCountry('france');
      });

      const country = result.current.getDefaultCountry();

      expect(country?.id).toBe('france');
      expect(country?.name).toBe('France');
    });

    it('should fallback to nigeria for invalid stored country', () => {
      mockLocalStorage[STORAGE_KEY] = 'nonexistent';

      const { result } = renderHook(() => useDefaultCountry());

      const country = result.current.getDefaultCountry();

      // Should fallback to nigeria (the default)
      expect(country?.id).toBe('nigeria');
    });
  });

  describe('persistence', () => {
    it('should save to localStorage on change', () => {
      const { result } = renderHook(() => useDefaultCountry());

      expect(mockLocalStorage[STORAGE_KEY]).toBe('nigeria');

      act(() => {
        result.current.setDefaultCountry('usa');
      });

      expect(mockLocalStorage[STORAGE_KEY]).toBe('usa');
    });

    it('should persist across hook remounts', () => {
      const { result: result1, unmount } = renderHook(() => useDefaultCountry());

      act(() => {
        result1.current.setDefaultCountry('japan');
      });

      unmount();

      const { result: result2 } = renderHook(() => useDefaultCountry());

      expect(result2.current.defaultCountryId).toBe('japan');
    });
  });

  describe('RGPD compliance', () => {
    it('should store only country ID (no PII)', () => {
      const { result } = renderHook(() => useDefaultCountry());

      act(() => {
        result.current.setDefaultCountry('france');
      });

      const stored = mockLocalStorage[STORAGE_KEY];
      expect(stored).toBe('france'); // Just a simple string, no personal data
    });
  });
});
