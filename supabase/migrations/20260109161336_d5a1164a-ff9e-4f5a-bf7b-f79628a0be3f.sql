-- Create table for storing generated country translations
CREATE TABLE public.generated_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  translation JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  UNIQUE(country_id, target_lang)
);

-- Enable RLS
ALTER TABLE public.generated_translations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read translations (they're public content)
CREATE POLICY "Translations are viewable by everyone" 
ON public.generated_translations 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert translations
CREATE POLICY "Authenticated users can create translations" 
ON public.generated_translations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update translations
CREATE POLICY "Authenticated users can update translations" 
ON public.generated_translations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_translations_updated_at
BEFORE UPDATE ON public.generated_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_generated_translations_lang ON public.generated_translations(target_lang);
CREATE INDEX idx_generated_translations_country ON public.generated_translations(country_id);