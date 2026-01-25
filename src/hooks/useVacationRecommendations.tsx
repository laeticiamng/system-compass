import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VacationDestination {
  countryId: string;
  name: string;
  score: number;
  reasons: string[];
  climate: string;
  bestSeason: string;
}

interface VacationRecommendation {
  id: string;
  originCountry: string;
  destinations: VacationDestination[];
  preferences: Record<string, unknown>;
  createdAt: string;
}

interface VacationPreferences {
  climate?: 'tropical' | 'temperate' | 'cold' | 'any';
  budget?: 'low' | 'medium' | 'high' | 'any';
  activities?: string[];
  duration?: number;
}

export function useVacationRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<VacationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vacation_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: VacationRecommendation[] = (data || []).map((item) => ({
        id: item.id,
        originCountry: item.origin_country,
        destinations: (item.destinations as unknown as VacationDestination[]) || [],
        preferences: (item.preferences as Record<string, unknown>) || {},
        createdAt: item.created_at || new Date().toISOString(),
      }));

      setRecommendations(mapped);
    } catch (err) {
      console.error('Error fetching vacation recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const generateRecommendations = useCallback(async (
    originCountry: string, 
    preferences: VacationPreferences
  ): Promise<VacationDestination[]> => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Connectez-vous pour générer des recommandations",
        variant: "destructive",
      });
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate AI-powered recommendations via edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'destination-insights',
        {
          body: {
            destination: originCountry,
            nationalities: [],
            aspiration: 'vacation',
            mode: 'vacation_recommendations',
            preferences,
          },
        }
      );

      if (functionError) throw functionError;

      // Parse recommendations from AI response
      const destinations: VacationDestination[] = functionData?.recommendations || [
        {
          countryId: 'portugal',
          name: 'Portugal',
          score: 92,
          reasons: ['Climate agréable', 'Coût de vie abordable', 'Culture riche'],
          climate: 'temperate',
          bestSeason: 'Printemps/Automne',
        },
        {
          countryId: 'thailand',
          name: 'Thaïlande',
          score: 88,
          reasons: ['Plages magnifiques', 'Cuisine exceptionnelle', 'Budget friendly'],
          climate: 'tropical',
          bestSeason: 'Novembre-Février',
        },
        {
          countryId: 'japan',
          name: 'Japon',
          score: 85,
          reasons: ['Culture unique', 'Sécurité', 'Gastronomie'],
          climate: 'temperate',
          bestSeason: 'Printemps (Sakura)',
        },
      ];

      // Save to database
      const { error: insertError } = await supabase
        .from('vacation_recommendations')
        .insert([{
          user_id: user.id,
          origin_country: originCountry,
          destinations: destinations as unknown as any,
          preferences: preferences as unknown as any,
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Recommandations générées",
        description: `${destinations.length} destinations trouvées`,
      });

      // Refresh list
      await fetchRecommendations();

      return destinations;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchRecommendations]);

  const deleteRecommendation = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('vacation_recommendations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setRecommendations((prev) => prev.filter((r) => r.id !== id));

      toast({
        title: "Recommandation supprimée",
      });
    } catch (err) {
      console.error('Error deleting recommendation:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recommandation",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    generateRecommendations,
    deleteRecommendation,
    refreshRecommendations: fetchRecommendations,
  };
}
