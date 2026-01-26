-- Remove public access from premium/proprietary tables
-- Keep only authenticated access

-- country_governance: remove public access
DROP POLICY IF EXISTS "Anyone can read governance data" ON public.country_governance;

-- financial_intel_country_snapshots: remove public access
DROP POLICY IF EXISTS "Snapshots are viewable by everyone" ON public.financial_intel_country_snapshots;

-- terrain_realities_cache: remove public access
DROP POLICY IF EXISTS "Anyone can read terrain realities cache" ON public.terrain_realities_cache;

-- subscription_plans: keep public (needed for pricing page) but remove duplicate
DROP POLICY IF EXISTS "Anyone can read subscription plans" ON public.subscription_plans;