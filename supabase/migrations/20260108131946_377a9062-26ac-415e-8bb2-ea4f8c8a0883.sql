-- Cache table for Suno generated music
CREATE TABLE public.music_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  pyramid_type TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  stream_url TEXT,
  task_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  UNIQUE(country_id, pyramid_type)
);

-- Enable RLS but allow public read for cached music
ALTER TABLE public.music_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached music" 
ON public.music_cache 
FOR SELECT 
USING (true);

-- Index for fast lookups
CREATE INDEX idx_music_cache_lookup ON public.music_cache(country_id, pyramid_type);
CREATE INDEX idx_music_cache_expiry ON public.music_cache(expires_at);

-- Comment for documentation
COMMENT ON TABLE public.music_cache IS 'Cache for Suno-generated country music to avoid regeneration';