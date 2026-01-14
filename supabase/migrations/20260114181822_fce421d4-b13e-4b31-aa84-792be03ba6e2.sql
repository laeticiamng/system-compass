-- Create table for UI translations
CREATE TABLE public.ui_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language VARCHAR(10) NOT NULL,
  namespace VARCHAR(100) NOT NULL DEFAULT 'translation',
  translations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(language, namespace)
);

-- Enable RLS
ALTER TABLE public.ui_translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (translations are public)
CREATE POLICY "UI translations are publicly readable"
  ON public.ui_translations
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ui_translations_updated_at
  BEFORE UPDATE ON public.ui_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast lookups
CREATE INDEX idx_ui_translations_language ON public.ui_translations(language);
CREATE INDEX idx_ui_translations_namespace ON public.ui_translations(namespace);