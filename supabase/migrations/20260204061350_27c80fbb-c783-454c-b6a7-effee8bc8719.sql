-- =====================================================
-- FINAL SECURITY HARDENING
-- =====================================================

-- 1. PROFILES: Ensure no anonymous access is possible
-- First check and drop any public policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 2. NEWSLETTER: Remove the problematic email-based lookup
DROP POLICY IF EXISTS "Users can manage own subscription" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can manage their subscriptions" ON public.newsletter_subscriptions;

-- 3. USER_SUBSCRIPTIONS: Restrict service role policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role full access" ON public.user_subscriptions;

-- Re-create service role policy with proper naming
CREATE POLICY "Service role manages subscriptions"
  ON public.user_subscriptions
  FOR ALL
  USING (
    -- Only allow if request is from service role (server-side only)
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- 4. AI_ACTIVITY_LOG: Ensure strict user access only
DROP POLICY IF EXISTS "Admin override for AI logs" ON public.ai_activity_log;
DROP POLICY IF EXISTS "Admins can view all AI activity" ON public.ai_activity_log;

-- Admins can only view via has_role check
CREATE POLICY "Admins can view all AI activity"
  ON public.ai_activity_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));