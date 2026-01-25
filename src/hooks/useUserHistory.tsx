import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface HistoryEntry {
  type: 'country_view' | 'comparison' | 'simulation' | 'exit_key';
  id: string;
  label: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const STORAGE_KEY = 'pyramid_compass_history';
const MAX_HISTORY = 50;

export function useUserHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage or DB
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      
      if (user) {
        // For logged in users, we could sync with DB in the future
        // For now, use localStorage + merge
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setHistory(parsed.map((h: any) => ({
              ...h,
              timestamp: new Date(h.timestamp),
            })));
          } catch (e) {
            console.error('Failed to parse history:', e);
            setHistory([]);
          }
        }
      } else {
        // Guest mode - localStorage only
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setHistory(parsed.map((h: any) => ({
              ...h,
              timestamp: new Date(h.timestamp),
            })));
          } catch (e) {
            setHistory([]);
          }
        }
      }
      
      setIsLoading(false);
    };

    loadHistory();
  }, [user]);

  // Save history to localStorage
  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  // Add entry to history
  const addEntry = useCallback((entry: Omit<HistoryEntry, 'timestamp'>) => {
    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(h => !(h.type === entry.type && h.id === entry.id));
      
      // Add new entry at the start
      const newHistory = [
        { ...entry, timestamp: new Date() },
        ...filtered,
      ].slice(0, MAX_HISTORY);
      
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Track country view
  const trackCountryView = useCallback((countryId: string, countryName: string) => {
    addEntry({
      type: 'country_view',
      id: countryId,
      label: countryName,
    });
  }, [addEntry]);

  // Track comparison
  const trackComparison = useCallback((countryIds: string[], countryNames: string[]) => {
    const id = countryIds.sort().join('-');
    addEntry({
      type: 'comparison',
      id,
      label: countryNames.join(' vs '),
      metadata: { countryIds, countryNames },
    });
  }, [addEntry]);

  // Track simulation
  const trackSimulation = useCallback((simulationType: string, params: Record<string, any>) => {
    const id = `${simulationType}-${Date.now()}`;
    addEntry({
      type: 'simulation',
      id,
      label: simulationType,
      metadata: params,
    });
  }, [addEntry]);

  // Track exit key
  const trackExitKey = useCallback((exitKeyId: string, exitKeyName: string) => {
    addEntry({
      type: 'exit_key',
      id: exitKeyId,
      label: exitKeyName,
    });
  }, [addEntry]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get recent items by type
  const getRecentByType = useCallback((type: HistoryEntry['type'], limit = 5) => {
    return history.filter(h => h.type === type).slice(0, limit);
  }, [history]);

  // Get most viewed countries
  const getMostViewedCountries = useCallback((limit = 5) => {
    const countryViews = history.filter(h => h.type === 'country_view');
    const counts = countryViews.reduce((acc, h) => {
      acc[h.id] = (acc[h.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({
        id,
        label: countryViews.find(h => h.id === id)?.label || id,
        count,
      }));
  }, [history]);

  return {
    history,
    isLoading,
    addEntry,
    trackCountryView,
    trackComparison,
    trackSimulation,
    trackExitKey,
    clearHistory,
    getRecentByType,
    getMostViewedCountries,
  };
}
