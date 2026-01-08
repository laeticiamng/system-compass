import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SavedComparison {
  id: string;
  name: string;
  country_ids: string[];
  created_at: string;
  updated_at: string;
}

export function useSavedComparisons() {
  const { user } = useAuth();
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComparisons = useCallback(async () => {
    if (!user) {
      setComparisons([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_comparisons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComparisons(data || []);
    } catch (error) {
      console.error('Error fetching saved comparisons:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  const saveComparison = async (name: string, countryIds: string[]) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('saved_comparisons')
        .insert({
          user_id: user.id,
          name,
          country_ids: countryIds,
        })
        .select()
        .single();

      if (error) throw error;
      setComparisons(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving comparison:', error);
      return null;
    }
  };

  const deleteComparison = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_comparisons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setComparisons(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting comparison:', error);
      return false;
    }
  };

  return {
    comparisons,
    loading,
    isLoggedIn: !!user,
    saveComparison,
    deleteComparison,
    refetch: fetchComparisons,
  };
}