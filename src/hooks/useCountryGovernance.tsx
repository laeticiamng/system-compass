import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface GovernanceScore {
  id: string;
  country_id: string;
  stability_score: number;
  friction_score: number;
  operational_score: number;
  capture_risk_score: number;
  ecosystem_score: number;
  stability_notes: string | null;
  friction_notes: string | null;
  operational_notes: string | null;
  capture_risk_notes: string | null;
  ecosystem_notes: string | null;
  state_of_art: Array<{ id: string; label: string; checked: boolean; notes?: string }>;
  attractiveness: {
    demand?: number;
    easeOfDoing?: number;
    marketAccess?: number;
    localDynamics?: number;
    signals?: string[];
  };
  friction_risks: {
    redFlags: Array<{ id: string; label: string; severity: 'low' | 'medium' | 'high' }>;
    protections: Array<{ id: string; label: string; implemented: boolean }>;
  };
  competition: Array<{
    name: string;
    type: string;
    implantation: string;
    maturity: string;
    notes?: string;
  }>;
  fiscal_checklist: Array<{ id: string; label: string; checked: boolean; critical: boolean }>;
  customs_logistics: Array<{ id: string; label: string; checked: boolean; riskLevel: 'low' | 'medium' | 'high' }>;
  created_at: string;
  updated_at: string;
}

export interface UserGovernanceNotes {
  id: string;
  user_id: string;
  country_id: string;
  partner_reliability: Array<{
    name: string;
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
  poc_plan: {
    hypothesis?: string;
    maxBudget?: number;
    duration?: string;
    successCriteria?: string[];
    stopCriteria?: string[];
  };
  timeline_scenarios: {
    optimistic: { months: number; notes?: string } | null;
    realistic: { months: number; notes?: string } | null;
    pessimistic: { months: number; notes?: string } | null;
    buffer?: number;
    cashflowRisks?: string[];
  };
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
  risk_register: Array<{
    id: string;
    category: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    protections: string[];
    status: 'open' | 'mitigated' | 'accepted';
  }>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Données par défaut pour les pays sans données en DB
const getDefaultGovernanceData = (countryId: string, pyramidType?: string): Partial<GovernanceScore> => {
  const baseScores: Record<string, { stability: number; friction: number; operational: number; capture: number; ecosystem: number }> = {
    'COMPETENCE_TRUST': { stability: 4, friction: 4, operational: 4, capture: 4, ecosystem: 4 },
    'STABILITY_REDIS': { stability: 4, friction: 3, operational: 3, capture: 3, ecosystem: 3 },
    'GROWTH_RISK': { stability: 3, friction: 3, operational: 4, capture: 3, ecosystem: 4 },
    'HYBRID_TRANSITION': { stability: 3, friction: 3, operational: 3, capture: 3, ecosystem: 3 },
    'PROBLEM_RENT': { stability: 2, friction: 2, operational: 2, capture: 2, ecosystem: 2 },
    'RESOURCE_EXTRACTION': { stability: 2, friction: 2, operational: 2, capture: 2, ecosystem: 2 },
  };

  const scores = baseScores[pyramidType || 'HYBRID_TRANSITION'] || baseScores['HYBRID_TRANSITION'];

  return {
    country_id: countryId,
    stability_score: scores.stability,
    friction_score: scores.friction,
    operational_score: scores.operational,
    capture_risk_score: scores.capture,
    ecosystem_score: scores.ecosystem,
    state_of_art: [
      { id: 'legal', label: 'Cadre juridique', checked: false },
      { id: 'market', label: 'Étude de marché', checked: false },
      { id: 'culture', label: 'Codes culturels', checked: false },
      { id: 'admin', label: 'Processus administratifs', checked: false },
      { id: 'network', label: 'Réseau local', checked: false },
    ],
    attractiveness: { demand: 3, easeOfDoing: 3, marketAccess: 3, localDynamics: 3, signals: [] },
    friction_risks: { redFlags: [], protections: [] },
    competition: [],
    fiscal_checklist: [
      { id: 'tax_regime', label: 'Régime fiscal identifié', checked: false, critical: true },
      { id: 'vat', label: 'TVA / Taxes indirectes', checked: false, critical: true },
      { id: 'treaties', label: 'Conventions fiscales', checked: false, critical: false },
      { id: 'transfer_pricing', label: 'Prix de transfert', checked: false, critical: false },
      { id: 'local_taxes', label: 'Taxes locales', checked: false, critical: false },
    ],
    customs_logistics: [
      { id: 'import_codes', label: 'Codes douaniers', checked: false, riskLevel: 'medium' },
      { id: 'delays', label: 'Délais moyens vérifiés', checked: false, riskLevel: 'high' },
      { id: 'dependencies', label: 'Dépendances logistiques', checked: false, riskLevel: 'high' },
      { id: 'certifications', label: 'Certifications requises', checked: false, riskLevel: 'medium' },
    ],
  };
};

export function useCountryGovernance(countryId: string, pyramidType?: string) {
  const { data: governance, isLoading } = useQuery({
    queryKey: ['country-governance', countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country_governance')
        .select('*')
        .eq('country_id', countryId)
        .maybeSingle();

      if (error) throw error;
      
      // Si pas de données, retourner les valeurs par défaut
      if (!data) {
        return getDefaultGovernanceData(countryId, pyramidType) as GovernanceScore;
      }

      return data as unknown as GovernanceScore;
    },
    enabled: !!countryId,
  });

  return {
    governance,
    isLoading,
    averageScore: governance 
      ? ((governance.stability_score + governance.friction_score + governance.operational_score + governance.capture_risk_score + governance.ecosystem_score) / 5)
      : 3,
  };
}

export function useUserGovernanceNotes(countryId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['user-governance-notes', countryId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_governance_notes')
        .select('*')
        .eq('country_id', countryId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as UserGovernanceNotes | null;
    },
    enabled: !!countryId && !!user,
  });

  const saveNotes = useMutation({
    mutationFn: async (updates: Partial<UserGovernanceNotes>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_governance_notes')
        .upsert({
          user_id: user.id,
          country_id: countryId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,country_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-governance-notes', countryId, user?.id] });
    },
  });

  return {
    notes,
    isLoading,
    saveNotes: saveNotes.mutate,
    isSaving: saveNotes.isPending,
  };
}
