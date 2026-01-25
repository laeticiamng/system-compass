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
      const { data, error: fetchError } = await supabase
        .from('game_statistics')
        .select('*')
        .order('best_score_solo', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      const mapped: LeaderboardEntry[] = (data || []).map(row => ({
        userId: row.user_id,
        displayName: row.display_name || 'Anonymous',
        bestScoreSolo: row.best_score_solo || 0,
        bestScoreRace: row.best_score_race || 0,
        totalGamesPlayed: row.total_games_played || 0,
        countriesVisited: (row.countries_visited || []).length,
        riskSuccessRate: row.total_risk_events
          ? Math.round(((row.risk_successes || 0) / row.total_risk_events) * 100)
          : 0,
        lastGameAt: row.last_game_at || row.updated_at,
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
