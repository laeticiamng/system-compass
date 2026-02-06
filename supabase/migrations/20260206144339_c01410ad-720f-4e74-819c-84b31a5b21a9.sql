-- Drop the permissive anon SELECT policy that exposes sensitive fields
DROP POLICY IF EXISTS "Anon can view active experts via view" ON public.experts;

-- Recreate the view WITHOUT security_invoker so it runs as the view owner (definer)
-- This allows the view to read from experts table without needing anon SELECT policy
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

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.experts_public TO anon;
GRANT SELECT ON public.experts_public TO authenticated;