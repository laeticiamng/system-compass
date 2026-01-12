-- 1. AJOUTER stripe_product_id à subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- 2. Mettre à jour les plans avec les vrais price_id de Stripe
UPDATE public.subscription_plans 
SET stripe_price_id = 'price_1SnecEDFa5Y9NR1IjYEILvEh',
    stripe_product_id = 'prod_SQaZLNxcXH2hPq'
WHERE tier = 'premium';

UPDATE public.subscription_plans 
SET stripe_price_id = 'price_1SnecYDFa5Y9NR1Isyw5mEyQ',
    stripe_product_id = 'prod_SQaZXQ3iN1jJNH'
WHERE tier = 'pro';

-- 3. Créer index unique pour music_generation_tasks (nécessaire pour upsert)
DROP INDEX IF EXISTS idx_music_tasks_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_music_tasks_country_pyramid_mood 
ON public.music_generation_tasks (country_id, pyramid_type, mood);

-- 4. Ajouter RLS à user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
CREATE POLICY "Users can view own notifications" 
ON public.user_notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications" 
ON public.user_notifications FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "System can insert notifications" 
ON public.user_notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.user_notifications;
CREATE POLICY "Users can delete own notifications" 
ON public.user_notifications FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Ajouter RLS pour user_governance_notes
ALTER TABLE public.user_governance_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own governance notes" ON public.user_governance_notes;
CREATE POLICY "Users can manage own governance notes" 
ON public.user_governance_notes FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Ajouter RLS pour user_project_analyses
ALTER TABLE public.user_project_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own project analyses" ON public.user_project_analyses;
CREATE POLICY "Users can manage own project analyses" 
ON public.user_project_analyses FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Ajouter RLS pour user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "System can manage subscriptions" 
ON public.user_subscriptions FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Nettoyer les doublons de policies vacation_recommendations
DROP POLICY IF EXISTS "vacation_recommendations_select" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "vacation_recommendations_insert" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "vacation_recommendations_update" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "vacation_recommendations_delete" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can view own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can insert own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can update own vacation recommendations" ON public.vacation_recommendations;
DROP POLICY IF EXISTS "Users can delete own vacation recommendations" ON public.vacation_recommendations;

-- Recréer proprement
CREATE POLICY "vacation_rec_select" ON public.vacation_recommendations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vacation_rec_insert" ON public.vacation_recommendations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vacation_rec_update" ON public.vacation_recommendations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vacation_rec_delete" ON public.vacation_recommendations 
FOR DELETE USING (auth.uid() = user_id);

-- 9. Index pour performance
CREATE INDEX IF NOT EXISTS idx_music_cache_lookup 
ON public.music_cache (country_id, pyramid_type, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user 
ON public.user_notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_traceos_decisions_user 
ON public.traceos_decisions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_cases_user 
ON public.user_cases (user_id, status);