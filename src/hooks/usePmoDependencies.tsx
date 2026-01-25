import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { PmoDependencyRow } from '@/lib/pmo-types';

type DependencyType = 'blocks' | 'depends_on' | 'related_to' | 'mitigates';
type EntityType = 'objective' | 'initiative' | 'milestone' | 'risk';

interface CreateDependencyParams {
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  dependencyType: DependencyType;
  description?: string;
}

export function usePmoDependencies(caseId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all dependencies for a case
  const { data: dependencies, isLoading, error } = useQuery({
    queryKey: ['pmo-dependencies', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_dependencies')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PmoDependencyRow[];
    },
    enabled: !!caseId && !!user,
  });

  // Create a new dependency
  const createDependency = useMutation({
    mutationFn: async (params: CreateDependencyParams) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      const { data, error } = await supabase
        .from('pmo_dependencies')
        .insert({
          case_id: caseId,
          user_id: user.id,
          source_type: params.sourceType,
          source_id: params.sourceId,
          target_type: params.targetType,
          target_id: params.targetId,
          dependency_type: params.dependencyType,
          description: params.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-dependencies', caseId] });
      toast.success('Dépendance créée');
    },
    onError: (error) => {
      console.error('Error creating dependency:', error);
      toast.error('Erreur lors de la création de la dépendance');
    },
  });

  // Delete a dependency
  const deleteDependency = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_dependencies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-dependencies', caseId] });
      toast.success('Dépendance supprimée');
    },
    onError: (error) => {
      console.error('Error deleting dependency:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Helper: Get blockers for a specific entity
  const getBlockersFor = (targetId: string) => {
    return dependencies?.filter(d => 
      d.target_id === targetId && d.dependency_type === 'blocks'
    ) || [];
  };

  // Helper: Get what this entity blocks
  const getBlockedBy = (sourceId: string) => {
    return dependencies?.filter(d => 
      d.source_id === sourceId && d.dependency_type === 'blocks'
    ) || [];
  };

  // Helper: Get mitigations (risk → initiative links)
  const getMitigations = (riskId: string) => {
    return dependencies?.filter(d => 
      d.source_id === riskId && d.dependency_type === 'mitigates'
    ) || [];
  };

  return {
    dependencies: dependencies || [],
    isLoading,
    error,
    createDependency: createDependency.mutate,
    deleteDependency: deleteDependency.mutate,
    getBlockersFor,
    getBlockedBy,
    getMitigations,
  };
}
