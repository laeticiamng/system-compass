/**
 * User History Sync Hook
 * 
 * Synchronizes user history between localStorage and Supabase database.
 * Implements the missing DB sync for logged-in users.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface HistoryEntry {
  type: 'country_view' | 'comparison' | 'simulation' | 'exit_key';
  id: string;
  label: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

interface SyncedHistoryEntry extends HistoryEntry {
  synced: boolean;
  dbId?: string;
}

const STORAGE_KEY = 'pyramid_compass_history';
const SYNC_KEY = 'pyramid_compass_history_synced';
const MAX_HISTORY = 50;

export function useUserHistorySync() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SyncedHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // Load and sync history
  useEffect(() => {
    const loadAndSync = async () => {
      setIsLoading(true);
      
      // Load from localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      let localHistory: SyncedHistoryEntry[] = [];
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localHistory = parsed.map((h: HistoryEntry) => ({
            ...h,
            timestamp: new Date(h.timestamp),
            synced: false,
          }));
        } catch (e) {
          console.error('Failed to parse local history:', e);
        }
      }

      if (user) {
        // Fetch from database for logged-in users
        try {
          const { data: dbHistory, error } = await supabase
            .from('analytics_events')
            .select('id, event_name, event_category, metadata, created_at')
            .eq('user_id', user.id)
            .in('event_category', ['country_view', 'comparison', 'simulation', 'exit_key'])
            .order('created_at', { ascending: false })
            .limit(MAX_HISTORY);

          if (!error && dbHistory) {
            // Merge with local history, preferring DB records
            const dbEntries: SyncedHistoryEntry[] = dbHistory.map(row => ({
              type: row.event_category as HistoryEntry['type'],
              id: (row.metadata as Record<string, unknown>)?.id as string || row.id,
              label: row.event_name,
              metadata: row.metadata as Record<string, unknown>,
              timestamp: new Date(row.created_at),
              synced: true,
              dbId: row.id,
            }));

            // Merge: keep DB entries and add unsynced local entries
            const dbIds = new Set(dbEntries.map(e => e.id));
            const unsyncedLocal = localHistory.filter(e => !dbIds.has(e.id));
            
            localHistory = [...dbEntries, ...unsyncedLocal].slice(0, MAX_HISTORY);
            
            // Sync unsynced entries to DB
            if (unsyncedLocal.length > 0) {
              await syncToDatabase(unsyncedLocal, user.id);
            }
          }
        } catch (e) {
          console.error('Failed to sync with database:', e);
        }
      }

      setHistory(localHistory);
      setIsLoading(false);
      setLastSyncAt(new Date());
    };

    loadAndSync();
  }, [user]);

  // Sync entries to database
  const syncToDatabase = async (entries: SyncedHistoryEntry[], userId: string) => {
    setIsSyncing(true);
    
    try {
      const sessionId = localStorage.getItem('analytics_session_id') || 'unknown';
      
      const inserts = entries.map(entry => ({
        user_id: userId,
        session_id: sessionId,
        event_name: entry.label,
        event_category: entry.type,
        metadata: { ...entry.metadata, id: entry.id },
        page_path: window.location.pathname,
      }));

      const { error } = await supabase
        .from('analytics_events')
        .insert(inserts);

      if (error) {
        console.error('Failed to sync history to DB:', error);
      } else {
        // Mark as synced
        setHistory(prev => prev.map(h => 
          entries.some(e => e.id === h.id) ? { ...h, synced: true } : h
        ));
        localStorage.setItem(SYNC_KEY, new Date().toISOString());
      }
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save history to localStorage
  const saveHistory = useCallback((entries: SyncedHistoryEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, []);

  // Add entry
  const addEntry = useCallback(async (entry: Omit<HistoryEntry, 'timestamp'>) => {
    const newEntry: SyncedHistoryEntry = {
      ...entry,
      timestamp: new Date(),
      synced: false,
    };

    setHistory(prev => {
      const filtered = prev.filter(h => !(h.type === entry.type && h.id === entry.id));
      const newHistory = [newEntry, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(newHistory);
      return newHistory;
    });

    // Sync immediately if user is logged in
    if (user) {
      await syncToDatabase([newEntry], user.id);
    }
  }, [user, saveHistory]);

  // Force sync all unsynced entries
  const forceSync = useCallback(async () => {
    if (!user) return;
    
    const unsynced = history.filter(h => !h.synced);
    if (unsynced.length > 0) {
      await syncToDatabase(unsynced, user.id);
    }
  }, [user, history]);

  // Clear history
  const clearHistory = useCallback(async () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNC_KEY);
    
    // Also clear from DB if logged in
    if (user) {
      try {
        await supabase
          .from('analytics_events')
          .delete()
          .eq('user_id', user.id)
          .in('event_category', ['country_view', 'comparison', 'simulation', 'exit_key']);
      } catch (e) {
        console.error('Failed to clear DB history:', e);
      }
    }
  }, [user]);

  // Get sync status
  const getSyncStatus = useCallback(() => {
    const synced = history.filter(h => h.synced).length;
    const total = history.length;
    return {
      synced,
      unsynced: total - synced,
      total,
      percentage: total > 0 ? Math.round((synced / total) * 100) : 100,
      lastSyncAt,
    };
  }, [history, lastSyncAt]);

  return {
    history: history as HistoryEntry[],
    isLoading,
    isSyncing,
    addEntry,
    clearHistory,
    forceSync,
    getSyncStatus,
  };
}
