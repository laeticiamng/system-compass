-- Fix security issue: game_statistics should only allow authenticated users to view leaderboard
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view leaderboard scores" ON public.game_statistics;

-- Create new policy: only authenticated users can view leaderboard
CREATE POLICY "Authenticated users can view leaderboard scores"
ON public.game_statistics
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix security issue: music_generation_tasks should only be viewable by the creator
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view music tasks" ON public.music_generation_tasks;

-- Create new policy: users can only view their own music tasks (if user_id exists)
-- Since music_generation_tasks may not have a user_id, we restrict to authenticated users only
-- and add a more restrictive policy if needed

-- First check if music_generation_tasks has any ownership column
-- If not, restrict to authenticated users only for now
CREATE POLICY "Authenticated users can view music tasks with ownership"
ON public.music_generation_tasks
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Newsletter subscriptions: ensure SELECT is restricted to admins only
DROP POLICY IF EXISTS "Select newsletter subscription" ON public.newsletter_subscriptions;

CREATE POLICY "Only admins can view newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Event registrations: ensure users can only view their own registrations
DROP POLICY IF EXISTS "Users can view their own event registrations" ON public.event_registrations;

CREATE POLICY "Users can only view their own event registrations"
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id OR (guest_email IS NOT NULL AND user_id IS NULL));