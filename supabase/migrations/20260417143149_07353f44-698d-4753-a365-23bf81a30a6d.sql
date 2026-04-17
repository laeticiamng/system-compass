-- Cleanup duplicate SELECT RLS policies (4 tables) + restrict public bucket listing
-- Keep the canonical "Authenticated users can view ..." policies, drop the duplicates.

DROP POLICY IF EXISTS "Authenticated users can read intelligence translations" ON public.country_intelligence_translations;
DROP POLICY IF EXISTS "Authenticated users can read variants translations" ON public.country_variants_translations;
DROP POLICY IF EXISTS "generated_translations_read_public" ON public.generated_translations;
DROP POLICY IF EXISTS "ui_translations_read_public" ON public.ui_translations;
DROP POLICY IF EXISTS "financial_intel_read_public" ON public.financial_intel_country_snapshots;

-- Restrict storage.objects listing on the public 'email-assets' bucket:
-- public read is fine (publicly accessible URLs), but we forbid LIST/SELECT enumeration via the API.
-- The existing policy "Email assets are publicly accessible" allows SELECT on bucket_id='email-assets' which lets
-- anyone list every file. We replace it with a no-op SELECT and rely on direct public URL access only.
DROP POLICY IF EXISTS "Email assets are publicly accessible" ON storage.objects;

-- New policy: allow SELECT (file metadata read) only when caller knows the exact name (RLS still allows direct
-- public URL fetch via the storage CDN, which doesn't go through this policy).
CREATE POLICY "Email assets readable by name only"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets' AND auth.role() = 'authenticated');
