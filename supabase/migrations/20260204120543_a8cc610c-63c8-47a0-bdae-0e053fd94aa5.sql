-- Fix RLS policies with "always true" issue for analytics tables

-- Drop the permissive policies and replace with stricter ones
DROP POLICY IF EXISTS "analytics_events_insert_any" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_sessions_insert_any" ON public.analytics_sessions;

-- Analytics events: Allow insert for authenticated users or with session_id for anon
CREATE POLICY "analytics_events_insert_authenticated"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "analytics_events_insert_anon"
  ON public.analytics_events FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Analytics sessions: Allow insert for authenticated users or with session_id for anon
CREATE POLICY "analytics_sessions_insert_authenticated"
  ON public.analytics_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "analytics_sessions_insert_anon"
  ON public.analytics_sessions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);