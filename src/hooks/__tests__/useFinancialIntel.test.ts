import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ============================================
// FINANCIAL INTEL HOOK TESTS - BUSINESS CRITICAL
// ============================================

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: 'fr' },
  }),
}));

import { useFinancialIntel, FinancialIntelResult } from '../useFinancialIntel';

describe('useFinancialIntel', () => {
  const mockResult: FinancialIntelResult = {
    country_profile: {
      name: 'France',
      currency: 'EUR',
      main_regulators: ['AMF', 'ACPR'],
      source_confidence: 'high',
    },
    scam_top7: [
      {
        name: 'Faux investissement crypto',
        category: 'investment_fraud',
        process: 'Promise high returns...',
        typical_targets: 'Young investors',
        red_flags: ['Guaranteed returns', 'Pressure to invest'],
        psychological_tactics: ['FOMO', 'Authority'],
        risks: ['Total loss of capital'],
        protection_checklist: ['Verify AMF registration'],
        where_to_verify: ['AMF.fr'],
        where_to_report: ['Signal-Arnaques'],
      },
    ],
    legit_top7: [
      {
        name: 'Livret A',
        category: 'savings',
        why_safer: 'State guaranteed',
        what_its_not: 'Not high yield investment',
        verification_checklist: ['Bank is regulated'],
        when_to_avoid: ['High inflation periods'],
        official_resources: ['service-public.fr'],
      },
    ],
    sources: [{ name: 'AMF', url: 'https://amf.fr', type: 'regulator' }],
    confidence: 85,
    disclaimer: 'This is informational only',
    cached: false,
  };

    beforeEach(() => {
      vi.clearAllMocks();
    });

  describe('initialization', () => {
    it('should start with correct initial state', () => {
      const { result } = renderHook(() => useFinancialIntel());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('generateIntel', () => {
    it('should call edge function with correct parameters', async () => {
      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useFinancialIntel());

      await act(async () => {
        await result.current.generateIntel({
          country: 'France',
          sector_focus: 'crypto',
          audience: 'retail_investors',
        });
      });

      expect(mockInvoke).toHaveBeenCalledWith('financial-intel', {
        body: {
          country: 'France',
          sector_focus: 'crypto',
          audience: 'retail_investors',
          language: 'fr',
        },
      });
    });

    it('should use current i18n language', async () => {
      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useFinancialIntel());

      await act(async () => {
        await result.current.generateIntel({ country: 'UK' });
      });

      expect(mockInvoke).toHaveBeenCalledWith('financial-intel', {
        body: expect.objectContaining({
          language: 'fr', // Default mocked language
        }),
      });
    });

    it('should set loading state during generation', async () => {
      mockInvoke.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockResult, error: null }), 100))
      );

      const { result } = renderHook(() => useFinancialIntel());

      act(() => {
        void result.current.generateIntel({ country: 'France' });
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should return result on success', async () => {
      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useFinancialIntel());

      let returnedData;
      await act(async () => {
        returnedData = await result.current.generateIntel({ country: 'France' });
      });

      expect(returnedData).toEqual(mockResult);
      expect(result.current.result).toEqual(mockResult);
    });

    it('should handle rate limiting errors', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Rate limit exceeded' },
        error: null,
      });

      const { result } = renderHook(() => useFinancialIntel());

      let returnedData;
      await act(async () => {
        returnedData = await result.current.generateIntel({ country: 'France' });
      });

      expect(returnedData).toBeNull();
      expect(result.current.error).toBe('Rate limit exceeded');
    });

    it('should handle insufficient credits errors', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Insufficient credits remaining' },
        error: null,
      });

      const { result } = renderHook(() => useFinancialIntel());

      let returnedData;
      await act(async () => {
        returnedData = await result.current.generateIntel({ country: 'France' });
      });

      expect(returnedData).toBeNull();
      expect(result.current.error).toContain('credits');
    });

    it('should handle network/function errors', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('Network timeout'),
      });

      const { result } = renderHook(() => useFinancialIntel());

      let returnedData;
      await act(async () => {
        returnedData = await result.current.generateIntel({ country: 'France' });
      });

      expect(returnedData).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('should clear result and error', async () => {
      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useFinancialIntel());

      await act(async () => {
        await result.current.generateIntel({ country: 'France' });
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadResult', () => {
    it('should load externally provided result', () => {
      const { result } = renderHook(() => useFinancialIntel());

      act(() => {
        result.current.loadResult(mockResult);
      });

      expect(result.current.result).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });
  });

  describe('cached results', () => {
    it('should handle cached results correctly', async () => {
      const cachedResult = { ...mockResult, cached: true };
      mockInvoke.mockResolvedValue({ data: cachedResult, error: null });

      const { result } = renderHook(() => useFinancialIntel());

      await act(async () => {
        await result.current.generateIntel({ country: 'France' });
      });

      expect(result.current.result?.cached).toBe(true);
    });
  });
});

