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
import { usePmoObjectives } from '../usePmoObjectives';
import { supabase } from '@/integrations/supabase/client';

describe('usePmoObjectives', () => {
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
      const { result } = renderHook(() => usePmoObjectives(null), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.objectives).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array initially', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.objectives).toEqual([]);
    });
  });

  describe('fetching objectives', () => {
    it('should fetch objectives for a valid caseId', async () => {
      const mockObjectives = [
        { id: 'obj-1', title: 'Objective 1', status: 'active' },
        { id: 'obj-2', title: 'Objective 2', status: 'draft' },
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockObjectives, error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.objectives).toEqual(mockObjectives);
      });

      expect(supabase.from).toHaveBeenCalledWith('pmo_objectives');
    });

    it('should handle fetch error gracefully', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ 
            data: null, 
            error: new Error('Database error') 
          }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('createObjective mutation', () => {
    it('should provide createObjective function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.createObjective).toBe('function');
    });
  });

  describe('updateObjective mutation', () => {
    it('should provide updateObjective function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.updateObjective).toBe('function');
    });
  });

  describe('deleteObjective mutation', () => {
    it('should provide deleteObjective function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.deleteObjective).toBe('function');
    });
  });

  describe('isCreating state', () => {
    it('should track isCreating state', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoObjectives('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreating).toBe(false);
    });
  });
});

describe('usePmoObjectives edge cases', () => {
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

  it('should handle empty string caseId', async () => {
    const { result } = renderHook(() => usePmoObjectives(''), { wrapper });

    await waitFor(() => {
      expect(result.current.objectives).toEqual([]);
    });
  });

  it('should handle special characters in caseId', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(
      () => usePmoObjectives('case-with-special-chars-!@#$'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
