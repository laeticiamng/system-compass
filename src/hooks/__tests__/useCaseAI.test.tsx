import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ============================================
// CASE AI HOOK TESTS - AI GENERATION CRITICAL
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
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock toast
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  },
}));

const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUserValue,
    loading: false,
  })),
}));

import { useCaseAI } from '../useCaseAI';

describe('useCaseAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
  });

  describe('initialization', () => {
    it('should start with default state', () => {
      const { result } = renderHook(() => useCaseAI());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should expose all generation functions', () => {
      const { result } = renderHook(() => useCaseAI());

      expect(typeof result.current.generateMarketStudy).toBe('function');
      expect(typeof result.current.generateActorsMap).toBe('function');
      expect(typeof result.current.generateRiskRegister).toBe('function');
      expect(typeof result.current.generateStructuralRules).toBe('function');
      expect(typeof result.current.generatePOCPlan).toBe('function');
      expect(typeof result.current.generateCompleteCase).toBe('function');
    });
  });

  describe('authentication requirement', () => {
    it('should reject generation without authentication', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateMarketStudy({
          countryName: 'Nigeria',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith('Veuillez vous connecter');
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('generateMarketStudy', () => {
    it('should call ai-assist with correct action and context', async () => {
      const mockResult = {
        success: true,
        action: 'generate-market-study',
        result: {
          problemStatement: 'Test problem',
          valueProposition: 'Test value',
          customerSegments: ['Segment A'],
          payingCustomer: 'Enterprises',
          endUser: 'End users',
          competitors: [],
          differentiation: 'Unique approach',
          timingReason: 'Market ready',
          regulations: [],
          constraints: [],
          goToMarket: 'Direct sales',
          channels: ['Online'],
          keyRisks: ['Competition'],
          feasibility: 'medium',
          conditionsToValidate: ['Market validation'],
        },
      };

      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useCaseAI());

      const context = {
        countryName: 'Nigeria',
        intention: 'entrepreneurship' as const,
        projectType: 'tech',
        sector: 'fintech',
      };

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateMarketStudy(context);
      });

      expect(mockInvoke).toHaveBeenCalledWith('ai-assist', {
        body: expect.objectContaining({
          action: 'generate-market-study',
          context: expect.objectContaining({
            countryName: 'Nigeria',
            intention: 'entrepreneurship',
            module: 'cases',
          }),
          userId: 'user-123',
          sessionId: expect.any(String),
        }),
      });

      expect(returnValue).toEqual(mockResult.result);
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });

  describe('generateActorsMap', () => {
    it('should return actors data with warnings', async () => {
      const mockResult = {
        success: true,
        action: 'generate-actors-map',
        result: {
          actors: [
            {
              id: 'actor-1',
              name: 'Ministry of Finance',
              type: 'government',
              status: 'active',
              role: 'Regulator',
              dependencyLevel: 'high',
              reliability: 'medium',
              notes: 'Key stakeholder',
              proofs: [],
              isRedFlag: false,
            },
          ],
          warnings: ['Regulatory delays expected'],
          mitigations: ['Engage early'],
        },
      };

      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateActorsMap({
          countryName: 'Nigeria',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue.actors).toHaveLength(1);
      expect(returnValue.warnings).toContain('Regulatory delays expected');
    });
  });

  describe('generateRiskRegister', () => {
    it('should return risks with summary', async () => {
      const mockResult = {
        success: true,
        action: 'generate-risk-register',
        result: {
          risks: [
            {
              id: 'risk-1',
              category: 'regulatory',
              description: 'License delays',
              probability: 'high',
              impact: ['timeline', 'budget'],
              alertSignals: ['No response in 30 days'],
              protections: ['Engage consultant'],
              status: 'identified',
              notes: '',
            },
          ],
          summary: {
            highRisks: 1,
            mediumRisks: 0,
            lowRisks: 0,
            mainThreats: ['Regulatory'],
          },
          recommendations: ['Start early'],
        },
      };

      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateRiskRegister({
          countryName: 'Nigeria',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue.risks).toHaveLength(1);
      expect(returnValue.summary.highRisks).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should handle rate limit error (429)', async () => {
      const error = { status: 429, message: 'Rate limited' };
      mockInvoke.mockRejectedValue(error);

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateMarketStudy({
          countryName: 'Test',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBeTruthy();
      expect(mockToastError).toHaveBeenCalledWith('Limite de requêtes atteinte. Réessayez dans quelques instants.');
    });

    it('should handle credits error (402)', async () => {
      const error = { status: 402, message: 'Insufficient credits' };
      mockInvoke.mockRejectedValue(error);

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateMarketStudy({
          countryName: 'Test',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue).toBeNull();
      expect(mockToastError).toHaveBeenCalledWith('Crédits IA insuffisants. Veuillez recharger votre compte.');
    });

    it('should handle function invocation error', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('Function failed'),
      });

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateMarketStudy({
          countryName: 'Test',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should handle unsuccessful response', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'Generation failed' },
        error: null,
      });

      const { result } = renderHook(() => useCaseAI());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.generateMarketStudy({
          countryName: 'Test',
          intention: 'entrepreneurship',
        });
      });

      expect(returnValue).toBeNull();
      expect(result.current.error).toBe('Generation failed');
    });
  });

  describe('loading state', () => {
    it('should set loading during request', async () => {
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockInvoke.mockReturnValue(slowPromise);

      const { result } = renderHook(() => useCaseAI());

      // Start the request
      act(() => {
        result.current.generateMarketStudy({
          countryName: 'Test',
          intention: 'entrepreneurship',
        });
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve
      await act(async () => {
        resolvePromise!({ data: { success: true, result: {} }, error: null });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('policy warnings', () => {
    it('should log policy warnings without blocking', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockResult = {
        success: true,
        action: 'generate-market-study',
        result: { problemStatement: 'Test' },
        policyWarnings: ['Sensitive content detected'],
      };

      mockInvoke.mockResolvedValue({ data: mockResult, error: null });

      const { result } = renderHook(() => useCaseAI());

      await act(async () => {
        await result.current.generateMarketStudy({
          countryName: 'Test',
          intention: 'entrepreneurship',
        });
      });

      expect(consoleSpy).toHaveBeenCalledWith('AI Policy warnings:', ['Sensitive content detected']);

      consoleSpy.mockRestore();
    });
  });
});

// ============================================
// CONTEXT VALIDATION TESTS
// ============================================

describe('CaseAI Context Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
  });

  it('should pass full context to edge function', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, result: {} },
      error: null,
    });

    const { result } = renderHook(() => useCaseAI());

    const fullContext = {
      countryName: 'Nigeria',
      countryContext: {
        pyramidType: 'PROBLEM_RENT',
        region: 'West Africa',
        governanceScores: { stability: 3, ecosystem: 4 },
      },
      intention: 'entrepreneurship' as const,
      projectType: 'tech-startup',
      projectDescription: 'Fintech solution',
      sector: 'Financial Services',
      budget: '$100k-500k',
      timeline: '12 months',
      profile: {
        birthCountry: 'FR',
        nationalities: ['FR'],
        currentCountry: 'NG',
        motorProfile: 'explorer',
        riskTolerance: 'moderate',
      },
    };

    await act(async () => {
      await result.current.generateCompleteCase(fullContext);
    });

    expect(mockInvoke).toHaveBeenCalledWith('ai-assist', {
      body: expect.objectContaining({
        context: expect.objectContaining({
          countryName: 'Nigeria',
          countryContext: expect.objectContaining({
            pyramidType: 'PROBLEM_RENT',
          }),
          profile: expect.objectContaining({
            motorProfile: 'explorer',
          }),
        }),
      }),
    });
  });
});
