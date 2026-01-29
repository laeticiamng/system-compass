-- Fix overly permissive RLS policies

-- Drop permissive policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;

-- Newsletter: Allow insert but only with valid email format (rate limiting should be at application level)
CREATE POLICY "Insert newsletter subscription with email"
ON public.newsletter_subscriptions
FOR INSERT
TO public
WITH CHECK (
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Events: Allow authenticated users to register OR guests with valid email
CREATE POLICY "Authenticated users can register for events"
ON public.event_registrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow guest registrations with valid email (anon access)
CREATE POLICY "Guests can register with valid email"
ON public.event_registrations
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL AND 
  guest_name IS NOT NULL AND 
  guest_email IS NOT NULL AND
  guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);