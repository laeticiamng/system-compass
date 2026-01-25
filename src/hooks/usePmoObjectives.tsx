import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { 
  PmoObjectiveRow,
  CreateObjectiveForm,
  ObjectiveStatus 
} from '@/lib/pmo-types';

export function usePmoObjectives(caseId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all objectives for a case
  const { data: objectives, isLoading, error } = useQuery({
    queryKey: ['pmo-objectives', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_objectives')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!user,
  });

  // Create a new objective
  const createObjective = useMutation({
    mutationFn: async (form: CreateObjectiveForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('pmo_objectives')
        .insert({
          case_id: caseId,
          user_id: user.id,
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          horizon_days: form.horizon_days,
          success_metrics: form.success_metrics || null,
          target_date: form.target_date || null,
          status: 'draft' as ObjectiveStatus,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-objectives', caseId] });
      toast.success('Objectif créé avec succès');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating objective:', error);
      toast.error('Erreur lors de la création de l\'objectif');
      setIsCreating(false);
    },
  });

  // Update an objective
  const updateObjective = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PmoObjectiveRow> }) => {
      const { data, error } = await supabase
        .from('pmo_objectives')
        .update({ ...updates, updated_by: user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-objectives', caseId] });
      toast.success('Objectif mis à jour');
    },
    onError: (error) => {
      console.error('Error updating objective:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete an objective
  const deleteObjective = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-objectives', caseId] });
      toast.success('Objectif supprimé');
    },
    onError: (error) => {
      console.error('Error deleting objective:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    objectives: objectives || [],
    isLoading,
    error,
    isCreating,
    createObjective: createObjective.mutate,
    updateObjective: updateObjective.mutate,
    deleteObjective: deleteObjective.mutate,
  };
}
