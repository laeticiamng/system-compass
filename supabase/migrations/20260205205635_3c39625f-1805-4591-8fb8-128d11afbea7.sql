-- Security Fix: Consolidate analytics RLS policies
-- Remove redundant policies and create clean, minimal policy structure

-- =====================================================
-- ANALYTICS_EVENTS TABLE - Consolidate to 4 policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow rate-limited anonymous event tracking" ON public.analytics_events;
DROP POLICY IF EXISTS "Analytics events insertable by authenticated" ON public.analytics_events;
DROP POLICY IF EXISTS "Analytics events viewable by owner only" ON public.analytics_events;
DROP POLICY IF EXISTS "Anonymous can insert events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.analytics_events;
DROP POLICY IF EXISTS "Events insert with session validation" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view own events" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert_anon" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert_authenticated" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_select_owner" ON public.analytics_events;
DROP POLICY IF EXISTS "events_safe_insert" ON public.analytics_events;
DROP POLICY IF EXISTS "events_strict_select" ON public.analytics_events;

-- Create clean policies for analytics_events
CREATE POLICY "events_authenticated_insert"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND session_id IS NOT NULL 
    AND length(session_id) BETWEEN 20 AND 100
    AND length(event_name) <= 100
    AND length(event_category) <= 50
  );

CREATE POLICY "events_anonymous_insert"
  ON public.analytics_events FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL 
    AND session_id IS NOT NULL 
    AND length(session_id) BETWEEN 20 AND 100
    AND length(event_name) <= 100
    AND length(event_category) <= 50
  );

CREATE POLICY "events_owner_select"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "events_admin_select"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- ANALYTICS_SESSIONS TABLE - Consolidate to 5 policies
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow rate-limited anonymous session tracking" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow session updates by matching session_id" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow session updates by session owner" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Analytics sessions insertable by authenticated" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Analytics sessions viewable by owner only" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_safe_insert" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_owner_update" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_strict_insert" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_strict_select" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_strict_update" ON public.analytics_sessions;
DROP POLICY IF EXISTS "analytics_sessions_insert_anon" ON public.analytics_sessions;
DROP POLICY IF EXISTS "analytics_sessions_insert_authenticated" ON public.analytics_sessions;
DROP POLICY IF EXISTS "analytics_sessions_select_owner" ON public.analytics_sessions;
DROP POLICY IF EXISTS "analytics_sessions_update_owner" ON public.analytics_sessions;

-- Create clean policies for analytics_sessions
CREATE POLICY "sessions_authenticated_insert"
  ON public.analytics_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND session_id IS NOT NULL 
    AND length(session_id) BETWEEN 20 AND 100
  );

CREATE POLICY "sessions_anonymous_insert"
  ON public.analytics_sessions FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL 
    AND session_id IS NOT NULL 
    AND length(session_id) BETWEEN 20 AND 100
  );

CREATE POLICY "sessions_owner_select"
  ON public.analytics_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_admin_select"
  ON public.analytics_sessions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "sessions_owner_update"
  ON public.analytics_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);