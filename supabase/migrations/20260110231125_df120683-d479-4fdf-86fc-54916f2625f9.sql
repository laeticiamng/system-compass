-- Create table to cache country variants translations
CREATE TABLE public.country_variants_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  language TEXT NOT NULL,
  translated_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_id, language)
);

-- Enable RLS
ALTER TABLE public.country_variants_translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (translations are public data)
CREATE POLICY "Variants translations are publicly readable"
ON public.country_variants_translations
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_variants_translations_country_lang 
ON public.country_variants_translations(country_id, language);

-- Add trigger for updated_at
CREATE TRIGGER update_variants_translations_updated_at
BEFORE UPDATE ON public.country_variants_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();