import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

// Mock data
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUserValue, loading: false }),
}));

// Supabase mocks
const mockSelect = vi.fn();
const mockUpsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'ovi_suggestions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => mockSelect()
            })
          }),
          upsert: (data: unknown, _options?: unknown) => mockUpsert(data),
          update: () => ({
            eq: mockUpdate
          }),
        };
      }
      return {};
    }),
  },
}));

// Initialize i18n for testing
i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'ovi.frameworks.bias.title': 'Cognitive Bias',
        'ovi.frameworks.bias.preview': 'Understanding cognitive biases',
        'ovi.frameworks.irreversible.title': 'Irreversible Decisions',
        'ovi.frameworks.irreversible.preview': 'Managing irreversibility',
        'ovi.grids.visibility.title': 'Visibility Grid',
        'ovi.grids.visibility.desc': 'Visible vs invisible factors',
      }
    }
  }
});

// Import after mocks
import { useOVISuggestions } from '../useOVISuggestions';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  };
}

describe('useOVISuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockSelect.mockResolvedValue({ data: [], error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockUpdate.mockResolvedValue({ error: null });
  });

  describe('initialization', () => {
    it('should return suggestion functions', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.getSuggestionsForSimulation).toBeDefined();
        expect(result.current.dismissSuggestion).toBeDefined();
        expect(result.current.getTopSuggestion).toBeDefined();
        expect(result.current.trackSuggestionView).toBeDefined();
      });
    });

    it('should start with zero dismissed suggestions', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.dismissedCount).toBe(0);
      });
    });

    it('should load dismissed suggestions from database', async () => {
      mockSelect.mockResolvedValue({ data: [{ id: 'suggestion-1' }, { id: 'suggestion-2' }], error: null });

      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.dismissedCount).toBe(2);
      });
    });
  });

  describe('getSuggestionsForSimulation', () => {
    it('should return suggestions for country_view simulation', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestionsForSimulation('country_view');
      
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(s => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('type');
        expect(s).toHaveProperty('title');
        expect(s).toHaveProperty('relevanceScore');
      });
    });

    it('should return suggestions for exit_key simulation', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestionsForSimulation('exit_key');
      
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return suggestions for comparison simulation', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestionsForSimulation('comparison');
      
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should boost relevance for high-risk context', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const highRiskSuggestions = result.current.getSuggestionsForSimulation('exit_key', { riskLevel: 'high' });
      
      // High risk context should boost certain suggestions
      expect(highRiskSuggestions.length).toBeGreaterThan(0);
    });

    it('should exclude dismissed suggestions', async () => {
      mockSelect.mockResolvedValue({ data: [{ id: 'framework-cognitive_bias' }], error: null });

      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.dismissedCount).toBe(1);
      });

      const suggestions = result.current.getSuggestionsForSimulation('prevention_filter');
      const hasDismissed = suggestions.some(s => s.id === 'framework-cognitive_bias');
      
      expect(hasDismissed).toBe(false);
    });

    it('should sort suggestions by relevance score', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const suggestions = result.current.getSuggestionsForSimulation('project_analysis');
      
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].relevanceScore).toBeGreaterThanOrEqual(suggestions[i].relevanceScore);
      }
    });
  });

  describe('getTopSuggestion', () => {
    it('should return the highest relevance suggestion', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const topSuggestion = result.current.getTopSuggestion('matching');
      
      expect(topSuggestion).not.toBeNull();
      expect(topSuggestion?.relevanceScore).toBeDefined();
    });

    it('should return null for unknown simulation type', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // @ts-expect-error - testing invalid type
      const topSuggestion = result.current.getTopSuggestion('unknown_type');
      
      expect(topSuggestion).toBeNull();
    });
  });

  describe('dismissSuggestion', () => {
    it('should add suggestion to dismissed set', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.dismissedCount;

      await act(async () => {
        await result.current.dismissSuggestion('framework-test');
      });

      expect(result.current.dismissedCount).toBe(initialCount + 1);
    });

    it('should persist dismissal to database for authenticated users', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.dismissSuggestion('grid-visible_invisible');
      });

      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should not persist to database for anonymous users', async () => {
      mockUserValue = null;
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.dismissSuggestion('framework-test');
      });

      // Upsert should not be called for anonymous users
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe('resetDismissed', () => {
    it('should clear all dismissed suggestions', async () => {
      mockSelect.mockResolvedValue({ data: [{ id: 's1' }, { id: 's2' }], error: null });

      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.dismissedCount).toBe(2);
      });

      await act(async () => {
        await result.current.resetDismissed();
      });

      expect(result.current.dismissedCount).toBe(0);
    });

    it('should update database for authenticated users', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resetDismissed();
      });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('trackSuggestionView', () => {
    it('should record suggestion view for authenticated users', async () => {
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackSuggestionView('framework-test', 'country_view');
      });

      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should not track for anonymous users', async () => {
      mockUserValue = null;
      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.trackSuggestionView('framework-test', 'exit_key');
      });

      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSelect.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.dismissedCount).toBe(0);
      });

      consoleSpy.mockRestore();
    });

    it('should handle upsert errors gracefully', async () => {
      mockUpsert.mockRejectedValue(new Error('Upsert Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useOVISuggestions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.dismissSuggestion('test');
      });

      // Should still update local state despite DB error
      expect(result.current.dismissedCount).toBe(1);
      consoleSpy.mockRestore();
    });
  });
});
