/**
 * useExperts - Hook for managing expert marketplace data
 * Persisted with Supabase for real expert profiles
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface Expert {
  id: string;
  userId?: string;
  type: 'lawyer' | 'tax_advisor' | 'immigration' | 'notary' | 'business';
  name: string;
  bio: string;
  photoUrl?: string;
  countries: string[];
  languages: string[];
  specialties: string[];
  priceMin: number;
  priceMax: number;
  currency: string;
  responseTime: string;
  experienceYears: number;
  verified: boolean;
  rating: number;
  reviewCount: number;
}

export interface ExpertReview {
  id: string;
  expertId: string;
  userId?: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  expertId: string;
  userId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingUrl?: string;
  notes?: string;
  pricePaid?: number;
  currency: string;
}

// Fallback mock data for when no DB experts exist
const MOCK_EXPERTS: Expert[] = [
  {
    id: 'mock-1',
    type: 'lawyer',
    name: 'Maître Sophie Laurent',
    bio: 'Avocate au Barreau de Paris, spécialisée depuis 15 ans dans l\'accompagnement des expatriés et la fiscalité internationale.',
    countries: ['France', 'Belgium', 'Luxembourg'],
    languages: ['Français', 'English', 'Néerlandais'],
    specialties: ['Droit fiscal international', 'Expatriation', 'Structuration patrimoniale'],
    priceMin: 200,
    priceMax: 400,
    currency: 'EUR',
    responseTime: '24h',
    experienceYears: 15,
    verified: true,
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: 'mock-2',
    type: 'tax_advisor',
    name: 'Dr. Michael Weber',
    bio: 'Expert-comptable et conseiller fiscal avec une expertise reconnue en structuration internationale.',
    countries: ['Germany', 'Switzerland', 'Austria'],
    languages: ['Deutsch', 'English', 'Français'],
    specialties: ['Steueroptimierung', 'Holding structures', 'Cross-border taxation'],
    priceMin: 250,
    priceMax: 500,
    currency: 'EUR',
    responseTime: '48h',
    experienceYears: 20,
    verified: true,
    rating: 4.8,
    reviewCount: 98,
  },
  {
    id: 'mock-3',
    type: 'immigration',
    name: 'Emma Rodriguez',
    bio: 'Consultante en immigration spécialisée dans les programmes de résidence européens depuis 10 ans.',
    countries: ['Spain', 'Portugal', 'Andorra'],
    languages: ['Español', 'Português', 'English', 'Français'],
    specialties: ['Golden Visa', 'NHR Portugal', 'Beckham Law Spain', 'Residency'],
    priceMin: 150,
    priceMax: 350,
    currency: 'EUR',
    responseTime: '12h',
    experienceYears: 10,
    verified: true,
    rating: 4.9,
    reviewCount: 234,
  },
  {
    id: 'mock-4',
    type: 'business',
    name: 'James Chen',
    bio: 'Business consultant avec 12 ans d\'expérience dans la création de sociétés en Asie et au Moyen-Orient.',
    countries: ['Singapore', 'Hong Kong', 'UAE'],
    languages: ['English', '中文', 'Français'],
    specialties: ['Company formation', 'Offshore structures', 'Banking'],
    priceMin: 300,
    priceMax: 600,
    currency: 'USD',
    responseTime: '24h',
    experienceYears: 12,
    verified: true,
    rating: 4.7,
    reviewCount: 87,
  },
  {
    id: 'mock-5',
    type: 'notary',
    name: 'Maître Pierre Dubois',
    bio: 'Notaire spécialisé dans les actes à dimension internationale et les successions complexes.',
    countries: ['France', 'Monaco'],
    languages: ['Français', 'English', 'Italiano'],
    specialties: ['Immobilier international', 'Successions transfrontalières', 'Donations'],
    priceMin: 180,
    priceMax: 350,
    currency: 'EUR',
    responseTime: '72h',
    experienceYears: 18,
    verified: true,
    rating: 4.8,
    reviewCount: 67,
  },
];

interface UseExpertsReturn {
  experts: Expert[];
  consultations: Consultation[];
  isLoading: boolean;
  error: string | null;
  fetchExperts: (filters?: { type?: string; country?: string }) => Promise<void>;
  fetchReviews: (expertId: string) => Promise<ExpertReview[]>;
  submitReview: (expertId: string, rating: number, title?: string, content?: string) => Promise<boolean>;
  bookConsultation: (expertId: string, scheduledAt: Date, notes?: string) => Promise<boolean>;
  getMyConsultations: () => Promise<Consultation[]>;
}

export function useExperts(): UseExpertsReturn {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapDbExpert = (row: Record<string, any>): Expert => ({
    id: row.id,
    userId: row.user_id,
    type: row.expert_type,
    name: row.name,
    bio: row.bio || '',
    photoUrl: row.photo_url,
    countries: row.countries || [],
    languages: row.languages || [],
    specialties: row.specialties || [],
    priceMin: row.price_min,
    priceMax: row.price_max,
    currency: row.currency,
    responseTime: row.response_time || '24h',
    experienceYears: row.experience_years || 5,
    verified: row.verified || false,
    rating: parseFloat(row.rating) || 0,
    reviewCount: row.review_count || 0,
  });

  const fetchExperts = useCallback(async (filters?: { type?: string; country?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Since tables may not be in types yet, use a more flexible approach
      // Type assertion for tables not yet in generated types
      const { data, error: dbError } = await supabase
        .from('expert_profiles' as any)
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (dbError || !data || data.length === 0) {
        // Use mock data as fallback
        let filtered = MOCK_EXPERTS;

        if (filters?.type && filters.type !== 'all') {
          filtered = filtered.filter(e => e.type === filters.type);
        }
        if (filters?.country && filters.country !== 'all') {
          filtered = filtered.filter(e => e.countries.includes(filters.country!));
        }
        setExperts(filtered);
      } else {
        // Apply filters on DB results
        let results = data.map(mapDbExpert);
        if (filters?.type && filters.type !== 'all') {
          results = results.filter((e: Expert) => e.type === filters.type);
        }
        if (filters?.country && filters.country !== 'all') {
          results = results.filter((e: Expert) => e.countries.includes(filters.country!));
        }
        setExperts(results);
      }
    } catch (err) {
      console.error('Error fetching experts:', err);
      setError('Failed to load experts');
      // Apply filters on mock data
      let filtered = MOCK_EXPERTS;
      if (filters?.type && filters.type !== 'all') {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters?.country && filters.country !== 'all') {
        filtered = filtered.filter(e => e.countries.includes(filters.country!));
      }
      setExperts(filtered);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async (expertId: string): Promise<ExpertReview[]> => {
    if (expertId.startsWith('mock-')) {
      // No fake reviews for mock experts
      return [];
    }

    try {
      const { data, error: dbError } = await supabase
        .from('expert_reviews' as any)
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false });

      if (dbError || !data) {
        console.warn('Could not fetch reviews:', dbError?.message);
        return [];
      }

      return ((data as unknown as Record<string, any>[]) || []).map((row) => ({
        id: row.id,
        expertId: row.expert_id,
        userId: row.user_id,
        rating: row.rating,
        title: row.title,
        content: row.content,
        isVerifiedPurchase: row.is_verified_purchase || false,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    }
  }, []);

  const submitReview = useCallback(async (
    expertId: string, 
    rating: number, 
    title?: string, 
    content?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error(t('experts.loginRequired', 'Vous devez être connecté pour laisser un avis'));
      return false;
    }

    if (expertId.startsWith('mock-')) {
      toast.success(t('experts.reviewSubmittedDemo', 'Avis soumis avec succès (démo)'));
      return true;
    }

    try {
      const { error: dbError } = await supabase
        .from('expert_reviews' as any)
        .insert({
          expert_id: expertId,
          user_id: user.id,
          rating,
          title,
          content,
        });

      if (dbError) {
        toast.error(t('experts.reviewSubmitError', 'Erreur lors de la soumission de l\'avis'));
        return false;
      }

      toast.success(t('experts.reviewSubmitted', 'Avis soumis avec succès'));
      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(t('experts.reviewSubmitError', 'Erreur lors de la soumission de l\'avis'));
      return false;
    }
  }, [user]);

  const bookConsultation = useCallback(async (
    expertId: string,
    scheduledAt: Date,
    notes?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error(t('experts.loginRequiredBooking', 'Vous devez être connecté pour réserver'));
      return false;
    }

    if (expertId.startsWith('mock-')) {
      toast.success(t('experts.consultationBookedDemo', 'Consultation réservée avec succès (démo)'), {
        description: t('experts.appointmentDate', 'Rendez-vous le {{date}}', { date: scheduledAt.toLocaleDateString('fr-FR') }),
      });
      return true;
    }

    try {
      const { error: dbError } = await supabase
        .from('expert_consultations' as any)
        .insert({
          expert_id: expertId,
          user_id: user.id,
          scheduled_at: scheduledAt.toISOString(),
          notes,
          status: 'pending',
        });

      if (dbError) {
        toast.error(t('experts.bookingError', 'Erreur lors de la réservation'));
        return false;
      }

      toast.success(t('experts.consultationBooked', 'Consultation réservée avec succès'));
      return true;
    } catch (err) {
      console.error('Error booking consultation:', err);
      toast.error(t('experts.bookingError', 'Erreur lors de la réservation'));
      return false;
    }
  }, [user]);

  const getMyConsultations = useCallback(async (): Promise<Consultation[]> => {
    if (!user) return [];

    try {
      const { data, error: dbError } = await supabase
        .from('expert_consultations' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (dbError || !data) {
        console.warn('Could not fetch consultations:', dbError?.message);
        return [];
      }

      const mapped = ((data as unknown as Record<string, any>[]) || []).map((row) => ({
        id: row.id,
        expertId: row.expert_id,
        userId: row.user_id,
        scheduledAt: row.scheduled_at,
        durationMinutes: row.duration_minutes || 60,
        status: row.status as Consultation['status'],
        meetingUrl: row.meeting_url,
        notes: row.notes,
        pricePaid: row.price_paid,
        currency: row.currency || 'EUR',
      }));

      setConsultations(mapped);
      return mapped;
    } catch (err) {
      console.error('Error fetching consultations:', err);
      return [];
    }
  }, [user]);

  // Load experts on mount
  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  return {
    experts,
    consultations,
    isLoading,
    error,
    fetchExperts,
    fetchReviews,
    submitReview,
    bookConsultation,
    getMyConsultations,
  };
}
