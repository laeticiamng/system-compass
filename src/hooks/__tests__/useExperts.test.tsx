/**
 * useExperts Hook Tests
 * Tests for expert marketplace functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExperts } from '../useExperts';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useExperts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useExperts());
      expect(result.current.isLoading).toBe(true);
    });

    it('should load mock experts when DB is empty', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.experts.length).toBeGreaterThan(0);
    });

    it('should have no error initially', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('expert filtering', () => {
    it('should filter by type', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchExperts({ type: 'lawyer' });
      });

      // Should have filtered results
      expect(result.current.experts.every(e => e.type === 'lawyer')).toBe(true);
    });

    it('should filter by country', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchExperts({ country: 'France' });
      });

      // Should have filtered results
      expect(result.current.experts.every(e => e.countries.includes('France'))).toBe(true);
    });
  });

  describe('reviews', () => {
    it('should return empty reviews for mock experts', async () => {
      const { result } = renderHook(() => useExperts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const reviews = await result.current.fetchReviews('mock-1');
      expect(reviews).toEqual([]);
    });

    it('should return an array from fetchReviews', async () => {
      const { result } = renderHook(() => useExperts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const reviews = await result.current.fetchReviews('mock-1');
      expect(Array.isArray(reviews)).toBe(true);
    });
  });

  describe('consultations', () => {
    it('should book consultation for mock expert', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const success = await result.current.bookConsultation(
        'mock-1',
        new Date(Date.now() + 86400000),
        'Test consultation'
      );

      expect(success).toBe(true);
    });
  });

  describe('data structure', () => {
    it('should have correct expert structure', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expert = result.current.experts[0];
      expect(expert).toHaveProperty('id');
      expect(expert).toHaveProperty('name');
      expect(expert).toHaveProperty('type');
      expect(expert).toHaveProperty('countries');
      expect(expert).toHaveProperty('languages');
      expect(expert).toHaveProperty('specialties');
      expect(expert).toHaveProperty('priceMin');
      expect(expert).toHaveProperty('priceMax');
      expect(expert).toHaveProperty('rating');
    });

    it('should include all expert types', async () => {
      const { result } = renderHook(() => useExperts());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const types = new Set(result.current.experts.map(e => e.type));
      expect(types.has('lawyer')).toBe(true);
      expect(types.has('tax_advisor')).toBe(true);
      expect(types.has('immigration')).toBe(true);
    });
  });
});
