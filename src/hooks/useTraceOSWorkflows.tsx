import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';


interface WorkflowStep {
  order: number;
  name: string;
  required_approvers: number;
  type: 'approval' | 'signature' | 'review';
}

interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Approval {
  id: string;
  decision_id: string;
  workflow_id: string | null;
  step_order: number;
  step_name: string;
  approver_id: string | null;
  approver_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  signature_hash: string | null;
  comment: string | null;
  approved_at: string | null;
  created_at: string;
}

export function useTraceOSWorkflows() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('traceos_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(w => ({
        ...w,
        steps: (w.steps as unknown as WorkflowStep[]) || []
      }));
      
      setWorkflows(typedData);
    } catch (err) {
      // Silent fail for workflows fetching
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createWorkflow = useCallback(async (
    name: string,
    description: string,
    steps: WorkflowStep[]
  ): Promise<Workflow | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('traceos_workflows')
        .insert([{
          user_id: user.id,
          name,
          description,
          steps: JSON.parse(JSON.stringify(steps)),
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchWorkflows();
      toast.success(t('toast.workflow.created', 'Workflow créé avec succès'));
      return {
        ...data,
        steps: (data.steps as unknown as WorkflowStep[]) || []
      };
    } catch (err) {
      toast.error(t('toast.error.workflow.create', 'Erreur lors de la création du workflow'));
      return null;
    }
  }, [user, fetchWorkflows]);

  const deleteWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_workflows')
        .delete()
        .eq('id', workflowId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWorkflows();
      toast.success(t('toast.workflow.deleted', 'Workflow supprimé'));
      return true;
    } catch (err) {
      toast.error(t('toast.error.delete', 'Erreur lors de la suppression'));
      return false;
    }
  }, [user, fetchWorkflows]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    loading,
    createWorkflow,
    deleteWorkflow,
    refreshWorkflows: fetchWorkflows,
  };
}

export function useTraceOSApprovals(decisionId?: string) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    if (!user || !decisionId) {
      setApprovals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('traceos_approvals')
        .select('*')
        .eq('decision_id', decisionId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      setApprovals((data || []) as Approval[]);
    } catch (err) {
      // Silent fail for approvals fetching
    } finally {
      setLoading(false);
    }
  }, [user, decisionId]);

  const startWorkflow = useCallback(async (
    workflowId: string,
    targetDecisionId: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get workflow steps
      const { data: workflow, error: workflowError } = await supabase
        .from('traceos_workflows')
        .select('steps')
        .eq('id', workflowId)
        .single();

      if (workflowError || !workflow) throw workflowError;

      const steps = workflow.steps as unknown as WorkflowStep[];

      // Create approval entries for each step
      const approvalEntries = steps.map(step => ({
        decision_id: targetDecisionId,
        workflow_id: workflowId,
        step_order: step.order,
        step_name: step.name,
        status: 'pending',
      }));

      const { error } = await supabase
        .from('traceos_approvals')
        .insert(approvalEntries);

      if (error) throw error;

      await fetchApprovals();
      toast.success(t('toast.workflow.approvalStarted', 'Workflow d\'approbation démarré'));
      return true;
    } catch (err) {
      toast.error(t('toast.error.workflow.start', 'Erreur lors du démarrage du workflow'));
      return false;
    }
  }, [user, fetchApprovals]);

  const approveStep = useCallback(async (
    approvalId: string,
    comment?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Generate a simple signature hash
      const signatureHash = btoa(`${user.id}-${approvalId}-${Date.now()}`);

      const { error } = await supabase
        .from('traceos_approvals')
        .update({
          status: 'approved',
          approver_id: user.id,
          approver_name: user.email?.split('@')[0] || 'Utilisateur',
          signature_hash: signatureHash,
          comment,
          approved_at: new Date().toISOString(),
        })
        .eq('id', approvalId);

      if (error) throw error;

      await fetchApprovals();
      toast.success(t('toast.workflow.stepApproved', 'Étape approuvée avec signature électronique'));
      return true;
    } catch (err) {
      toast.error(t('toast.error.workflow.approve', 'Erreur lors de l\'approbation'));
      return false;
    }
  }, [user, fetchApprovals]);

  const rejectStep = useCallback(async (
    approvalId: string,
    comment: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_approvals')
        .update({
          status: 'rejected',
          approver_id: user.id,
          approver_name: user.email?.split('@')[0] || 'Utilisateur',
          comment,
          approved_at: new Date().toISOString(),
        })
        .eq('id', approvalId);

      if (error) throw error;

      await fetchApprovals();
      toast.success(t('toast.workflow.stepRejected', 'Étape rejetée'));
      return true;
    } catch (err) {
      toast.error(t('toast.error.workflow.reject', 'Erreur lors du rejet'));
      return false;
    }
  }, [user, fetchApprovals]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  return {
    approvals,
    loading,
    startWorkflow,
    approveStep,
    rejectStep,
    refreshApprovals: fetchApprovals,
  };
}
