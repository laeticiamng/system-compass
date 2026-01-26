import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ============================================
// EXIT KEYS HISTORY HOOK TESTS - BUSINESS CRITICAL
// ============================================

const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { useExitKeysHistory, ExitKeyStatus } from '../useExitKeysHistory';

describe('useExitKeysHistory', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  
  const mockHistoryEntries = [
    {
      id: 'entry-1',
      user_id: mockUser.id,
      exit_key_id: 'key-1',
      country_id: 'FR',
      compatibility_score: 85,
      notes: 'Good fit',
      status: 'saved' as ExitKeyStatus,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'entry-2',
      user_id: mockUser.id,
      exit_key_id: 'key-2',
      country_id: 'DE',
      compatibility_score: 72,
      notes: null,
      status: 'in_progress' as ExitKeyStatus,
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-12T00:00:00Z',
    },
    {
      id: 'entry-3',
      user_id: mockUser.id,
      exit_key_id: 'key-3',
      country_id: 'ES',
      compatibility_score: 60,
      notes: null,
      status: 'explored' as ExitKeyStatus,
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockHistoryEntries, error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-entry' }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }));
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useExitKeysHistory());
      expect(result.current.loading).toBe(true);
    });

    it('should fetch history for authenticated user', async () => {
      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.history).toHaveLength(3);
      expect(mockFrom).toHaveBeenCalledWith('exit_keys_history');
    });

    it('should return empty history when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.history).toEqual([]);
      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should indicate logged in status', async () => {
      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  describe('trackExitKey', () => {
    it('should create new entry when not exists', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-entry',
              exit_key_id: 'key-new',
              country_id: 'JP',
              status: 'explored',
            },
            error: null,
          }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }), // Empty history
          }),
        }),
        insert: mockInsert,
      }));

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackExitKey('key-new', 'JP', 80);
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        exit_key_id: 'key-new',
        country_id: 'JP',
        compatibility_score: 80,
        status: 'explored',
      });
    });

    it('should update existing entry timestamp', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockHistoryEntries, error: null }),
          }),
        }),
        update: mockUpdate,
      }));

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Track existing key-1 + FR combination
      await act(async () => {
        await result.current.trackExitKey('key-1', 'FR');
      });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should return null when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let trackResult;
      await act(async () => {
        trackResult = await result.current.trackExitKey('key-new', 'JP');
      });

      expect(trackResult).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update entry status', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockHistoryEntries, error: null }),
          }),
        }),
        update: mockUpdate,
      }));

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateStatus('entry-1', 'dismissed');
      });

      expect(updateResult).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'dismissed' });
    });

    it('should return false when not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateStatus('entry-1', 'saved');
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('addNotes', () => {
    it('should add notes to entry', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockHistoryEntries, error: null }),
          }),
        }),
        update: mockUpdate,
      }));

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let addResult;
      await act(async () => {
        addResult = await result.current.addNotes('entry-1', 'Updated notes');
      });

      expect(addResult).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ notes: 'Updated notes' });
    });
  });

  describe('removeEntry', () => {
    it('should delete entry from history', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockHistoryEntries, error: null }),
          }),
        }),
        delete: mockDelete,
      }));

      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let removeResult;
      await act(async () => {
        removeResult = await result.current.removeEntry('entry-1');
      });

      expect(removeResult).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('filter helpers', () => {
    it('should return only saved keys', async () => {
      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const savedKeys = result.current.getSavedKeys();
      expect(savedKeys).toHaveLength(1);
      expect(savedKeys[0].status).toBe('saved');
    });

    it('should return only in-progress keys', async () => {
      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const inProgressKeys = result.current.getInProgressKeys();
      expect(inProgressKeys).toHaveLength(1);
      expect(inProgressKeys[0].status).toBe('in_progress');
    });

    it('should return recently explored with default limit', async () => {
      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const recent = result.current.getRecentlyExplored();
      expect(recent.length).toBeLessThanOrEqual(5);
    });

    it('should respect custom limit for recently explored', async () => {
      const { result } = renderHook(() => useExitKeysHistory());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const recent = result.current.getRecentlyExplored(2);
      expect(recent).toHaveLength(2);
    });
  });
});

// ============================================
// SECURITY TESTS
// ============================================

describe('Exit Keys History Security', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
  });

  it('should always scope queries to current user_id', async () => {
    const mockEq = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: mockEq,
      }),
    }));

    renderHook(() => useExitKeysHistory());

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });
  });

  it('should include user_id in all mutations', async () => {
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

    const { result } = renderHook(() => useExitKeysHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.trackExitKey('key-1', 'FR');
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: mockUser.id,
      })
    );
  });

  it('should double-check user_id on update operations', async () => {
    const mockEqChain = vi.fn().mockResolvedValue({ error: null });
    const mockEqId = vi.fn().mockReturnValue({ eq: mockEqChain });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqId });

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [{ id: 'entry-1' }], error: null }),
        }),
      }),
      update: mockUpdate,
    }));

    const { result } = renderHook(() => useExitKeysHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateStatus('entry-1', 'saved');
    });

    // Should call .eq('id', ...).eq('user_id', ...)
    expect(mockEqId).toHaveBeenCalledWith('id', 'entry-1');
    expect(mockEqChain).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('should gracefully handle database errors', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    }));

    const { result } = renderHook(() => useExitKeysHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });

    // Should not crash, should return empty array (graceful degradation)
    expect(Array.isArray(result.current.history)).toBe(true);
  });
});
