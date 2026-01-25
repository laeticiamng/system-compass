import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { 
  PmoBudgetLineRow,
  CreateBudgetLineForm,
  BudgetDashboard,
  BudgetAlert,
  ScenarioType 
} from '@/lib/pmo-types';

export function usePmoBudget(caseId: string | null, initialScenarioId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(initialScenarioId || null);

  // Fetch budget lines
  const { data: budgetLines, isLoading: linesLoading } = useQuery({
    queryKey: ['pmo-budget-lines', caseId, activeScenarioId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      let query = supabase
        .from('pmo_budget_lines')
        .select('*')
        .eq('case_id', caseId)
        .order('month_year', { ascending: true });

      if (activeScenarioId) {
        query = query.eq('scenario_id', activeScenarioId);
      } else {
        query = query.is('scenario_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!user,
  });

  // Fetch scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['pmo-budget-scenarios', caseId],
    queryFn: async () => {
      if (!caseId || !user) return [];
      
      const { data, error } = await supabase
        .from('pmo_budget_scenarios')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!user,
  });

  // Compute dashboard metrics
  const dashboard = useMemo<BudgetDashboard>(() => {
    const lines = budgetLines || [];
    
    let totalCapex = 0;
    let totalOpex = 0;
    const byCategory: Record<string, number> = {};
    const byMonth: { month: string; capex: number; opex: number }[] = [];
    const monthMap = new Map<string, { capex: number; opex: number }>();

    for (const line of lines) {
      const amount = line.amount;
      
      // Total by type
      if (line.budget_type === 'capex') {
        totalCapex += amount;
      } else {
        totalOpex += amount;
      }
      
      // By category
      byCategory[line.category] = (byCategory[line.category] || 0) + amount;
      
      // By month
      const month = line.month_year;
      if (!monthMap.has(month)) {
        monthMap.set(month, { capex: 0, opex: 0 });
      }
      const monthData = monthMap.get(month)!;
      if (line.budget_type === 'capex') {
        monthData.capex += amount;
      } else {
        monthData.opex += amount;
      }
    }

    // Convert month map to sorted array
    for (const [month, data] of Array.from(monthMap.entries()).sort()) {
      byMonth.push({ month, ...data });
    }

    // Calculate burn rate (average monthly OPEX over last 3 months)
    const recentMonths = byMonth.slice(-3);
    const monthlyBurnRate = recentMonths.length > 0
      ? recentMonths.reduce((sum, m) => sum + m.opex, 0) / recentMonths.length
      : 0;

    // Get active scenario for cash info
    const activeScenario = scenarios?.find(s => s.is_active);
    const availableCash = activeScenario?.available_cash || 500000; // Default 500k€
    
    const runwayMonths = monthlyBurnRate > 0 
      ? Math.floor(availableCash / monthlyBurnRate) 
      : 999;

    // Generate alerts
    const alerts: BudgetAlert[] = [];
    
    if (runwayMonths < 6) {
      alerts.push({
        type: 'runway_low',
        message: `Runway critique: ${runwayMonths} mois restants`,
        severity: runwayMonths < 3 ? 'critical' : 'warning',
      });
    }

    return {
      total_budget: totalCapex + totalOpex,
      total_capex: totalCapex,
      total_opex: totalOpex,
      monthly_burn_rate: monthlyBurnRate,
      runway_months: runwayMonths,
      by_category: byCategory,
      by_month: byMonth,
      alerts,
    };
  }, [budgetLines, scenarios]);

  // Create a budget line
  const createBudgetLine = useMutation({
    mutationFn: async (form: CreateBudgetLineForm) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('pmo_budget_lines')
        .insert({
          case_id: caseId,
          user_id: user.id,
          scenario_id: form.scenario_id || null,
          budget_type: form.budget_type,
          category: form.category,
          description: form.description,
          amount: form.amount,
          currency: form.currency || 'EUR',
          month_year: form.month_year,
          is_recurring: form.is_recurring || false,
          justification: form.justification || null,
          initiative_id: form.initiative_id || null,
          milestone_id: form.milestone_id || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-budget-lines', caseId] });
      toast.success('Ligne budgétaire créée');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating budget line:', error);
      toast.error('Erreur lors de la création');
      setIsCreating(false);
    },
  });

  // Update a budget line
  const updateBudgetLine = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PmoBudgetLineRow> }) => {
      const { data, error } = await supabase
        .from('pmo_budget_lines')
        .update({ ...updates, updated_by: user?.id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-budget-lines', caseId] });
      toast.success('Ligne budgétaire mise à jour');
    },
    onError: (error) => {
      console.error('Error updating budget line:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Delete a budget line
  const deleteBudgetLine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pmo_budget_lines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-budget-lines', caseId] });
      toast.success('Ligne budgétaire supprimée');
    },
    onError: (error) => {
      console.error('Error deleting budget line:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  // Create a scenario
  const createScenario = useMutation({
    mutationFn: async ({ name, type, description }: { name: string; type: ScenarioType; description?: string }) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      const { data, error } = await supabase
        .from('pmo_budget_scenarios')
        .insert({
          case_id: caseId,
          user_id: user.id,
          name,
          scenario_type: type,
          description: description || null,
          is_active: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmo-budget-scenarios', caseId] });
      toast.success('Scénario créé');
    },
    onError: (error) => {
      console.error('Error creating scenario:', error);
      toast.error('Erreur lors de la création du scénario');
    },
  });

  // Clone budget to scenario
  const cloneBudgetToScenario = useMutation({
    mutationFn: async (targetScenarioId: string) => {
      if (!caseId || !user) throw new Error('Missing case or user');
      
      // Get base budget lines (no scenario)
      const baseLines = budgetLines?.filter(l => !l.scenario_id) || [];
      
      // Clone each line to the new scenario
      const clonedLines = baseLines.map(line => ({
        case_id: caseId,
        user_id: user.id,
        scenario_id: targetScenarioId,
        budget_type: line.budget_type,
        category: line.category,
        description: line.description,
        amount: line.amount,
        currency: line.currency,
        month_year: line.month_year,
        is_recurring: line.is_recurring,
        justification: line.justification,
        initiative_id: line.initiative_id,
        milestone_id: line.milestone_id,
        created_by: user.id,
      }));

      if (clonedLines.length > 0) {
        const { error } = await supabase
          .from('pmo_budget_lines')
          .insert(clonedLines);

        if (error) throw error;
      }

      return clonedLines.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['pmo-budget-lines', caseId] });
      toast.success(`${count} lignes clonées dans le scénario`);
    },
    onError: (error) => {
      console.error('Error cloning budget:', error);
      toast.error('Erreur lors du clonage');
    },
  });

  return {
    budgetLines: budgetLines || [],
    scenarios: scenarios || [],
    dashboard,
    isLoading: linesLoading || scenariosLoading,
    isCreating,
    activeScenarioId,
    setActiveScenarioId,
    createBudgetLine: createBudgetLine.mutate,
    updateBudgetLine: updateBudgetLine.mutate,
    deleteBudgetLine: deleteBudgetLine.mutate,
    createScenario: createScenario.mutate,
    cloneScenario: cloneBudgetToScenario.mutate,
  };
}
