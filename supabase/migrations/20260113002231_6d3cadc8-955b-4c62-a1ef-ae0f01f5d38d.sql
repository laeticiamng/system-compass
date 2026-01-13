-- Table for storing country financial intel snapshots (cached results)
CREATE TABLE public.financial_intel_country_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  sector_focus TEXT,
  audience TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  scam_top7_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  legit_top7_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  country_profile JSONB,
  confidence NUMERIC(3,2) DEFAULT 0.5,
  disclaimer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_financial_intel_country ON public.financial_intel_country_snapshots(country, language);
CREATE INDEX idx_financial_intel_expires ON public.financial_intel_country_snapshots(expires_at);

-- Table for tracking generation runs
CREATE TABLE public.financial_intel_generation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  workspace_id TEXT,
  country TEXT NOT NULL,
  params_json JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  snapshot_id UUID REFERENCES public.financial_intel_country_snapshots(id),
  tokens_cost INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for user lookups
CREATE INDEX idx_financial_intel_runs_user ON public.financial_intel_generation_runs(user_id);

-- Enable RLS
ALTER TABLE public.financial_intel_country_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_intel_generation_runs ENABLE ROW LEVEL SECURITY;

-- Snapshots are readable by all (public educational content)
CREATE POLICY "Snapshots are viewable by everyone" 
ON public.financial_intel_country_snapshots 
FOR SELECT 
USING (true);

-- Only authenticated users can insert snapshots (via edge function)
CREATE POLICY "Authenticated users can create snapshots" 
ON public.financial_intel_country_snapshots 
FOR INSERT 
WITH CHECK (true);

-- Generation runs visible to the user who created them
CREATE POLICY "Users can view their own generation runs" 
ON public.financial_intel_generation_runs 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create generation runs" 
ON public.financial_intel_generation_runs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own generation runs" 
ON public.financial_intel_generation_runs 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Trigger for updated_at
CREATE TRIGGER update_financial_intel_snapshots_updated_at
BEFORE UPDATE ON public.financial_intel_country_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();