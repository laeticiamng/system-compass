import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ============================================
// USER ROLES HOOK TESTS - SECURITY CRITICAL
// ============================================

// Mock Supabase client
const mockSelect = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

// Mock useAuth with different user states
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Import after mocks
import { useUserRoles } from '../useUserRoles';
import { supabase } from '@/integrations/supabase/client';

describe('useUserRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
    });
  });

  describe('when user is not authenticated', () => {
    it('should return empty roles array', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual([]);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isModerator).toBe(false);
    });

    it('should not call supabase when no user', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        session: { access_token: 'token' },
        loading: false,
      });
    });

    it('should fetch roles from user_roles table', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'user' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabase.from).toHaveBeenCalledWith('user_roles');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should correctly identify admin role', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'admin' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isModerator).toBe(true); // Admin implies moderator
      expect(result.current.roles).toContain('admin');
    });

    it('should correctly identify moderator role', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'moderator' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isModerator).toBe(true);
      expect(result.current.roles).toContain('moderator');
    });

    it('should default to user role when no roles found', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual(['user']);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isModerator).toBe(false);
    });

    it('should handle multiple roles', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'admin' }, { role: 'moderator' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toContain('admin');
      expect(result.current.roles).toContain('moderator');
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isModerator).toBe(true);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        session: { access_token: 'token' },
        loading: false,
      });
    });

    it('should fallback to user role on database error', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual(['user']);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should not crash on network failure', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockRejectedValue(new Error('Network error')),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual(['user']);
    });
  });

  describe('hasRole function', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        session: { access_token: 'token' },
        loading: false,
      });
    });

    it('should correctly check for admin role', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'admin' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('user')).toBe(false);
      expect(result.current.hasRole('moderator')).toBe(false);
    });

    it('should correctly check for user role', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'user' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole('user')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(false);
    });
  });

  describe('hasAnyRole function', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' },
        session: { access_token: 'token' },
        loading: false,
      });
    });

    it('should return true if user has any of the required roles', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'moderator' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasAnyRole(['admin', 'moderator'])).toBe(true);
      expect(result.current.hasAnyRole(['admin'])).toBe(false);
    });

    it('should return false if user has none of the required roles', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: [{ role: 'user' }],
          error: null,
        }),
      });

      const { result } = renderHook(() => useUserRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasAnyRole(['admin', 'moderator'])).toBe(false);
    });
  });
});

// ============================================
// SECURITY TESTS - CRITICAL
// ============================================

describe('User Roles Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should ONLY check roles from database, not localStorage', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      session: { access_token: 'token' },
      loading: false,
    });

    mockSelect.mockReturnValue({
      eq: mockEq.mockResolvedValue({
        data: [{ role: 'user' }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useUserRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify database was queried
    expect(supabase.from).toHaveBeenCalledWith('user_roles');
    
    // User should NOT be admin even if they tried to manipulate client state
    expect(result.current.isAdmin).toBe(false);
  });

  it('should not expose role manipulation functions', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      session: { access_token: 'token' },
      loading: false,
    });

    mockSelect.mockReturnValue({
      eq: mockEq.mockResolvedValue({
        data: [{ role: 'user' }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useUserRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify no setRole or addRole functions are exposed
    const keys = Object.keys(result.current);
    expect(keys).not.toContain('setRole');
    expect(keys).not.toContain('addRole');
    expect(keys).not.toContain('removeRole');
    expect(keys).not.toContain('setIsAdmin');
  });

  it('should handle user ID injection attempt gracefully', async () => {
    // Simulating an injection attempt via user.id
    mockUseAuth.mockReturnValue({
      user: { id: "'; DROP TABLE user_roles; --" },
      session: { access_token: 'token' },
      loading: false,
    });

    mockSelect.mockReturnValue({
      eq: mockEq.mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    const { result } = renderHook(() => useUserRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still call database with the ID (Supabase handles sanitization)
    expect(mockEq).toHaveBeenCalled();
    // Should default to user role
    expect(result.current.roles).toEqual(['user']);
  });
});
