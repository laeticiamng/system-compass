-- Fix overly permissive RLS policies for ui_translations
-- Remove the public INSERT policy and restrict to admins only

DROP POLICY IF EXISTS "Anyone can insert translations" ON public.ui_translations;
DROP POLICY IF EXISTS "Authenticated users can insert translations" ON public.ui_translations;
DROP POLICY IF EXISTS "Authenticated users can update translations" ON public.ui_translations;

-- Only admins can insert translations
CREATE POLICY "Admins can insert translations"
  ON public.ui_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update translations
CREATE POLICY "Admins can update translations"
  ON public.ui_translations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix financial_intel_country_snapshots - restrict insert to authenticated users with proper check
DROP POLICY IF EXISTS "Authenticated users can create snapshots" ON public.financial_intel_country_snapshots;

CREATE POLICY "Authenticated users can create snapshots"
  ON public.financial_intel_country_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix financial_intel_generation_runs - require user_id match
DROP POLICY IF EXISTS "Users can create generation runs" ON public.financial_intel_generation_runs;

CREATE POLICY "Users can create generation runs"
  ON public.financial_intel_generation_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);