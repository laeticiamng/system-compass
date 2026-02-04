-- ================================================================
-- AUDIT v6.9: Correction des failles RLS critiques + enrichissements
-- ================================================================

-- 1. CORRIGER: analytics_sessions - restreindre INSERT/UPDATE aux authentifiés
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own sessions" ON public.analytics_sessions;

CREATE POLICY "Authenticated users can insert sessions"
ON public.analytics_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Authenticated users can update own sessions"
ON public.analytics_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 2. CORRIGER: analytics_events - restreindre INSERT aux authentifiés
DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.analytics_events;

CREATE POLICY "Authenticated users can insert events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 3. RENFORCER: music_cache - INSERT admin seulement
DROP POLICY IF EXISTS "Authenticated users can insert music cache" ON public.music_cache;
DROP POLICY IF EXISTS "Admin only can insert music cache" ON public.music_cache;

CREATE POLICY "Admin only can insert music cache"
ON public.music_cache
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. RENFORCER: gdpr_consent_log - validation session plus stricte
DROP POLICY IF EXISTS "Anyone can insert consent" ON public.gdpr_consent_log;
DROP POLICY IF EXISTS "Users can insert consent with valid session" ON public.gdpr_consent_log;

CREATE POLICY "Users can insert consent with valid session"
ON public.gdpr_consent_log
FOR INSERT
WITH CHECK (
  (user_id IS NULL AND session_id IS NOT NULL AND length(session_id) >= 16)
  OR 
  (user_id = auth.uid())
);

-- 5. Ajouter index pour performance sur analytics
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);