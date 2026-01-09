-- Table for storing country generation jobs
CREATE TABLE public.country_generation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  country_name TEXT NOT NULL,
  iso2 TEXT NOT NULL,
  region TEXT NOT NULL,
  primary_pyramid TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed', 'validating')),
  json_payload JSONB,
  error_message TEXT,
  specificity_score INTEGER,
  confidence_score INTEGER,
  stereotype_flag BOOLEAN DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for fast lookups
CREATE INDEX idx_country_generation_jobs_status ON public.country_generation_jobs(status);
CREATE INDEX idx_country_generation_jobs_country_id ON public.country_generation_jobs(country_id);

-- Enable RLS
ALTER TABLE public.country_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view jobs (admin only in practice)
CREATE POLICY "Authenticated users can view generation jobs"
ON public.country_generation_jobs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only service role can insert/update (via edge functions)
-- No user policies for insert/update/delete - only service role

-- Add trigger for updated_at
CREATE TRIGGER update_country_generation_jobs_updated_at
BEFORE UPDATE ON public.country_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table for batch job tracking
CREATE TABLE public.country_generation_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_countries INTEGER NOT NULL DEFAULT 0,
  completed_countries INTEGER NOT NULL DEFAULT 0,
  failed_countries INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  concurrency INTEGER NOT NULL DEFAULT 5,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.country_generation_batches ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view batches
CREATE POLICY "Authenticated users can view generation batches"
ON public.country_generation_batches
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create their own batches
CREATE POLICY "Authenticated users can create generation batches"
ON public.country_generation_batches
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_country_generation_batches_updated_at
BEFORE UPDATE ON public.country_generation_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();