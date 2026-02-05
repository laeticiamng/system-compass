-- Add profile_type and matched_countries to user_test_results
ALTER TABLE public.user_test_results 
ADD COLUMN IF NOT EXISTS profile_type TEXT,
ADD COLUMN IF NOT EXISTS matched_countries JSONB DEFAULT '[]'::jsonb;

-- Create index for profile_type lookups
CREATE INDEX IF NOT EXISTS idx_user_test_results_profile_type 
ON public.user_test_results(profile_type);

COMMENT ON COLUMN public.user_test_results.profile_type IS 'User profile type (e.g., Explorateur Prudent, Stratège Fiscal)';
COMMENT ON COLUMN public.user_test_results.matched_countries IS 'Top matching countries with compatibility scores';