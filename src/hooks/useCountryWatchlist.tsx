import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';


interface WatchlistRow {
  id: string;
  user_id: string;
  country_id: string;
  notify_on_changes: boolean;
  created_at: string;
}

interface WatchlistEntry {
  id: string;
  user_id: string;
  country_id: string;
  notify_on_changes: boolean;
  created_at: string;
}

export function useCountryWatchlist() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['country-watchlist', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_country_watchlist' as any)
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data as unknown as WatchlistRow[]).map((row): WatchlistEntry => ({
        id: row.id,
        user_id: row.user_id,
        country_id: row.country_id,
        notify_on_changes: row.notify_on_changes,
        created_at: row.created_at,
      }));
    },
    enabled: !!user?.id,
  });

  const isWatching = (countryId: string) => 
    watchlist.some(w => w.country_id === countryId);

  const toggleWatch = useMutation({
    mutationFn: async (countryId: string) => {
      if (!user?.id) throw new Error('Must be logged in');
      
      const existing = watchlist.find(w => w.country_id === countryId);
      if (existing) {
        const { error } = await supabase
          .from('user_country_watchlist' as any)
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { error } = await supabase
          .from('user_country_watchlist' as any)
          .insert({ user_id: user.id, country_id: countryId });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['country-watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist-count'] });
      toast.success(result.action === 'added' ? t('toast.watchlist.added', 'Pays suivi') : t('toast.watchlist.removed', 'Pays retiré'));
    },
    onError: () => toast.error(t('toast.watchlist.error', 'Erreur lors de la mise à jour')),
  });

  return { watchlist, isLoading, isWatching, toggleWatch };
}

export function useWatchlistCount(countryId: string) {
  return useQuery({
    queryKey: ['watchlist-count', countryId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_country_watchlist' as any)
        .select('*', { count: 'exact', head: true })
        .eq('country_id', countryId);
      if (error) return 0;
      return count || 0;
    },
  });
}
