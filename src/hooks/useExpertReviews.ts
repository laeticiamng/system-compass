/**
 * useExpertReviews - Hook for managing expert reviews in the marketplace
 * Provides CRUD operations for reviews with real-time vote tracking
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ExpertReview {
  id: string;
  expertId: string;
  userId: string;
  authorName: string;
  authorCountry: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpfulCount: number;
  tags: string[];
  expertResponse?: string;
  expertResponseAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  hasVoted?: boolean;
}

export interface CreateReviewInput {
  expertId: string;
  rating: number;
  title: string;
  content: string;
  tags?: string[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { stars: number; count: number; percentage: number }[];
}

export function useExpertReviews(expertId?: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ExpertReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews for an expert
  const fetchReviews = useCallback(async (targetExpertId?: string) => {
    const id = targetExpertId || expertId;
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch approved reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('expert_reviews')
        .select('*')
        .eq('expert_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch user's votes if logged in
      let userVotes: string[] = [];
      if (user) {
        const { data: votesData } = await supabase
          .from('expert_review_votes')
          .select('review_id')
          .eq('user_id', user.id);
        
        userVotes = (votesData || []).map(v => v.review_id);
      }

      // Fetch author profiles (optional - for display names)
      const formattedReviews: ExpertReview[] = (reviewsData || []).map(review => ({
        id: review.id,
        expertId: review.expert_id,
        userId: review.user_id,
        authorName: 'Utilisateur vérifié', // Anonymized by default
        authorCountry: '', // Would come from profile
        rating: review.rating,
        title: review.title,
        content: review.content,
        verified: review.verified ?? false,
        helpfulCount: review.helpful_count ?? 0,
        tags: review.tags || [],
        expertResponse: review.expert_response || undefined,
        expertResponseAt: review.expert_response_at || undefined,
        status: review.status as 'pending' | 'approved' | 'rejected',
        createdAt: review.created_at,
        hasVoted: userVotes.includes(review.id),
      }));

      setReviews(formattedReviews);

      // Calculate stats
      if (formattedReviews.length > 0) {
        const totalRating = formattedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / formattedReviews.length;

        const distribution = [5, 4, 3, 2, 1].map(stars => {
          const count = formattedReviews.filter(r => r.rating === stars).length;
          return {
            stars,
            count,
            percentage: Math.round((count / formattedReviews.length) * 100),
          };
        });

        setStats({
          averageRating: avgRating,
          totalReviews: formattedReviews.length,
          ratingDistribution: distribution,
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [5, 4, 3, 2, 1].map(stars => ({ stars, count: 0, percentage: 0 })),
        });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Impossible de charger les avis');
    } finally {
      setLoading(false);
    }
  }, [expertId, user]);

  // Create a new review
  const createReview = useCallback(async (input: CreateReviewInput): Promise<boolean> => {
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return false;
    }

    if (input.rating < 1 || input.rating > 5) {
      toast.error('La note doit être entre 1 et 5');
      return false;
    }

    if (input.content.length < 20) {
      toast.error('Votre avis doit contenir au moins 20 caractères');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('expert_reviews')
        .insert({
          expert_id: input.expertId,
          user_id: user.id,
          rating: input.rating,
          title: input.title,
          content: input.content,
          tags: input.tags || [],
          status: 'pending',
        });

      if (insertError) throw insertError;

      toast.success('Avis soumis pour vérification');
      return true;
    } catch (err) {
      console.error('Error creating review:', err);
      toast.error('Erreur lors de la soumission de l\'avis');
      return false;
    }
  }, [user]);

  // Vote helpful on a review
  const voteHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Vous devez être connecté pour voter');
      return false;
    }

    try {
      const { error: voteError } = await supabase
        .from('expert_review_votes')
        .insert({
          review_id: reviewId,
          user_id: user.id,
        });

      if (voteError) {
        if (voteError.code === '23505') {
          toast.info('Vous avez déjà voté pour cet avis');
          return false;
        }
        throw voteError;
      }

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, helpfulCount: r.helpfulCount + 1, hasVoted: true }
          : r
      ));

      toast.success('Merci pour votre vote');
      return true;
    } catch (err) {
      console.error('Error voting:', err);
      toast.error('Erreur lors du vote');
      return false;
    }
  }, [user]);

  // Remove helpful vote
  const removeVote = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('expert_review_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, helpfulCount: Math.max(0, r.helpfulCount - 1), hasVoted: false }
          : r
      ));

      return true;
    } catch (err) {
      console.error('Error removing vote:', err);
      return false;
    }
  }, [user]);

  // Get user's pending reviews
  const fetchMyPendingReviews = useCallback(async (): Promise<ExpertReview[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('expert_reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      return (data || []).map(review => ({
        id: review.id,
        expertId: review.expert_id,
        userId: review.user_id,
        authorName: 'Vous',
        authorCountry: '',
        rating: review.rating,
        title: review.title,
        content: review.content,
        verified: review.verified ?? false,
        helpfulCount: review.helpful_count ?? 0,
        tags: review.tags || [],
        expertResponse: review.expert_response || undefined,
        status: review.status as 'pending' | 'approved' | 'rejected',
        createdAt: review.created_at,
      }));
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
      return [];
    }
  }, [user]);

  // Delete a pending review
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Avis supprimé');
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Impossible de supprimer l\'avis');
      return false;
    }
  }, [user]);

  return {
    reviews,
    stats,
    loading,
    error,
    fetchReviews,
    createReview,
    voteHelpful,
    removeVote,
    fetchMyPendingReviews,
    deleteReview,
    isAuthenticated: !!user,
  };
}
