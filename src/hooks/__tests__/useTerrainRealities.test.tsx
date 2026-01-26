import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ============================================
// TERRAIN REALITIES HOOK TESTS - EDGE FUNCTION
// ============================================

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (name: string, options: any) => mockInvoke(name, options),
    },
  },
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

// Mock sonner toast
const mockToastError = vi.fn();
const mockToastInfo = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    info: (msg: string) => mockToastInfo(msg),
    success: vi.fn(),
  },
}));

import { useTerrainRealities } from '../useTerrainRealities';

describe('useTerrainRealities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with default state', () => {
      const { result } = renderHook(() => useTerrainRealities());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should expose generateRealities and reset functions', () => {
      const { result } = renderHook(() => useTerrainRealities());

      expect(typeof result.current.generateRealities).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('generateRealities', () => {
    it('should call edge function with country and language', async () => {
      const mockResult = {
        country_name: 'Nigeria',
        last_updated: '2024-01',
        overall_risk_level: 'high',
        healthcare_realities: { risk_level: 'high' },
        justice_realities: { risk_level: 'high' },
        security_realities: { risk_level: 'medium' },
        administration_realities: { risk_level: 'high' },
        positive_developments: [],
        sources: [],
        confidence_score: 0.75,
        disclaimer: 'Test disclaimer',
      };

      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useTerrainRealities());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateRealities('Nigeria');
      });

      expect(mockInvoke).toHaveBeenCalledWith('terrain-realities', {
        body: {
          country: 'Nigeria',
          language: 'fr',
        },
      });

      expect(result.current.result).toEqual(mockResult);
      expect(returnValue).toEqual(mockResult);
    });

    it('should set loading state during request', async () => {
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockInvoke.mockReturnValue(slowPromise);

      const { result } = renderHook(() => useTerrainRealities());

      // Start the request
      act(() => {
        result.current.generateRealities('Test');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve
      await act(async () => {
        resolvePromise!({ data: { country_name: 'Test' }, error: null });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle cached results with info toast', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          country_name: 'Cached Country',
          cached: true,
        },
        error: null,
      });

      const { result } = renderHook(() => useTerrainRealities());

      await act(async () => {
        await result.current.generateRealities('Cached Country');
      });

      expect(mockToastInfo).toHaveBeenCalledWith('terrainRealities.cachedResult');
    });
  });

  describe('error handling', () => {
    it('should handle function invocation error', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('Function failed'),
      });

      const { result } = renderHook(() => useTerrainRealities());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateRealities('Test');
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBeTruthy();
      expect(mockToastError).toHaveBeenCalled();
    });

    it('should handle rate limit error', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Rate limit exceeded' },
        error: null,
      });

      const { result } = renderHook(() => useTerrainRealities());

      await act(async () => {
        await result.current.generateRealities('Test');
      });

      expect(result.current.error).toBe('Rate limit exceeded');
      expect(mockToastError).toHaveBeenCalledWith('errors.rateLimited');
    });

    it('should handle credits error', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Insufficient credits' },
        error: null,
      });

      const { result } = renderHook(() => useTerrainRealities());

      await act(async () => {
        await result.current.generateRealities('Test');
      });

      expect(result.current.error).toBe('Insufficient credits');
      expect(mockToastError).toHaveBeenCalledWith('errors.insufficientCredits');
    });

    it('should handle generic error', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Something went wrong' },
        error: null,
      });

      const { result } = renderHook(() => useTerrainRealities());

      await act(async () => {
        await result.current.generateRealities('Test');
      });

      expect(result.current.error).toBe('Something went wrong');
      expect(mockToastError).toHaveBeenCalledWith('Something went wrong');
    });

    it('should handle thrown exception', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTerrainRealities());

      await act(async () => {
        await result.current.generateRealities('Test');
      });

      expect(result.current.error).toBe('Network error');
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  describe('reset function', () => {
    it('should clear result and error', async () => {
      mockInvoke.mockResolvedValue({
        data: { country_name: 'Test' },
        error: null,
      });

      const { result } = renderHook(() => useTerrainRealities());

      await act(async () => {
        await result.current.generateRealities('Test');
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});

// ============================================
// DATA STRUCTURE VALIDATION TESTS
// ============================================

describe('TerrainRealities Data Structures', () => {
  it('should validate healthcare realities interface', () => {
    const healthcareRealities = {
      risk_level: 'high' as const,
      fake_medications: {
        prevalence: 'high',
        affected_categories: ['antibiotics'],
        known_distribution_channels: ['street vendors'],
        protection_measures: ['buy from certified pharmacies'],
        sources: [{ name: 'WHO', year: 2023, finding: 'Test' }],
      },
      medical_equipment: {
        issues: ['unreliable'],
        affected_facilities: 'public hospitals',
        reliable_alternatives: ['private clinics'],
        sources: [{ name: 'Report', year: 2023 }],
      },
      chronic_disease_management: {
        hiv_treatment: {
          availability: 'limited',
          test_reliability: 'variable',
          issues_reported: ['stock-outs'],
          reliable_centers: ['Center A'],
          international_support: ['UNAIDS'],
        },
        diabetes_care: { availability: 'limited', issues: ['cost'] },
        cancer_care: { availability: 'very limited', issues: ['equipment'] },
      },
      recommendations: ['Bring essential medications'],
    };

    expect(healthcareRealities.risk_level).toBe('high');
    expect(healthcareRealities.fake_medications.sources).toHaveLength(1);
  });

  it('should validate justice realities interface', () => {
    const justiceRealities = {
      risk_level: 'medium' as const,
      corruption_patterns: {
        lawyer_corruption: {
          prevalence: 'medium',
          mechanism: 'bribery',
          protection: ['use vetted lawyers'],
        },
        judicial_corruption: {
          prevalence: 'high',
          protection: ['international arbitration'],
        },
        police_corruption: {
          prevalence: 'high',
          typical_bribes_range: '$10-50',
          common_scenarios: ['traffic stops'],
          protection: ['stay calm'],
        },
      },
      average_delays: {
        civil_cases: '2-3 years',
        criminal_cases: '1-2 years',
        commercial_disputes: '6 months - 2 years',
      },
      emergency_recourses: [{
        name: 'Embassy',
        description: 'Contact embassy',
        timeline: 'Immediate',
        cost_range: 'Free',
        effectiveness: 'medium' as const,
        how_to_access: 'Call hotline',
      }],
      reliable_contacts: [{
        type: 'lawyer',
        name: 'Test Lawyer',
        specialty: 'International law',
        contact_info: '+1234567890',
      }],
      recommendations: ['Document everything'],
    };

    expect(justiceRealities.corruption_patterns.police_corruption.prevalence).toBe('high');
    expect(justiceRealities.emergency_recourses).toHaveLength(1);
  });

  it('should validate security realities interface', () => {
    const securityRealities = {
      risk_level: 'medium' as const,
      human_trafficking: {
        prevalence: 'present',
        common_scenarios: ['labor exploitation'],
        risk_zones: ['border areas'],
        warning_signs: ['document confiscation'],
        emergency_contacts: ['hotline'],
        sources: [{ name: 'UNODC' }],
      },
      organized_crime: {
        prevalence: 'medium',
        types: ['fraud'],
        risk_zones: ['urban areas'],
        protection: ['vigilance'],
      },
      petty_crime: {
        prevalence: 'high',
        hotspots: ['markets'],
        protection: ['keep valuables hidden'],
      },
      recommendations: ['Avoid high-risk areas at night'],
    };

    expect(securityRealities.human_trafficking.sources).toHaveLength(1);
  });

  it('should validate confidence score range', () => {
    const confidenceScores = [0, 0.5, 0.75, 1];
    
    confidenceScores.forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
