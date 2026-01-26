import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ============================================
// PARTNER PROGRAM HOOK TESTS - B2B CRITICAL
// ============================================

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'partner_applications') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockResolvedValue({ data: [], error: null })
            })
          }),
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      if (table === 'partner_contributions') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              order: mockOrder.mockResolvedValue({ data: [], error: null })
            })
          }),
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      if (table === 'partner_benefits') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: mockOrder.mockResolvedValue({ data: [], error: null })
              })
            })
          }),
        };
      }
      if (table === 'user_roles') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockResolvedValue({ data: [], error: null })
          }),
        };
      }
      if (table === 'generation_notifications') {
        return {
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      return {};
    }),
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: mockToast })),
}));

const mockUser = { id: 'user-123', email: 'partner@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUserValue,
    loading: false,
  })),
}));

import { usePartnerProgram, PartnerApplication, PartnerContribution, PartnerBenefit } from '../usePartnerProgram';

describe('usePartnerProgram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  describe('initialization', () => {
    it('should start with empty data when no applications exist', async () => {
      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.applications).toEqual([]);
      expect(result.current.contributions).toEqual([]);
      expect(result.current.benefits).toEqual([]);
    });

    it('should load applications for authenticated user', async () => {
      const mockApplications: PartnerApplication[] = [
        {
          id: 'app-1',
          user_id: 'user-123',
          partner_type: 'ambassador',
          status: 'pending',
          company_name: null,
          professional_profile: 'Developer',
          motivation: 'Love the platform',
          platform_experience: '1 year',
          ethics_charter_accepted: true,
          ethics_charter_accepted_at: '2024-01-01T00:00:00Z',
          reviewed_at: null,
          review_notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: mockApplications, error: null })
               .mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.applications).toHaveLength(1);
      expect(result.current.applications[0].partner_type).toBe('ambassador');
    });

    it('should clear data when user is not authenticated', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.applications).toEqual([]);
    });
  });

  describe('submitApplication', () => {
    it('should submit ambassador application successfully', async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: { success: boolean } | undefined;
      await act(async () => {
        submitResult = await result.current.submitApplication('ambassador', {
          motivation: 'I want to contribute',
          platform_experience: '2 years',
        });
      });

      expect(submitResult?.success).toBe(true);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Candidature envoyée',
        })
      );
    });

    it('should submit B2B partner application with company info', async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: { success: boolean } | undefined;
      await act(async () => {
        submitResult = await result.current.submitApplication('b2b_partner', {
          motivation: 'Enterprise partnership',
          company_name: 'Acme Corp',
          professional_profile: 'Enterprise Solutions Provider',
        });
      });

      expect(submitResult?.success).toBe(true);
    });

    it('should reject application without authentication', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: { success: boolean } | undefined;
      await act(async () => {
        submitResult = await result.current.submitApplication('ambassador', {
          motivation: 'Test',
        });
      });

      expect(submitResult?.success).toBe(false);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Connexion requise',
          variant: 'destructive',
        })
      );
    });

    it('should handle duplicate application with unique constraint', async () => {
      // Simulate unique constraint error structure
      mockInsert.mockImplementation(() => {
        throw { code: '23505' };
      });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: { success: boolean } | undefined;
      await act(async () => {
        submitResult = await result.current.submitApplication('ambassador', {
          motivation: 'Duplicate',
        });
      });

      expect(submitResult?.success).toBe(false);
    });
  });

  describe('submitContribution', () => {
    it('should submit contribution successfully', async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: { success: boolean } | undefined;
      await act(async () => {
        submitResult = await result.current.submitContribution({
          contribution_type: 'referral',
          description: 'Referred 5 new users',
          impact_metric: '5 signups',
        });
      });

      expect(submitResult?.success).toBe(true);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Contribution enregistrée',
        })
      );
    });

    it('should reject contribution without authentication', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: { success: boolean } | undefined;
      await act(async () => {
        submitResult = await result.current.submitContribution({
          contribution_type: 'referral',
          description: 'Test',
        });
      });

      expect(submitResult?.success).toBe(false);
    });
  });

  describe('getActiveApplication', () => {
    it('should return active ambassador application', async () => {
      const mockApplications: PartnerApplication[] = [
        {
          id: 'app-1',
          user_id: 'user-123',
          partner_type: 'ambassador',
          status: 'pending',
          company_name: null,
          professional_profile: null,
          motivation: 'Test',
          platform_experience: null,
          ethics_charter_accepted: true,
          ethics_charter_accepted_at: '2024-01-01T00:00:00Z',
          reviewed_at: null,
          review_notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: mockApplications, error: null })
               .mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const activeApp = result.current.getActiveApplication('ambassador');
      expect(activeApp?.id).toBe('app-1');
    });

    it('should not return rejected applications', async () => {
      const mockApplications: PartnerApplication[] = [
        {
          id: 'app-1',
          user_id: 'user-123',
          partner_type: 'ambassador',
          status: 'rejected',
          company_name: null,
          professional_profile: null,
          motivation: 'Test',
          platform_experience: null,
          ethics_charter_accepted: true,
          ethics_charter_accepted_at: '2024-01-01T00:00:00Z',
          reviewed_at: '2024-01-02T00:00:00Z',
          review_notes: 'Not qualified',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: mockApplications, error: null })
               .mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const activeApp = result.current.getActiveApplication('ambassador');
      expect(activeApp).toBeUndefined();
    });
  });

  describe('isApprovedPartner', () => {
    it('should return true for approved partner', async () => {
      const mockApplications: PartnerApplication[] = [
        {
          id: 'app-1',
          user_id: 'user-123',
          partner_type: 'b2b_partner',
          status: 'approved',
          company_name: 'Acme Corp',
          professional_profile: 'Enterprise',
          motivation: 'Partnership',
          platform_experience: null,
          ethics_charter_accepted: true,
          ethics_charter_accepted_at: '2024-01-01T00:00:00Z',
          reviewed_at: '2024-01-05T00:00:00Z',
          review_notes: 'Approved',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-05T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: mockApplications, error: null })
               .mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isApprovedPartner('b2b_partner')).toBe(true);
      expect(result.current.isApprovedPartner('ambassador')).toBe(false);
    });
  });

  describe('getTotalCredits', () => {
    it('should sum verified contribution credits', async () => {
      const mockContributions: PartnerContribution[] = [
        {
          id: 'contrib-1',
          user_id: 'user-123',
          contribution_type: 'referral',
          description: 'Referral 1',
          impact_metric: null,
          verified: true,
          verified_at: '2024-01-10T00:00:00Z',
          credits_awarded: 100,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'contrib-2',
          user_id: 'user-123',
          contribution_type: 'content',
          description: 'Blog post',
          impact_metric: null,
          verified: true,
          verified_at: '2024-01-15T00:00:00Z',
          credits_awarded: 50,
          created_at: '2024-01-05T00:00:00Z',
        },
        {
          id: 'contrib-3',
          user_id: 'user-123',
          contribution_type: 'referral',
          description: 'Pending referral',
          impact_metric: null,
          verified: false,
          verified_at: null,
          credits_awarded: 0,
          created_at: '2024-01-20T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: mockContributions, error: null })
               .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getTotalCredits()).toBe(150);
    });

    it('should return 0 with no verified contributions', async () => {
      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getTotalCredits()).toBe(0);
    });
  });

  describe('benefits', () => {
    it('should load active benefits', async () => {
      const mockBenefits: PartnerBenefit[] = [
        {
          id: 'benefit-1',
          user_id: 'user-123',
          benefit_type: 'discount',
          description: '20% discount on premium',
          awarded_at: '2024-01-01T00:00:00Z',
          expires_at: '2024-12-31T00:00:00Z',
          active: true,
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: [], error: null })
               .mockResolvedValueOnce({ data: mockBenefits, error: null });

      const { result } = renderHook(() => usePartnerProgram());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.benefits).toHaveLength(1);
      expect(result.current.benefits[0].benefit_type).toBe('discount');
    });
  });
});

