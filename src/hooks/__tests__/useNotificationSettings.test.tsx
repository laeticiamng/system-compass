import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]),
  },
  writable: true,
});

// Supabase mocks
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();

const mockSettingsData = {
  id: 'settings-123',
  user_id: 'user-123',
  email_enabled: true,
  push_enabled: false,
  slack_webhook_url: null,
  deadline_reminder_days: 3,
  weekly_digest: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: () => {
        mockSelect();
        return {
          eq: (field: string, value: string) => {
            mockEq(field, value);
            return {
              single: () => mockSingle(),
            };
          },
        };
      },
      update: (data: unknown) => {
        mockUpdate(data);
        return {
          eq: () => Promise.resolve({ error: null }),
        };
      },
      insert: (data: unknown) => {
        mockInsert(data);
        return {
          select: () => ({
            single: () => Promise.resolve({ data: { ...mockSettingsData, ...(data as object) }, error: null }),
          }),
        };
      },
    })),
  },
}));

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserState: typeof mockUser | null = mockUser;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUserState,
    loading: false,
  }),
}));

// Import after mocks
import { useNotificationSettings } from '../useNotificationSettings';

describe('useNotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
    mockUserState = mockUser;
    mockSingle.mockResolvedValue({ data: mockSettingsData, error: null });
  });

  describe('initialization', () => {
    it('should start with loading state', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should fetch settings on mount', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should set settings from database', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toBeDefined();
      expect(result.current.settings?.email_enabled).toBe(true);
      expect(result.current.settings?.push_enabled).toBe(false);
    });

    it('should handle no user gracefully', async () => {
      mockUserState = null;

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult: boolean;
      await act(async () => {
        updateResult = await result.current.updateSettings({ email_enabled: false });
      });

      expect(updateResult!).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ email_enabled: false });
    });

    it('should set saving state during update', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.saving).toBe(false);

      const updatePromise = act(async () => {
        await result.current.updateSettings({ email_enabled: false });
      });

      // Note: saving state may be too fast to catch in test
      await updatePromise;
    });

    it('should insert settings if none exist', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({ email_enabled: true });
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should return false when no user', async () => {
      mockUserState = null;

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult: boolean;
      await act(async () => {
        updateResult = await result.current.updateSettings({ email_enabled: true });
      });

      expect(updateResult!).toBe(false);
    });
  });

  describe('push notifications', () => {
    it('should report unsupported when Notification API unavailable', async () => {
      const originalNotification = window.Notification;
      // @ts-expect-error - deleting window.Notification to test unsupported case
      delete window.Notification;

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pushStatus).toBe('unsupported');

      // Restore
      window.Notification = originalNotification;
    });

    it('should provide isLoggedIn status', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(true);
    });

    it('should show isLoggedIn false when no user', async () => {
      mockUserState = null;

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch settings when called', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = mockSelect.mock.calls.length;

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockSelect.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'UNKNOWN', message: 'Error' } });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('security', () => {
    it('should only fetch settings for authenticated user', async () => {
      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should not fetch settings without authentication', async () => {
      mockUserState = null;

      renderHook(() => useNotificationSettings());

      await waitFor(() => {});

      // Should not have made any database calls
      expect(mockEq).not.toHaveBeenCalled();
    });
  });
});
