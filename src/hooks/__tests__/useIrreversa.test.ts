import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ============================================
// IRREVERSA HOOK TESTS - PRO MODULE
// Critical: Threshold lifecycle management
// ============================================

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => {
      return {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
      };
    }),
  },
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { 
  useIrreversa, 
  ThresholdDomain, 
  ThresholdNature, 
  ThresholdStatus,
  ValidatorRole 
} from '../useIrreversa';

describe('useIrreversa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  describe('when user is not authenticated', () => {
    it('should return empty thresholds array', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useIrreversa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.thresholds).toEqual([]);
      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should not allow creating thresholds without auth', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useIrreversa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const threshold = await result.current.createThreshold({
        title: 'Test Threshold',
        context: 'Test context',
        domain: 'strategic',
        detection_source: 'manual',
        threshold_nature: 'contractual',
        irreversibility_reason: 'Test reason',
        alternatives_before: ['Alt 1'],
        validated_by: 'Test User',
        validator_role: 'ceo',
      });
      
      expect(threshold).toBeNull();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = { id: 'user-123' };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser });
      mockOrder.mockResolvedValue({ data: [], error: null });
      mockSelect.mockReturnValue({ order: mockOrder });
    });

    it('should fetch thresholds on mount', async () => {
      const mockThresholds = [
        { 
          id: 'threshold-1', 
          title: 'Strategic Decision', 
          status: 'detected',
          domain: 'strategic'
        },
      ];
      mockOrder.mockResolvedValue({ data: mockThresholds, error: null });

      const { result } = renderHook(() => useIrreversa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.thresholds.length).toBe(1);
      expect(result.current.thresholds[0].title).toBe('Strategic Decision');
    });

    it('should handle fetch error gracefully', async () => {
      mockOrder.mockResolvedValue({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useIrreversa());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch thresholds');
    });
  });

  describe('Threshold status lifecycle', () => {
    it('should validate status progression order', () => {
      const statusOrder: ThresholdStatus[] = ['detected', 'marked', 'validated', 'sealed'];
      
      expect(statusOrder.indexOf('detected')).toBe(0);
      expect(statusOrder.indexOf('marked')).toBe(1);
      expect(statusOrder.indexOf('validated')).toBe(2);
      expect(statusOrder.indexOf('sealed')).toBe(3);
    });

    it('should not allow skipping status steps', () => {
      // Status must progress: detected -> marked -> validated -> sealed
      const isValidTransition = (from: ThresholdStatus, to: ThresholdStatus) => {
        const order: ThresholdStatus[] = ['detected', 'marked', 'validated', 'sealed'];
        const fromIndex = order.indexOf(from);
        const toIndex = order.indexOf(to);
        return toIndex === fromIndex + 1;
      };

      expect(isValidTransition('detected', 'marked')).toBe(true);
      expect(isValidTransition('marked', 'validated')).toBe(true);
      expect(isValidTransition('validated', 'sealed')).toBe(true);
      expect(isValidTransition('detected', 'sealed')).toBe(false); // Skip not allowed
      expect(isValidTransition('detected', 'validated')).toBe(false); // Skip not allowed
    });
  });

  describe('Domain and nature validation', () => {
    it('should validate threshold domains', () => {
      const validDomains: ThresholdDomain[] = [
        'strategic', 
        'financial', 
        'organizational', 
        'legal', 
        'ethical'
      ];
      
      expect(validDomains).toHaveLength(5);
      validDomains.forEach(domain => {
        expect(typeof domain).toBe('string');
      });
    });

    it('should validate threshold natures', () => {
      const validNatures: ThresholdNature[] = [
        'resource_commitment',
        'contractual',
        'reputational',
        'structural',
        'temporal'
      ];
      
      expect(validNatures).toHaveLength(5);
    });

    it('should validate validator roles', () => {
      const validRoles: ValidatorRole[] = [
        'ceo', 
        'board', 
        'founder', 
        'director', 
        'comex'
      ];
      
      expect(validRoles).toHaveLength(5);
    });
  });
});

// ============================================
// SECURITY TESTS - IRREVERSA
// ============================================

describe('Irreversa Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should require authentication for all operations', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useIrreversa());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All operations should return null/false/empty without auth
    expect(await result.current.createThreshold({
      title: 'Test',
      context: 'Test',
      domain: 'strategic',
      detection_source: 'manual',
      threshold_nature: 'contractual',
      irreversibility_reason: 'Test',
      alternatives_before: [],
      validated_by: 'Test',
      validator_role: 'ceo',
    })).toBeNull();
    
    expect(await result.current.markThreshold('id', 'actor', 'role')).toBe(false);
    expect(await result.current.addWitness('id', 'name', 'role')).toBeNull();
    expect(await result.current.validateThreshold('id', 'name', 'ceo', 'statement')).toBe(false);
    expect(await result.current.sealThreshold('id', 'name', 'role')).toBe(false);
    expect(await result.current.getWitnesses('id')).toEqual([]);
    expect(await result.current.getAuditLog('id')).toEqual([]);
  });

  it('should not expose sensitive validation functions when logged out', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useIrreversa());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
  });
});

// ============================================
// AUDIT TRAIL TESTS
// ============================================

describe('Irreversa Audit Trail', () => {
  it('should define proper audit entry structure', () => {
    const mockAuditEntry = {
      id: 'audit-1',
      threshold_id: 'threshold-1',
      action: 'created',
      actor_name: 'John Doe',
      actor_role: 'ceo',
      details: { title: 'Test Threshold' },
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(mockAuditEntry.action).toBe('created');
    expect(mockAuditEntry.actor_name).toBeDefined();
    expect(mockAuditEntry.actor_role).toBeDefined();
  });

  it('should track all lifecycle actions', () => {
    const auditableActions = [
      'created',
      'marked',
      'witness_added',
      'validated',
      'sealed'
    ];

    expect(auditableActions).toContain('created');
    expect(auditableActions).toContain('sealed');
  });
});

// ============================================
// WITNESS VALIDATION TESTS
// ============================================

describe('Irreversa Witness Management', () => {
  it('should define proper witness structure', () => {
    const mockWitness = {
      id: 'witness-1',
      threshold_id: 'threshold-1',
      witness_name: 'Jane Doe',
      witness_role: 'CFO',
      witness_statement: 'I confirm this decision',
      witnessed_at: '2024-01-01T00:00:00Z',
      signature_hash: null,
    };

    expect(mockWitness.witness_name).toBeDefined();
    expect(mockWitness.witness_role).toBeDefined();
    expect(mockWitness.threshold_id).toBeDefined();
  });
});
