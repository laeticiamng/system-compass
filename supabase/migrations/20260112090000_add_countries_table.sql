-- Countries master list with versioning and tags
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are readable by everyone"
  ON public.countries
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage countries"
  ON public.countries
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_countries_country_id ON public.countries(country_id);

CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
