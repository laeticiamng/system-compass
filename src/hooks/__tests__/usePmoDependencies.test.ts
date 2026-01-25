import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
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
import { usePmoDependencies } from '../usePmoDependencies';
import { supabase } from '@/integrations/supabase/client';

describe('usePmoDependencies', () => {
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
      const { result } = renderHook(() => usePmoDependencies(null), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dependencies).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('dependency type handling', () => {
    it('should handle all dependency types', async () => {
      const mockDependencies = [
        { id: 'dep-1', dependency_type: 'blocks', source_type: 'initiative', target_type: 'initiative' },
        { id: 'dep-2', dependency_type: 'depends_on', source_type: 'milestone', target_type: 'initiative' },
        { id: 'dep-3', dependency_type: 'related_to', source_type: 'objective', target_type: 'risk' },
        { id: 'dep-4', dependency_type: 'mitigates', source_type: 'risk', target_type: 'initiative' },
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockDependencies, error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.dependencies).toEqual(mockDependencies);
      });

      expect(result.current.dependencies).toHaveLength(4);
    });
  });

  describe('helper functions', () => {
    it('should provide getBlockersFor function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.getBlockersFor).toBe('function');
    });

    it('should provide getBlockedBy function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.getBlockedBy).toBe('function');
    });

    it('should provide getMitigations function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.getMitigations).toBe('function');
    });

    it('should filter mitigations for a specific risk', async () => {
      const mockDependencies = [
        { id: 'dep-1', dependency_type: 'mitigates', source_type: 'risk', source_id: 'risk-1', target_type: 'initiative', target_id: 'init-1' },
        { id: 'dep-2', dependency_type: 'mitigates', source_type: 'risk', source_id: 'risk-2', target_type: 'initiative', target_id: 'init-2' },
        { id: 'dep-3', dependency_type: 'blocks', source_type: 'initiative', source_id: 'init-3', target_type: 'initiative', target_id: 'init-4' },
      ];

      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: mockDependencies, error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.dependencies).toEqual(mockDependencies);
      });

      // Get mitigations for risk-1
      const mitigations = result.current.getMitigations('risk-1');
      expect(mitigations).toHaveLength(1);
      expect(mitigations[0].target_id).toBe('init-1');
    });
  });

  describe('CRUD operations', () => {
    it('should provide createDependency function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.createDependency).toBe('function');
    });

    it('should provide deleteDependency function', async () => {
      mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockResolvedValue({ data: [], error: null }),
        }),
      });

      const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.deleteDependency).toBe('function');
    });
  });
});

describe('usePmoDependencies edge cases', () => {
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

  it('should handle empty dependencies', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.dependencies).toEqual([]);
    });
  });

  it('should handle database errors gracefully', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ 
          data: null, 
          error: new Error('Connection error') 
        }),
      }),
    });

    const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should return empty array when entity has no mitigations', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => usePmoDependencies('case-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mitigations = result.current.getMitigations('non-existent-risk');
    expect(mitigations).toEqual([]);
  });
});
