-- 1. Fix overly permissive RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Fix permissive policies on analytics tables (should be insert-only for users, select for admins)
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can insert analytics sessions" ON public.analytics_sessions;

CREATE POLICY "Authenticated users can insert their own analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert their own analytics sessions" 
ON public.analytics_sessions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

-- 3. Fix music_cache - should be readable by all but insertable only by authenticated
DROP POLICY IF EXISTS "Anyone can read music cache" ON public.music_cache;
DROP POLICY IF EXISTS "Anyone can insert music cache" ON public.music_cache;

CREATE POLICY "Anyone can read music cache" 
ON public.music_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert music cache" 
ON public.music_cache 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Ensure all user-specific tables have proper RLS
-- dashboard_progress
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.dashboard_progress;

CREATE POLICY "Users can view their own progress" 
ON public.dashboard_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.dashboard_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.dashboard_progress 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.dashboard_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Fix saved_comparisons policies
DROP POLICY IF EXISTS "Users can manage their saved comparisons" ON public.saved_comparisons;

CREATE POLICY "Users can view their saved comparisons" 
ON public.saved_comparisons 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their saved comparisons" 
ON public.saved_comparisons 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved comparisons" 
ON public.saved_comparisons 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved comparisons" 
ON public.saved_comparisons 
FOR DELETE 
USING (auth.uid() = user_id);