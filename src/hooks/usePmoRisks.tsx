import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { 
  PmoRiskRow,
  CreateRiskForm,
  RiskStatus,
  RiskDashboard,
} from '@/lib/pmo-types';

export function usePmoRisks(caseId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all risks for a case
  const { data: risks, isLoading, error } = useQuery({
    queryKey: ['pmo-risks', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_risk_register')
        .select('*')
        .eq('case_id', caseId)
        .order('score', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!user,
  });

  // Compute dashboard metrics
  const dashboard = useMemo<RiskDashboard>(() => {
    const riskList = risks || [];
    const today = new Date().toISOString().split('T')[0];
    
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    let critical = 0;
    let noOwner = 0;
    let noMitigation = 0;
    let overdueReviews = 0;

    for (const risk of riskList) {
      // Count by category
      byCategory[risk.category] = (byCategory[risk.category] || 0) + 1;
      
      // Count by status
      byStatus[risk.status] = (byStatus[risk.status] || 0) + 1;
      
      // Critical risks (score >= 16)
      if (risk.score && risk.score >= 16) critical++;
      
      // Risks without owner
      if (!risk.owner_id) noOwner++;
      
      // Risks without mitigation
      if (!risk.mitigation_plan) noMitigation++;
      
      // Overdue reviews
      if (risk.next_review_date && risk.next_review_date < today && risk.status !== 'closed') {
        overdueReviews++;
      }
    }

    return {
      total_risks: riskList.length,
      critical_risks: critical,
      risks_without_owner: noOwner,
      risks_without_mitigation: noMitigation,
      overdue_reviews: overdueReviews,
      by_category: byCategory,
      by_status: byStatus,
    };
  }, [risks]);

  // Create a new risk
  const createRisk = useMutation({
    mutationFn: async (form: CreateRiskForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const score = form.impact * form.probability;
      
      const { data, error } = await supabase
        .from('pmo_risk_register')
        .insert({
          case_id: caseId,
          user_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          cause: form.cause || null,
          impact: form.impact,
          probability: form.probability,
          score: score,
          mitigation_plan: form.mitigation_plan || null,
          contingency_plan: form.contingency_plan || null,
          next_review_date: form.next_review_date || null,
          escalation_threshold: 16,
          status: 'identified' as RiskStatus,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-risks', caseId] });
      toast.success('Risque créé avec succès');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating risk:', error);
      toast.error('Erreur lors de la création du risque');
      setIsCreating(false);
    },
  });

  // Update a risk
  const updateRisk = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PmoRiskRow> }) => {
      // Recalculate score if impact/probability change
      let finalUpdates = { ...updates, updated_by: user?.id };
      if (updates.impact !== undefined || updates.probability !== undefined) {
        const currentRisk = risks?.find(r => r.id === id);
        if (currentRisk) {
          const impact = updates.impact ?? currentRisk.impact;
          const probability = updates.probability ?? currentRisk.probability;
          finalUpdates.score = impact * probability;
        }
      }

      const { data, error } = await supabase
        .from('pmo_risk_register')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-risks', caseId] });
      toast.success('Risque mis à jour');
    },
    onError: (error) => {
      console.error('Error updating risk:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete a risk
  const deleteRisk = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_risk_register')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-risks', caseId] });
      toast.success('Risque supprimé');
    },
    onError: (error) => {
      console.error('Error deleting risk:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Create initiative from risk (mitigation action)
  const createInitiativeFromRisk = useMutation({
    mutationFn: async (riskId: string) => {
      const risk = risks?.find(r => r.id === riskId);
      if (!risk || !caseId || !user) throw new Error('Risk not found');

      // Create an initiative linked to this risk
      const { data: initiative, error: initError } = await supabase
        .from('pmo_initiatives')
        .insert({
          objective_id: null,
          case_id: caseId,
          user_id: user.id,
          title: `Atténuation: ${risk.title}`,
          description: risk.mitigation_plan || `Plan d'atténuation pour le risque: ${risk.description}`,
          status: 'todo',
          created_by: user.id,
        })
        .select()
        .single();

      if (initError) throw initError;

      // Update risk status
      await supabase
        .from('pmo_risk_register')
        .update({ 
          status: 'mitigating' as RiskStatus,
          updated_by: user.id 
        })
        .eq('id', riskId);

      return initiative;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-risks', caseId] });
      queryClient.invalidateQueries({ queryKey: ['pmo-initiatives', caseId] });
      toast.success('Initiative de mitigation créée');
    },
    onError: (error) => {
      console.error('Error creating initiative from risk:', error);
      toast.error('Erreur lors de la création de l\'initiative');
    },
  });

  return {
    risks: risks || [],
    kpis: dashboard,
    dashboard,
    isLoading,
    error,
    isCreating,
    createRisk: createRisk.mutate,
    updateRisk: updateRisk.mutate,
    deleteRisk: deleteRisk.mutate,
    addReview: () => {}, // Placeholder for future implementation
    createInitiativeFromRisk: createInitiativeFromRisk.mutate,
  };
}
