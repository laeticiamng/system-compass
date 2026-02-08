-- Fix analytics_events: allow authenticated users to insert with null user_id
-- (covers the race condition where auth state isn't fully loaded yet)
DROP POLICY IF EXISTS "events_anonymous_insert" ON public.analytics_events;
CREATE POLICY "events_anonymous_insert" ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND session_id IS NOT NULL
    AND length(session_id) >= 20 AND length(session_id) <= 100
    AND length(event_name) <= 100
    AND length(event_category) <= 50
  );

-- Fix analytics_sessions: same issue
DROP POLICY IF EXISTS "sessions_anonymous_insert" ON public.analytics_sessions;
CREATE POLICY "sessions_anonymous_insert" ON public.analytics_sessions
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND session_id IS NOT NULL
    AND length(session_id) >= 20 AND length(session_id) <= 100
  );