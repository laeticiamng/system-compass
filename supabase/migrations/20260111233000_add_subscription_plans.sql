-- Source de vérité pour les plans d'abonnement
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('premium', 'pro')),
  name TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  price_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tier)
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans are readable by everyone"
  ON public.subscription_plans
  FOR SELECT
  USING (active = true);

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.subscription_plans (
  tier,
  name,
  stripe_product_id,
  stripe_price_id,
  price_amount,
  currency,
  features
) VALUES
  (
    'premium',
    'Premium',
    'prod_TlAy1Ohjpt09BM',
    'price_1SnecEDFa5Y9NR1IjYEILvEh',
    7.99,
    'eur',
    '["Tout le contenu gratuit", "Variantes pays spécifiques", "Profils qui réussissent/souffrent", "Ce qui surprend les nouveaux"]'::jsonb
  ),
  (
    'pro',
    'Pro',
    'prod_TlAyzPHIXdTjt7',
    'price_1SnecYDFa5Y9NR1Isyw5mEyQ',
    19.99,
    'eur',
    '["Tout le contenu Premium", "Analyse projet personnalisée", "Points aveugles spécifiques", "Clés de sortie personnalisées"]'::jsonb
  );
