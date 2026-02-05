-- ============================================
-- MODULE 3A: Expert Marketplace Infrastructure
-- ============================================

-- 1. Create experts table
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  countries TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]'::jsonb,
  hourly_rate NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  booking_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating_avg NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create consultation_status enum
DO $$ BEGIN
  CREATE TYPE consultation_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create payment_status enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status consultation_status DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  amount NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  payment_status payment_status DEFAULT 'pending',
  meeting_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Update expert_reviews to reference experts table (add FK if not exists)
DO $$ BEGIN
  ALTER TABLE public.expert_reviews 
    ADD CONSTRAINT fk_expert_reviews_experts 
    FOREIGN KEY (expert_id) REFERENCES public.experts(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_table THEN null;
END $$;

-- 6. Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for experts

-- Public read for active experts
CREATE POLICY "Anyone can view active experts"
ON public.experts FOR SELECT
USING (is_active = true);

-- Experts can update their own profile
CREATE POLICY "Experts can update own profile"
ON public.experts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "Admins can manage all experts"
ON public.experts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 8. RLS Policies for consultations

-- Users can see their own consultations
CREATE POLICY "Users can view own consultations"
ON public.consultations FOR SELECT
USING (auth.uid() = user_id);

-- Experts can see consultations with them
CREATE POLICY "Experts can view their consultations"
ON public.consultations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.experts 
    WHERE experts.id = consultations.expert_id 
    AND experts.user_id = auth.uid()
  )
);

-- Users can create consultations
CREATE POLICY "Users can create consultations"
ON public.consultations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their pending consultations
CREATE POLICY "Users can update own pending consultations"
ON public.consultations FOR UPDATE
USING (auth.uid() = user_id AND status = 'requested')
WITH CHECK (auth.uid() = user_id);

-- Experts can update their consultations status
CREATE POLICY "Experts can update consultation status"
ON public.consultations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.experts 
    WHERE experts.id = consultations.expert_id 
    AND experts.user_id = auth.uid()
  )
);

-- Admin can do everything
CREATE POLICY "Admins can manage all consultations"
ON public.consultations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Update expert_reviews RLS - authors can update within 48h
DROP POLICY IF EXISTS "Authors can update own reviews within 48h" ON public.expert_reviews;
CREATE POLICY "Authors can update own reviews within 48h"
ON public.expert_reviews FOR UPDATE
USING (auth.uid() = user_id AND created_at > now() - interval '48 hours')
WITH CHECK (auth.uid() = user_id);

-- 10. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON public.experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_is_active ON public.experts(is_active);
CREATE INDEX IF NOT EXISTS idx_experts_countries ON public.experts USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_experts_specialties ON public.experts USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_consultations_expert_id ON public.consultations(expert_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);

-- 11. Trigger for updated_at
CREATE TRIGGER update_experts_updated_at
  BEFORE UPDATE ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Insert sample experts data
INSERT INTO public.experts (display_name, bio, specialties, countries, languages, hourly_rate, currency, is_verified, is_active, rating_avg, review_count, response_time_hours)
VALUES
  ('Me. Sophie Durand', 'Avocate fiscaliste spécialisée en mobilité internationale. 15 ans d''expérience en optimisation fiscale pour expatriés.', ARRAY['tax_law', 'wealth_management', 'international_tax'], ARRAY['france', 'switzerland', 'luxembourg'], ARRAY['Français', 'English', 'Deutsch'], 250, 'EUR', true, true, 4.8, 47, 24),
  ('Dr. Marco Rossi', 'Expert en immigration italienne et droit des affaires. Accompagne les entrepreneurs dans leur installation en Italie.', ARRAY['immigration', 'business_setup', 'real_estate'], ARRAY['italy', 'malta'], ARRAY['Italiano', 'English', 'Français'], 180, 'EUR', true, true, 4.9, 32, 12),
  ('Ana García López', 'Spécialiste Visa Doré et résidence fiscale au Portugal et en Espagne. Plus de 500 dossiers traités.', ARRAY['immigration', 'golden_visa', 'tax_residency'], ARRAY['portugal', 'spain'], ARRAY['Español', 'Português', 'English', 'Français'], 200, 'EUR', true, true, 4.7, 89, 24),
  ('James Mitchell', 'Conseiller fiscal international certifié. Expert en structuration patrimoniale pour HNWIs.', ARRAY['tax_law', 'wealth_management', 'estate_planning'], ARRAY['uae', 'singapore', 'uk'], ARRAY['English', 'Arabic'], 350, 'USD', true, true, 4.9, 28, 48),
  ('Marie Lefebvre', 'Notaire spécialisée en transactions immobilières internationales et successions transfrontalières.', ARRAY['real_estate', 'inheritance', 'notary'], ARRAY['france', 'belgium', 'luxembourg'], ARRAY['Français', 'Nederlands', 'English'], 220, 'EUR', true, true, 4.6, 54, 24),
  ('Hans Weber', 'Expert en forfait fiscal suisse et optimisation pour résidents non-domiciliés.', ARRAY['tax_law', 'lump_sum_taxation', 'private_banking'], ARRAY['switzerland'], ARRAY['Deutsch', 'English', 'Français'], 400, 'CHF', true, true, 4.8, 19, 48);
