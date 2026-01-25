// PMO Module Types - Aligned with Supabase Schema
// Uses case_id (user_cases table) as the anchor point

import type { Database } from '@/integrations/supabase/types';

// ============================================
// TYPE ALIASES FROM DATABASE
// ============================================

export type PmoObjectiveRow = Database['public']['Tables']['pmo_objectives']['Row'];
export type PmoObjectiveInsert = Database['public']['Tables']['pmo_objectives']['Insert'];
export type PmoObjectiveUpdate = Database['public']['Tables']['pmo_objectives']['Update'];

export type PmoInitiativeRow = Database['public']['Tables']['pmo_initiatives']['Row'];
export type PmoInitiativeInsert = Database['public']['Tables']['pmo_initiatives']['Insert'];
export type PmoInitiativeUpdate = Database['public']['Tables']['pmo_initiatives']['Update'];

export type PmoMilestoneRow = Database['public']['Tables']['pmo_milestones']['Row'];
export type PmoMilestoneInsert = Database['public']['Tables']['pmo_milestones']['Insert'];
export type PmoMilestoneUpdate = Database['public']['Tables']['pmo_milestones']['Update'];

export type PmoDependencyRow = Database['public']['Tables']['pmo_dependencies']['Row'];
export type PmoDependencyInsert = Database['public']['Tables']['pmo_dependencies']['Insert'];

export type PmoRiskRow = Database['public']['Tables']['pmo_risk_register']['Row'];
export type PmoRiskInsert = Database['public']['Tables']['pmo_risk_register']['Insert'];
export type PmoRiskUpdate = Database['public']['Tables']['pmo_risk_register']['Update'];

export type PmoRiskReviewRow = Database['public']['Tables']['pmo_risk_reviews']['Row'];
export type PmoRiskReviewInsert = Database['public']['Tables']['pmo_risk_reviews']['Insert'];

export type PmoBudgetLineRow = Database['public']['Tables']['pmo_budget_lines']['Row'];
export type PmoBudgetLineInsert = Database['public']['Tables']['pmo_budget_lines']['Insert'];
export type PmoBudgetLineUpdate = Database['public']['Tables']['pmo_budget_lines']['Update'];

export type PmoBudgetScenarioRow = Database['public']['Tables']['pmo_budget_scenarios']['Row'];
export type PmoBudgetScenarioInsert = Database['public']['Tables']['pmo_budget_scenarios']['Insert'];
export type PmoBudgetScenarioUpdate = Database['public']['Tables']['pmo_budget_scenarios']['Update'];

export type PmoGeneratedPackRow = Database['public']['Tables']['pmo_generated_packs']['Row'];
export type PmoGeneratedPackInsert = Database['public']['Tables']['pmo_generated_packs']['Insert'];

// ============================================
// ENUM-LIKE TYPES
// ============================================

export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type ObjectivePriority = 'low' | 'medium' | 'high' | 'critical';
export type ObjectiveHorizon = 30 | 90 | 180 | 365;

export type InitiativeStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'missed';
export type RiskStatus = 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed' | 'escalated';
export type ReviewDecision = 'accept' | 'mitigate' | 'escalate' | 'transfer' | 'close';

export type RiskCategory = 
  | 'strategy' 
  | 'finance' 
  | 'technical' 
  | 'product' 
  | 'legal' 
  | 'security' 
  | 'operational' 
  | 'hr_vendors';

export type BudgetType = 'capex' | 'opex';
export type BudgetCategory = 
  | 'hr' 
  | 'contractors' 
  | 'cloud' 
  | 'compliance' 
  | 'marketing' 
  | 'legal' 
  | 'office' 
  | 'travel' 
  | 'tools' 
  | 'other';

export type ScenarioType = 'base' | 'optimistic' | 'constrained';
export type PackType = 'b2c_simple' | 'b2b_comex' | 'investor' | 'compliance_audit';

// ============================================
// FORM TYPES
// ============================================

export interface CreateObjectiveForm {
  title: string;
  description?: string;
  priority: ObjectivePriority;
  horizon_days: ObjectiveHorizon;
  success_metrics?: string[];
  target_date?: string;
}

export interface CreateInitiativeForm {
  objective_id?: string;
  title: string;
  description?: string;
  effort_estimate?: string;
  value_expected?: string;
  target_date?: string;
}

export interface CreateMilestoneForm {
  initiative_id?: string;
  objective_id?: string;
  title: string;
  description?: string;
  target_date: string;
  validation_criteria?: string[];
  deliverables?: string[];
}

export interface CreateRiskForm {
  title: string;
  description: string;
  category: RiskCategory;
  cause?: string;
  impact: number;
  probability: number;
  mitigation_plan?: string;
  contingency_plan?: string;
  next_review_date?: string;
}

export interface CreateBudgetLineForm {
  scenario_id?: string;
  budget_type: BudgetType;
  category: BudgetCategory;
  description: string;
  amount: number;
  currency?: string;
  month_year: string;
  is_recurring?: boolean;
  justification?: string;
  initiative_id?: string;
  milestone_id?: string;
}

