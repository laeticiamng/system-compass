import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  bestScoreSolo: number;
  bestScoreRace: number;
  totalGamesPlayed: number;
  countriesVisited: number;
  riskSuccessRate: number;
  lastGameAt: string;
}

export function useGameLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the secure leaderboard view that only exposes safe columns
      const { data, error: fetchError } = await supabase
        .from('game_statistics_leaderboard' as 'game_statistics')
        .select('id, display_name, best_score_solo, best_score_race, total_games_played, total_turns_played, updated_at')
        .order('best_score_solo', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      const mapped: LeaderboardEntry[] = (data || []).map(row => ({
        userId: row.id,
        displayName: row.display_name || 'Anonymous',
        bestScoreSolo: row.best_score_solo || 0,
        bestScoreRace: row.best_score_race || 0,
        totalGamesPlayed: row.total_games_played || 0,
        countriesVisited: 0, // Not exposed in secure view
        riskSuccessRate: 0, // Not exposed in secure view (calculated from sensitive patterns)
        lastGameAt: row.updated_at,
      }));

      // Filter out entries with 0 games played
      setEntries(mapped.filter(e => e.totalGamesPlayed > 0));
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    refresh: fetchLeaderboard,
  };
}
