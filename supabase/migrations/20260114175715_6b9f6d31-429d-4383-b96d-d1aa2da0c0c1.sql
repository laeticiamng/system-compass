-- Create countries table for base country data
CREATE TABLE public.countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_local TEXT,
  iso2 CHAR(2) NOT NULL UNIQUE,
  region TEXT NOT NULL,
  pyramid_type TEXT NOT NULL,
  rule_of_gold TEXT,
  pyramid JSONB NOT NULL DEFAULT '{}',
  risks JSONB NOT NULL DEFAULT '{}',
  who_wins JSONB NOT NULL DEFAULT '[]',
  who_loses JSONB NOT NULL DEFAULT '[]',
  playbook JSONB NOT NULL DEFAULT '{}',
  snapshot JSONB NOT NULL DEFAULT '{}',
  visa JSONB NOT NULL DEFAULT '{}',
  cost_of_living JSONB NOT NULL DEFAULT '{}',
  quality_of_life JSONB NOT NULL DEFAULT '{}',
  natural_risks JSONB NOT NULL DEFAULT '{}',
  healthcare JSONB NOT NULL DEFAULT '{}',
  lgbtq_rights JSONB NOT NULL DEFAULT '{}',
  positive_points JSONB NOT NULL DEFAULT '{}',
  last_updated DATE,
  sources JSONB NOT NULL DEFAULT '[]',
  data_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_countries_iso2 ON public.countries(iso2);
CREATE INDEX idx_countries_region ON public.countries(region);
CREATE INDEX idx_countries_pyramid_type ON public.countries(pyramid_type);

-- Enable RLS (public read, admin write)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Everyone can read countries (public data)
CREATE POLICY "Countries are publicly readable"
ON public.countries
FOR SELECT
USING (true);

-- Only admins can modify countries
CREATE POLICY "Admins can manage countries"
ON public.countries
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_countries_updated_at
BEFORE UPDATE ON public.countries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.countries IS 'Base country data including pyramid analysis, risks, and playbooks';