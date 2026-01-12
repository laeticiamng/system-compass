-- Create music_generation_tasks table for music player functionality
CREATE TABLE public.music_generation_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  pyramid_type TEXT NOT NULL,
  mood TEXT DEFAULT 'narrative',
  status TEXT NOT NULL DEFAULT 'pending',
  audio_url TEXT,
  stream_url TEXT,
  error_message TEXT,
  suno_task_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_music_tasks_country ON public.music_generation_tasks(country_id, pyramid_type);
CREATE INDEX idx_music_tasks_status ON public.music_generation_tasks(status);

-- Enable RLS
ALTER TABLE public.music_generation_tasks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tasks (public music)
CREATE POLICY "Anyone can read music tasks" 
ON public.music_generation_tasks 
FOR SELECT 
USING (true);

-- Only service role can insert/update (edge functions)
CREATE POLICY "Service role can manage tasks" 
ON public.music_generation_tasks 
FOR ALL 
USING (true);

-- Create subscription_plans table for Stripe integration
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('free', 'premium', 'pro', 'enterprise')),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  stripe_price_id TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read plans
CREATE POLICY "Anyone can read subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (tier, name, description, price_monthly, price_yearly, features, limits, active)
VALUES 
  ('free', 'Gratuit', 'Accès de base pour explorer', 0, 0, 
   '["Accès aux fiches pays", "Clés de sortie basiques", "Mode jeu éducatif"]'::jsonb,
   '{"countries": 5, "comparisons": 2, "ai_actions": 0}'::jsonb, true),
  ('premium', 'Premium', 'Accès complet pour particuliers', 9.99, 99, 
   '["Toutes les fiches pays", "Clés de sortie personnalisées", "Comparaisons illimitées", "Export PDF", "Musique pays"]'::jsonb,
   '{"countries": -1, "comparisons": -1, "ai_actions": 50}'::jsonb, true),
  ('pro', 'Pro', 'Pour les professionnels et institutions', 29.99, 299, 
   '["Tout Premium", "TraceOS", "LATENT", "Irreversa", "Dossiers B2B", "API access", "Support prioritaire"]'::jsonb,
   '{"countries": -1, "comparisons": -1, "ai_actions": 500, "cases": 50}'::jsonb, true),
  ('enterprise', 'Enterprise', 'Solution sur mesure', NULL, NULL, 
   '["Tout Pro", "SSO", "Déploiement dédié", "SLA garanti", "Formation équipe"]'::jsonb,
   '{"countries": -1, "comparisons": -1, "ai_actions": -1, "cases": -1}'::jsonb, true);

-- Clean up duplicate vacation_recommendations policies
DROP POLICY IF EXISTS "Users can create their own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can delete their own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can view their own vacation recommendations" ON public.vacation_recommendations;

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_music_tasks_updated_at
BEFORE UPDATE ON public.music_generation_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();