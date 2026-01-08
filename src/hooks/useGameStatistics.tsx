import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface GameStatistics {
  totalGamesPlayed: number;
  totalTurnsPlayed: number;
  bestScoreSolo: number;
  bestScoreRace: number;
  archetypesUsed: string[];
  countriesVisited: string[];
  totalRiskEvents: number;
  riskSuccesses: number;
  riskFailures: number;
  totalMoneyEarned: number;
  totalMoneyLost: number;
  totalHealthLost: number;
  favoriteActions: Record<string, number>;
}

const LOCAL_STORAGE_KEY = 'game_statistics';

const defaultStats: GameStatistics = {
  totalGamesPlayed: 0,
  totalTurnsPlayed: 0,
  bestScoreSolo: 0,
  bestScoreRace: 0,
  archetypesUsed: [],
  countriesVisited: [],
  totalRiskEvents: 0,
  riskSuccesses: 0,
  riskFailures: 0,
  totalMoneyEarned: 0,
  totalMoneyLost: 0,
  totalHealthLost: 0,
  favoriteActions: {},
};

export function useGameStatistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStatistics>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);

      // First load from localStorage
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          setStats({ ...defaultStats, ...JSON.parse(localData) });
        } catch (e) {
          console.error('Error parsing local stats:', e);
        }
      }

      // If logged in, fetch from Supabase
      if (user) {
        try {
          const { data, error } = await supabase
            .from('game_statistics')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error loading stats from Supabase:', error);
          } else if (data) {
            const cloudStats: GameStatistics = {
              totalGamesPlayed: data.total_games_played,
              totalTurnsPlayed: data.total_turns_played,
              bestScoreSolo: data.best_score_solo || 0,
              bestScoreRace: data.best_score_race || 0,
              archetypesUsed: (data.archetypes_used as string[]) || [],
              countriesVisited: data.countries_visited || [],
              totalRiskEvents: data.total_risk_events || 0,
              riskSuccesses: data.risk_successes || 0,
              riskFailures: data.risk_failures || 0,
              totalMoneyEarned: data.total_money_earned || 0,
              totalMoneyLost: data.total_money_lost || 0,
              totalHealthLost: data.total_health_lost || 0,
              favoriteActions: (data.favorite_actions as Record<string, number>) || {},
            };
            setStats(cloudStats);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudStats));
          } else if (localData) {
            // Sync local to cloud if no cloud data
            await syncToCloud(JSON.parse(localData));
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
        }
      }

      setLoading(false);
    };

    loadStats();
  }, [user]);

  // Sync to Supabase
  const syncToCloud = useCallback(async (data: GameStatistics) => {
    if (!user) return false;

    setSyncing(true);
    try {
      const dbData = {
        user_id: user.id,
        total_games_played: data.totalGamesPlayed,
        total_turns_played: data.totalTurnsPlayed,
        best_score_solo: data.bestScoreSolo,
        best_score_race: data.bestScoreRace,
        archetypes_used: data.archetypesUsed,
        countries_visited: data.countriesVisited,
        total_risk_events: data.totalRiskEvents,
        risk_successes: data.riskSuccesses,
        risk_failures: data.riskFailures,
        total_money_earned: data.totalMoneyEarned,
        total_money_lost: data.totalMoneyLost,
        total_health_lost: data.totalHealthLost,
        favorite_actions: data.favoriteActions,
      };

      const { error } = await supabase
        .from('game_statistics')
        .upsert(dbData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error syncing stats:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Save stats
  const saveStats = useCallback(async (newStats: GameStatistics) => {
    setStats(newStats);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStats));
    if (user) {
      await syncToCloud(newStats);
    }
  }, [user, syncToCloud]);

  // Track game completion
  const trackGameCompleted = useCallback(async (
    mode: 'solo' | 'race' | 'points_duel' | 'cooperative',
    score: number,
    archetypeId: string,
    countryId: string,
    turnsPlayed: number
  ) => {
    const newStats = {
      ...stats,
      totalGamesPlayed: stats.totalGamesPlayed + 1,
      totalTurnsPlayed: stats.totalTurnsPlayed + turnsPlayed,
      archetypesUsed: stats.archetypesUsed.includes(archetypeId) 
        ? stats.archetypesUsed 
        : [...stats.archetypesUsed, archetypeId],
      countriesVisited: stats.countriesVisited.includes(countryId)
        ? stats.countriesVisited
        : [...stats.countriesVisited, countryId],
    };

    if (mode === 'solo' && score > stats.bestScoreSolo) {
      newStats.bestScoreSolo = score;
    } else if (mode === 'race' && score > stats.bestScoreRace) {
      newStats.bestScoreRace = score;
    }

    await saveStats(newStats);
  }, [stats, saveStats]);

  // Track risk event outcome
  const trackRiskEvent = useCallback(async (
    outcome: 'success' | 'failure' | 'catastrophic',
    moneyChange: number,
    healthChange: number
  ) => {
    const newStats = {
      ...stats,
      totalRiskEvents: stats.totalRiskEvents + 1,
      riskSuccesses: outcome === 'success' ? stats.riskSuccesses + 1 : stats.riskSuccesses,
      riskFailures: outcome !== 'success' ? stats.riskFailures + 1 : stats.riskFailures,
      totalMoneyEarned: moneyChange > 0 ? stats.totalMoneyEarned + moneyChange : stats.totalMoneyEarned,
      totalMoneyLost: moneyChange < 0 ? stats.totalMoneyLost + Math.abs(moneyChange) : stats.totalMoneyLost,
      totalHealthLost: healthChange < 0 ? stats.totalHealthLost + Math.abs(healthChange) : stats.totalHealthLost,
    };
    await saveStats(newStats);
  }, [stats, saveStats]);

  // Track action used
  const trackActionUsed = useCallback(async (actionId: string, success: boolean) => {
    const newStats = {
      ...stats,
      favoriteActions: {
        ...stats.favoriteActions,
        [actionId]: (stats.favoriteActions[actionId] || 0) + 1,
      },
    };
    await saveStats(newStats);
  }, [stats, saveStats]);

  // Calculate derived stats
  const riskSuccessRate = stats.totalRiskEvents > 0 
    ? Math.round((stats.riskSuccesses / stats.totalRiskEvents) * 100) 
    : 0;

  const topActions = Object.entries(stats.favoriteActions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([action, count]) => ({ action, count }));

  return {
    stats,
    loading,
    syncing,
    isLoggedIn: !!user,
    trackGameCompleted,
    trackRiskEvent,
    trackActionUsed,
    riskSuccessRate,
    topActions,
  };
}