-- =====================================================
-- AUDIT v6.2 - Critical RLS Security Hardening
-- Fix: analytics_sessions, analytics_events, newsletter, 
-- event_registrations, gdpr_consent, generated_translations
-- =====================================================

-- 1. Fix analytics_sessions: require session_id validation
DROP POLICY IF EXISTS "Anyone can insert analytics sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.analytics_sessions;

CREATE POLICY "Sessions insert with validation" 
ON public.analytics_sessions 
FOR INSERT 
WITH CHECK (
  session_id IS NOT NULL 
  AND length(session_id) >= 10 
  AND length(session_id) <= 100
);

CREATE POLICY "Sessions update own only" 
ON public.analytics_sessions 
FOR UPDATE 
USING (session_id IS NOT NULL AND length(session_id) >= 10);

-- 2. Fix analytics_events: add session validation
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Events insert with session validation" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  session_id IS NOT NULL 
  AND length(session_id) >= 10 
  AND length(event_name) <= 100
  AND length(event_category) <= 50
);

-- 3. Fix newsletter_subscriptions: add email format validation
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

CREATE POLICY "Newsletter subscribe with email validation" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (
  email IS NOT NULL 
  AND length(email) >= 5 
  AND length(email) <= 255
  AND email LIKE '%@%.%'
);

-- 4. Fix event_registrations: strengthen guest validation
DROP POLICY IF EXISTS "Guest users can register for events" ON public.event_registrations;

CREATE POLICY "Event registration with validation" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (
  event_id IS NOT NULL
  AND event_title IS NOT NULL
  AND event_date IS NOT NULL
  AND (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (
      guest_email IS NOT NULL 
      AND length(guest_email) >= 5 
      AND guest_email LIKE '%@%.%'
      AND guest_name IS NOT NULL
      AND length(guest_name) >= 2
    )
  )
);

-- 5. Fix gdpr_consent_log: require session_id validation
DROP POLICY IF EXISTS "Users can log their own consent" ON public.gdpr_consent_log;

CREATE POLICY "GDPR consent with session validation" 
ON public.gdpr_consent_log 
FOR INSERT 
WITH CHECK (
  consent_type IS NOT NULL
  AND length(consent_type) >= 3
  AND (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (session_id IS NOT NULL AND length(session_id) >= 10)
  )
);

-- 6. Fix generated_translations: restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can insert translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Users can update their translations" ON public.generated_translations;

CREATE POLICY "Only admins can insert translations" 
ON public.generated_translations 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update translations" 
ON public.generated_translations 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 7. Fix country_generation_jobs: restrict to admins
DROP POLICY IF EXISTS "Authenticated users can insert generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.country_generation_jobs;

CREATE POLICY "Only admins can create generation jobs" 
ON public.country_generation_jobs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update generation jobs" 
ON public.country_generation_jobs 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 8. Add rate limiting function for newsletter (abuse prevention)
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check for rate limiting: max 3 subscriptions per hour from same IP pattern
  SELECT COUNT(*) INTO recent_count
  FROM public.newsletter_subscriptions
  WHERE created_at > NOW() - INTERVAL '1 hour'
  AND email LIKE '%' || split_part(NEW.email, '@', 2);
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded for newsletter subscriptions';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for newsletter rate limiting
DROP TRIGGER IF EXISTS newsletter_rate_limit_trigger ON public.newsletter_subscriptions;
CREATE TRIGGER newsletter_rate_limit_trigger
  BEFORE INSERT ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_newsletter_rate_limit();