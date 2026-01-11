-- Fix remaining permissive policies (INSERT/UPDATE with true)

-- 1. Remove old permissive INSERT policy on analytics_sessions
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.analytics_sessions;

-- 2. Fix UPDATE policy on analytics_sessions (shouldn't allow anyone to update)
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.analytics_sessions;

CREATE POLICY "Users can update their own sessions" 
ON public.analytics_sessions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

-- 3. Clean up duplicate SELECT policies (keep one per table)
DROP POLICY IF EXISTS "Country intelligence readable by everyone" ON public.country_intelligence;
DROP POLICY IF EXISTS "Translations are publicly readable" ON public.country_intelligence_translations;
DROP POLICY IF EXISTS "Country tags readable by everyone" ON public.country_tags;
DROP POLICY IF EXISTS "Country variants are readable by everyone" ON public.country_variants;
DROP POLICY IF EXISTS "Variants translations are publicly readable" ON public.country_variants_translations;
DROP POLICY IF EXISTS "Anyone can read cached music" ON public.music_cache;