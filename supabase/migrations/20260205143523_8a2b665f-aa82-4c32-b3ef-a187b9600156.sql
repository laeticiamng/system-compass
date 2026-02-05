-- Enum types for country data sources
CREATE TYPE public.source_type AS ENUM ('government', 'embassy', 'statistics', 'immigration', 'fiscal');
CREATE TYPE public.change_type AS ENUM ('visa_rules', 'tax_rates', 'cost_of_living', 'healthcare', 'immigration_policy', 'lgbtq_rights', 'natural_risks', 'quality_of_life');
CREATE TYPE public.validation_status AS ENUM ('pending', 'approved', 'rejected');

-- Table: country_data_sources
-- Stores official data sources per country for automated scraping
CREATE TABLE public.country_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_type source_type NOT NULL,
  source_name TEXT, -- Human readable name
  last_scraped_at TIMESTAMPTZ,
  last_content_hash TEXT, -- SHA256 hash to detect changes
  scrape_frequency_hours INTEGER NOT NULL DEFAULT 168, -- 7 days
  is_active BOOLEAN NOT NULL DEFAULT true,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_id, source_url)
);

-- Table: country_data_updates
-- History of detected changes requiring validation
CREATE TABLE public.country_data_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.country_data_sources(id) ON DELETE CASCADE,
  change_type change_type NOT NULL,
  change_summary TEXT, -- AI-generated summary of what changed
  old_value JSONB,
  new_value JSONB NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_by UUID REFERENCES auth.users(id),
  validation_status validation_status NOT NULL DEFAULT 'pending',
  validation_notes TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: scrape_jobs
-- Tracks scraping job execution
CREATE TABLE public.scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id TEXT REFERENCES public.countries(id) ON DELETE SET NULL,
  source_id UUID REFERENCES public.country_data_sources(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  changes_detected INTEGER DEFAULT 0,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.country_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_data_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for country_data_sources
CREATE POLICY "Admins can manage data sources"
  ON public.country_data_sources FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active sources"
  ON public.country_data_sources FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- RLS Policies for country_data_updates  
CREATE POLICY "Admins can manage updates"
  ON public.country_data_updates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view approved updates"
  ON public.country_data_updates FOR SELECT
  USING (validation_status = 'approved' AND auth.role() = 'authenticated');

-- RLS Policies for scrape_jobs
CREATE POLICY "Admins can manage scrape jobs"
  ON public.scrape_jobs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_country_data_sources_country ON public.country_data_sources(country_id);
CREATE INDEX idx_country_data_sources_active ON public.country_data_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_country_data_sources_next_scrape ON public.country_data_sources(last_scraped_at, scrape_frequency_hours) WHERE is_active = true;

CREATE INDEX idx_country_data_updates_country ON public.country_data_updates(country_id);
CREATE INDEX idx_country_data_updates_source ON public.country_data_updates(source_id);
CREATE INDEX idx_country_data_updates_pending ON public.country_data_updates(validation_status) WHERE validation_status = 'pending';
CREATE INDEX idx_country_data_updates_detected ON public.country_data_updates(detected_at DESC);

CREATE INDEX idx_scrape_jobs_status ON public.scrape_jobs(status);
CREATE INDEX idx_scrape_jobs_country ON public.scrape_jobs(country_id);

-- Triggers for updated_at
CREATE TRIGGER update_country_data_sources_updated_at
  BEFORE UPDATE ON public.country_data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_country_data_updates_updated_at
  BEFORE UPDATE ON public.country_data_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();