// ============================================
// DATA STRUCTURE VALIDATION
// ============================================

describe('Financial Intel Data Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate scam item structure', async () => {
    const validScam = {
      name: 'Test Scam',
      category: 'fraud',
      process: 'How it works',
      typical_targets: 'Targets',
      red_flags: ['flag1'],
      psychological_tactics: ['tactic1'],
      risks: ['risk1'],
      protection_checklist: ['check1'],
      where_to_verify: ['verify1'],
      where_to_report: ['report1'],
    };

    const result: FinancialIntelResult = {
      country_profile: {
        name: 'Test',
        currency: 'EUR',
        main_regulators: [],
        source_confidence: 'medium',
      },
      scam_top7: [validScam],
      legit_top7: [],
      sources: [],
      confidence: 50,
      disclaimer: 'Test',
    };

    mockInvoke.mockResolvedValue({ data: result, error: null });

    const { result: hookResult } = renderHook(() => useFinancialIntel());

    await act(async () => {
      await hookResult.current.generateIntel({ country: 'Test' });
    });

    const scam = hookResult.current.result?.scam_top7[0];
    expect(scam).toHaveProperty('name');
    expect(scam).toHaveProperty('category');
    expect(scam).toHaveProperty('red_flags');
    expect(Array.isArray(scam?.red_flags)).toBe(true);
  });

  it('should validate legit option structure', async () => {
    const validLegit = {
      name: 'Safe Option',
      category: 'savings',
      why_safer: 'Reason',
      what_its_not: 'Not this',
      verification_checklist: ['check'],
      when_to_avoid: ['avoid'],
      official_resources: ['resource'],
    };

    const result: FinancialIntelResult = {
      country_profile: {
        name: 'Test',
        currency: 'EUR',
        main_regulators: [],
        source_confidence: 'high',
      },
      scam_top7: [],
      legit_top7: [validLegit],
      sources: [],
      confidence: 80,
      disclaimer: 'Test',
    };

    mockInvoke.mockResolvedValue({ data: result, error: null });

    const { result: hookResult } = renderHook(() => useFinancialIntel());

    await act(async () => {
      await hookResult.current.generateIntel({ country: 'Test' });
    });

    const legit = hookResult.current.result?.legit_top7[0];
    expect(legit).toHaveProperty('name');
    expect(legit).toHaveProperty('why_safer');
    expect(Array.isArray(legit?.verification_checklist)).toBe(true);
  });

  it('should validate confidence score bounds', async () => {
    const result: FinancialIntelResult = {
      country_profile: {
        name: 'Test',
        currency: 'EUR',
        main_regulators: [],
        source_confidence: 'low',
      },
      scam_top7: [],
      legit_top7: [],
      sources: [],
      confidence: 45,
      disclaimer: 'Test',
    };

    mockInvoke.mockResolvedValue({ data: result, error: null });

    const { result: hookResult } = renderHook(() => useFinancialIntel());

    await act(async () => {
      await hookResult.current.generateIntel({ country: 'Test' });
    });

    const confidence = hookResult.current.result?.confidence;
    expect(typeof confidence).toBe('number');
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(100);
  });
});
