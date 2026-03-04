/**
 * Hook for UGC country reviews CRUD + voting
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UgcReview {
  id: string;
  user_id: string;
  country_id: string;
  title: string;
  content: string;
  rating_overall: number;
  rating_admin: number | null;
  rating_cost: number | null;
  rating_integration: number | null;
  rating_safety: number | null;
  rating_quality_life: number | null;
  pros: string[];
  cons: string[];
  profile_type: string;
  from_country: string | null;
  duration_months: number | null;
  tags: string[];
  status: string;
  helpful_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // joined
  author_name?: string;
}

export interface ReviewFormData {
  country_id: string;
  title: string;
  content: string;
  rating_overall: number;
  rating_admin?: number;
  rating_cost?: number;
  rating_integration?: number;
  rating_safety?: number;
  rating_quality_life?: number;
  pros: string[];
  cons: string[];
  profile_type: string;
  from_country?: string;
  duration_months?: number;
  tags: string[];
}

export function useUgcReviews(countryId?: string, profileFilter?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['ugc-reviews', countryId, profileFilter],
    queryFn: async () => {
      let q = supabase
        .from('ugc_country_reviews')
        .select('*')
        .order('helpful_count', { ascending: false });

      if (countryId) q = q.eq('country_id', countryId);
      if (profileFilter && profileFilter !== 'all') q = q.eq('profile_type', profileFilter);

      const { data, error } = await q;
      if (error) throw error;

      // Fetch author names
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
        
        const nameMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
        return data.map(r => ({ ...r, author_name: nameMap.get(r.user_id) || 'Expatrié anonyme' })) as UgcReview[];
      }
      return (data || []) as UgcReview[];
    },
  });

  const createReview = useMutation({
    mutationFn: async (form: ReviewFormData) => {
      if (!user) throw new Error('Non authentifié');
      const { error } = await supabase.from('ugc_country_reviews').insert({
        ...form,
        user_id: user.id,
        status: 'approved', // auto-approve for now
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ugc-reviews'] });
      toast.success('Avis publié avec succès !');
    },
    onError: () => toast.error('Erreur lors de la publication'),
  });

  const voteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('Non authentifié');
      // Try insert, if conflict = already voted, so delete
      const { error } = await supabase.from('ugc_review_votes').insert({
        review_id: reviewId,
        user_id: user.id,
      });
      if (error?.code === '23505') {
        // Already voted, remove
        await supabase.from('ugc_review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);
      } else if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ugc-reviews'] }),
  });

  return { reviews: reviewsQuery.data || [], isLoading: reviewsQuery.isLoading, createReview, voteReview };
}
