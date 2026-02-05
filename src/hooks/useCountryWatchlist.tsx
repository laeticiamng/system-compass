import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WatchlistEntry {
  id: string;
  user_id: string;
  country_id: string;
  notify_on_changes: boolean;
  created_at: string;
}

export function useCountryWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['country-watchlist', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from('user_country_watchlist')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as WatchlistEntry[];
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
        const { error } = await (supabase as any)
          .from('user_country_watchlist')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        const { error } = await (supabase as any)
          .from('user_country_watchlist')
          .insert({ user_id: user.id, country_id: countryId });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['country-watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist-count'] });
      toast.success(result.action === 'added' ? 'Pays suivi' : 'Pays retiré');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  return { watchlist, isLoading, isWatching, toggleWatch };
}

export function useWatchlistCount(countryId: string) {
  return useQuery({
    queryKey: ['watchlist-count', countryId],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from('user_country_watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('country_id', countryId);
      if (error) return 0;
      return count || 0;
    },
  });
}
