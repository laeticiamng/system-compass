-- Add public leaderboard view policy (only show best scores, not private data)
-- Users can see all players' best scores for the leaderboard
CREATE POLICY "Anyone can view leaderboard scores"
ON public.game_statistics
FOR SELECT
USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own statistics" ON public.game_statistics;

-- Add display_name column for leaderboard
ALTER TABLE public.game_statistics 
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT 'Anonymous';

-- Add last_game_at for sorting recent players
ALTER TABLE public.game_statistics
ADD COLUMN IF NOT EXISTS last_game_at TIMESTAMP WITH TIME ZONE DEFAULT now();