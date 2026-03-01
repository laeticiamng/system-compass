import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AggregateRating {
  ratingValue: number;
  reviewCount: number;
}

export function useAggregateRating() {
  return useQuery<AggregateRating | null>({
    queryKey: ['aggregate-rating'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_reviews')
        .select('rating')
        .eq('status', 'approved');

      if (error || !data || data.length === 0) return null;

      const reviewCount = data.length;
      const ratingValue = Math.round(
        (data.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
      ) / 10;

      return { ratingValue, reviewCount };
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });
}
