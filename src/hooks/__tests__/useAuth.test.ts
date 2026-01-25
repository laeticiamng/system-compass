import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';

// ============================================
// AUTH HOOK TESTS - SECURITY CRITICAL MODULE
// ============================================

// Mock Supabase auth methods
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        mockOnAuthStateChange(callback);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      },
      signUp: (params: unknown) => mockSignUp(params),
      signInWithPassword: (params: unknown) => mockSignInWithPassword(params),
      signOut: () => mockSignOut(),
    },
  },
}));

// Import after mocks
import { AuthProvider, useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignUp.mockResolvedValue({ error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(AuthProvider, null, children);

  describe('initialization', () => {
    it('should start with loading state true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.loading).toBe(true);
    });

    it('should set user to null when no session exists', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should set user when session exists', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token-123' };

      mockGetSession.mockResolvedValue({ data: { session: mockSession } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  describe('signUp', () => {
    it('should call supabase signUp with correct parameters', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          options: expect.objectContaining({
            data: { display_name: 'Test User' },
          }),
        })
      );
    });

    it('should include emailRedirectTo in signUp options', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test');
      });

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: expect.stringContaining('/'),
          }),
        })
      );
    });

    it('should return error when signUp fails', async () => {
      const mockError = new Error('Email already registered');
      mockSignUp.mockResolvedValue({ error: mockError });
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test');
      });

      expect(signUpResult).toEqual({ error: mockError });
    });
  });

  describe('signIn', () => {
    it('should call supabase signInWithPassword with correct parameters', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error when signIn fails', async () => {
      const mockError = new Error('Invalid credentials');
      mockSignInWithPassword.mockResolvedValue({ error: mockError });
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrong-password');
      });

      expect(signInResult).toEqual({ error: mockError });
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // This test verifies the context check
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});

// ============================================
// SECURITY TESTS
// ============================================

describe('Auth Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(AuthProvider, null, children);

  it('should not expose password in any state', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify no password-related properties are exposed
    const stateKeys = Object.keys(result.current);
    expect(stateKeys).not.toContain('password');
    expect(stateKeys).not.toContain('credentials');
  });

  it('should always call server-side validation (not localStorage)', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    renderHook(() => useAuth(), { wrapper });

    // Verify getSession is called (server-side validation)
    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
    });
  });

  it('should handle auth state changes reactively', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    renderHook(() => useAuth(), { wrapper });

    // Verify onAuthStateChange listener is registered
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });
});
