-- =============================================
-- SECURITY HARDENING v2: Proper RLS Policies
-- Fix the 5 remaining ERROR findings
-- =============================================

-- 1. PROFILES: Drop incorrect policy and create proper one
DROP POLICY IF EXISTS "Block anonymous profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable only by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Proper authenticated-only policy for profiles
CREATE POLICY "Profiles viewable by authenticated owner only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 2. USER_SUBSCRIPTIONS: Clean up and create proper policy
DROP POLICY IF EXISTS "Block anonymous subscription access" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;

CREATE POLICY "Subscriptions viewable by owner only" 
ON public.user_subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 3. NEWSLETTER_SUBSCRIPTIONS: Restrict to admins only
DROP POLICY IF EXISTS "Block anonymous newsletter access" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can view all newsletter subscriptions" ON public.newsletter_subscriptions;

CREATE POLICY "Newsletter subs viewable by admins only" 
ON public.newsletter_subscriptions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. EVENT_REGISTRATIONS: Clean up and create proper policies
DROP POLICY IF EXISTS "Block anonymous event registrations access" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;

CREATE POLICY "Event registrations viewable by owner" 
ON public.event_registrations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all event registrations" 
ON public.event_registrations 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. PUSH_SUBSCRIPTIONS: Clean up and create proper policies
DROP POLICY IF EXISTS "Block anonymous push subscriptions access" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Push subs viewable by owner only" 
ON public.push_subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Push subs insertable by owner only" 
ON public.push_subscriptions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Push subs updatable by owner only" 
ON public.push_subscriptions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Push subs deletable by owner only" 
ON public.push_subscriptions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);