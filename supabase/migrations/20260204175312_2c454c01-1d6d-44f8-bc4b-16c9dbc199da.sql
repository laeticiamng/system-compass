-- Fix security warnings from linter

-- 1. Fix SECURITY DEFINER view issue - recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.game_leaderboard;
CREATE VIEW public.game_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  display_name,
  best_score_solo,
  best_score_race,
  total_games_played
FROM public.game_statistics
WHERE display_name IS NOT NULL
ORDER BY best_score_solo DESC NULLS LAST
LIMIT 100;

GRANT SELECT ON public.game_leaderboard TO anon, authenticated;

-- 2. Fix overly permissive RLS policies (true WITH CHECK)
-- Update gdpr_consent_log to require session_id validation
DROP POLICY IF EXISTS "Anyone can insert consent record" ON public.gdpr_consent_log;
CREATE POLICY "Users can insert consent with session" ON public.gdpr_consent_log
  FOR INSERT WITH CHECK (
    session_id IS NOT NULL AND 
    LENGTH(session_id) >= 10
  );

-- Update newsletter_subscriptions to require email validation
DROP POLICY IF EXISTS "Users can insert newsletter subscription" ON public.newsletter_subscriptions;
CREATE POLICY "Users can insert newsletter subscription" ON public.newsletter_subscriptions
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- Update event_registrations to require either user_id or guest_email
DROP POLICY IF EXISTS "Users can create event registrations" ON public.event_registrations;
CREATE POLICY "Users can create event registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND guest_email IS NOT NULL AND guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  );