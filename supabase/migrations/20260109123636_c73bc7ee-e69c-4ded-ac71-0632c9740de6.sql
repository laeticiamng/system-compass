
-- Country Intelligence Layer table for Premium+ content
CREATE TABLE public.country_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL UNIQUE,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- A. Power Map (Carte du pouvoir)
  power_formal JSONB NOT NULL DEFAULT '[]'::jsonb,
  power_informal JSONB NOT NULL DEFAULT '[]'::jsonb,
  power_keys_ranking JSONB NOT NULL DEFAULT '{"diplomas": 3, "networks": 3, "capital": 3, "visibility": 3, "conformity": 3}'::jsonb,
  
  -- B. Social Operating System (Règles sociales implicites)
  social_norms TEXT,
  authority_relation TEXT,
  risk_attitude TEXT,
  conflict_approach TEXT,
  
  -- C. Winning/Losing Strategies
  strategies_rewarded JSONB NOT NULL DEFAULT '[]'::jsonb,
  strategies_punished JSONB NOT NULL DEFAULT '[]'::jsonb,
  newcomer_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- D. Social Mobility
  mobility_elevators JSONB NOT NULL DEFAULT '[]'::jsonb,
  mobility_speed TEXT,
  mobility_speed_reason TEXT,
  mental_cost TEXT,
  mental_cost_reason TEXT,
  
  -- E. Psycho/Socio
  system_produces JSONB NOT NULL DEFAULT '[]'::jsonb,
  adaptive_behaviors JSONB NOT NULL DEFAULT '[]'::jsonb,
  backfiring_behaviors JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- F. Geopolitics & Flows
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  cycle_status TEXT,
  macro_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- G. Historical Legacy
  historical_traces JSONB NOT NULL DEFAULT '[]'::jsonb,
  legacy_implications JSONB NOT NULL DEFAULT '{"trust": "", "institutions": "", "merit": "", "risk": ""}'::jsonb
);

-- Country Tags for comparison (1-5 scores)
CREATE TABLE public.country_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Scored tags (1-5)
  network_weight INTEGER NOT NULL DEFAULT 3 CHECK (network_weight BETWEEN 1 AND 5),
  diploma_weight INTEGER NOT NULL DEFAULT 3 CHECK (diploma_weight BETWEEN 1 AND 5),
  risk_tolerance INTEGER NOT NULL DEFAULT 3 CHECK (risk_tolerance BETWEEN 1 AND 5),
  admin_speed INTEGER NOT NULL DEFAULT 3 CHECK (admin_speed BETWEEN 1 AND 5),
  authority_verticality INTEGER NOT NULL DEFAULT 3 CHECK (authority_verticality BETWEEN 1 AND 5),
  mental_friction INTEGER NOT NULL DEFAULT 3 CHECK (mental_friction BETWEEN 1 AND 5),
  social_mobility INTEGER NOT NULL DEFAULT 3 CHECK (social_mobility BETWEEN 1 AND 5),
  predictability INTEGER NOT NULL DEFAULT 3 CHECK (predictability BETWEEN 1 AND 5),
  reputation_requirement INTEGER NOT NULL DEFAULT 3 CHECK (reputation_requirement BETWEEN 1 AND 5),
  compliance_sensitivity INTEGER NOT NULL DEFAULT 3 CHECK (compliance_sensitivity BETWEEN 1 AND 5)
);

-- Enable RLS
ALTER TABLE public.country_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for all (display purposes)
CREATE POLICY "Country intelligence readable by everyone" 
  ON public.country_intelligence 
  FOR SELECT 
  USING (true);

CREATE POLICY "Country tags readable by everyone" 
  ON public.country_tags 
  FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_country_intelligence_country_id ON public.country_intelligence(country_id);
CREATE INDEX idx_country_tags_country_id ON public.country_tags(country_id);

-- Create trigger for updated_at on country_intelligence
CREATE TRIGGER update_country_intelligence_updated_at
  BEFORE UPDATE ON public.country_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on country_tags
CREATE TRIGGER update_country_tags_updated_at
  BEFORE UPDATE ON public.country_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
