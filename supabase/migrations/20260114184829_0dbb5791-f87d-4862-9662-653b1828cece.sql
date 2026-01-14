-- Allow public INSERT for initial seeding (translations are public data anyway)
-- This is safe because translations are non-sensitive public data
CREATE POLICY "Anyone can insert translations"
  ON public.ui_translations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);