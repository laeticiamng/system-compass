-- Create cache table for terrain realities
CREATE TABLE public.terrain_realities_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr',
  data_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Create index for faster lookups
CREATE INDEX idx_terrain_realities_country_lang ON public.terrain_realities_cache(country, language);
CREATE INDEX idx_terrain_realities_expires ON public.terrain_realities_cache(expires_at);

-- Enable RLS
ALTER TABLE public.terrain_realities_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (cached data is public)
CREATE POLICY "Anyone can read terrain realities cache" 
ON public.terrain_realities_cache 
FOR SELECT 
USING (true);

-- Only service role can insert/update (edge function uses service role)
CREATE POLICY "Service role can manage terrain realities cache" 
ON public.terrain_realities_cache 
FOR ALL 
USING (auth.role() = 'service_role');