-- =============================================
-- ENRICHISSEMENT DES TABLES PAYS
-- Ajout de colonnes pour contenus premium plus détaillés
-- =============================================

-- 1. Enrichir country_variants avec plus de détails pratiques
ALTER TABLE public.country_variants
ADD COLUMN IF NOT EXISTS typical_day JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS year_one_reality JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS common_mistakes_timeline JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hidden_admin_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cultural_shocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS real_costs_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS success_timeline_months JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS expat_communities JSONB DEFAULT '[]'::jsonb;

-- 2. Enrichir country_intelligence avec stratégies profondes
ALTER TABLE public.country_intelligence
ADD COLUMN IF NOT EXISTS unspoken_rules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS negotiation_styles JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS trust_signals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS distrust_signals JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exit_difficulty JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS career_ceiling_by_profile JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hidden_hierarchies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS taboo_topics JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS decision_making_patterns JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS time_perception JSONB DEFAULT '{}'::jsonb;

-- 3. Ajouter un index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_country_variants_country_id ON public.country_variants(country_id);
CREATE INDEX IF NOT EXISTS idx_country_intelligence_country_id ON public.country_intelligence(country_id);