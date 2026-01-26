-- =============================================
-- AUDIT SÉCURITÉ - Protection des données propriétaires
-- =============================================

-- 1. subscription_plans - rendre accessible uniquement aux utilisateurs authentifiés
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow public read access to subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Authenticated users can view subscription plans" ON public.subscription_plans;

-- Nouvelle policy : lecture pour utilisateurs authentifiés uniquement
CREATE POLICY "Authenticated users can view subscription plans"
ON public.subscription_plans FOR SELECT
TO authenticated
USING (true);

-- 2. financial_intel_country_snapshots - restreindre aux utilisateurs authentifiés
ALTER TABLE public.financial_intel_country_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read financial intel snapshots" ON public.financial_intel_country_snapshots;
DROP POLICY IF EXISTS "Authenticated users can view financial intel" ON public.financial_intel_country_snapshots;

CREATE POLICY "Authenticated users can view financial intel"
ON public.financial_intel_country_snapshots FOR SELECT
TO authenticated
USING (true);

-- 3. country_intelligence - protéger la propriété intellectuelle
ALTER TABLE public.country_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read country intelligence" ON public.country_intelligence;
DROP POLICY IF EXISTS "Authenticated users can view country intelligence" ON public.country_intelligence;

CREATE POLICY "Authenticated users can view country intelligence"
ON public.country_intelligence FOR SELECT
TO authenticated
USING (true);

-- 4. country_variants - protéger les guides expat premium
ALTER TABLE public.country_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read country variants" ON public.country_variants;
DROP POLICY IF EXISTS "Authenticated users can view country variants" ON public.country_variants;

CREATE POLICY "Authenticated users can view country variants"
ON public.country_variants FOR SELECT
TO authenticated
USING (true);

-- 5. country_governance - protéger l'intelligence B2B
ALTER TABLE public.country_governance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read country governance" ON public.country_governance;
DROP POLICY IF EXISTS "Authenticated users can view country governance" ON public.country_governance;

CREATE POLICY "Authenticated users can view country governance"
ON public.country_governance FOR SELECT
TO authenticated
USING (true);

-- 6. terrain_realities_cache - protéger les réalités terrain
ALTER TABLE public.terrain_realities_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read terrain realities" ON public.terrain_realities_cache;
DROP POLICY IF EXISTS "Authenticated users can view terrain realities" ON public.terrain_realities_cache;

CREATE POLICY "Authenticated users can view terrain realities"
ON public.terrain_realities_cache FOR SELECT
TO authenticated
USING (true);

-- 7. music_generation_tasks - restreindre aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view music tasks" ON public.music_generation_tasks;
DROP POLICY IF EXISTS "Authenticated users can view music tasks" ON public.music_generation_tasks;

CREATE POLICY "Authenticated users can view music tasks"
ON public.music_generation_tasks FOR SELECT
TO authenticated
USING (true);

-- 8. country_tags - protéger le système de classification
ALTER TABLE public.country_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read country tags" ON public.country_tags;
DROP POLICY IF EXISTS "Authenticated users can view country tags" ON public.country_tags;

CREATE POLICY "Authenticated users can view country tags"
ON public.country_tags FOR SELECT
TO authenticated
USING (true);

-- 9. countries - table de base, garder publique pour la navigation mais considérer restriction
-- On la garde publique car c'est nécessaire pour la landing page

-- 10. country_intelligence_translations - protéger les traductions
ALTER TABLE public.country_intelligence_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view intelligence translations" ON public.country_intelligence_translations;

CREATE POLICY "Authenticated users can view intelligence translations"
ON public.country_intelligence_translations FOR SELECT
TO authenticated
USING (true);

-- 11. country_variants_translations - protéger les traductions variants
ALTER TABLE public.country_variants_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view variants translations" ON public.country_variants_translations;

CREATE POLICY "Authenticated users can view variants translations"
ON public.country_variants_translations FOR SELECT
TO authenticated
USING (true);