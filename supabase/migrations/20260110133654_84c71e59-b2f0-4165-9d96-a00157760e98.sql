-- Create table for LATENT potential zones
CREATE TABLE public.latent_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'dormant' CHECK (status IN ('dormant', 'emergent', 'fragile', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tension fields associated with zones
CREATE TABLE public.latent_zone_tensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.latent_zones(id) ON DELETE CASCADE,
  tension_type TEXT NOT NULL CHECK (tension_type IN ('nourishing', 'blocking', 'fragility', 'premature_crushing')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for zone evolution history (non-modifiable)
CREATE TABLE public.latent_zone_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.latent_zones(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'status_changed', 'transformed', 'merged', 'archived', 'put_to_sleep')),
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.latent_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.latent_zone_tensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.latent_zone_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for latent_zones
CREATE POLICY "Users can view their own zones" 
ON public.latent_zones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own zones" 
ON public.latent_zones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own zones" 
ON public.latent_zones 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own zones" 
ON public.latent_zones 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for latent_zone_tensions
CREATE POLICY "Users can view tensions of their zones" 
ON public.latent_zone_tensions 
FOR SELECT 
USING (zone_id IN (SELECT id FROM public.latent_zones WHERE user_id = auth.uid()));

CREATE POLICY "Users can create tensions for their zones" 
ON public.latent_zone_tensions 
FOR INSERT 
WITH CHECK (zone_id IN (SELECT id FROM public.latent_zones WHERE user_id = auth.uid()));

CREATE POLICY "Users can update tensions of their zones" 
ON public.latent_zone_tensions 
FOR UPDATE 
USING (zone_id IN (SELECT id FROM public.latent_zones WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete tensions of their zones" 
ON public.latent_zone_tensions 
FOR DELETE 
USING (zone_id IN (SELECT id FROM public.latent_zones WHERE user_id = auth.uid()));

-- RLS policies for latent_zone_history (read-only after creation)
CREATE POLICY "Users can view history of their zones" 
ON public.latent_zone_history 
FOR SELECT 
USING (zone_id IN (SELECT id FROM public.latent_zones WHERE user_id = auth.uid()));

CREATE POLICY "Users can create history entries for their zones" 
ON public.latent_zone_history 
FOR INSERT 
WITH CHECK (zone_id IN (SELECT id FROM public.latent_zones WHERE user_id = auth.uid()));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_latent_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_latent_zones_updated_at
BEFORE UPDATE ON public.latent_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_latent_zones_updated_at();