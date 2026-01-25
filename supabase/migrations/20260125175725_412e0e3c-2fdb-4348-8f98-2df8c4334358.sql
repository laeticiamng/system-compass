-- =============================================================================
-- PMO PHASE 1: Roadmap OS + Risk Engine + Budget & Runway
-- Schema for execution-focused project management
-- =============================================================================

-- 1. OBJECTIVES TABLE (OKRs / Simple objectives)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  org_id UUID, -- For B2B multi-org support
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  horizon_days INTEGER NOT NULL DEFAULT 90 CHECK (horizon_days IN (30, 90, 180, 365)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled')),
  
  -- Success metrics
  success_metrics JSONB DEFAULT '[]'::jsonb, -- [{metric, target, current, unit}]
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  -- Dates
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Traceability
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. INITIATIVES TABLE (linked to objectives)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES public.pmo_objectives(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID, -- Assigned owner
  owner_name TEXT, -- Display name for non-users
  
  -- Effort & Value
  effort_estimate TEXT CHECK (effort_estimate IN ('xs', 's', 'm', 'l', 'xl')),
  effort_days INTEGER,
  value_expected TEXT CHECK (value_expected IN ('low', 'medium', 'high', 'critical')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'planned', 'in_progress', 'blocked', 'review', 'done', 'cancelled')),
  blocked_reason TEXT,
  
  -- Dates
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Traceability
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. MILESTONES TABLE (key dates with deliverables)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  objective_id UUID REFERENCES public.pmo_objectives(id) ON DELETE SET NULL,
  initiative_id UUID REFERENCES public.pmo_initiatives(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  
  -- Validation
  target_date DATE NOT NULL,
  validation_criteria JSONB DEFAULT '[]'::jsonb, -- [{criterion, validated: bool}]
  deliverables JSONB DEFAULT '[]'::jsonb, -- [{name, type, url?, status}]
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'at_risk', 'achieved', 'missed', 'cancelled')),
  achieved_at TIMESTAMP WITH TIME ZONE,
  
  -- Traceability
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. DEPENDENCIES TABLE (links between items)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Dependency definition
  source_type TEXT NOT NULL CHECK (source_type IN ('objective', 'initiative', 'milestone', 'risk')),
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('objective', 'initiative', 'milestone', 'risk')),
  target_id UUID NOT NULL,
  
  -- Relationship type
  dependency_type TEXT NOT NULL DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'depends_on', 'related_to', 'mitigates')),
  
  -- Notes
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. RISK REGISTER TABLE (comprehensive risk management)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_risk_register (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  org_id UUID,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cause TEXT, -- Root cause
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'strategy', 'finance', 'technical', 'product', 
    'legal', 'regulatory', 'security', 'operational', 
    'hr', 'supplier', 'market', 'other'
  )),
  
  -- Scoring (1-5 scale)
  probability INTEGER NOT NULL DEFAULT 3 CHECK (probability >= 1 AND probability <= 5),
  impact INTEGER NOT NULL DEFAULT 3 CHECK (impact >= 1 AND impact <= 5),
  score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  criticality TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN probability * impact >= 20 THEN 'critical'
      WHEN probability * impact >= 12 THEN 'high'
      WHEN probability * impact >= 6 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  
  -- Response
  response_strategy TEXT CHECK (response_strategy IN ('avoid', 'mitigate', 'transfer', 'accept')),
  mitigation_plan TEXT,
  contingency_plan TEXT,
  
  -- Ownership
  owner_id UUID,
  owner_name TEXT,
  
  -- Status & Review
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigating', 'monitoring', 'escalated', 'closed', 'occurred')),
  escalation_threshold INTEGER DEFAULT 15, -- Auto-escalate if score >= threshold
  next_review_date DATE,
  last_review_date DATE,
  
  -- Resolution
  occurred_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  closure_reason TEXT,
  
  -- Traceability
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. RISK REVIEWS TABLE (review history & decisions)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_risk_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_id UUID NOT NULL REFERENCES public.pmo_risk_register(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Review content
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  previous_score INTEGER,
  new_score INTEGER,
  score_change INTEGER GENERATED ALWAYS AS (new_score - previous_score) STORED,
  
  -- Assessment
  assessment TEXT, -- Reviewer notes
  probability_change TEXT CHECK (probability_change IN ('increased', 'stable', 'decreased')),
  impact_change TEXT CHECK (impact_change IN ('increased', 'stable', 'decreased')),
  
  -- Decisions & Actions
  decision TEXT,
  actions_generated JSONB DEFAULT '[]'::jsonb, -- [{initiative_id?, milestone_id?, description}]
  
  -- Next steps
  next_review_date DATE,
  escalated BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. BUDGET LINES TABLE (CAPEX/OPEX by category)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_budget_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  scenario_id UUID, -- Links to budget scenarios
  user_id UUID NOT NULL,
  
  -- Classification
  budget_type TEXT NOT NULL CHECK (budget_type IN ('capex', 'opex')),
  category TEXT NOT NULL CHECK (category IN (
    'hr', 'contractors', 'cloud', 'software', 'hardware',
    'compliance', 'legal', 'marketing', 'travel', 
    'office', 'insurance', 'training', 'other'
  )),
  
  -- Line details
  description TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  recurrence TEXT CHECK (recurrence IN ('one_time', 'monthly', 'quarterly', 'yearly')),
  
  -- Amount
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Timeline
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  start_month TEXT, -- For recurring: 'YYYY-MM'
  end_month TEXT, -- For recurring: 'YYYY-MM' or NULL for ongoing
  
  -- Linkage
  initiative_id UUID REFERENCES public.pmo_initiatives(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.pmo_milestones(id) ON DELETE SET NULL,
  risk_id UUID REFERENCES public.pmo_risk_register(id) ON DELETE SET NULL,
  
  -- Ownership
  owner_id UUID,
  owner_name TEXT,
  justification TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'approved', 'committed', 'spent', 'cancelled')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  
  -- Actuals
  actual_amount DECIMAL(15,2),
  variance DECIMAL(15,2) GENERATED ALWAYS AS (actual_amount - amount) STORED,
  
  -- Traceability
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. BUDGET SCENARIOS TABLE (Base, Optimistic, Constrained)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_budget_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Scenario details
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL DEFAULT 'base' CHECK (scenario_type IN ('base', 'optimistic', 'constrained', 'custom')),
  is_active BOOLEAN DEFAULT false, -- Currently selected scenario
  
  -- Parameters (for scenario modeling)
  parameters JSONB DEFAULT '{}'::jsonb, -- {cloud_multiplier: 1.2, fte_count: -1, delay_months: 2}
  
  -- Calculated totals (updated via trigger)
  total_capex DECIMAL(15,2) DEFAULT 0,
  total_opex DECIMAL(15,2) DEFAULT 0,
  total_budget DECIMAL(15,2) DEFAULT 0,
  monthly_burn_rate DECIMAL(15,2) DEFAULT 0,
  
  -- Runway calculation
  available_cash DECIMAL(15,2) DEFAULT 0,
  runway_months INTEGER,
  
  -- Timeframe
  forecast_months INTEGER DEFAULT 12,
  start_month TEXT, -- 'YYYY-MM'
  
  -- Traceability
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. GENERATED PACKS TABLE (Export history)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pmo_generated_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Pack type
  pack_type TEXT NOT NULL CHECK (pack_type IN ('b2c_simple', 'b2b_comex', 'investor', 'compliance_audit', 'budget', 'risk_summary', 'full_report')),
  
  -- Content snapshot
  title TEXT NOT NULL,
  snapshot_data JSONB NOT NULL, -- Complete data at generation time
  
  -- Generation metadata
  template_version TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by UUID,
  
  -- File reference (if stored)
  file_url TEXT,
  file_size_bytes INTEGER,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  share_token UUID DEFAULT gen_random_uuid(),
  share_expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- INDEXES for performance
-- =============================================================================

CREATE INDEX idx_pmo_objectives_case ON public.pmo_objectives(case_id);
CREATE INDEX idx_pmo_objectives_user ON public.pmo_objectives(user_id);
CREATE INDEX idx_pmo_objectives_status ON public.pmo_objectives(status);

CREATE INDEX idx_pmo_initiatives_objective ON public.pmo_initiatives(objective_id);
CREATE INDEX idx_pmo_initiatives_case ON public.pmo_initiatives(case_id);
CREATE INDEX idx_pmo_initiatives_status ON public.pmo_initiatives(status);

CREATE INDEX idx_pmo_milestones_case ON public.pmo_milestones(case_id);
CREATE INDEX idx_pmo_milestones_target ON public.pmo_milestones(target_date);
CREATE INDEX idx_pmo_milestones_status ON public.pmo_milestones(status);

CREATE INDEX idx_pmo_dependencies_source ON public.pmo_dependencies(source_type, source_id);
CREATE INDEX idx_pmo_dependencies_target ON public.pmo_dependencies(target_type, target_id);

CREATE INDEX idx_pmo_risk_register_case ON public.pmo_risk_register(case_id);
CREATE INDEX idx_pmo_risk_register_score ON public.pmo_risk_register(score DESC);
CREATE INDEX idx_pmo_risk_register_review ON public.pmo_risk_register(next_review_date);
CREATE INDEX idx_pmo_risk_register_status ON public.pmo_risk_register(status);

CREATE INDEX idx_pmo_risk_reviews_risk ON public.pmo_risk_reviews(risk_id);

CREATE INDEX idx_pmo_budget_lines_case ON public.pmo_budget_lines(case_id);
CREATE INDEX idx_pmo_budget_lines_scenario ON public.pmo_budget_lines(scenario_id);
CREATE INDEX idx_pmo_budget_lines_month ON public.pmo_budget_lines(month_year);
CREATE INDEX idx_pmo_budget_lines_category ON public.pmo_budget_lines(category);

CREATE INDEX idx_pmo_budget_scenarios_case ON public.pmo_budget_scenarios(case_id);

CREATE INDEX idx_pmo_generated_packs_case ON public.pmo_generated_packs(case_id);
CREATE INDEX idx_pmo_generated_packs_type ON public.pmo_generated_packs(pack_type);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.pmo_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_risk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_budget_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_generated_packs ENABLE ROW LEVEL SECURITY;

-- Objectives policies
CREATE POLICY "Users can view their own objectives" ON public.pmo_objectives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own objectives" ON public.pmo_objectives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own objectives" ON public.pmo_objectives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own objectives" ON public.pmo_objectives FOR DELETE USING (auth.uid() = user_id);

-- Initiatives policies
CREATE POLICY "Users can view their own initiatives" ON public.pmo_initiatives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own initiatives" ON public.pmo_initiatives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own initiatives" ON public.pmo_initiatives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own initiatives" ON public.pmo_initiatives FOR DELETE USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view their own milestones" ON public.pmo_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own milestones" ON public.pmo_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.pmo_milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own milestones" ON public.pmo_milestones FOR DELETE USING (auth.uid() = user_id);

-- Dependencies policies
CREATE POLICY "Users can view their own dependencies" ON public.pmo_dependencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own dependencies" ON public.pmo_dependencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dependencies" ON public.pmo_dependencies FOR DELETE USING (auth.uid() = user_id);

-- Risk register policies
CREATE POLICY "Users can view their own risks" ON public.pmo_risk_register FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own risks" ON public.pmo_risk_register FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own risks" ON public.pmo_risk_register FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own risks" ON public.pmo_risk_register FOR DELETE USING (auth.uid() = user_id);

-- Risk reviews policies
CREATE POLICY "Users can view their own risk reviews" ON public.pmo_risk_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own risk reviews" ON public.pmo_risk_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Budget lines policies
CREATE POLICY "Users can view their own budget lines" ON public.pmo_budget_lines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budget lines" ON public.pmo_budget_lines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget lines" ON public.pmo_budget_lines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget lines" ON public.pmo_budget_lines FOR DELETE USING (auth.uid() = user_id);

-- Budget scenarios policies
CREATE POLICY "Users can view their own budget scenarios" ON public.pmo_budget_scenarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budget scenarios" ON public.pmo_budget_scenarios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget scenarios" ON public.pmo_budget_scenarios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget scenarios" ON public.pmo_budget_scenarios FOR DELETE USING (auth.uid() = user_id);

-- Generated packs policies
CREATE POLICY "Users can view their own packs" ON public.pmo_generated_packs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own packs" ON public.pmo_generated_packs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own packs" ON public.pmo_generated_packs FOR DELETE USING (auth.uid() = user_id);

-- Public access to shared packs
CREATE POLICY "Anyone can view shared packs" ON public.pmo_generated_packs FOR SELECT 
  USING (is_shared = true AND (share_expires_at IS NULL OR share_expires_at > now()));

-- =============================================================================
-- TRIGGERS for updated_at
-- =============================================================================

CREATE TRIGGER update_pmo_objectives_updated_at BEFORE UPDATE ON public.pmo_objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_initiatives_updated_at BEFORE UPDATE ON public.pmo_initiatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_milestones_updated_at BEFORE UPDATE ON public.pmo_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_risk_register_updated_at BEFORE UPDATE ON public.pmo_risk_register
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_budget_lines_updated_at BEFORE UPDATE ON public.pmo_budget_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_budget_scenarios_updated_at BEFORE UPDATE ON public.pmo_budget_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();