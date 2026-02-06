
-- Remove the overly permissive public SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Public can read active experts for marketplace" ON public.experts;

-- Recreate experts_public as SECURITY DEFINER (no security_invoker) 
-- so it doesn't need anon SELECT on the base table
-- This is the ONLY way to provide public column-filtered access without exposing base table
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
    rating_avg,
    review_count,
    response_time_hours,
    created_at,
    updated_at
FROM public.experts
WHERE is_active = true;

-- Add security_barrier to prevent predicate pushdown attacks
ALTER VIEW public.experts_public SET (security_barrier = true);

GRANT SELECT ON public.experts_public TO anon;
GRANT SELECT ON public.experts_public TO authenticated;

-- Add a COMMENT documenting why this view is intentionally SECURITY DEFINER
COMMENT ON VIEW public.experts_public IS 'Intentionally SECURITY DEFINER: provides column-filtered public access to expert profiles without exposing sensitive fields (user_id, stripe_account_id). security_barrier=true prevents predicate pushdown attacks.';
