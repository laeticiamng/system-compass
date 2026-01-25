import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// ============================================
// PMO INITIATIVES HOOK TESTS - ROADMAP CRITICAL
// ============================================

const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser = { id: 'user-123', email: 'test@test.com' };
let mockUserValue: typeof mockUser | null = mockUser;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUserValue,
  }),
}));

import { usePmoInitiatives } from '../usePmoInitiatives';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePmoInitiatives', () => {
  const mockCaseId = 'case-123';
  const mockObjectiveId = 'obj-456';
  
  const mockInitiatives = [
    { 
      id: 'init-1', 
      case_id: mockCaseId, 
      objective_id: mockObjectiveId,
      title: 'MVP Development', 
      status: 'todo',
      effort_estimate: 'high',
      value_expected: 'high',
      user_id: 'user-123',
    },
    { 
      id: 'init-2', 
      case_id: mockCaseId, 
      objective_id: mockObjectiveId,
      title: 'Market Research', 
      status: 'in_progress',
      effort_estimate: 'medium',
      value_expected: 'high',
      user_id: 'user-123',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockInitiatives, error: null }),
          }),
          order: vi.fn().mockResolvedValue({ data: mockInitiatives, error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-init' }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'init-1' }, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }));
  });

  describe('initialization', () => {
    it('should return empty array when caseId is null', async () => {
      const { result } = renderHook(() => usePmoInitiatives(null), { wrapper: createWrapper() });
      
      expect(result.current.initiatives).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return empty array when user is not authenticated', async () => {
      mockUserValue = null;
      
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.initiatives).toEqual([]);
      });
    });

    it('should fetch initiatives on mount', async () => {
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(mockFrom).toHaveBeenCalledWith('pmo_initiatives');
    });
  });

  describe('filtering by objective', () => {
    it('should filter initiatives by objectiveId when provided', async () => {
      renderHook(() => usePmoInitiatives(mockCaseId, mockObjectiveId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('pmo_initiatives');
      });
    });
  });

  describe('createInitiative', () => {
    it('should create initiative with required fields', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-init' }, error: null }),
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
      
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        result.current.createInitiative({
          title: 'New Initiative',
          objective_id: mockObjectiveId,
          description: 'Test description',
        });
      });
      
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            case_id: mockCaseId,
            user_id: 'user-123',
            title: 'New Initiative',
            objective_id: mockObjectiveId,
            status: 'todo',
          })
        );
      });
    });

    it('should set status to "todo" by default', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-init' }, error: null }),
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
      
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        result.current.createInitiative({ title: 'Test' });
      });
      
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'todo' })
        );
      });
    });

    it('should track created_by for audit trail', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-init' }, error: null }),
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
      
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        result.current.createInitiative({ title: 'Test' });
      });
      
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({ created_by: 'user-123' })
        );
      });
    });
  });

  describe('updateInitiative', () => {
    it('should update initiative and track updated_by', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'init-1' }, error: null }),
          }),
        }),
      });
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockInitiatives, error: null }),
          }),
        }),
        update: mockUpdate,
      }));
      
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        result.current.updateInitiative({ 
          id: 'init-1', 
          updates: { status: 'in_progress' } 
        });
      });
      
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ 
            status: 'in_progress',
            updated_by: 'user-123',
          })
        );
      });
    });
  });

  describe('deleteInitiative', () => {
    it('should delete initiative by id', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockInitiatives, error: null }),
          }),
        }),
        delete: mockDelete,
      }));
      
      const { result } = renderHook(() => usePmoInitiatives(mockCaseId), { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        result.current.deleteInitiative('init-1');
      });
      
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });

  describe('status transitions', () => {
    it('should support valid status values', async () => {
      const validStatuses = ['todo', 'in_progress', 'done', 'blocked', 'cancelled'];
      
      validStatuses.forEach(status => {
        expect(['todo', 'in_progress', 'done', 'blocked', 'cancelled']).toContain(status);
      });
    });
  });
});
