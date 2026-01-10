-- Create vacation_recommendations table if not exists
CREATE TABLE IF NOT EXISTS public.vacation_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  origin_country TEXT NOT NULL,
  destinations JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (will not error if already enabled)
ALTER TABLE public.vacation_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can create their own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can delete their own vacation recommendations" ON public.vacation_recommendations;

-- Create policies
CREATE POLICY "Users can view their own vacation recommendations"
ON public.vacation_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vacation recommendations"
ON public.vacation_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacation recommendations"
ON public.vacation_recommendations
FOR DELETE
USING (auth.uid() = user_id);

-- Create user_notifications table if not exists
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'low',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.user_notifications;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.user_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.user_notifications
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_vacation_recommendations_user_id ON public.vacation_recommendations(user_id);