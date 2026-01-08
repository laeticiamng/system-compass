import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PyramidType } from '@/lib/types';
import { GamePlayerProfile } from '@/components/game/PlayerProfile';
import { Database } from '@/integrations/supabase/types';

type GameMode = Database['public']['Enums']['game_mode'];

export interface SavedGameState {
  players: {
    id: number;
    name: string;
    position: number;
    scores: Record<PyramidType, number>;
    color: string;
    result?: PyramidType;
    profile?: GamePlayerProfile;
  }[];
  currentPlayerIndex: number;
  diceValue: number | null;
  gameMessage: string;
}

export interface SavedGame {
  id: string;
  game_name: string;
  game_mode: GameMode;
  game_state: SavedGameState;
  player_count: number;
  current_player: number;
  is_finished: boolean;
  created_at: string;
  updated_at: string;
}

export function useSavedGames() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  const fetchSavedGames = useCallback(async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_games')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const games = (data || []).map(game => ({
        ...game,
        game_state: game.game_state as unknown as SavedGameState,
      })) as SavedGame[];
      
      setSavedGames(games);
      return games;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch games';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveGame = useCallback(async (
    gameName: string,
    gameMode: GameMode,
    gameState: SavedGameState,
    existingGameId?: string
  ): Promise<string | null> => {
    if (!user) {
      setError('Must be logged in to save games');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const gameData = {
        game_name: gameName,
        game_mode: gameMode,
        game_state: gameState as unknown as Database['public']['Tables']['saved_games']['Insert']['game_state'],
        player_count: gameState.players.length,
        current_player: gameState.currentPlayerIndex,
        is_finished: gameState.players.every(p => p.position >= 41),
        user_id: user.id,
      };

      if (existingGameId) {
        const { error: updateError } = await supabase
          .from('saved_games')
          .update(gameData)
          .eq('id', existingGameId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        return existingGameId;
      } else {
        const { data, error: insertError } = await supabase
          .from('saved_games')
          .insert(gameData)
          .select('id')
          .single();

        if (insertError) throw insertError;
        return data?.id || null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save game';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadGame = useCallback(async (gameId: string): Promise<SavedGame | null> => {
    if (!user) {
      setError('Must be logged in to load games');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('saved_games')
        .select('*')
        .eq('id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) {
        setError('Game not found');
        return null;
      }

      return {
        ...data,
        game_state: data.game_state as unknown as SavedGameState,
      } as SavedGame;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load game';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteGame = useCallback(async (gameId: string): Promise<boolean> => {
    if (!user) {
      setError('Must be logged in to delete games');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('saved_games')
        .delete()
        .eq('id', gameId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setSavedGames(prev => prev.filter(g => g.id !== gameId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete game';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    savedGames,
    loading,
    error,
    fetchSavedGames,
    saveGame,
    loadGame,
    deleteGame,
  };
}
