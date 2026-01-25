import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
    session: { access_token: 'test-token' },
    loading: false,
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { usePmoMilestones } from '../usePmoMilestones';
import { supabase } from '@/integrations/supabase/client';

describe('usePmoMilestones', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should not fetch when caseId is null', async () => {
      const { result } = renderHook(() => usePmoMilestones(null), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.milestones).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('stats calculations', () => {
    it('should calculate correct stats from milestones', async () => {
      const mockMilestones = [
        { id: 'ms-1', status: 'pending', target_date: '2030-01-01' },
        { id: 'ms-2', status: 'in_progress', target_date: '2030-02-01' },
        { id: 'ms-3', status: 'completed', target_date: '2024-01-01' },
        { id: 'ms-4', status: 'missed', target_date: '2024-01-01' },
        { id: 'ms-5', status: 'pending', target_date: '2020-01-01' }, // Overdue
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockMilestones, error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.milestones).toEqual(mockMilestones);
      });

      // Verify stats structure
      expect(result.current.stats).toBeDefined();
      expect(result.current.stats.total).toBe(5);
      expect(result.current.stats.pending).toBe(2);
      expect(result.current.stats.inProgress).toBe(1);
      expect(result.current.stats.completed).toBe(1);
      expect(result.current.stats.missed).toBe(1);
    });

    it('should identify overdue milestones', async () => {
      const mockMilestones = [
        { id: 'ms-1', status: 'pending', target_date: '2020-01-01' }, // Past = overdue
        { id: 'ms-2', status: 'pending', target_date: '2030-01-01' }, // Future = not overdue
        { id: 'ms-3', status: 'completed', target_date: '2020-01-01' }, // Completed = not overdue
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockMilestones, error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.milestones).toHaveLength(3);
      });

      // Only the first milestone should be overdue
      expect(result.current.stats.overdue).toBe(1);
    });
  });

  describe('CRUD operations', () => {
    it('should provide createMilestone function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.createMilestone).toBe('function');
    });

    it('should provide updateMilestone function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.updateMilestone).toBe('function');
    });

    it('should provide deleteMilestone function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.deleteMilestone).toBe('function');
    });
  });
});

describe('usePmoMilestones edge cases', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should handle milestones with null target_date', async () => {
    const mockMilestones = [
      { id: 'ms-1', status: 'pending', target_date: null },
    ];

    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: mockMilestones, error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.milestones).toHaveLength(1);
    });

    // Should not count as overdue
    expect(result.current.stats.overdue).toBe(0);
  });

  it('should handle empty milestones', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.milestones).toEqual([]);
      expect(result.current.stats.total).toBe(0);
    });
  });

  it('should handle database errors', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ 
          data: null, 
          error: new Error('Query failed') 
        }),
      }),
    });

    const { result } = renderHook(() => usePmoMilestones('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
