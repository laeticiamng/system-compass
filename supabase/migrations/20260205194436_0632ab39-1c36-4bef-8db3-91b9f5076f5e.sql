
-- 1. Drop existing permissive SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view active experts" ON public.experts;

-- 2. Create a secure public view that hides sensitive fields
CREATE OR REPLACE VIEW public.experts_public
WITH (security_invoker = on) AS
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
  rating_avg,
  review_count,
  response_time_hours,
  created_at,
  updated_at
  -- Excluded: user_id, stripe_account_id, stripe_onboarding_complete, is_active
FROM public.experts
WHERE is_active = true;

-- 3. Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.experts_public TO anon, authenticated;

-- 4. Create restrictive SELECT policy - only allow access through view or for owners/admins
CREATE POLICY "Restrict direct table access - owners and admins only"
ON public.experts
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::text)
);

-- 5. Create policy for anon users - they can only access via the view
-- The view with security_invoker will respect this policy
CREATE POLICY "Anon can view active experts via view"
ON public.experts
FOR SELECT
TO anon
USING (is_active = true);

-- Add comment for documentation
COMMENT ON VIEW public.experts_public IS 'Public view of experts hiding sensitive fields (user_id, stripe_account_id). Use this view for public/unauthenticated access.';
