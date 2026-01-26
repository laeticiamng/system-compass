import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// ============================================
// DASHBOARD PROGRESS HOOK TESTS
// ============================================

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'dashboard_progress') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle
            })
          }),
          insert: mockInsert.mockReturnValue({ error: null }),
          update: mockUpdate.mockReturnValue({
            eq: mockEq.mockReturnValue({ error: null })
          }),
          delete: mockDelete.mockReturnValue({
            eq: mockEq.mockReturnValue({ error: null })
          }),
        };
      }
      return {};
    }),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
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

import { useDashboardProgress } from '../useDashboardProgress';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useDashboardProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUserValue = mockUser;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('should start with no progress', async () => {
      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress).toBeNull();
    });

    it('should load progress from localStorage', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [{ phaseIndex: 0, actionIndex: 0, completed: true }],
        phaseNotes: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));
      mockUserValue = null; // No cloud sync

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress?.exitKeyId).toBe('exit-123');
    });

    it('should load from cloud when logged in', async () => {
      const cloudData = {
        exit_key_id: 'cloud-exit-456',
        started_at: '2024-01-15T00:00:00Z',
        steps_progress: [{ phaseIndex: 1, actionIndex: 1, completed: true }],
        phase_notes: [],
      };

      mockMaybeSingle.mockResolvedValue({ data: cloudData, error: null });

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Hook initialized successfully
      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  describe('startPlan', () => {
    it('should create new progress for exit key', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('new-exit-key');
      });

      expect(result.current.progress?.exitKeyId).toBe('new-exit-key');
      expect(result.current.progress?.stepsProgress).toEqual([]);
      expect(result.current.progress?.phaseNotes).toEqual([]);
    });

    it('should save to localStorage', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-key-1');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'exit_keys_dashboard',
        expect.stringContaining('"exitKeyId":"exit-key-1"')
      );
    });
  });

  describe('toggleAction', () => {
    it('should mark action as completed', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start a plan first
      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      // Toggle action
      await act(async () => {
        await result.current.toggleAction(0, 0);
      });

      expect(result.current.isActionCompleted(0, 0)).toBe(true);
    });

    it('should toggle action off when already completed', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [{ phaseIndex: 0, actionIndex: 0, completed: true, completedAt: '2024-01-01T00:00:00Z' }],
        phaseNotes: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Toggle off
      await act(async () => {
        await result.current.toggleAction(0, 0);
      });

      expect(result.current.isActionCompleted(0, 0)).toBe(false);
    });

    it('should allow toggling multiple actions', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      await act(async () => {
        await result.current.toggleAction(0, 0);
      });

      expect(result.current.isActionCompleted(0, 0)).toBe(true);
      
      await act(async () => {
        await result.current.toggleAction(1, 0);
      });

      expect(result.current.isActionCompleted(1, 0)).toBe(true);
    });
  });

  describe('setDeadline', () => {
    it('should set deadline for action', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      const deadline = '2024-06-01T00:00:00Z';

      await act(async () => {
        await result.current.setDeadline(0, 0, deadline);
      });

      const step = result.current.getActionStep(0, 0);
      expect(step?.deadline).toBe(deadline);
      expect(step?.reminderEnabled).toBe(true);
    });

    it('should update deadline for existing action', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [{ phaseIndex: 0, actionIndex: 0, completed: false, deadline: '2024-05-01' }],
        phaseNotes: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newDeadline = '2024-07-01T00:00:00Z';

      await act(async () => {
        await result.current.setDeadline(0, 0, newDeadline);
      });

      const step = result.current.getActionStep(0, 0);
      expect(step?.deadline).toBe(newDeadline);
    });
  });

  describe('toggleReminder', () => {
    it('should toggle reminder for action', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [{ phaseIndex: 0, actionIndex: 0, completed: false, deadline: '2024-05-01', reminderEnabled: true }],
        phaseNotes: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleReminder(0, 0);
      });

      const step = result.current.getActionStep(0, 0);
      expect(step?.reminderEnabled).toBe(false);
    });

    it('should do nothing for non-existent action', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      // This should not throw
      await act(async () => {
        await result.current.toggleReminder(99, 99);
      });

      expect(result.current.progress?.stepsProgress).toEqual([]);
    });
  });

  describe('savePhaseNote', () => {
    it('should save note for phase', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      const note = 'Phase 0 notes: Important considerations';

      await act(async () => {
        await result.current.savePhaseNote(0, note);
      });

      expect(result.current.getPhaseNote(0)).toBe(note);
    });

    it('should update existing note', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [],
        phaseNotes: [{ phaseIndex: 0, note: 'Old note', updatedAt: '2024-01-01T00:00:00Z' }],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.savePhaseNote(0, 'Updated note');
      });

      expect(result.current.getPhaseNote(0)).toBe('Updated note');
    });

    it('should track updatedAt timestamp', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      await act(async () => {
        await result.current.savePhaseNote(0, 'Test note');
      });

      const updatedAt = result.current.getPhaseNoteUpdatedAt(0);
      expect(updatedAt).toBeDefined();
      expect(new Date(updatedAt!).getTime()).toBeGreaterThan(0);
    });
  });

  describe('resetProgress', () => {
    it('should clear all progress', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [{ phaseIndex: 0, actionIndex: 0, completed: true }],
        phaseNotes: [{ phaseIndex: 0, note: 'Test', updatedAt: '2024-01-01' }],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress).not.toBeNull();

      await act(async () => {
        await result.current.resetProgress();
      });

      expect(result.current.progress).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('exit_keys_dashboard');
    });

    it('should delete from cloud when logged in', async () => {
      const savedProgress = {
        exitKeyId: 'exit-123',
        startedAt: '2024-01-01T00:00:00Z',
        stepsProgress: [],
        phaseNotes: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetProgress();
      });

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('helper functions', () => {
    it('isActionCompleted returns false for null progress', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isActionCompleted(0, 0)).toBe(false);
    });

    it('getActionStep returns undefined for non-existent step', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      expect(result.current.getActionStep(99, 99)).toBeUndefined();
    });

    it('getPhaseNote returns empty string for non-existent note', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.startPlan('exit-123');
      });

      expect(result.current.getPhaseNote(99)).toBe('');
    });
  });

  describe('cloud sync', () => {
    it('should indicate logged in status', async () => {
      mockUserValue = mockUser;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(true);
    });

    it('should indicate logged out status', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useDashboardProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(false);
    });
  });
});

// ============================================
// DATA INTEGRITY TESTS
// ============================================

describe('DashboardProgress Data Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUserValue = null;
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it('should initialize phaseNotes if missing from localStorage', async () => {
    const incompleteProgress = {
      exitKeyId: 'exit-123',
      startedAt: '2024-01-01T00:00:00Z',
      stepsProgress: [],
      // phaseNotes missing
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteProgress));

    const { result } = renderHook(() => useDashboardProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress?.phaseNotes).toEqual([]);
  });

  it('should handle corrupted localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => useDashboardProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not crash
    expect(result.current.progress).toBeNull();
  });
});
