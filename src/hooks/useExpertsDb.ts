/**
 * Hook for managing experts from Supabase database
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbExpert {
  id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[];
  countries: string[];
  languages: string[];
  certifications: Array<{ title: string; issuer: string; year: number; verified: boolean }>;
  hourly_rate: number;
  currency: string;
  booking_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
  response_time_hours: number;
  created_at: string;
  updated_at: string;
}

export interface ExpertFilters {
  specialty?: string;
  country?: string;
  language?: string;
  minRating?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  search?: string;
}

// Fetch all active experts with optional filters
export function useExpertsDb(filters?: ExpertFilters) {
  return useQuery({
    queryKey: ['experts-db', filters],
    queryFn: async () => {
      let query = supabase
        .from('experts')
        .select('*')
        .eq('is_active', true)
        .order('rating_avg', { ascending: false });
      
      if (filters?.specialty && filters.specialty !== 'all') {
        query = query.contains('specialties', [filters.specialty]);
      }
      
      if (filters?.country && filters.country !== 'all') {
        query = query.contains('countries', [filters.country]);
      }
      
      if (filters?.language) {
        query = query.contains('languages', [filters.language]);
      }
      
      if (filters?.minRating) {
        query = query.gte('rating_avg', filters.minRating);
      }
      
      if (filters?.maxPrice) {
        query = query.lte('hourly_rate', filters.maxPrice);
      }
      
      if (filters?.verifiedOnly) {
        query = query.eq('is_verified', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Apply search filter client-side for flexibility
      let results = data as DbExpert[];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(expert => 
          expert.display_name.toLowerCase().includes(searchLower) ||
          expert.bio?.toLowerCase().includes(searchLower) ||
          expert.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
          expert.countries.some(c => c.toLowerCase().includes(searchLower))
        );
      }
      
      return results;
    },
  });
}

// Fetch a single expert by ID
export function useExpertById(id: string | undefined) {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as DbExpert;
    },
    enabled: !!id,
  });
}

// Fetch experts for a specific country
export function useExpertsByCountry(countryId: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['experts-by-country', countryId, limit],
    queryFn: async () => {
      if (!countryId) return [];
      
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('is_active', true)
        .contains('countries', [countryId])
        .order('rating_avg', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as DbExpert[];
    },
    enabled: !!countryId,
  });
}

// Get unique values for filters
export function useExpertFilterOptions() {
  return useQuery({
    queryKey: ['expert-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experts')
        .select('specialties, countries, languages')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const specialties = new Set<string>();
      const countries = new Set<string>();
      const languages = new Set<string>();
      
      data?.forEach(expert => {
        expert.specialties?.forEach(s => specialties.add(s));
        expert.countries?.forEach(c => countries.add(c));
        expert.languages?.forEach(l => languages.add(l));
      });
      
      return {
        specialties: Array.from(specialties).sort(),
        countries: Array.from(countries).sort(),
        languages: Array.from(languages).sort(),
      };
    },
  });
}

// Admin: Fetch all experts (including inactive)
export function useAllExpertsAdmin() {
  return useQuery({
    queryKey: ['all-experts-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbExpert[];
    },
  });
}

// Admin: Update expert verification status
export function useUpdateExpertVerification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ expertId, isVerified }: { expertId: string; isVerified: boolean }) => {
      const { error } = await supabase
        .from('experts')
        .update({ is_verified: isVerified })
        .eq('id', expertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-experts-admin'] });
      queryClient.invalidateQueries({ queryKey: ['experts-db'] });
      toast.success('Statut de vérification mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

// Admin: Toggle expert active status
export function useToggleExpertActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ expertId, isActive }: { expertId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('experts')
        .update({ is_active: isActive })
        .eq('id', expertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-experts-admin'] });
      queryClient.invalidateQueries({ queryKey: ['experts-db'] });
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
}
