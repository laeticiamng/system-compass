import { useState, useEffect, useCallback } from 'react';

interface TerrainHistoryEntry {
  countryId: string;
  countryName: string;
  consultedAt: string;
  riskLevel?: 'high' | 'medium' | 'low';
}

const STORAGE_KEY = 'terrain-realities-history';
const MAX_HISTORY_ITEMS = 20;

export function useTerrainHistory() {
  const [history, setHistory] = useState<TerrainHistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addToHistory = useCallback((entry: Omit<TerrainHistoryEntry, 'consultedAt'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.countryId !== entry.countryId);
      const newEntry: TerrainHistoryEntry = {
        ...entry,
        consultedAt: new Date().toISOString()
      };
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateRiskLevel = useCallback((countryId: string, riskLevel: 'high' | 'medium' | 'low') => {
    setHistory(prev => {
      const updated = prev.map(h => 
        h.countryId === countryId ? { ...h, riskLevel } : h
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((countryId: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.countryId !== countryId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isInHistory = useCallback((countryId: string) => {
    return history.some(h => h.countryId === countryId);
  }, [history]);

  return {
    history,
    addToHistory,
    updateRiskLevel,
    removeFromHistory,
    clearHistory,
    isInHistory
  };
}
