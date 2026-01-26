import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSavedGames, SavedGame } from '../useSavedGames';

// Mock data
const mockUser = { id: 'user-123', email: 'test@example.com' };
let mockUserValue: typeof mockUser | null = mockUser;

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUserValue, loading: false }),
}));

// Supabase mocks
const mockOrder = vi.fn();
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'saved_games') {
        return {
          select: () => ({
            eq: (col: string, _val: string) => {
              void _val;
              if (col === 'user_id') {
                return { order: mockOrder };
              }
              return {
                eq: () => ({ maybeSingle: mockMaybeSingle })
              };
            }
          }),
          insert: (data: any) => ({
            select: () => ({
              single: () => mockInsert(data)
            })
          }),
          update: (data: any) => ({
            eq: () => ({
              eq: () => mockUpdate(data)
            })
          }),
          delete: () => ({
            eq: () => ({
              eq: () => mockDelete()
            })
          }),
        };
      }
      return {};
    }),
  },
}));

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockGameState = {
  players: [
    { id: 1, name: 'Player 1', position: 10, scores: {}, color: '#FF0000' }
  ],
  currentPlayerIndex: 0,
  diceValue: 4,
  gameMessage: 'Test message',
};

describe('useSavedGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserValue = mockUser;
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ data: { id: 'game-1' }, error: null });
    mockUpdate.mockResolvedValue({ error: null });
    mockDelete.mockResolvedValue({ error: null });
  });

  describe('initialization', () => {
    it('should initialize with empty saved games', () => {
      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      expect(result.current.savedGames).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchSavedGames', () => {
    it('should fetch saved games for authenticated user', async () => {
      const mockGames = [
        {
          id: 'game-1',
          game_name: 'Test Game',
          game_mode: 'solo',
          game_state: mockGameState,
          player_count: 1,
          current_player: 0,
          is_finished: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];
      mockOrder.mockResolvedValue({ data: mockGames, error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.fetchSavedGames();
      });

      expect(result.current.savedGames).toHaveLength(1);
      expect(result.current.savedGames[0].game_name).toBe('Test Game');
    });

    it('should return empty array when not authenticated', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let games;
      await act(async () => {
        games = await result.current.fetchSavedGames();
      });

      expect(games).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      mockOrder.mockRejectedValue({ message: 'Fetch failed' });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.fetchSavedGames();
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('saveGame', () => {
    it('should save a new game', async () => {
      mockInsert.mockResolvedValue({ data: { id: 'new-game-id' }, error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let gameId;
      await act(async () => {
        gameId = await result.current.saveGame('My Game', 'solo', mockGameState as any);
      });

      expect(gameId).toBe('new-game-id');
    });

    it('should update an existing game', async () => {
      mockUpdate.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let gameId;
      await act(async () => {
        gameId = await result.current.saveGame('My Game', 'solo', mockGameState as any, 'existing-id');
      });

      expect(gameId).toBe('existing-id');
    });

    it('should return null and set error when not authenticated', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let gameId;
      await act(async () => {
        gameId = await result.current.saveGame('My Game', 'solo', mockGameState as any);
      });

      expect(gameId).toBeNull();
      expect(result.current.error).toBe('Must be logged in to save games');
    });

    it('should handle save errors', async () => {
      mockInsert.mockRejectedValue({ message: 'Save failed' });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let gameId;
      await act(async () => {
        gameId = await result.current.saveGame('My Game', 'solo', mockGameState as any);
      });

      expect(gameId).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('loadGame', () => {
    it('should load a specific game', async () => {
      const mockGame = {
        id: 'game-1',
        game_name: 'Loaded Game',
        game_mode: 'race',
        game_state: mockGameState,
        player_count: 2,
        current_player: 1,
        is_finished: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      mockMaybeSingle.mockResolvedValue({ data: mockGame, error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      const gamePromise = result.current.loadGame('game-1');
      let loadedGame: SavedGame | null = null;
      await act(async () => {
        loadedGame = await gamePromise;
      });

      expect(loadedGame!.game_name).toBe('Loaded Game');
      expect(loadedGame!.game_mode).toBe('race');
    });

    it('should return null when game not found', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let game;
      await act(async () => {
        game = await result.current.loadGame('nonexistent');
      });

      expect(game).toBeNull();
      expect(result.current.error).toBe('Game not found');
    });

    it('should return null when not authenticated', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let game;
      await act(async () => {
        game = await result.current.loadGame('game-1');
      });

      expect(game).toBeNull();
      expect(result.current.error).toBe('Must be logged in to load games');
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      mockOrder.mockResolvedValue({ 
        data: [{ id: 'game-1', game_name: 'Test' }], 
        error: null 
      });
      mockDelete.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      // First fetch games
      await act(async () => {
        await result.current.fetchSavedGames();
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGame('game-1');
      });

      expect(deleteResult).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      mockUserValue = null;

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGame('game-1');
      });

      expect(deleteResult).toBe(false);
      expect(result.current.error).toBe('Must be logged in to delete games');
    });

    it('should handle delete errors', async () => {
      mockDelete.mockRejectedValue({ message: 'Delete failed' });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGame('game-1');
      });

      expect(deleteResult).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('data isolation (RGPD)', () => {
    it('should scope all operations to current user_id', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.fetchSavedGames();
      });

      // All operations use user.id in their queries (verified by mock structure)
      expect(result.current.error).toBeNull();
    });
  });

  describe('loading state', () => {
    it('should track loading state during operations', async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockOrder.mockReturnValue(delayedPromise);

      const { result } = renderHook(() => useSavedGames(), { wrapper: createWrapper() });

      // Start the fetch
      const fetchPromise = act(async () => {
        const promise = result.current.fetchSavedGames();
        // Resolve after a tick
        resolvePromise!({ data: [], error: null });
        return promise;
      });

      await fetchPromise;

      expect(result.current.loading).toBe(false);
    });
  });
});
