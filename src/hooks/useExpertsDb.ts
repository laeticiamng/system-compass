/**
 * Hook for managing experts from Supabase database
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


export interface Certification {
  title: string;
  issuer: string;
  year: number;
  verified: boolean;
}

export interface DbExpert {
  id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  specialties: string[];
  countries: string[];
  languages: string[];
  certifications: Certification[];
  hourly_rate: number;
  currency: string;
  booking_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
  response_time_hours: number;
  stripe_account_id?: string | null;
  stripe_onboarding_complete?: boolean;
  created_at: string;
  updated_at: string;
}

// Helper to transform DB data to DbExpert
function transformExpert(data: Record<string, unknown>): DbExpert {
  return {
    ...data,
    specialties: (data.specialties as string[]) || [],
    countries: (data.countries as string[]) || [],
    languages: (data.languages as string[]) || [],
    certifications: (data.certifications as Certification[]) || [],
    hourly_rate: Number(data.hourly_rate) || 0,
    rating_avg: Number(data.rating_avg) || 0,
    review_count: Number(data.review_count) || 0,
    response_time_hours: Number(data.response_time_hours) || 48,
    is_verified: Boolean(data.is_verified),
    is_active: Boolean(data.is_active),
  } as DbExpert;
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
// Uses experts_public view to hide sensitive fields (user_id, stripe_account_id)
export function useExpertsDb(filters?: ExpertFilters) {
  return useQuery({
    queryKey: ['experts-db', filters],
    queryFn: async () => {
      // Use the secure public view that hides sensitive fields
      let query = supabase
        .from('experts_public')
        .select('*')
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
      
      // Transform and apply search filter
      let results = (data || []).map(d => transformExpert(d as Record<string, unknown>));
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
// Uses experts_public view to hide sensitive fields (user_id, stripe_account_id)
export function useExpertById(id: string | undefined) {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Use the secure public view that hides sensitive fields
      const { data, error } = await supabase
        .from('experts_public')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformExpert(data as Record<string, unknown>);
    },
    enabled: !!id,
  });
}

// Fetch experts for a specific country
// Uses experts_public view to hide sensitive fields (user_id, stripe_account_id)
export function useExpertsByCountry(countryId: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['experts-by-country', countryId, limit],
    queryFn: async () => {
      if (!countryId) return [];
      
      // Use the secure public view that hides sensitive fields
      const { data, error } = await supabase
        .from('experts_public')
        .select('*')
        .contains('countries', [countryId])
        .order('rating_avg', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []).map(d => transformExpert(d as Record<string, unknown>));
    },
    enabled: !!countryId,
  });
}

// Get unique values for filters
// Uses experts_public view for consistent security
export function useExpertFilterOptions() {
  return useQuery({
    queryKey: ['expert-filter-options'],
    queryFn: async () => {
      // Use the secure public view
      const { data, error } = await supabase
        .from('experts_public')
        .select('specialties, countries, languages');
      
      if (error) throw error;
      
      const specialties = new Set<string>();
      const countries = new Set<string>();
      const languages = new Set<string>();
      
      data?.forEach(expert => {
        (expert.specialties as string[] | null)?.forEach(s => specialties.add(s));
        (expert.countries as string[] | null)?.forEach(c => countries.add(c));
        (expert.languages as string[] | null)?.forEach(l => languages.add(l));
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
      return (data || []).map(d => transformExpert(d as Record<string, unknown>));
    },
  });
}

// Admin: Update expert verification status
export function useUpdateExpertVerification() {
  const { t } = useTranslation();
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
      toast.success(t('toasts.consultation.statusUpdated', 'Statut de vérification mis à jour'));
    },
    onError: () => {
      toast.error(t('toasts.consultation.errorUpdating', 'Erreur lors de la mise à jour'));
    },
  });
}

// Admin: Toggle expert active status
export function useToggleExpertActive() {
  const { t } = useTranslation();
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
      toast.success(t('toasts.consultation.statusUpdated', 'Statut mis à jour'));
    },
    onError: () => {
      toast.error(t('toasts.consultation.errorUpdating', 'Erreur lors de la mise à jour'));
    },
  });
}