// ============================================
// SECURITY TESTS
// ============================================

describe('PartnerProgram Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  it('should scope all queries to authenticated user_id', async () => {
    renderHook(() => usePartnerProgram());

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  it('should not expose admin review functions to non-admins', async () => {
    const { result } = renderHook(() => usePartnerProgram());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Hook should not expose admin-only functions
    expect(result.current).not.toHaveProperty('approveApplication');
    expect(result.current).not.toHaveProperty('rejectApplication');
    expect(result.current).not.toHaveProperty('verifyContribution');
  });

  it('should always set ethics_charter_accepted on submission', async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHook(() => usePartnerProgram());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitApplication('ambassador', {
        motivation: 'Test',
      });
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        ethics_charter_accepted: true,
        ethics_charter_accepted_at: expect.any(String),
      })
    );
  });
});

// ============================================
// EDGE CASES
// ============================================

describe('PartnerProgram Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockOrder.mockResolvedValue({ data: [], error: null });
  });

  it('should handle network errors gracefully', async () => {
    mockOrder.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePartnerProgram());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not crash, just have empty data
    expect(result.current.applications).toEqual([]);
  });

  it('should handle submission errors', async () => {
    mockInsert.mockImplementation(() => {
      throw new Error('Database error');
    });

    const { result } = renderHook(() => usePartnerProgram());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let submitResult: { success: boolean } | undefined;
    await act(async () => {
      submitResult = await result.current.submitApplication('ambassador', {
        motivation: 'Test',
      });
    });

    expect(submitResult?.success).toBe(false);
  });

  it('should handle null platform_experience and company_name', async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHook(() => usePartnerProgram());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitApplication('ambassador', {
        motivation: 'Just motivation, nothing else',
      });
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        platform_experience: null,
        company_name: null,
        professional_profile: null,
      })
    );
  });
});
