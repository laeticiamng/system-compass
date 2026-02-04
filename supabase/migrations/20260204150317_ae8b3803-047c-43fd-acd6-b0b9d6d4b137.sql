-- Fix overly permissive RLS policies for music_generation_tasks
-- This table is system-managed, only allow SELECT for authenticated users and full access for service role

-- 1. Drop the existing permissive policy
DROP POLICY IF EXISTS "Service role manages music tasks" ON public.music_generation_tasks;

-- 2. Create proper policies for music_generation_tasks (system table)
-- Allow authenticated users to read music tasks (for displaying audio players)
CREATE POLICY "Authenticated users can view music tasks"
ON public.music_generation_tasks
FOR SELECT
USING (auth.role() = 'authenticated');

-- No INSERT/UPDATE/DELETE for regular users - only service role (via API) can manage
-- Service role bypasses RLS automatically

-- 3. The analytics rate limiting function already exists (check_event_analytics_rate_limit)
-- Just ensure the trigger is properly named

-- Add index for rate limit query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created 
ON public.analytics_events(session_id, created_at);