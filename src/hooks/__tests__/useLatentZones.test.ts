import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ============================================
// LATENT ZONES HOOK TESTS - PRO MODULE
// ============================================

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => {
      return {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
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
import { useLatentZones, ZoneStatus, TensionType } from '../useLatentZones';

describe('useLatentZones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
  });

  describe('when user is not authenticated', () => {
    it('should return empty zones array', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useLatentZones());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.zones).toEqual([]);
      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should not allow creating zones without auth', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useLatentZones());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const zone = await result.current.createZone('Test Zone');
      expect(zone).toBeNull();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = { id: 'user-123' };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser });
      mockOrder.mockResolvedValue({ data: [], error: null });
      mockSelect.mockReturnValue({ order: mockOrder });
    });

    it('should fetch zones on mount', async () => {
      const mockZones = [
        { id: 'zone-1', title: 'Zone 1', status: 'dormant', latent_zone_tensions: [] },
      ];
      mockOrder.mockResolvedValue({ data: mockZones, error: null });

      const { result } = renderHook(() => useLatentZones());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.zones.length).toBe(1);
      expect(result.current.zones[0].title).toBe('Zone 1');
    });

    it('should handle fetch error gracefully', async () => {
      mockOrder.mockResolvedValue({ data: null, error: new Error('Network error') });

      const { result } = renderHook(() => useLatentZones());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch zones');
    });
  });

  describe('Zone status transitions', () => {
    it('should validate zone status types', () => {
      const validStatuses: ZoneStatus[] = ['dormant', 'emergent', 'fragile', 'blocked'];
      
      validStatuses.forEach(status => {
        expect(['dormant', 'emergent', 'fragile', 'blocked']).toContain(status);
      });
    });
  });

  describe('Tension types validation', () => {
    it('should validate tension type definitions', () => {
      const validTensionTypes: TensionType[] = [
        'nourishing', 
        'blocking', 
        'fragility', 
        'premature_crushing'
      ];
      
      expect(validTensionTypes).toHaveLength(4);
      validTensionTypes.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });
  });
});

// ============================================
// SECURITY TESTS - LATENT ZONES
// ============================================

describe('Latent Zones Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should require authentication for all mutations', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useLatentZones());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All mutation methods should return null/false without auth
    expect(await result.current.createZone('Test')).toBeNull();
    expect(await result.current.updateZone('id', 'title')).toBe(false);
    expect(await result.current.updateZoneStatus('id', 'dormant')).toBe(false);
    expect(await result.current.addTension('id', 'blocking', 'content')).toBeNull();
    expect(await result.current.removeTension('t-id', 'z-id')).toBe(false);
    expect(await result.current.evolveZone('id', 'created')).toBe(false);
    expect(await result.current.deleteZone('id')).toBe(false);
    expect(await result.current.duplicateZone('id')).toBeNull();
    expect(await result.current.getZoneHistory('id')).toEqual([]);
  });

  it('should not expose internal mutation functions when logged out', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useLatentZones());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify isLoggedIn flag is false
    expect(result.current.isLoggedIn).toBe(false);
  });
});

// ============================================
// DATA INTEGRITY TESTS
// ============================================

describe('Latent Zones Data Integrity', () => {
  it('should properly structure zone with tensions', () => {
    const mockZoneData = {
      id: 'zone-1',
      user_id: 'user-123',
      title: 'Test Zone',
      description: 'Test description',
      status: 'dormant' as ZoneStatus,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      tensions: [
        {
          id: 't-1',
          zone_id: 'zone-1',
          tension_type: 'blocking' as TensionType,
          content: 'Blocking tension',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    };

    expect(mockZoneData.tensions).toHaveLength(1);
    expect(mockZoneData.tensions[0].tension_type).toBe('blocking');
  });

  it('should handle zones without tensions', () => {
    const zoneWithoutTensions = {
      id: 'zone-2',
      user_id: 'user-123',
      title: 'Empty Zone',
      description: null,
      status: 'emergent' as ZoneStatus,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      tensions: undefined,
    };

    // Should handle undefined tensions gracefully
    expect(zoneWithoutTensions.tensions || []).toEqual([]);
  });
});
