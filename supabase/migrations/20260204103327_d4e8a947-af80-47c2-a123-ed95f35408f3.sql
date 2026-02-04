-- =============================================
-- SECURITY HARDENING: Block Anonymous Access
-- =============================================

-- 1. profiles: Block anonymous SELECT
DROP POLICY IF EXISTS "Block anonymous profiles access" ON public.profiles;
CREATE POLICY "Block anonymous profiles access" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);

-- 2. user_subscriptions: Block anonymous SELECT  
DROP POLICY IF EXISTS "Block anonymous subscription access" ON public.user_subscriptions;
CREATE POLICY "Block anonymous subscription access" 
ON public.user_subscriptions 
FOR SELECT 
TO anon
USING (false);

-- 3. newsletter_subscriptions: Block anonymous SELECT (already admin-only but explicit)
DROP POLICY IF EXISTS "Block anonymous newsletter access" ON public.newsletter_subscriptions;
CREATE POLICY "Block anonymous newsletter access" 
ON public.newsletter_subscriptions 
FOR SELECT 
TO anon
USING (false);

-- 4. event_registrations: Block anonymous SELECT
DROP POLICY IF EXISTS "Block anonymous event registrations access" ON public.event_registrations;
CREATE POLICY "Block anonymous event registrations access" 
ON public.event_registrations 
FOR SELECT 
TO anon
USING (false);

-- 5. push_subscriptions: Ensure table has RLS and block anonymous access
ALTER TABLE IF EXISTS public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block anonymous push subscriptions access" ON public.push_subscriptions;
CREATE POLICY "Block anonymous push subscriptions access" 
ON public.push_subscriptions 
FOR SELECT 
TO anon
USING (false);

DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions" 
ON public.push_subscriptions 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);