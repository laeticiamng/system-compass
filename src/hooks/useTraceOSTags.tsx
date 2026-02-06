import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';


export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DecisionTag {
  decision_id: string;
  tag_id: string;
  tag?: Tag;
}

export function useTraceOSTags() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    if (!user) {
      setTags([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('traceos_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTag = useCallback(async (name: string, color: string): Promise<Tag | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('traceos_tags')
        .insert({ user_id: user.id, name, color })
        .select()
        .single();

      if (error) throw error;
      await fetchTags();
      return data;
    } catch (err) {
      console.error('Error creating tag:', err);
      toast.error(t('toast.error.tag.create', 'Erreur lors de la création du tag'));
      return null;
    }
  }, [user, fetchTags]);

  const updateTag = useCallback(async (id: string, updates: { name?: string; color?: string }): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_tags')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchTags();
      return true;
    } catch (err) {
      console.error('Error updating tag:', err);
      return false;
    }
  }, [user, fetchTags]);

  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTags();
      toast.success(t('toast.tag.deleted', 'Tag supprimé'));
      return true;
    } catch (err) {
      console.error('Error deleting tag:', err);
      return false;
    }
  }, [user, fetchTags]);

  const addTagToDecision = useCallback(async (decisionId: string, tagId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_decision_tags')
        .insert({ decision_id: decisionId, tag_id: tagId });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error adding tag to decision:', err);
      return false;
    }
  }, [user]);

  const removeTagFromDecision = useCallback(async (decisionId: string, tagId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_decision_tags')
        .delete()
        .eq('decision_id', decisionId)
        .eq('tag_id', tagId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error removing tag from decision:', err);
      return false;
    }
  }, [user]);

  const getDecisionTags = useCallback(async (decisionId: string): Promise<Tag[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('traceos_decision_tags')
        .select('tag_id, traceos_tags(*)')
        .eq('decision_id', decisionId);

      if (error) throw error;
      return (data || []).map(d => d.traceos_tags).filter(Boolean) as Tag[];
    } catch (err) {
      console.error('Error fetching decision tags:', err);
      return [];
    }
  }, [user]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    addTagToDecision,
    removeTagFromDecision,
    getDecisionTags,
    refreshTags: fetchTags
  };
}
