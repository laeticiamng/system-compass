-- Fix SECURITY DEFINER view warning
-- Recreate the view with SECURITY INVOKER (default, explicit for clarity)
DROP VIEW IF EXISTS public.game_leaderboard_safe;

CREATE VIEW public.game_leaderboard_safe 
WITH (security_invoker = true) AS
SELECT 
  gs.user_id,
  p.display_name,
  gs.best_score_solo,
  gs.best_score_race,
  gs.total_games_played
FROM public.game_statistics gs
LEFT JOIN public.profiles p ON p.id = gs.user_id
WHERE gs.best_score_solo > 0 OR gs.best_score_race > 0
ORDER BY GREATEST(COALESCE(gs.best_score_solo, 0), COALESCE(gs.best_score_race, 0)) DESC
LIMIT 100;

GRANT SELECT ON public.game_leaderboard_safe TO authenticated;