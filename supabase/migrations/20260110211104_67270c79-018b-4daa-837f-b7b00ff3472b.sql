-- Fix overly permissive RLS policy on user_notifications
-- Drop the permissive policy and replace with proper user-scoped policy
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.user_notifications;

-- Only authenticated users can insert notifications for themselves OR service role can insert any
CREATE POLICY "Users can insert their own notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);