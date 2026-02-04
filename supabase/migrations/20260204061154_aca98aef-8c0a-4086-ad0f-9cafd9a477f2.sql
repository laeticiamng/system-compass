-- =====================================================
-- FIX REMAINING 2 ERROR ISSUES
-- =====================================================

-- 1. NEWSLETTER_SUBSCRIPTIONS: Fix any remaining public access
-- Drop all existing SELECT policies and recreate properly
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can read subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Public can read subscriptions" ON public.newsletter_subscriptions;

-- Only admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can only view their own subscription by user_id (not by email match)
CREATE POLICY "Users can view own subscription"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2. EVENT_REGISTRATIONS: Fix guest email exposure completely
-- Drop the problematic policy and ensure proper access control
DROP POLICY IF EXISTS "Users can only view their own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Guests can view their registration" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;

-- Users can only view their own registrations (authenticated with user_id)
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));