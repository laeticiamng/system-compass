-- =============================================
-- Gouvernance avancée : Tables pour Acteurs, Intermédiation, Partenaires, Délais
-- =============================================

-- Table: case_governance_actors (acteurs clés par dossier)
CREATE TABLE public.case_governance_actors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  country_code TEXT NOT NULL,
  sector TEXT,
  label TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('institution', 'regulator', 'payer', 'approver', 'operator', 'judicial', 'local_authority', 'industry_body', 'supplier', 'other')),
  power_types TEXT[] DEFAULT '{}',
  formality_level TEXT DEFAULT 'formal' CHECK (formality_level IN ('formal', 'mixed', 'unknown')),
  reliability_status TEXT DEFAULT 'unverified' CHECK (reliability_status IN ('unverified', 'in_progress', 'verified')),
  notes TEXT,
  sources JSONB DEFAULT '[]',
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: case_intermediation_patterns (schémas d'intermédiation)
CREATE TABLE public.case_intermediation_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('access_chain', 'signature_bottleneck', 'delegated_negotiation', 'informal_queue', 'paper_stuck', 'multi_approver', 'joint_venture_requirement', 'payment_delay')),
  description_neutral TEXT NOT NULL,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  signals TEXT[] DEFAULT '{}',
  protections TEXT[] DEFAULT '{}',
  sources JSONB DEFAULT '[]',
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: case_governance_partners (partenaires obligatoires vs optionnels)
CREATE TABLE public.case_governance_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('mandatory_local_partner', 'commercial_partner', 'implementation_partner', 'distribution_partner', 'equity_partner')),
  description TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  risk_flags TEXT[] DEFAULT '{}',
  due_diligence_checklist TEXT[] DEFAULT '{}',
  notes TEXT,
  sources JSONB DEFAULT '[]',
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: case_delays_reality (délais officiels vs observés)
CREATE TABLE public.case_delays_reality (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  process_name TEXT NOT NULL,
  official_timeframe TEXT,
  optimistic_timeframe TEXT,
  realistic_timeframe TEXT,
  pessimistic_timeframe TEXT,
  delay_risk_signals TEXT[] DEFAULT '{}',
  cashflow_implications TEXT,
  sources JSONB DEFAULT '[]',
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: gov_intel_runs (log des générations IA)
CREATE TABLE public.gov_intel_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  user_id UUID NOT NULL,
  country_code TEXT NOT NULL,
  sector TEXT,
  project_type TEXT,
  intention TEXT CHECK (intention IN ('relocation', 'entrepreneurship')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  actors_count INTEGER DEFAULT 0,
  patterns_count INTEGER DEFAULT 0,
  partners_count INTEGER DEFAULT 0,
  delays_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.case_governance_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_intermediation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_governance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_delays_reality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_intel_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_governance_actors
CREATE POLICY "Users can view actors for their cases" ON public.case_governance_actors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can insert actors for their cases" ON public.case_governance_actors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can update actors for their cases" ON public.case_governance_actors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can delete actors for their cases" ON public.case_governance_actors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );

-- RLS Policies for case_intermediation_patterns
CREATE POLICY "Users can view patterns for their cases" ON public.case_intermediation_patterns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can insert patterns for their cases" ON public.case_intermediation_patterns
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can update patterns for their cases" ON public.case_intermediation_patterns
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can delete patterns for their cases" ON public.case_intermediation_patterns
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );

-- RLS Policies for case_governance_partners
CREATE POLICY "Users can view partners for their cases" ON public.case_governance_partners
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can insert partners for their cases" ON public.case_governance_partners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can update partners for their cases" ON public.case_governance_partners
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can delete partners for their cases" ON public.case_governance_partners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );

-- RLS Policies for case_delays_reality
CREATE POLICY "Users can view delays for their cases" ON public.case_delays_reality
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can insert delays for their cases" ON public.case_delays_reality
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can update delays for their cases" ON public.case_delays_reality
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );
CREATE POLICY "Users can delete delays for their cases" ON public.case_delays_reality
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_cases uc WHERE uc.id = case_id AND uc.user_id = auth.uid())
  );

-- RLS Policies for gov_intel_runs
CREATE POLICY "Users can view their gov intel runs" ON public.gov_intel_runs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their gov intel runs" ON public.gov_intel_runs
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their gov intel runs" ON public.gov_intel_runs
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_case_governance_actors_case_id ON public.case_governance_actors(case_id);
CREATE INDEX idx_case_intermediation_patterns_case_id ON public.case_intermediation_patterns(case_id);
CREATE INDEX idx_case_governance_partners_case_id ON public.case_governance_partners(case_id);
CREATE INDEX idx_case_delays_reality_case_id ON public.case_delays_reality(case_id);
CREATE INDEX idx_gov_intel_runs_case_id ON public.gov_intel_runs(case_id);
CREATE INDEX idx_gov_intel_runs_user_id ON public.gov_intel_runs(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_case_governance_actors_updated_at
  BEFORE UPDATE ON public.case_governance_actors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_intermediation_patterns_updated_at
  BEFORE UPDATE ON public.case_intermediation_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_governance_partners_updated_at
  BEFORE UPDATE ON public.case_governance_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_delays_reality_updated_at
  BEFORE UPDATE ON public.case_delays_reality
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();