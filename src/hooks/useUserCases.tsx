import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type CaseIntention = 'relocation' | 'entrepreneurship';
export type CaseStatus = 'draft' | 'active' | 'archived' | 'completed';
export type TimelineScenario = 'optimistic' | 'realistic' | 'pessimistic';

export interface UserCase {
  id: string;
  user_id: string;
  country_id: string;
  title: string;
  intention: CaseIntention;
  status: CaseStatus;
  timeline_scenario: TimelineScenario;
  estimated_start_date: string | null;
  target_completion_date: string | null;
  budget_buffer_percent: number;
  
  // LIGHT (relocation)
  clarifications_done: Array<{ id: string; label: string; verified_at?: string }>;
  clarifications_pending: Array<{ id: string; label: string; priority: 'low' | 'medium' | 'high' }>;
  red_flags_acknowledged: Array<{ id: string; label: string; acknowledged_at?: string }>;
  admin_checklist: Array<{ id: string; label: string; checked: boolean; deadline?: string }>;
  
  // DEEP (entrepreneurship)
  poc_hypothesis: string | null;
  poc_budget: number | null;
  poc_duration: string | null;
  poc_success_criteria: string[];
  poc_stop_criteria: string[];
  risk_register: Array<{
    id: string;
    category: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    status: 'open' | 'mitigated' | 'accepted';
  }>;
  governance_map: Array<{
    id: string;
    name: string;
    role: string;
    level: 'official' | 'influential' | 'blocking';
    power: 'sign' | 'block' | 'access';
    reliability: 1 | 2 | 3 | 4 | 5;
    notes?: string;
    isRedFlag?: boolean;
  }>;
  partners_vetted: Array<{
    id: string;
    name: string;
    type: string;
    criteria: {
      terrain: boolean;
      references: boolean;
      transparency: boolean;
      alignment: boolean;
      capacity: boolean;
    };
    status: 'unverified' | 'in_progress' | 'verified';
    notes?: string;
  }>;
  anti_copy_checklist: Array<{ id: string; label: string; protected: boolean }>;
  cash_reality: {
    capex_estimated?: number;
    capex_buffer_multiplier?: number;
    opex_monthly?: number;
    payment_delays_days?: number;
    runway_months?: number;
  };
  
  // Milestones
  milestones: Array<{
    id: string;
    title: string;
    deadline?: string;
    completed: boolean;
    completed_at?: string;
    type: 'clarification' | 'admin' | 'poc' | 'risk' | 'partner' | 'custom';
  }>;
  
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  country_id: string;
  title: string;
  intention: CaseIntention;
}

export function useUserCases() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['user-cases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as unknown as UserCase[];
    },
    enabled: !!user,
  });

  const createCase = useMutation({
    mutationFn: async (input: CreateCaseInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_cases')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Increment B2B usage
      await supabase.rpc('increment_b2b_usage', {
        p_user_id: user.id,
        p_metric: 'cases_created',
        p_increment: 1,
      });

      return data as unknown as UserCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cases', user?.id] });
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserCase> }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_cases')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cases', user?.id] });
    },
  });

  const deleteCase = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_cases')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cases', user?.id] });
    },
  });

  return {
    cases: cases || [],
    isLoading,
    createCase: createCase.mutate,
    updateCase: updateCase.mutate,
    deleteCase: deleteCase.mutate,
    isCreating: createCase.isPending,
    isUpdating: updateCase.isPending,
  };
}

export function useUserCase(caseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['user-case', caseId],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_cases')
        .select('*')
        .eq('id', caseId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as unknown as UserCase;
    },
    enabled: !!user && !!caseId,
  });

  const updateCase = useMutation({
    mutationFn: async (updates: Partial<UserCase>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_cases')
        .update(updates)
        .eq('id', caseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['user-cases', user?.id] });
    },
  });

  return {
    caseData,
    isLoading,
    updateCase: updateCase.mutate,
    isUpdating: updateCase.isPending,
  };
}

// Helpers pour déterminer la profondeur
export function isDeepMode(intention: CaseIntention): boolean {
  return intention === 'entrepreneurship';
}

export function isLightMode(intention: CaseIntention): boolean {
  return intention === 'relocation';
}
