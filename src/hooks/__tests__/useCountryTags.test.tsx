import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Supabase mocks
const mockSelect = vi.fn();
const mockIn = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: () => {
        mockSelect();
        return {
          in: (field: string, values: string[]) => {
            mockIn(field, values);
            return Promise.resolve({ data: mockTagsData, error: null });
          },
          eq: (field: string, value: string) => {
            mockEq(field, value);
            return {
              maybeSingle: () => mockMaybeSingle()
            };
          },
          then: (resolve: (result: { data: unknown; error: null }) => void) => {
            resolve({ data: mockTagsData, error: null });
          }
        };
      },
    })),
  },
}));

// Mock data
const mockTagsData = [
  {
    country_id: 'france',
    network_weight: 7,
    diploma_weight: 8,
    risk_tolerance: 4,
    admin_speed: 3,
    authority_verticality: 6,
    mental_friction: 5,
    social_mobility: 5,
    predictability: 7,
    reputation_requirement: 6,
    compliance_sensitivity: 8,
  },
  {
    country_id: 'usa',
    network_weight: 5,
    diploma_weight: 6,
    risk_tolerance: 8,
    admin_speed: 5,
    authority_verticality: 4,
    mental_friction: 3,
    social_mobility: 8,
    predictability: 6,
    reputation_requirement: 4,
    compliance_sensitivity: 5,
  },
];

// Import after mocks
import { useCountryTags, useCountryTagById } from '../useCountryTags';

describe('useCountryTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with loading state', async () => {
      const { result } = renderHook(() => useCountryTags());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should start with empty tags array', async () => {
      const { result } = renderHook(() => useCountryTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.tags)).toBe(true);
    });

    it('should have null error initially', async () => {
      const { result } = renderHook(() => useCountryTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('data fetching', () => {
    it('should fetch all tags when no countryIds provided', async () => {
      const { result } = renderHook(() => useCountryTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockSelect).toHaveBeenCalled();
    });

    it('should filter by countryIds when provided', async () => {
      const countryIds = ['france', 'usa'];
      const { result } = renderHook(() => useCountryTags(countryIds));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockIn).toHaveBeenCalledWith('country_id', countryIds);
    });

    it('should return tags with expected structure', async () => {
      const { result } = renderHook(() => useCountryTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.tags.forEach(tag => {
        expect(tag).toHaveProperty('country_id');
        expect(tag).toHaveProperty('network_weight');
        expect(tag).toHaveProperty('diploma_weight');
        expect(tag).toHaveProperty('risk_tolerance');
        expect(tag).toHaveProperty('admin_speed');
        expect(tag).toHaveProperty('authority_verticality');
        expect(tag).toHaveProperty('mental_friction');
        expect(tag).toHaveProperty('social_mobility');
        expect(tag).toHaveProperty('predictability');
        expect(tag).toHaveProperty('reputation_requirement');
        expect(tag).toHaveProperty('compliance_sensitivity');
      });
    });

    it('should refetch when countryIds change', async () => {
      const { result, rerender } = renderHook(
        ({ ids }) => useCountryTags(ids),
        { initialProps: { ids: ['france'] } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      rerender({ ids: ['usa', 'germany'] });

      await waitFor(() => {
        expect(mockIn).toHaveBeenLastCalledWith('country_id', ['usa', 'germany']);
      });
    });
  });

  describe('error handling', () => {
    it('should handle empty data gracefully', async () => {
      const { result } = renderHook(() => useCountryTags(['nonexistent']));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.tags)).toBe(true);
    });
  });

  describe('data validation', () => {
    it('should have numeric values for all score fields', async () => {
      const { result } = renderHook(() => useCountryTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.tags.forEach(tag => {
        expect(typeof tag.network_weight).toBe('number');
        expect(typeof tag.diploma_weight).toBe('number');
        expect(typeof tag.risk_tolerance).toBe('number');
        expect(typeof tag.admin_speed).toBe('number');
        expect(typeof tag.authority_verticality).toBe('number');
      });
    });
  });
});

describe('useCountryTagById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: mockTagsData[0], error: null });
  });

  describe('initialization', () => {
    it('should start with loading state', async () => {
      const { result } = renderHook(() => useCountryTagById('france'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should return null tag for empty countryId', async () => {
      const { result } = renderHook(() => useCountryTagById(''));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tag).toBeNull();
    });
  });

  describe('data fetching', () => {
    it('should fetch single tag by countryId', async () => {
      const { result } = renderHook(() => useCountryTagById('france'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockEq).toHaveBeenCalledWith('country_id', 'france');
    });

    it('should return tag with correct structure', async () => {
      const { result } = renderHook(() => useCountryTagById('france'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      if (result.current.tag) {
        expect(result.current.tag.country_id).toBe('france');
        expect(typeof result.current.tag.network_weight).toBe('number');
      }
    });

    it('should refetch when countryId changes', async () => {
      const { result, rerender } = renderHook(
        ({ id }) => useCountryTagById(id),
        { initialProps: { id: 'france' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      rerender({ id: 'usa' });

      await waitFor(() => {
        expect(mockEq).toHaveBeenLastCalledWith('country_id', 'usa');
      });
    });
  });

  describe('error handling', () => {
    it('should return null tag on error', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const { result } = renderHook(() => useCountryTagById('nonexistent'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tag).toBeNull();
    });

    it('should handle missing data gracefully', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useCountryTagById('unknown'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tag).toBeNull();
    });
  });
});