// ============================================
// DASHBOARD/AGGREGATE TYPES
// ============================================

export interface RiskDashboard {
  total_risks: number;
  critical_risks: number;
  risks_without_owner: number;
  risks_without_mitigation: number;
  overdue_reviews: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
}

export interface BudgetDashboard {
  total_budget: number;
  total_capex: number;
  total_opex: number;
  monthly_burn_rate: number;
  runway_months: number;
  by_category: Record<string, number>;
  by_month: { month: string; capex: number; opex: number }[];
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  type: 'runway_low' | 'budget_exceeded' | 'milestone_unfunded';
  message: string;
  severity: 'warning' | 'critical';
  related_id?: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function calculateRiskScore(impact: number, probability: number): number {
  return impact * probability;
}

export function getRiskSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 16) return 'high';
  return 'critical';
}

export function formatBudgetAmount(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateRunway(
  availableCash: number,
  monthlyBurnRate: number
): number {
  if (monthlyBurnRate <= 0) return 999;
  return Math.floor(availableCash / monthlyBurnRate);
}

// ============================================
// LABELS (B2C/B2B friendly)
// ============================================

export const RISK_CATEGORY_LABELS: Record<RiskCategory, { fr: string; en: string }> = {
  strategy: { fr: 'Stratégie', en: 'Strategy' },
  finance: { fr: 'Finance', en: 'Finance' },
  technical: { fr: 'Technique', en: 'Technical' },
  product: { fr: 'Produit', en: 'Product' },
  legal: { fr: 'Légal/Réglementaire', en: 'Legal/Regulatory' },
  security: { fr: 'Sécurité', en: 'Security' },
  operational: { fr: 'Opérationnel', en: 'Operational' },
  hr_vendors: { fr: 'RH/Fournisseurs', en: 'HR/Vendors' },
};

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, { fr: string; en: string }> = {
  hr: { fr: 'Ressources Humaines', en: 'Human Resources' },
  contractors: { fr: 'Prestataires', en: 'Contractors' },
  cloud: { fr: 'Cloud/Infra', en: 'Cloud/Infrastructure' },
  compliance: { fr: 'Conformité', en: 'Compliance' },
  marketing: { fr: 'Marketing', en: 'Marketing' },
  legal: { fr: 'Juridique', en: 'Legal' },
  office: { fr: 'Bureaux', en: 'Office' },
  travel: { fr: 'Déplacements', en: 'Travel' },
  tools: { fr: 'Outils/Licences', en: 'Tools/Licenses' },
  other: { fr: 'Autres', en: 'Other' },
};

export const PRIORITY_LABELS: Record<ObjectivePriority, { fr: string; en: string; color: string }> = {
  low: { fr: 'Faible', en: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { fr: 'Moyen', en: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  high: { fr: 'Élevé', en: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  critical: { fr: 'Critique', en: 'Critical', color: 'bg-destructive/10 text-destructive' },
};

export const OBJECTIVE_STATUS_LABELS: Record<ObjectiveStatus, { fr: string; en: string }> = {
  draft: { fr: 'Brouillon', en: 'Draft' },
  active: { fr: 'En cours', en: 'Active' },
  completed: { fr: 'Terminé', en: 'Completed' },
  cancelled: { fr: 'Annulé', en: 'Cancelled' },
};

export const INITIATIVE_STATUS_LABELS: Record<InitiativeStatus, { fr: string; en: string }> = {
  todo: { fr: 'À faire', en: 'To Do' },
  in_progress: { fr: 'En cours', en: 'In Progress' },
  blocked: { fr: 'Bloqué', en: 'Blocked' },
  done: { fr: 'Fait', en: 'Done' },
  cancelled: { fr: 'Annulé', en: 'Cancelled' },
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, { fr: string; en: string }> = {
  pending: { fr: 'En attente', en: 'Pending' },
  in_progress: { fr: 'En cours', en: 'In Progress' },
  completed: { fr: 'Atteint', en: 'Completed' },
  missed: { fr: 'Manqué', en: 'Missed' },
};

export const RISK_STATUS_LABELS: Record<RiskStatus, { fr: string; en: string }> = {
  identified: { fr: 'Identifié', en: 'Identified' },
  analyzing: { fr: 'En analyse', en: 'Analyzing' },
  mitigating: { fr: 'En atténuation', en: 'Mitigating' },
  monitoring: { fr: 'Sous surveillance', en: 'Monitoring' },
  closed: { fr: 'Fermé', en: 'Closed' },
  escalated: { fr: 'Escaladé', en: 'Escalated' },
};

export const SCENARIO_TYPE_LABELS: Record<ScenarioType, { fr: string; en: string }> = {
  base: { fr: 'Base', en: 'Base' },
  optimistic: { fr: 'Optimiste', en: 'Optimistic' },
  constrained: { fr: 'Contraint', en: 'Constrained' },
};
