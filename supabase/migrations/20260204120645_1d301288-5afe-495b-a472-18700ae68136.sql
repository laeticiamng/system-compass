-- Final security fixes for remaining critical errors

-- 1. UI_TRANSLATIONS - Restrict write to admin only
DROP POLICY IF EXISTS "Anyone can read translations" ON public.ui_translations;
DROP POLICY IF EXISTS "Authenticated users can insert translations" ON public.ui_translations;
DROP POLICY IF EXISTS "Authenticated users can update translations" ON public.ui_translations;

CREATE POLICY "ui_translations_read_public"
  ON public.ui_translations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "ui_translations_write_admin"
  ON public.ui_translations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ui_translations_update_admin"
  ON public.ui_translations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. GENERATED_TRANSLATIONS - Restrict write to admin only
DROP POLICY IF EXISTS "Anyone can read generated translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated users can insert generated translations" ON public.generated_translations;
DROP POLICY IF EXISTS "Authenticated users can update generated translations" ON public.generated_translations;

CREATE POLICY "generated_translations_read_public"
  ON public.generated_translations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "generated_translations_write_admin"
  ON public.generated_translations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "generated_translations_update_admin"
  ON public.generated_translations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. FINANCIAL_INTEL_COUNTRY_SNAPSHOTS - Restrict insert to admin
DROP POLICY IF EXISTS "Anyone can read financial intel" ON public.financial_intel_country_snapshots;
DROP POLICY IF EXISTS "Authenticated users can insert financial intel" ON public.financial_intel_country_snapshots;

CREATE POLICY "financial_intel_read_public"
  ON public.financial_intel_country_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "financial_intel_write_admin"
  ON public.financial_intel_country_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));