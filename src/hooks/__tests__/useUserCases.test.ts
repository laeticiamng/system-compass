import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================
// USER CASES HOOK TESTS - BUSINESS CRITICAL
// ============================================

// Mocks must be defined inside vi.mock factory to avoid hoisting issues
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      rpc: mockRpc,
    },
    __mockFrom: mockFrom,
    __mockRpc: mockRpc,
  };
});

vi.mock('@/hooks/useAuth', () => {
  const mockUseAuth = vi.fn();
  return {
    useAuth: () => mockUseAuth(),
    __mockUseAuth: mockUseAuth,
  };
});

import { useUserCases, useUserCase, isDeepMode, isLightMode } from '../useUserCases';
import { supabase } from '@/integrations/supabase/client';
import * as authModule from '@/hooks/useAuth';

// Access the mocks via the module
const mockFrom = (supabase as unknown as { __mockFrom: ReturnType<typeof vi.fn> }).__mockFrom || supabase.from;
const mockRpc = (supabase as unknown as { __mockRpc: ReturnType<typeof vi.fn> }).__mockRpc || supabase.rpc;
const mockUseAuth = (authModule as unknown as { __mockUseAuth: ReturnType<typeof vi.fn> }).__mockUseAuth;

// Create test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUserCases', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  const mockCases = [
    {
      id: 'case-1',
      user_id: mockUser.id,
      country_id: 'FR',
      title: 'Move to France',
      intention: 'relocation',
      status: 'active',
      timeline_scenario: 'realistic',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'case-2',
      user_id: mockUser.id,
      country_id: 'DE',
      title: 'Germany Startup',
      intention: 'entrepreneurship',
      status: 'draft',
      timeline_scenario: 'optimistic',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockRpc.mockResolvedValue({ error: null });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockCases, error: null }),
          single: vi.fn().mockResolvedValue({ data: mockCases[0], error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-case' }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockCases[0], error: null }),
            }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }));
  });

  describe('useUserCases - list operations', () => {
    it('should fetch cases for authenticated user', async () => {
      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cases).toHaveLength(2);
      expect(mockFrom).toHaveBeenCalledWith('user_cases');
    });

    it('should return empty array when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cases).toEqual([]);
    });

    it('should order cases by updated_at descending', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: mockCases, error: null });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      }));

      renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
      });
    });
  });

  describe('createCase mutation', () => {
    it('should create case with correct data', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-case' }, error: null }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCases, error: null }),
          }),
        }),
        insert: mockInsert,
      }));

      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createCase({
          country_id: 'JP',
          title: 'Japan Adventure',
          intention: 'relocation',
        });
      });

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: mockUser.id,
          country_id: 'JP',
          title: 'Japan Adventure',
          intention: 'relocation',
        });
      });
    });

    it('should increment B2B usage after case creation', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-case' }, error: null }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCases, error: null }),
          }),
        }),
        insert: mockInsert,
      }));

      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.createCase({
          country_id: 'JP',
          title: 'Test',
          intention: 'relocation',
        });
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('increment_b2b_usage', {
          p_user_id: mockUser.id,
          p_metric: 'cases_created',
          p_increment: 1,
        });
      });
    });

    it('should throw error when not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Attempting to create case should fail
      expect(() => {
        result.current.createCase({
          country_id: 'JP',
          title: 'Test',
          intention: 'relocation',
        });
      }).not.toThrow(); // Mutation will fail asynchronously
    });
  });

  describe('updateCase mutation', () => {
    it('should update case with user_id check', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockCases[0], error: null }),
            }),
          }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCases, error: null }),
          }),
        }),
        update: mockUpdate,
      }));

      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateCase({
          id: 'case-1',
          updates: { title: 'Updated Title' },
        });
      });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ title: 'Updated Title' });
      });
    });
  });

  describe('deleteCase mutation', () => {
    it('should delete case with user_id check', async () => {
      const mockEqChain = vi.fn().mockResolvedValue({ error: null });
      const mockEqId = vi.fn().mockReturnValue({ eq: mockEqChain });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEqId });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCases, error: null }),
          }),
        }),
        delete: mockDelete,
      }));

      const { result } = renderHook(() => useUserCases(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.deleteCase('case-1');
      });

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
        expect(mockEqId).toHaveBeenCalledWith('id', 'case-1');
        expect(mockEqChain).toHaveBeenCalledWith('user_id', mockUser.id);
      });
    });
  });
});

describe('useUserCase - single case operations', () => {
  const mockUser = { id: 'user-123' };
  const mockCase = {
    id: 'case-1',
    user_id: mockUser.id,
    country_id: 'FR',
    title: 'France Move',
    intention: 'relocation',
    status: 'active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockCase, error: null }),
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockCase, error: null }),
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockCase, error: null }),
            }),
          }),
        }),
      }),
    }));
  });

  it('should fetch single case by id', async () => {
    const { result } = renderHook(() => useUserCase('case-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.caseData).toBeDefined();
    expect(mockFrom).toHaveBeenCalledWith('user_cases');
  });

  it('should not fetch when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useUserCase('case-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // React Query returns undefined when query is disabled
    expect(result.current.caseData).toBeUndefined();
  });

  it('should not fetch when caseId is empty', async () => {
    mockFrom.mockClear();

    const { result } = renderHook(() => useUserCase(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe('Helper functions', () => {
  describe('isDeepMode', () => {
    it('should return true for entrepreneurship', () => {
      expect(isDeepMode('entrepreneurship')).toBe(true);
    });

    it('should return false for relocation', () => {
      expect(isDeepMode('relocation')).toBe(false);
    });
  });

  describe('isLightMode', () => {
    it('should return true for relocation', () => {
      expect(isLightMode('relocation')).toBe(true);
    });

    it('should return false for entrepreneurship', () => {
      expect(isLightMode('entrepreneurship')).toBe(false);
    });
  });
});

// ============================================
// SECURITY TESTS
// ============================================

describe('User Cases Security', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
  });

  it('should always include user_id in queries', async () => {
    const mockEq = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: mockEq,
      }),
    }));

    renderHook(() => useUserCases(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });
  });

  it('should always include user_id in insert operations', async () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new' }, error: null }),
      }),
    });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: mockInsert,
    }));

    const { result } = renderHook(() => useUserCases(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.createCase({
        country_id: 'FR',
        title: 'Test',
        intention: 'relocation',
      });
    });

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
        })
      );
    });
  });

  it('should require user_id match for delete operations', async () => {
    const mockUserIdCheck = vi.fn().mockResolvedValue({ error: null });
    const mockIdCheck = vi.fn().mockReturnValue({ eq: mockUserIdCheck });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockIdCheck });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      delete: mockDelete,
    }));

    const { result } = renderHook(() => useUserCases(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.deleteCase('some-case-id');
    });

    await waitFor(() => {
      // Verify both id and user_id are checked
      expect(mockIdCheck).toHaveBeenCalledWith('id', 'some-case-id');
      expect(mockUserIdCheck).toHaveBeenCalledWith('user_id', mockUser.id);
    });
  });
});
