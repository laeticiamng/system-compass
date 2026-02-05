-- Add subscription_tier column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro'));

-- Add stripe_customer_id for easy lookup during webhook processing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);