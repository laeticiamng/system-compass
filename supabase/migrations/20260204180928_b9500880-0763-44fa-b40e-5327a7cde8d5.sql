-- ============================================================
-- AUDIT v6.4 - Fix Critical RLS Policies (4 ERRORS)
-- ============================================================

-- 1. Fix analytics_sessions: Restrict SELECT to owner or admin only
DROP POLICY IF EXISTS "sessions_anon_insert" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_owner_update" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_user_select" ON public.analytics_sessions;
DROP POLICY IF EXISTS "sessions_strict_select" ON public.analytics_sessions;

-- New strict SELECT policy: only owner or admin
CREATE POLICY "sessions_strict_select" ON public.analytics_sessions
  FOR SELECT USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Safe INSERT for analytics (session_id length validation)
CREATE POLICY "sessions_safe_insert" ON public.analytics_sessions
  FOR INSERT WITH CHECK (
    length(session_id) >= 16 
    AND length(session_id) <= 128
  );

-- UPDATE only by owner
CREATE POLICY "sessions_owner_update" ON public.analytics_sessions
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- 2. Fix analytics_events: Restrict SELECT to owner or admin only
DROP POLICY IF EXISTS "events_anon_insert" ON public.analytics_events;
DROP POLICY IF EXISTS "events_owner_select" ON public.analytics_events;
DROP POLICY IF EXISTS "events_strict_select" ON public.analytics_events;

-- New strict SELECT policy: only owner or admin
CREATE POLICY "events_strict_select" ON public.analytics_events
  FOR SELECT USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Safe INSERT with session_id validation
CREATE POLICY "events_safe_insert" ON public.analytics_events
  FOR INSERT WITH CHECK (
    length(session_id) >= 16 
    AND length(session_id) <= 128
  );

-- 3. Fix newsletter_subscriptions: Restrict SELECT to admin only
DROP POLICY IF EXISTS "newsletter_insert" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_admin_select" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "newsletter_strict_select" ON public.newsletter_subscriptions;

-- New strict SELECT policy: admin only
CREATE POLICY "newsletter_strict_select" ON public.newsletter_subscriptions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Safe INSERT with email validation
CREATE POLICY "newsletter_safe_insert" ON public.newsletter_subscriptions
  FOR INSERT WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 255
  );

-- 4. Fix event_registrations: Restrict SELECT to owner or admin only
DROP POLICY IF EXISTS "registrations_select" ON public.event_registrations;
DROP POLICY IF EXISTS "registrations_insert" ON public.event_registrations;
DROP POLICY IF EXISTS "registrations_strict_select" ON public.event_registrations;

-- New strict SELECT policy: only owner or admin
CREATE POLICY "registrations_strict_select" ON public.event_registrations
  FOR SELECT USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Safe INSERT with email validation for guests
CREATE POLICY "registrations_safe_insert" ON public.event_registrations
  FOR INSERT WITH CHECK (
    (user_id = auth.uid() AND auth.uid() IS NOT NULL)
    OR (
      guest_email IS NOT NULL 
      AND guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
      AND length(guest_email) <= 255
    )
  );

-- UPDATE only by owner
CREATE POLICY "registrations_owner_update" ON public.event_registrations
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- DELETE only by owner or admin
CREATE POLICY "registrations_owner_delete" ON public.event_registrations
  FOR DELETE USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );