-- ============================================
-- Security Fix: Newsletter Subscriptions & Music Tasks RLS
-- ============================================

-- 1. Fix newsletter_subscriptions: Replace overly permissive INSERT policy
-- The current policy allows anyone to insert, which enables spam attacks
-- New policy: Require authentication OR implement rate limiting via service role

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Insert newsletter subscription with email" ON public.newsletter_subscriptions;

-- Create a new INSERT policy that requires authentication for inserts
-- Anonymous newsletter signups will go through an edge function with rate limiting
CREATE POLICY "Authenticated users can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
TO authenticated
WITH CHECK (
  email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Service role will be used for anonymous subscriptions (via edge function)
-- This prevents direct spam attacks while allowing legitimate signups

-- 2. Fix music_generation_tasks: Remove public SELECT access
-- The current policy exposes internal system data

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read music tasks" ON public.music_generation_tasks;

-- Keep only the authenticated users policy
-- The existing "Authenticated users can view music tasks with ownership" is already correct

-- Add a policy for service role to manage tasks (for edge functions)
CREATE POLICY "Service role manages music tasks"
ON public.music_generation_tasks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);