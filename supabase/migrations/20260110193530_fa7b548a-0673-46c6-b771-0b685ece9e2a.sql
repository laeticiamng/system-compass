-- Create missing tables and fix security

-- Drop existing problematic policies before recreating
DROP POLICY IF EXISTS "Authenticated users can view generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Authenticated users can insert generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Authenticated users can update generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Users can view their batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Users can insert their batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Users can update their batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Authenticated can view translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated can insert translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated can update translations" ON public.generated_translations;

-- Create proper policies with authentication check for country_generation_jobs
CREATE POLICY "Authenticated users can view generation jobs" 
ON public.country_generation_jobs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert generation jobs" 
ON public.country_generation_jobs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update generation jobs" 
ON public.country_generation_jobs 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Fix country_generation_batches
CREATE POLICY "Users can view their batches" 
ON public.country_generation_batches 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their batches" 
ON public.country_generation_batches 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their batches" 
ON public.country_generation_batches 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Fix generated_translations
CREATE POLICY "Authenticated can view translations" 
ON public.generated_translations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert translations" 
ON public.generated_translations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update translations" 
ON public.generated_translations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create generation_notifications table for tracking notifications
CREATE TABLE IF NOT EXISTS public.generation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.country_generation_jobs(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.country_generation_batches(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('job_completed', 'job_failed', 'batch_completed', 'batch_failed')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.generation_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" 
ON public.generation_notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" 
ON public.generation_notifications 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
ON public.generation_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create user_roles table for proper authorization
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add vacation_recommendations table
CREATE TABLE IF NOT EXISTS public.vacation_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  origin_country TEXT NOT NULL,
  destinations JSONB NOT NULL DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vacation_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vacation recommendations" 
ON public.vacation_recommendations 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users insert own vacation recommendations" 
ON public.vacation_recommendations 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own vacation recommendations" 
ON public.vacation_recommendations 
FOR DELETE 
USING (user_id = auth.uid());