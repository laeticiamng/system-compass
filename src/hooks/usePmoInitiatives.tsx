import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { 
  PmoInitiativeRow,
  CreateInitiativeForm,
  InitiativeStatus 
} from '@/lib/pmo-types';

export function usePmoInitiatives(caseId: string | null, objectiveId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch initiatives (optionally filtered by objective)
  const { data: initiatives, isLoading, error } = useQuery({
    queryKey: ['pmo-initiatives', caseId, objectiveId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      let query = supabase
        .from('pmo_initiatives')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (objectiveId) {
        query = query.eq('objective_id', objectiveId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!user,
  });

  // Create a new initiative
  const createInitiative = useMutation({
    mutationFn: async (form: CreateInitiativeForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('pmo_initiatives')
        .insert({
          objective_id: form.objective_id || null,
          case_id: caseId,
          user_id: user.id,
          title: form.title,
          description: form.description || null,
          effort_estimate: form.effort_estimate || null,
          value_expected: form.value_expected || null,
          target_date: form.target_date || null,
          status: 'todo' as InitiativeStatus,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-initiatives', caseId] });
      toast.success('Initiative créée avec succès');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating initiative:', error);
      toast.error('Erreur lors de la création de l\'initiative');
      setIsCreating(false);
    },
  });

  // Update an initiative
  const updateInitiative = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PmoInitiativeRow> }) => {
      const { data, error } = await supabase
        .from('pmo_initiatives')
        .update({ ...updates, updated_by: user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-initiatives', caseId] });
      toast.success('Initiative mise à jour');
    },
    onError: (error) => {
      console.error('Error updating initiative:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete an initiative
  const deleteInitiative = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_initiatives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-initiatives', caseId] });
      toast.success('Initiative supprimée');
    },
    onError: (error) => {
      console.error('Error deleting initiative:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    initiatives: initiatives || [],
    isLoading,
    error,
    isCreating,
    createInitiative: createInitiative.mutate,
    updateInitiative: updateInitiative.mutate,
    deleteInitiative: deleteInitiative.mutate,
  };
}
