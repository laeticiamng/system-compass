-- Update subscription_plans with current Stripe price IDs
-- Previously these were hardcoded in stripe-webhook; now the database is the single source of truth

-- Update premium plan with current price ID
UPDATE public.subscription_plans
SET
  stripe_price_id = 'price_1SxpOSDFa5Y9NR1I05modzpV',
  updated_at = now()
WHERE tier = 'premium';

-- Ensure the legacy premium price is also resolvable
-- Since stripe_price_id has a UNIQUE constraint, we track legacy prices
-- by adding them as inactive duplicate rows if needed
-- For now, the webhook's product-ID fallback handles legacy prices
