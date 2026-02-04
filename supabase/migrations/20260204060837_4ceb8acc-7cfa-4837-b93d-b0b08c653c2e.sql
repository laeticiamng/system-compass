-- =====================================================
-- FIX SECURITY ISSUES: Event Registrations & Game Stats
-- =====================================================

-- 3. EVENT_REGISTRATIONS: Fix guest email exposure
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Guests can view their registration" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;

-- Users can only view their own registrations
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. GAME_STATISTICS: Create public view for leaderboard, restrict full table
-- First, create a public leaderboard view with only safe columns
CREATE OR REPLACE VIEW public.game_statistics_leaderboard
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_name,
  best_score_solo,
  best_score_race,
  total_games_played,
  total_turns_played,
  updated_at
FROM public.game_statistics
WHERE display_name IS NOT NULL;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.game_statistics_leaderboard TO authenticated;

-- Update game_statistics policies to be more restrictive for detailed data
DROP POLICY IF EXISTS "Leaderboard visible to all" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view own statistics" ON public.game_statistics;
DROP POLICY IF EXISTS "Users can view own full statistics" ON public.game_statistics;

-- Only owner can see full statistics (with sensitive patterns)
CREATE POLICY "Users can view own full statistics"
  ON public.game_statistics
  FOR SELECT
  USING (auth.uid() = user_id);