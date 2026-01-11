-- Table des dossiers/cases avec intention (relocation vs entrepreneurship)
CREATE TABLE public.user_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country_id TEXT NOT NULL,
  title TEXT NOT NULL,
  intention TEXT NOT NULL CHECK (intention IN ('relocation', 'entrepreneurship')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'completed')),
  
  -- Données communes
  timeline_scenario TEXT DEFAULT 'realistic' CHECK (timeline_scenario IN ('optimistic', 'realistic', 'pessimistic')),
  estimated_start_date DATE,
  target_completion_date DATE,
  budget_buffer_percent INTEGER DEFAULT 30,
  
  -- LIGHT (relocation) data
  clarifications_done JSONB DEFAULT '[]'::jsonb,
  clarifications_pending JSONB DEFAULT '[]'::jsonb,
  red_flags_acknowledged JSONB DEFAULT '[]'::jsonb,
  admin_checklist JSONB DEFAULT '[]'::jsonb,
  
  -- DEEP (entrepreneurship) data
  poc_hypothesis TEXT,
  poc_budget NUMERIC,
  poc_duration TEXT,
  poc_success_criteria JSONB DEFAULT '[]'::jsonb,
  poc_stop_criteria JSONB DEFAULT '[]'::jsonb,
  risk_register JSONB DEFAULT '[]'::jsonb,
  governance_map JSONB DEFAULT '[]'::jsonb,
  partners_vetted JSONB DEFAULT '[]'::jsonb,
  anti_copy_checklist JSONB DEFAULT '[]'::jsonb,
  cash_reality JSONB DEFAULT '{}'::jsonb,
  
  -- Milestones/jalons
  milestones JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own cases" 
  ON public.user_cases FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cases" 
  ON public.user_cases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" 
  ON public.user_cases FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" 
  ON public.user_cases FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_cases_updated_at
  BEFORE UPDATE ON public.user_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_user_cases_user_id ON public.user_cases(user_id);
CREATE INDEX idx_user_cases_country_id ON public.user_cases(country_id);
CREATE INDEX idx_user_cases_intention ON public.user_cases(intention);

-- Table pour le metering B2B (volume/densité)
CREATE TABLE public.b2b_usage_metering (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id TEXT,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Compteurs volume
  cases_created INTEGER DEFAULT 0,
  cases_active INTEGER DEFAULT 0,
  exports_light INTEGER DEFAULT 0,
  exports_deep INTEGER DEFAULT 0,
  
  -- Compteurs densité
  risk_register_items INTEGER DEFAULT 0,
  partners_vetted INTEGER DEFAULT 0,
  governance_actors INTEGER DEFAULT 0,
  milestones_created INTEGER DEFAULT 0,
  
  -- Quotas
  cases_quota INTEGER DEFAULT 5,
  exports_quota INTEGER DEFAULT 10,
  
  -- Alerts
  alert_80_sent BOOLEAN DEFAULT false,
  alert_100_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, period_start, period_end)
);

-- Enable RLS
ALTER TABLE public.b2b_usage_metering ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own B2B usage" 
  ON public.b2b_usage_metering FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own B2B usage" 
  ON public.b2b_usage_metering FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to increment B2B usage
CREATE OR REPLACE FUNCTION public.increment_b2b_usage(
  p_user_id UUID,
  p_metric TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  INSERT INTO b2b_usage_metering (user_id, period_start, period_end)
  VALUES (p_user_id, v_period_start, v_period_end)
  ON CONFLICT (user_id, period_start, period_end) DO NOTHING;
  
  EXECUTE format(
    'UPDATE b2b_usage_metering SET %I = %I + $1, updated_at = now() 
     WHERE user_id = $2 AND period_start = $3 AND period_end = $4',
    p_metric, p_metric
  ) USING p_increment, p_user_id, v_period_start, v_period_end;
END;
$$;