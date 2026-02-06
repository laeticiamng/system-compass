import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type EvidenceType = 'document' | 'link' | 'note' | 'decision' | 'extract';
export type ReliabilityLevel = 'high' | 'medium' | 'low' | 'unverified';

export interface EvidenceItem {
  id: string;
  case_id: string | null;
  user_id: string;
  evidence_type: string;
  title: string;
  content: string | null;
  url: string | null;
  source_name: string | null;
  source_date: string | null;
  reliability: string;
  tags: string[] | null;
  version: string | null;
  is_verified: boolean | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateEvidenceForm {
  evidence_type: EvidenceType;
  title: string;
  content?: string;
  url?: string;
  source_name?: string;
  source_date?: string;
  reliability: ReliabilityLevel;
  tags?: string[];
  version?: string;
}

export function usePmoEvidence(caseId: string | null) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all evidence items for a case
  const { data: evidenceItems, isLoading, error } = useQuery({
    queryKey: ['pmo-evidence', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_evidence_vault')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EvidenceItem[];
    },
    enabled: !!caseId && !!user,
  });

  // Create a new evidence item
  const createEvidence = useMutation({
    mutationFn: async (form: CreateEvidenceForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('pmo_evidence_vault')
        .insert({
          case_id: caseId,
          user_id: user.id,
          evidence_type: form.evidence_type,
          title: form.title,
          content: form.content || null,
          url: form.url || null,
          source_name: form.source_name || null,
          source_date: form.source_date || null,
          reliability: form.reliability,
          tags: form.tags || [],
          version: form.version || null,
          is_verified: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-evidence', caseId] });
      toast.success(t('toast.evidence.created', 'Preuve ajoutée avec succès'));
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating evidence:', error);
      toast.error(t('toast.error.evidence.create', 'Erreur lors de l\'ajout de la preuve'));
      setIsCreating(false);
    },
  });

  // Update an evidence item
  const updateEvidence = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EvidenceItem> }) => {
      const { data, error } = await supabase
        .from('pmo_evidence_vault')
        .update({ ...updates, updated_by: user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-evidence', caseId] });
      toast.success(t('toast.evidence.updated', 'Preuve mise à jour'));
    },
    onError: (error) => {
      console.error('Error updating evidence:', error);
      toast.error(t('toast.error.update', 'Erreur lors de la mise à jour'));
    },
  });

  // Delete an evidence item
  const deleteEvidence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_evidence_vault')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-evidence', caseId] });
      toast.success(t('toast.evidence.deleted', 'Preuve supprimée'));
    },
    onError: (error) => {
      console.error('Error deleting evidence:', error);
      toast.error(t('toast.error.delete', 'Erreur lors de la suppression'));
    },
  });

  // Verify an evidence item
  const verifyEvidence = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pmo_evidence_vault')
        .update({
          is_verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-evidence', caseId] });
      toast.success(t('toast.evidence.verified', 'Preuve vérifiée'));
    },
    onError: (error) => {
      console.error('Error verifying evidence:', error);
      toast.error(t('toast.error.evidence.verify', 'Erreur lors de la vérification'));
    },
  });

  // Stats
  const stats = {
    total: evidenceItems?.length || 0,
    verified: evidenceItems?.filter(e => e.is_verified).length || 0,
    byType: {
      document: evidenceItems?.filter(e => e.evidence_type === 'document').length || 0,
      link: evidenceItems?.filter(e => e.evidence_type === 'link').length || 0,
      note: evidenceItems?.filter(e => e.evidence_type === 'note').length || 0,
      decision: evidenceItems?.filter(e => e.evidence_type === 'decision').length || 0,
      extract: evidenceItems?.filter(e => e.evidence_type === 'extract').length || 0,
    },
  };

  return {
    evidenceItems: evidenceItems || [],
    stats,
    isLoading,
    error,
    isCreating,
    createEvidence: createEvidence.mutate,
    updateEvidence: updateEvidence.mutate,
    deleteEvidence: deleteEvidence.mutate,
    verifyEvidence: verifyEvidence.mutate,
  };
}
