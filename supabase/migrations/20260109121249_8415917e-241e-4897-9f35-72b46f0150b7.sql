-- Country Variants content table (Premium layer)
CREATE TABLE public.country_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL UNIQUE,
  
  -- Institutions/administration
  institutions JSONB NOT NULL DEFAULT '{"items": [], "summary": ""}',
  
  -- Networks/reputation/diplomas
  networks JSONB NOT NULL DEFAULT '{"items": [], "summary": ""}',
  
  -- Labor market dynamics
  labor_market JSONB NOT NULL DEFAULT '{"items": [], "summary": ""}',
  
  -- Entrepreneurship
  entrepreneurship JSONB NOT NULL DEFAULT '{"items": [], "summary": ""}',
  
  -- Daily life friction
  daily_life JSONB NOT NULL DEFAULT '{"items": [], "summary": ""}',
  
  -- What surprises newcomers (5 bullets)
  surprises JSONB NOT NULL DEFAULT '[]',
  
  -- 3 profiles that often succeed here
  profiles_succeed JSONB NOT NULL DEFAULT '[]',
  
  -- 3 profiles that often struggle here
  profiles_struggle JSONB NOT NULL DEFAULT '[]',
  
  -- Example trajectories (short format)
  example_trajectories JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.country_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can read country variants (content is public but access is gated by subscription)
CREATE POLICY "Country variants are readable by everyone"
ON public.country_variants FOR SELECT
USING (true);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- User project analyses (Pro layer - per-country project analysis)
CREATE TABLE public.user_project_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country_id TEXT NOT NULL,
  
  -- User inputs
  project_type TEXT NOT NULL CHECK (project_type IN ('studies', 'career', 'business', 'expatriation', 'family', 'investment', 'other')),
  constraints JSONB NOT NULL DEFAULT '[]',
  risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  horizon TEXT NOT NULL CHECK (horizon IN ('3months', '1year', '3years', '10years')),
  
  -- Generated analysis (no verdicts, no scores)
  blind_spots JSONB NOT NULL DEFAULT '[]',
  frequent_risks JSONB NOT NULL DEFAULT '[]',
  relevant_exit_keys JSONB NOT NULL DEFAULT '[]',
  alternative_scenarios JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, country_id, project_type)
);

-- Enable RLS
ALTER TABLE public.user_project_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own project analyses
CREATE POLICY "Users can view their own project analyses"
ON public.user_project_analyses FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own project analyses
CREATE POLICY "Users can insert their own project analyses"
ON public.user_project_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own project analyses
CREATE POLICY "Users can update their own project analyses"
ON public.user_project_analyses FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own project analyses
CREATE POLICY "Users can delete their own project analyses"
ON public.user_project_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_country_variants_updated_at
BEFORE UPDATE ON public.country_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_project_analyses_updated_at
BEFORE UPDATE ON public.user_project_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();