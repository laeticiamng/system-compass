
-- Create account_deletion_audit table for GDPR compliance
CREATE TABLE public.account_deletion_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  deletion_results JSONB,
  tables_cleaned INTEGER,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_deletion_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view deletion audit logs"
ON public.account_deletion_audit
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role inserts (from edge function) bypass RLS, no INSERT policy needed for regular users

-- Add security_barrier to experts_public view to prevent predicate pushdown attacks
DROP VIEW IF EXISTS public.experts_public;
CREATE VIEW public.experts_public WITH (security_barrier = true) AS
SELECT 
  id, display_name, avatar_url, bio, specialties, countries,
  languages, certifications, hourly_rate, currency, booking_url,
  is_verified, rating_avg, review_count, response_time_hours,
  created_at, updated_at
FROM public.experts
WHERE is_active = true;

-- Restore grants for the view
GRANT SELECT ON public.experts_public TO anon, authenticated;

-- Mark view as security definer
ALTER VIEW public.experts_public SET (security_invoker = false);

COMMENT ON VIEW public.experts_public IS 'SECURITY DEFINER view - intentionally bypasses RLS to expose only safe public columns for the expert marketplace. Sensitive fields (user_id, stripe_account_id) are excluded. security_barrier=true prevents predicate pushdown attacks.';
