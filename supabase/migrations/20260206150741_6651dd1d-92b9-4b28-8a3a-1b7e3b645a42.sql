-- Supprimer la politique permissive existante s'il y en a une
DROP POLICY IF EXISTS "Public can read active experts for marketplace" ON public.experts;

-- Recreer la vue en SECURITY INVOKER
DROP VIEW IF EXISTS public.experts_public;
CREATE VIEW public.experts_public 
WITH (security_invoker = true) AS
SELECT id, display_name, avatar_url, bio, specialties, countries,
       languages, certifications, hourly_rate, currency, booking_url,
       is_verified, rating_avg, review_count, response_time_hours,
       created_at, updated_at
FROM public.experts
WHERE is_active = true;

-- Politique RLS pour permettre la lecture via la vue invoker
CREATE POLICY "Anon and auth can read active experts"
ON public.experts FOR SELECT
USING (is_active = true);

GRANT SELECT ON public.experts_public TO anon;
GRANT SELECT ON public.experts_public TO authenticated;