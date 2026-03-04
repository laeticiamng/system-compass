
CREATE TABLE public.geopolitical_alerts_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geopolitics',
  severity TEXT NOT NULL DEFAULT 'warning',
  countries_affected TEXT[] NOT NULL DEFAULT '{}',
  country_codes TEXT[] NOT NULL DEFAULT '{}',
  conflict_type TEXT,
  impact_assessment TEXT,
  citations TEXT[] DEFAULT '{}',
  ai_model TEXT,
  ai_confidence NUMERIC(3,2),
  source_query TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + interval '7 days',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: public read, only service role can write (edge functions)
ALTER TABLE public.geopolitical_alerts_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active geopolitical alerts"
  ON public.geopolitical_alerts_ai
  FOR SELECT
  USING (is_active = true);

-- Index for fast queries
CREATE INDEX idx_geo_alerts_active_detected ON public.geopolitical_alerts_ai (is_active, detected_at DESC);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.geopolitical_alerts_ai;
