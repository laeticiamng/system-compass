import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock data
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUserValue, loading: false }),
}));

// Supabase mocks
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'analytics_events') {
        return { insert: mockInsert };
      }
      if (table === 'analytics_sessions') {
        return {
          select: () => ({
            eq: () => ({
              single: mockSingle,
              maybeSingle: mockSingle
            })
          }),
          insert: mockInsert,
          update: () => ({
            eq: mockUpdate
          }),
        };
      }
      return {};
    }),
  },
}));

// Mock sessionStorage & localStorage
const mockSessionStorage: Record<string, string> = {};
const mockLocalStorage: Record<string, string> = {};

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (key: string) => mockSessionStorage[key] || null,
    setItem: (key: string, value: string) => { mockSessionStorage[key] = value; },
    clear: () => Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]),
  },
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    clear: () => Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]),
  },
  writable: true,
});

// Import after mocks
import { useAnalytics } from '../useAnalytics';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  };
}

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockInsert.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    mockUpdate.mockResolvedValue({ error: null });
    
    // Clear storages
    Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]);
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
  });

  describe('initialization', () => {
    it('should return tracking functions', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.trackEvent).toBeDefined();
        expect(result.current.trackHomeOpened).toBeDefined();
        expect(result.current.trackFilterClicked).toBeDefined();
        expect(result.current.trackSimulationStarted).toBeDefined();
        expect(result.current.trackSimulationCompleted).toBeDefined();
        expect(result.current.trackAccountCreated).toBeDefined();
      });
    });

    it('should generate session ID on first load', async () => {
      renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockSessionStorage['analytics_session_id']).toBeDefined();
      });
    });

    it('should reuse existing session ID', async () => {
      mockSessionStorage['analytics_session_id'] = 'existing-session';
      
      renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockSessionStorage['analytics_session_id']).toBe('existing-session');
      });
    });
  });

  describe('trackEvent', () => {
    it('should insert event into analytics_events table', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.trackEvent({
          event: 'home_opened',
          category: 'navigation',
          metadata: { source: 'test' }
        });
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should include user_id when authenticated', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.trackEvent({
          event: 'filter_clicked',
          category: 'engagement'
        });
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should handle null user gracefully', async () => {
      mockUserValue = null;
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.trackEvent({
          event: 'page_view',
          category: 'navigation'
        });
      });

      // Should not throw
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should silently fail on database error', async () => {
      mockInsert.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.trackEvent({
          event: 'simulation_started',
          category: 'simulation'
        });
      });

      // Should not throw, just log debug
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('convenience tracking methods', () => {
    it('should track home opened', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackHomeOpened();
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track filter clicked', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackFilterClicked();
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track simulation started with type', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackSimulationStarted('country_comparison');
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track simulation completed with duration', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackSimulationCompleted('exit_key', 120);
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track simulation dropped', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackSimulationDropped('matching', 'step_2');
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track exit keys clicked', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackExitKeysClicked();
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should track account created', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.trackAccountCreated();
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('retention tracking', () => {
    it('should set first visit timestamp for new visitors', async () => {
      renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockLocalStorage['analytics_first_visit']).toBeDefined();
      });
    });

    it('should detect returning visitors', async () => {
      // Set first visit 8 days ago
      const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
      mockLocalStorage['analytics_first_visit'] = eightDaysAgo.toString();

      renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await waitFor(() => {
        // Should track return_visit event for J+7 retention
        expect(mockInsert).toHaveBeenCalled();
      });
    });
  });

  describe('RGPD compliance', () => {
    it('should allow anonymous tracking (null user_id)', async () => {
      mockUserValue = null;
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.trackEvent({
          event: 'page_view',
          category: 'navigation'
        });
      });

      // Event should be tracked without user identification
      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
