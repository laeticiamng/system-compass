-- SÉCURITÉ v7.0.1 : Documentation policies explicites pour tables publiques

-- 1. Policy explicite pour countries (documentation - table déjà avec RLS)
DROP POLICY IF EXISTS "Countries data is publicly readable for app functionality" ON public.countries;
CREATE POLICY "Countries data is publicly readable for app functionality"
ON public.countries
FOR SELECT
USING (true);