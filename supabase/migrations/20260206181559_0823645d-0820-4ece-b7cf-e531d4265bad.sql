
-- Fix 1: Remove the overly permissive anon SELECT policy on experts table
-- The experts_public view should be the only public access path
DROP POLICY IF EXISTS "Anon and auth can read active experts" ON public.experts;

-- Fix 2: Recreate experts_public view WITHOUT security_invoker 
-- so it can bypass RLS (view only exposes safe columns)
DROP VIEW IF EXISTS public.experts_public;

CREATE VIEW public.experts_public AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  specialties,
  countries,
  languages,
  certifications,
  hourly_rate,
  currency,
  booking_url,
  is_verified,
  is_active,
  rating_avg,
  review_count,
  response_time_hours,
  created_at,
  updated_at
FROM public.experts
WHERE is_active = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.experts_public TO anon, authenticated;

-- Fix 3: Tighten user_subscriptions UPDATE policy from public to authenticated
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);
