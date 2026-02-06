import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export type FrameworkType = 'rgpd' | 'ai_act' | 'mdr' | 'ehds' | 'custom';
export type RequirementStatus = 'not_started' | 'in_progress' | 'compliant' | 'non_compliant' | 'not_applicable';
export type Criticality = 'low' | 'medium' | 'high' | 'critical';
export type CoverageStatus = 'full' | 'partial' | 'none';
export type MappingType = 'initiative' | 'evidence' | 'milestone';

export interface ComplianceFramework {
  id: string;
  case_id: string;
  user_id: string;
  framework_type: FrameworkType;
  name: string;
  description: string | null;
  version: string | null;
  source_url: string | null;
  is_active: boolean;
  activation_questionnaire: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirement {
  id: string;
  framework_id: string;
  user_id: string;
  requirement_code: string | null;
  title: string;
  description: string | null;
  criticality: Criticality;
  category: string | null;
  source_reference: string | null;
  source_version: string | null;
  source_date: string | null;
  status: RequirementStatus;
  notes: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceMapping {
  id: string;
  requirement_id: string;
  user_id: string;
  mapping_type: MappingType;
  target_id: string;
  target_title: string | null;
  coverage_status: CoverageStatus;
  owner_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFrameworkForm {
  framework_type: FrameworkType;
  name: string;
  description?: string;
  version?: string;
  source_url?: string;
  activation_questionnaire?: Record<string, unknown>;
}

export interface CreateRequirementForm {
  framework_id: string;
  requirement_code?: string;
  title: string;
  description?: string;
  criticality?: Criticality;
  category?: string;
  source_reference?: string;
  source_version?: string;
  source_date?: string;
  due_date?: string;
}

export interface CreateMappingForm {
  requirement_id: string;
  mapping_type: MappingType;
  target_id: string;
  target_title?: string;
  coverage_status?: CoverageStatus;
  owner_name?: string;
  notes?: string;
}

// ============================================
// LABELS
// ============================================

export const FRAMEWORK_TYPE_LABELS: Record<FrameworkType, { fr: string; en: string; description: string }> = {
  rgpd: { fr: 'RGPD', en: 'GDPR', description: 'Protection des données personnelles' },
  ai_act: { fr: 'AI Act', en: 'AI Act', description: 'Règlement européen sur l\'IA' },
  mdr: { fr: 'MDR', en: 'MDR', description: 'Dispositifs médicaux (SaMD)' },
  ehds: { fr: 'EHDS', en: 'EHDS', description: 'Espace européen des données de santé' },
  custom: { fr: 'Personnalisé', en: 'Custom', description: 'Framework personnalisé' },
};

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, { fr: string; en: string; color: string }> = {
  not_started: { fr: 'Non commencé', en: 'Not Started', color: 'bg-muted text-muted-foreground' },
  in_progress: { fr: 'En cours', en: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  compliant: { fr: 'Conforme', en: 'Compliant', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  non_compliant: { fr: 'Non conforme', en: 'Non Compliant', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  not_applicable: { fr: 'N/A', en: 'N/A', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export const CRITICALITY_LABELS: Record<Criticality, { fr: string; en: string; color: string }> = {
  low: { fr: 'Faible', en: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { fr: 'Moyen', en: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  high: { fr: 'Élevé', en: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  critical: { fr: 'Critique', en: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

// ============================================
// HOOK
// ============================================

export function usePmoCompliance(caseId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch frameworks for a case
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['pmo-compliance-frameworks', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_compliance_frameworks' as any)
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown) as ComplianceFramework[];
    },
    enabled: !!caseId && !!user,
  });

  // Fetch requirements for all frameworks of a case
  const frameworkIds = frameworks?.map(f => f.id) || [];
  
  const { data: requirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['pmo-compliance-requirements', frameworkIds],
    queryFn: async () => {
      if (frameworkIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('pmo_compliance_requirements' as any)
        .select('*')
        .in('framework_id', frameworkIds)
        .order('criticality', { ascending: false });

      if (error) throw error;
      return (data as unknown) as ComplianceRequirement[];
    },
    enabled: frameworkIds.length > 0,
  });

  // Fetch mappings for all requirements
  const requirementIds = requirements?.map(r => r.id) || [];
  
  const { data: mappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['pmo-compliance-mappings', requirementIds],
    queryFn: async () => {
      if (requirementIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('pmo_compliance_mappings' as any)
        .select('*')
        .in('requirement_id', requirementIds);

      if (error) throw error;
      return (data as unknown) as ComplianceMapping[];
    },
    enabled: requirementIds.length > 0,
  });

  // Create framework
  const createFramework = useMutation({
    mutationFn: async (form: CreateFrameworkForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const insertData = {
        case_id: caseId,
        user_id: user.id,
        framework_type: form.framework_type,
        name: form.name,
        description: form.description || null,
        version: form.version || null,
        source_url: form.source_url || null,
        activation_questionnaire: form.activation_questionnaire || null,
        is_active: true,
        created_by: user.id,
      };
      
      const { data, error } = await supabase
        .from('pmo_compliance_frameworks' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-compliance-frameworks', caseId] });
      toast.success('Framework de conformité créé');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating framework:', error);
      toast.error('Erreur lors de la création du framework');
      setIsCreating(false);
    },
  });

  // Create requirement
  const createRequirement = useMutation({
    mutationFn: async (form: CreateRequirementForm) => {
      if (!user) throw new Error('Missing user');
      
      const insertData = {
        framework_id: form.framework_id,
        user_id: user.id,
        requirement_code: form.requirement_code || null,
        title: form.title,
        description: form.description || null,
        criticality: form.criticality || 'medium',
        category: form.category || null,
        source_reference: form.source_reference || null,
        source_version: form.source_version || null,
        source_date: form.source_date || null,
        due_date: form.due_date || null,
        status: 'not_started',
      };
      
      const { data, error } = await supabase
        .from('pmo_compliance_requirements' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-compliance-requirements'] });
      toast.success('Exigence ajoutée');
    },
    onError: (error) => {
      console.error('Error creating requirement:', error);
      toast.error('Erreur lors de l\'ajout de l\'exigence');
    },
  });

  // Update requirement status
  const updateRequirementStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequirementStatus }) => {
      const { data, error } = await supabase
        .from('pmo_compliance_requirements' as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-compliance-requirements'] });
    },
    onError: (error) => {
      console.error('Error updating requirement:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Create mapping
  const createMapping = useMutation({
    mutationFn: async (form: CreateMappingForm) => {
      if (!user) throw new Error('Missing user');
      
      const insertData = {
        requirement_id: form.requirement_id,
        user_id: user.id,
        mapping_type: form.mapping_type,
        target_id: form.target_id,
        target_title: form.target_title || null,
        coverage_status: form.coverage_status || 'partial',
        owner_name: form.owner_name || null,
        notes: form.notes || null,
      };
      
      const { data, error } = await supabase
        .from('pmo_compliance_mappings' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-compliance-mappings'] });
      toast.success('Mapping créé');
    },
    onError: (error) => {
      console.error('Error creating mapping:', error);
      toast.error('Erreur lors du mapping');
    },
  });

  // Delete framework
  const deleteFramework = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_compliance_frameworks' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-compliance-frameworks', caseId] });
      toast.success('Framework supprimé');
    },
    onError: (error) => {
      console.error('Error deleting framework:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Delete requirement
  const deleteRequirement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_compliance_requirements' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-compliance-requirements'] });
      toast.success('Exigence supprimée');
    },
    onError: (error) => {
      console.error('Error deleting requirement:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Stats and KPIs
  const stats = {
    totalFrameworks: frameworks?.length || 0,
    activeFrameworks: frameworks?.filter(f => f.is_active).length || 0,
    totalRequirements: requirements?.length || 0,
    compliantRequirements: requirements?.filter(r => r.status === 'compliant').length || 0,
    nonCompliantRequirements: requirements?.filter(r => r.status === 'non_compliant').length || 0,
    inProgressRequirements: requirements?.filter(r => r.status === 'in_progress').length || 0,
    criticalGaps: requirements?.filter(r => r.criticality === 'critical' && r.status !== 'compliant').length || 0,
    complianceRate: requirements && requirements.length > 0 
      ? Math.round((requirements.filter(r => r.status === 'compliant').length / requirements.length) * 100)
      : 0,
  };

  // Get requirements by framework
  const getRequirementsByFramework = (frameworkId: string) => 
    requirements?.filter(r => r.framework_id === frameworkId) || [];

  // Get mappings by requirement
  const getMappingsByRequirement = (requirementId: string) =>
    mappings?.filter(m => m.requirement_id === requirementId) || [];

  return {
    frameworks: frameworks || [],
    requirements: requirements || [],
    mappings: mappings || [],
    stats,
    isLoading: frameworksLoading || requirementsLoading || mappingsLoading,
    isCreating,
    createFramework: createFramework.mutate,
    createRequirement: createRequirement.mutate,
    createMapping: createMapping.mutate,
    updateRequirementStatus: updateRequirementStatus.mutate,
    deleteFramework: deleteFramework.mutate,
    deleteRequirement: deleteRequirement.mutate,
    getRequirementsByFramework,
    getMappingsByRequirement,
  };
}
