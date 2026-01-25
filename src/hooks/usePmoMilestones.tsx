import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { 
  PmoMilestoneRow,
  CreateMilestoneForm,
  MilestoneStatus 
} from '@/lib/pmo-types';

export function usePmoMilestones(caseId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all milestones for a case
  const { data: milestones, isLoading, error } = useQuery({
    queryKey: ['pmo-milestones', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_milestones')
        .select('*')
        .eq('case_id', caseId)
        .order('target_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!user,
  });

  // Create a new milestone
  const createMilestone = useMutation({
    mutationFn: async (form: CreateMilestoneForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('pmo_milestones')
        .insert({
          case_id: caseId,
          user_id: user.id,
          initiative_id: form.initiative_id || null,
          objective_id: form.objective_id || null,
          title: form.title,
          description: form.description || null,
          target_date: form.target_date,
          validation_criteria: form.validation_criteria || null,
          deliverables: form.deliverables || null,
          status: 'pending' as MilestoneStatus,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-milestones', caseId] });
      toast.success('Jalon créé avec succès');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating milestone:', error);
      toast.error('Erreur lors de la création du jalon');
      setIsCreating(false);
    },
  });

  // Update a milestone
  const updateMilestone = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PmoMilestoneRow> }) => {
      // Build update object with proper typing
      const updatePayload: Record<string, unknown> = { 
        ...updates, 
        updated_by: user?.id,
      };
      
      // Set achieved_at if status changes to completed
      if (updates.status === 'completed' && !('achieved_at' in updates)) {
        updatePayload.achieved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('pmo_milestones')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-milestones', caseId] });
      toast.success('Jalon mis à jour');
    },
    onError: (error) => {
      console.error('Error updating milestone:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete a milestone
  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-milestones', caseId] });
      toast.success('Jalon supprimé');
    },
    onError: (error) => {
      console.error('Error deleting milestone:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Computed stats
  const stats = {
    total: milestones?.length || 0,
    pending: milestones?.filter(m => m.status === 'pending').length || 0,
    inProgress: milestones?.filter(m => m.status === 'in_progress').length || 0,
    completed: milestones?.filter(m => m.status === 'completed').length || 0,
    missed: milestones?.filter(m => m.status === 'missed').length || 0,
    overdue: milestones?.filter(m => {
      if (!m.target_date || m.status === 'completed') return false;
      return new Date(m.target_date) < new Date();
    }).length || 0,
  };

  return {
    milestones: milestones || [],
    stats,
    isLoading,
    error,
    isCreating,
    createMilestone: createMilestone.mutate,
    updateMilestone: updateMilestone.mutate,
    deleteMilestone: deleteMilestone.mutate,
  };
}
