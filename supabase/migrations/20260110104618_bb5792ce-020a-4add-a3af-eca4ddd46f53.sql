-- Create enum for partner types
CREATE TYPE public.partner_type AS ENUM ('ambassador', 'b2b_partner');

-- Create enum for application status
CREATE TYPE public.partner_application_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create partner applications table
CREATE TABLE public.partner_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    partner_type partner_type NOT NULL,
    status partner_application_status NOT NULL DEFAULT 'pending',
    company_name TEXT,
    professional_profile TEXT,
    motivation TEXT NOT NULL,
    platform_experience TEXT,
    ethics_charter_accepted BOOLEAN NOT NULL DEFAULT false,
    ethics_charter_accepted_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, partner_type)
);

-- Create partner contributions table
CREATE TABLE public.partner_contributions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contribution_type TEXT NOT NULL,
    description TEXT NOT NULL,
    impact_metric TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    credits_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner benefits table
CREATE TABLE public.partner_benefits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    benefit_type TEXT NOT NULL,
    description TEXT NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_benefits ENABLE ROW LEVEL SECURITY;

-- RLS policies for partner_applications
CREATE POLICY "Users can view their own applications"
ON public.partner_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.partner_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications"
ON public.partner_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- RLS policies for partner_contributions
CREATE POLICY "Users can view their own contributions"
ON public.partner_contributions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contributions"
ON public.partner_contributions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for partner_benefits
CREATE POLICY "Users can view their own benefits"
ON public.partner_benefits FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_partner_applications_updated_at
BEFORE UPDATE ON public.partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();