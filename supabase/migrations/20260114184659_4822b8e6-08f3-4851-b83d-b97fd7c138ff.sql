-- Add INSERT policy for authenticated users on ui_translations
CREATE POLICY "Authenticated users can insert translations"
  ON public.ui_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update translations"
  ON public.ui_translations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);