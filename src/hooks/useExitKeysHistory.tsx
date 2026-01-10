import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ExitKeyStatus = 'explored' | 'saved' | 'dismissed' | 'in_progress';

export interface ExitKeyHistoryEntry {
  id: string;
  user_id: string;
  exit_key_id: string;
  country_id: string | null;
  compatibility_score: number | null;
  notes: string | null;
  status: ExitKeyStatus;
  created_at: string;
  updated_at: string;
}

export function useExitKeysHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ExitKeyHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exit_keys_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setHistory(data as ExitKeyHistoryEntry[] || []);
    } catch (err) {
      console.error('Failed to fetch exit keys history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const trackExitKey = useCallback(async (
    exitKeyId: string, 
    countryId?: string, 
    compatibilityScore?: number
  ) => {
    if (!user) return null;

    try {
      // Check if already exists
      const existing = history.find(h => h.exit_key_id === exitKeyId && h.country_id === countryId);
      
      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('exit_keys_history')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
        await fetchHistory();
        return existing;
      }

      // Create new entry
      const { data, error } = await supabase
        .from('exit_keys_history')
        .insert({
          user_id: user.id,
          exit_key_id: exitKeyId,
          country_id: countryId || null,
          compatibility_score: compatibilityScore || null,
          status: 'explored'
        })
        .select()
        .single();

      if (error) throw error;
      await fetchHistory();
      return data as ExitKeyHistoryEntry;
    } catch (err) {
      console.error('Failed to track exit key:', err);
      return null;
    }
  }, [user, history, fetchHistory]);

  const updateStatus = useCallback(async (id: string, status: ExitKeyStatus) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('exit_keys_history')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchHistory();
      return true;
    } catch (err) {
      console.error('Failed to update exit key status:', err);
      return false;
    }
  }, [user, fetchHistory]);

  const addNotes = useCallback(async (id: string, notes: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('exit_keys_history')
        .update({ notes })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchHistory();
      return true;
    } catch (err) {
      console.error('Failed to add notes:', err);
      return false;
    }
  }, [user, fetchHistory]);

  const removeEntry = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('exit_keys_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchHistory();
      return true;
    } catch (err) {
      console.error('Failed to remove entry:', err);
      return false;
    }
  }, [user, fetchHistory]);

  const getSavedKeys = useCallback(() => {
    return history.filter(h => h.status === 'saved');
  }, [history]);

  const getInProgressKeys = useCallback(() => {
    return history.filter(h => h.status === 'in_progress');
  }, [history]);

  const getRecentlyExplored = useCallback((limit = 5) => {
    return history.slice(0, limit);
  }, [history]);

  return {
    history,
    loading,
    trackExitKey,
    updateStatus,
    addNotes,
    removeEntry,
    getSavedKeys,
    getInProgressKeys,
    getRecentlyExplored,
    refetch: fetchHistory,
    isLoggedIn: !!user
  };
}