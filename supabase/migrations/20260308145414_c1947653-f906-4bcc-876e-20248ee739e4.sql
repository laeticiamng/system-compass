-- Clean up redundant duplicate RLS policies on event_registrations
DROP POLICY IF EXISTS "Authenticated users can register for events" ON event_registrations;
DROP POLICY IF EXISTS "Event registration with validation" ON event_registrations;
DROP POLICY IF EXISTS "Guests can register with valid email" ON event_registrations;
DROP POLICY IF EXISTS "Users can create event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Event registrations viewable by owner" ON event_registrations;
DROP POLICY IF EXISTS "Users can view own event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;

-- Clean up redundant duplicate RLS policies on newsletter_subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Newsletter subs viewable by admins only" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Newsletter subscribe with email validation" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Only admins can view newsletter subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can insert newsletter subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscriptions;

-- Keep only the clean canonical policies:
-- event_registrations: registrations_safe_insert (INSERT), registrations_strict_select (SELECT), registrations_owner_update (UPDATE), registrations_owner_delete (DELETE)
-- newsletter_subscriptions: newsletter_safe_insert (INSERT), newsletter_strict_select (SELECT)