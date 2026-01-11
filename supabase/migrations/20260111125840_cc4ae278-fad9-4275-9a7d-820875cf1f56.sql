-- Restrict country_generation_jobs to admins only
DROP POLICY IF EXISTS "Users can view generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Admins can view all generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Admins can manage generation jobs" ON public.country_generation_jobs;

CREATE POLICY "Admins can view all generation jobs" 
ON public.country_generation_jobs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage generation jobs" 
ON public.country_generation_jobs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Restrict country_generation_batches to admins only
DROP POLICY IF EXISTS "Users can view generation batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Admins can view all generation batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Admins can manage generation batches" ON public.country_generation_batches;

CREATE POLICY "Admins can view all generation batches" 
ON public.country_generation_batches 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage generation batches" 
ON public.country_generation_batches 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Restrict generated_translations to admins only
DROP POLICY IF EXISTS "Users can view translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Admins can view all translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Admins can manage translations" ON public.generated_translations;

CREATE POLICY "Admins can view all translations" 
ON public.generated_translations 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage translations" 
ON public.generated_translations 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Restrict ai_activity_log to user's own data or admins
DROP POLICY IF EXISTS "Users can view their own ai activity" ON public.ai_activity_log;
DROP POLICY IF EXISTS "Users can insert their own ai activity" ON public.ai_activity_log;
DROP POLICY IF EXISTS "Admins can view all ai activity" ON public.ai_activity_log;

CREATE POLICY "Users can view their own ai activity" 
ON public.ai_activity_log 
FOR SELECT 
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own ai activity" 
ON public.ai_activity_log 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Restrict ai_usage_metering to user's own data or admins
DROP POLICY IF EXISTS "Users can view their own usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Users can manage their own usage" ON public.ai_usage_metering;
DROP POLICY IF EXISTS "Admins can view all usage" ON public.ai_usage_metering;

CREATE POLICY "Users can view their own usage" 
ON public.ai_usage_metering 
FOR SELECT 
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own usage" 
ON public.ai_usage_metering 
FOR ALL 
USING (auth.uid() = user_id);

-- Restrict i18n_coverage_alerts to admins only
DROP POLICY IF EXISTS "Anyone can view coverage alerts" ON public.i18n_coverage_alerts;
DROP POLICY IF EXISTS "Admins can view coverage alerts" ON public.i18n_coverage_alerts;
DROP POLICY IF EXISTS "Admins can manage coverage alerts" ON public.i18n_coverage_alerts;

CREATE POLICY "Admins can view coverage alerts" 
ON public.i18n_coverage_alerts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage coverage alerts" 
ON public.i18n_coverage_alerts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));