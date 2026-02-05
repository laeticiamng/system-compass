-- Add Stripe Connect fields to experts table
ALTER TABLE public.experts 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;

-- Add expert applications table for "become an expert" flow
CREATE TABLE IF NOT EXISTS public.expert_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  countries TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  certifications JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info_needed')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own application
CREATE POLICY "Users can view own application"
ON public.expert_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own application"
ON public.expert_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending application"
ON public.expert_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all applications"
ON public.expert_applications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Index
CREATE INDEX IF NOT EXISTS idx_expert_applications_user_id ON public.expert_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_applications_status ON public.expert_applications(status);
CREATE INDEX IF NOT EXISTS idx_experts_stripe_account ON public.experts(stripe_account_id);

-- Trigger for updated_at
CREATE TRIGGER update_expert_applications_updated_at
  BEFORE UPDATE ON public.expert_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();