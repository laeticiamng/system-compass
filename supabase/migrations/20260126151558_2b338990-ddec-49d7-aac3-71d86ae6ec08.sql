-- Fix security: Restrict translation tables to authenticated users only
-- Issue: country_intelligence_translations and country_variants_translations are publicly readable

-- 1. Drop overly permissive public policies on country_intelligence_translations
DROP POLICY IF EXISTS "Anyone can read intelligence translations" ON public.country_intelligence_translations;

-- 2. Drop overly permissive public policies on country_variants_translations  
DROP POLICY IF EXISTS "Anyone can read variants translations" ON public.country_variants_translations;

-- 3. Ensure authenticated-only policies exist for country_intelligence_translations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'country_intelligence_translations' 
    AND policyname = 'Authenticated users can read intelligence translations'
  ) THEN
    CREATE POLICY "Authenticated users can read intelligence translations"
      ON public.country_intelligence_translations
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 4. Ensure authenticated-only policies exist for country_variants_translations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'country_variants_translations' 
    AND policyname = 'Authenticated users can read variants translations'
  ) THEN
    CREATE POLICY "Authenticated users can read variants translations"
      ON public.country_variants_translations
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;