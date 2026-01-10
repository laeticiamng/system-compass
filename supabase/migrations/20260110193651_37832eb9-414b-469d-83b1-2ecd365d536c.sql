-- Fix the permissive policy for generation_notifications
-- The system insert policy needs true because edge functions insert on behalf of users

-- Drop the existing policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.generation_notifications;

-- Create a more restrictive insert policy - only allow inserts where user_id matches a valid user
CREATE POLICY "System can insert notifications for users" 
ON public.generation_notifications 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)
);

-- Add realtime for generation_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_notifications;