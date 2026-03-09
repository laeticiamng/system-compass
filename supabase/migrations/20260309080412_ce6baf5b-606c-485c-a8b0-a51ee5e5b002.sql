
-- P0: Fix generation_notifications INSERT policy - prevent arbitrary notification injection
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.generation_notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.generation_notifications;
CREATE POLICY "Users can insert own notifications" ON public.generation_notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- P0: Fix pmo_generated_packs SELECT policy - require owner or explicit token match
DROP POLICY IF EXISTS "Users can view shared packs" ON public.pmo_generated_packs;
DROP POLICY IF EXISTS "Users can view own packs" ON public.pmo_generated_packs;
CREATE POLICY "Users can view own packs" ON public.pmo_generated_packs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- P1: Restrict country_generation_jobs to admin only
DROP POLICY IF EXISTS "Authenticated users can manage generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Authenticated users can view generation jobs" ON public.country_generation_jobs;
DROP POLICY IF EXISTS "Admins can manage generation jobs" ON public.country_generation_jobs;
CREATE POLICY "Admins can manage generation jobs" ON public.country_generation_jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- P1: Restrict country_generation_batches to admin only
DROP POLICY IF EXISTS "Authenticated users can manage generation batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Authenticated users can view generation batches" ON public.country_generation_batches;
DROP POLICY IF EXISTS "Admins can manage generation batches" ON public.country_generation_batches;
CREATE POLICY "Admins can manage generation batches" ON public.country_generation_batches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
