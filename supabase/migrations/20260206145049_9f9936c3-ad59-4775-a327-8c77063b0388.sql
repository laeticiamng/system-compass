
-- Fix: Switch experts_public view from security definer to security invoker
-- and add a safe SELECT policy on the base experts table for anon/authenticated

-- Step 1: Recreate the view with security_invoker = true
DROP VIEW IF EXISTS public.experts_public;

CREATE VIEW public.experts_public
WITH (security_invoker = true) AS
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

-- Step 2: Grant SELECT on the view
GRANT SELECT ON public.experts_public TO anon;
GRANT SELECT ON public.experts_public TO authenticated;

-- Step 3: Add a SELECT policy on experts table so the security_invoker view works
-- This only allows reading active experts, and the view further restricts columns
CREATE POLICY "Public can read active experts for marketplace"
ON public.experts
FOR SELECT
USING (is_active = true);
