/**
 * Hook for managing consultations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type ConsultationStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Consultation {
  id: string;
  expert_id: string;
  user_id: string;
  status: ConsultationStatus;
  scheduled_at: string | null;
  duration_minutes: number;
  amount: number;
  platform_fee: number;
  payment_status: PaymentStatus;
  meeting_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  expert?: {
    display_name: string;
    avatar_url: string | null;
  };
}

// Platform fee percentage (15%)
export const PLATFORM_FEE_PERCENT = 0.15;

// Calculate platform fee
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENT * 100) / 100;
}

// Fetch user's consultations
export function useUserConsultations() {
  return useQuery({
    queryKey: ['user-consultations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          expert:experts(display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Consultation[];
    },
  });
}

// Fetch expert's consultations (for experts)
export function useExpertConsultations(expertId: string | undefined) {
  return useQuery({
    queryKey: ['expert-consultations', expertId],
    queryFn: async () => {
      if (!expertId) return [];
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('expert_id', expertId)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as Consultation[];
    },
    enabled: !!expertId,
  });
}

// Create a new consultation request
export function useCreateConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      expertId: string;
      scheduledAt: Date;
      durationMinutes: number;
      amount: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const platformFee = calculatePlatformFee(params.amount);
      
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          expert_id: params.expertId,
          user_id: user.id,
          scheduled_at: params.scheduledAt.toISOString(),
          duration_minutes: params.durationMinutes,
          amount: params.amount,
          platform_fee: platformFee,
          notes: params.notes,
          status: 'requested',
          payment_status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-consultations'] });
      toast.success('Demande de consultation envoyée');
    },
    onError: (error) => {
      console.error('Error creating consultation:', error);
      toast.error('Erreur lors de la demande');
    },
  });
}

// Update consultation status
export function useUpdateConsultationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ consultationId, status }: { consultationId: string; status: ConsultationStatus }) => {
      const { error } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', consultationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] });
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

// Cancel a consultation
export function useCancelConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (consultationId: string) => {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'cancelled' })
        .eq('id', consultationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-consultations'] });
      toast.success('Consultation annulée');
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation');
    },
  });
}

// Admin: Get all consultations with stats
export function useAdminConsultations() {
  return useQuery({
    queryKey: ['admin-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          expert:experts(display_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Consultation[];
    },
  });
}

// Admin: Get consultation stats
export function useConsultationStats() {
  return useQuery({
    queryKey: ['consultation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('status, amount, platform_fee, payment_status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        completed: data.filter(c => c.status === 'completed').length,
        pending: data.filter(c => c.status === 'requested' || c.status === 'confirmed').length,
        cancelled: data.filter(c => c.status === 'cancelled').length,
        totalRevenue: data.reduce((sum, c) => sum + (c.amount || 0), 0),
        totalFees: data.reduce((sum, c) => sum + (c.platform_fee || 0), 0),
        paidConsultations: data.filter(c => c.payment_status === 'paid').length,
      };
      
      return stats;
    },
  });
}
