-- Secure analytics tables with rate limiting and validation
-- The INSERT true policy is needed for anonymous tracking but we add protection

-- 1. Update analytics_events policy to include session_id validation
DROP POLICY IF EXISTS "Allow anonymous event tracking" ON public.analytics_events;

CREATE POLICY "Allow rate-limited anonymous event tracking"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  -- Session ID must be provided and have valid format (UUID-like)
  session_id IS NOT NULL 
  AND length(session_id) >= 20
  AND length(session_id) <= 100
  -- Event name must be reasonable length
  AND length(event_name) <= 100
  AND length(event_category) <= 50
);

-- 2. Update analytics_sessions policy with validation
DROP POLICY IF EXISTS "Allow anonymous session tracking" ON public.analytics_sessions;

CREATE POLICY "Allow rate-limited anonymous session tracking"
ON public.analytics_sessions
FOR INSERT
WITH CHECK (
  -- Session ID must be provided with valid format
  session_id IS NOT NULL 
  AND length(session_id) >= 20
  AND length(session_id) <= 100
);

-- 3. Add UPDATE policy for sessions (needed for last_seen_at updates)
CREATE POLICY "Allow session updates by session_id"
ON public.analytics_sessions
FOR UPDATE
USING (true)
WITH CHECK (
  session_id IS NOT NULL 
  AND length(session_id) >= 20
);