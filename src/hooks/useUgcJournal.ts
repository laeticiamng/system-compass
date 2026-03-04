/**
 * Hook for UGC Expat Journal entries
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface JournalEntry {
  id: string;
  user_id: string;
  country_id: string;
  title: string;
  content: string;
  month_number: number | null;
  mood: string;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export interface JournalFormData {
  country_id: string;
  title: string;
  content: string;
  month_number?: number;
  mood?: string;
  is_public: boolean;
  tags: string[];
}

export function useUgcJournal(publicFeed = false, countryFilter?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ['ugc-journal', publicFeed, countryFilter, user?.id],
    queryFn: async () => {
      let q = supabase
        .from('ugc_journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!publicFeed && user) {
        q = q.eq('user_id', user.id);
      } else {
        q = q.eq('is_public', true);
      }
      if (countryFilter) q = q.eq('country_id', countryFilter);

      const { data, error } = await q;
      if (error) throw error;

      if (publicFeed && data && data.length > 0) {
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
        const nameMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
        return data.map(e => ({ ...e, author_name: nameMap.get(e.user_id) || 'Expatrié anonyme' })) as JournalEntry[];
      }
      return (data || []) as JournalEntry[];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (form: JournalFormData) => {
      if (!user) throw new Error('Non authentifié');
      const { error } = await supabase.from('ugc_journal_entries').insert({
        ...form,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ugc-journal'] });
      toast.success('Entrée publiée !');
    },
    onError: () => toast.error('Erreur lors de la publication'),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ugc_journal_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ugc-journal'] });
      toast.success('Entrée supprimée');
    },
  });

  return { entries: entriesQuery.data || [], isLoading: entriesQuery.isLoading, createEntry, deleteEntry };
}
