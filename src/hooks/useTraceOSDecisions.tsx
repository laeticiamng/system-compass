import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DecisionNodeData } from '@/components/institutions/DecisionNode';

interface DBDecision {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  context: string;
  main_hypothesis: string;
  alternative_hypotheses: string[];
  constraints: string[];
  decision: string;
  author: string;
  scope: string;
  status: 'pending' | 'validated' | 'abandoned';
  abandoned_branches: { title: string; reason: string }[];
  decision_date: string;
  created_at: string;
  updated_at: string;
}

// Convert DB format to UI format
function dbToUIDecision(dbDecision: DBDecision, children: DecisionNodeData[] = []): DecisionNodeData {
  return {
    id: dbDecision.id,
    title: dbDecision.title,
    context: dbDecision.context,
    mainHypothesis: dbDecision.main_hypothesis,
    alternativeHypotheses: dbDecision.alternative_hypotheses || [],
    constraints: dbDecision.constraints || [],
    decision: dbDecision.decision,
    date: dbDecision.decision_date,
    author: dbDecision.author,
    scope: dbDecision.scope,
    status: dbDecision.status,
    abandonedBranches: dbDecision.abandoned_branches || [],
    children
  };
}

// Build tree structure from flat list
function buildDecisionTree(decisions: DBDecision[]): DecisionNodeData[] {
  const decisionMap = new Map<string, DecisionNodeData>();
  const rootDecisions: DecisionNodeData[] = [];

  // First pass: create all nodes
  decisions.forEach(d => {
    decisionMap.set(d.id, dbToUIDecision(d, []));
  });

  // Second pass: build tree structure
  decisions.forEach(d => {
    const node = decisionMap.get(d.id)!;
    if (d.parent_id && decisionMap.has(d.parent_id)) {
      const parent = decisionMap.get(d.parent_id)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      rootDecisions.push(node);
    }
  });

  // Sort by date descending
  rootDecisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return rootDecisions;
}

export function useTraceOSDecisions() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<DecisionNodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all decisions for the user
  const fetchDecisions = useCallback(async () => {
    if (!user) {
      setDecisions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('traceos_decisions')
        .select('*')
        .eq('user_id', user.id)
        .order('decision_date', { ascending: false });

      if (fetchError) throw fetchError;

      const tree = buildDecisionTree((data || []) as DBDecision[]);
      setDecisions(tree);
      setError(null);
    } catch (err) {
      console.error('Error fetching decisions:', err);
      setError('Failed to fetch decisions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new decision
  const createDecision = useCallback(async (
    decision: Omit<DecisionNodeData, 'id' | 'children'>,
    parentId?: string
  ): Promise<DecisionNodeData | null> => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer une décision');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('traceos_decisions')
        .insert({
          user_id: user.id,
          parent_id: parentId || null,
          title: decision.title,
          context: decision.context,
          main_hypothesis: decision.mainHypothesis,
          alternative_hypotheses: decision.alternativeHypotheses,
          constraints: decision.constraints,
          decision: decision.decision,
          author: decision.author,
          scope: decision.scope,
          status: decision.status,
          abandoned_branches: decision.abandonedBranches || [],
          decision_date: decision.date
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchDecisions();
      toast.success('Décision enregistrée');
      return dbToUIDecision(data as DBDecision);
    } catch (err) {
      console.error('Error creating decision:', err);
      toast.error('Erreur lors de la création de la décision');
      return null;
    }
  }, [user, fetchDecisions]);

  // Update an existing decision
  const updateDecision = useCallback(async (
    id: string,
    updates: Partial<Omit<DecisionNodeData, 'id' | 'children'>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.context) updateData.context = updates.context;
      if (updates.mainHypothesis) updateData.main_hypothesis = updates.mainHypothesis;
      if (updates.alternativeHypotheses) updateData.alternative_hypotheses = updates.alternativeHypotheses;
      if (updates.constraints) updateData.constraints = updates.constraints;
      if (updates.decision) updateData.decision = updates.decision;
      if (updates.author) updateData.author = updates.author;
      if (updates.scope) updateData.scope = updates.scope;
      if (updates.status) updateData.status = updates.status;
      if (updates.abandonedBranches) updateData.abandoned_branches = updates.abandonedBranches;
      if (updates.date) updateData.decision_date = updates.date;

      const { error: updateError } = await supabase
        .from('traceos_decisions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchDecisions();
      toast.success('Décision mise à jour');
      return true;
    } catch (err) {
      console.error('Error updating decision:', err);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  }, [user, fetchDecisions]);

  // Delete a decision
  const deleteDecision = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('traceos_decisions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      await fetchDecisions();
      toast.success('Décision supprimée');
      return true;
    } catch (err) {
      console.error('Error deleting decision:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [user, fetchDecisions]);

  // Initial fetch
  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  return {
    decisions,
    loading,
    error,
    createDecision,
    updateDecision,
    deleteDecision,
    refreshDecisions: fetchDecisions,
    isLoggedIn: !!user
  };
}
