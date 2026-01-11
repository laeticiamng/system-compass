-- Create country_governance table for storing governance scores per country
CREATE TABLE IF NOT EXISTS public.country_governance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL UNIQUE,
  
  -- Score 1-5 pour chaque variable
  stability_score SMALLINT NOT NULL DEFAULT 3 CHECK (stability_score >= 1 AND stability_score <= 5),
  friction_score SMALLINT NOT NULL DEFAULT 3 CHECK (friction_score >= 1 AND friction_score <= 5),
  operational_score SMALLINT NOT NULL DEFAULT 3 CHECK (operational_score >= 1 AND operational_score <= 5),
  capture_risk_score SMALLINT NOT NULL DEFAULT 3 CHECK (capture_risk_score >= 1 AND capture_risk_score <= 5),
  ecosystem_score SMALLINT NOT NULL DEFAULT 3 CHECK (ecosystem_score >= 1 AND ecosystem_score <= 5),
  
  -- Notes explicatives
  stability_notes TEXT,
  friction_notes TEXT,
  operational_notes TEXT,
  capture_risk_notes TEXT,
  ecosystem_notes TEXT,
  
  -- Données détaillées JSON
  state_of_art JSONB DEFAULT '[]'::jsonb,
  attractiveness JSONB DEFAULT '{}'::jsonb,
  friction_risks JSONB DEFAULT '{"redFlags": [], "protections": []}'::jsonb,
  competition JSONB DEFAULT '[]'::jsonb,
  fiscal_checklist JSONB DEFAULT '[]'::jsonb,
  customs_logistics JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for country lookups
CREATE INDEX IF NOT EXISTS idx_country_governance_country_id ON public.country_governance(country_id);

-- Enable RLS
ALTER TABLE public.country_governance ENABLE ROW LEVEL SECURITY;

-- Public read access (governance data is reference data)
CREATE POLICY "Anyone can read governance data"
  ON public.country_governance
  FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage governance data"
  ON public.country_governance
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create user_governance_notes table for user-specific notes on governance
CREATE TABLE IF NOT EXISTS public.user_governance_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country_id TEXT NOT NULL,
  
  -- User-specific data
  partner_reliability JSONB DEFAULT '[]'::jsonb,
  poc_plan JSONB DEFAULT '{}'::jsonb,
  timeline_scenarios JSONB DEFAULT '{"optimistic": null, "realistic": null, "pessimistic": null}'::jsonb,
  governance_map JSONB DEFAULT '[]'::jsonb,
  risk_register JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, country_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_governance_notes_user ON public.user_governance_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_governance_notes_country ON public.user_governance_notes(country_id);

-- Enable RLS
ALTER TABLE public.user_governance_notes ENABLE ROW LEVEL SECURITY;

-- Users can only access their own notes
CREATE POLICY "Users can view their own governance notes"
  ON public.user_governance_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own governance notes"
  ON public.user_governance_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own governance notes"
  ON public.user_governance_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own governance notes"
  ON public.user_governance_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_country_governance_updated_at
  BEFORE UPDATE ON public.country_governance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_governance_notes_updated_at
  BEFORE UPDATE ON public.user_governance_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();