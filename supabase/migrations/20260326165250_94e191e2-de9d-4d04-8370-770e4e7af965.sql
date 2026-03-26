
-- Force recreate experts_public with correct security_invoker setting
DROP VIEW IF EXISTS public.experts_public;
CREATE VIEW public.experts_public
WITH (security_invoker = on) AS
SELECT 
  id, display_name, avatar_url, bio, specialties, countries,
  languages, certifications, hourly_rate, currency, booking_url,
  is_verified, rating_avg, review_count, response_time_hours,
  created_at, updated_at
FROM public.experts
WHERE is_active = true;
