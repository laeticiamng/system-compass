
-- Healthcare country data table
CREATE TABLE public.healthcare_country_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  
  -- Diploma recognition
  diploma_authority_name TEXT NOT NULL,
  diploma_authority_acronym TEXT,
  diploma_recognition_url TEXT,
  diploma_recognition_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  diploma_recognition_duration_months INTEGER,
  diploma_recognition_cost_eur INTEGER,
  
  -- Licensing
  licensing_authority_name TEXT,
  licensing_authority_level TEXT, -- 'national', 'cantonal', 'departmental', 'state'
  licensing_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  language_requirements JSONB,
  
  -- Professional liability insurance
  insurance_mandatory BOOLEAN NOT NULL DEFAULT true,
  insurance_min_coverage_eur INTEGER,
  insurance_providers JSONB DEFAULT '[]'::jsonb,
  insurance_notes TEXT,
  
  -- Social protection
  social_protection_system TEXT,
  health_insurance_system TEXT,
  pension_system JSONB,
  cross_border_agreements JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  specialties_covered TEXT[] DEFAULT ARRAY['general_medicine', 'nursing', 'pharmacy', 'dentistry'],
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_urls JSONB DEFAULT '[]'::jsonb,
  data_confidence TEXT DEFAULT 'verified', -- 'verified', 'ai_generated', 'community_reported'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(country_id)
);

-- Healthcare document checklists  
CREATE TABLE public.healthcare_document_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL DEFAULT 'general_medicine',
  origin_region TEXT NOT NULL DEFAULT 'eu', -- 'eu', 'non_eu', 'specific_country'
  
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Each doc: { name, description, required, estimated_processing_days, official_source_url, order }
  
  total_estimated_weeks INTEGER,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_urls JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(country_id, specialty, origin_region)
);

-- Add professional_track to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_track TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_specialty TEXT;

-- RLS
ALTER TABLE public.healthcare_country_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_document_checklists ENABLE ROW LEVEL SECURITY;

-- Public read access (reference data)
CREATE POLICY "Healthcare data is publicly readable" ON public.healthcare_country_data
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Healthcare checklists are publicly readable" ON public.healthcare_document_checklists
  FOR SELECT TO authenticated, anon USING (true);

-- Indexes
CREATE INDEX idx_healthcare_country ON public.healthcare_country_data(country_id);
CREATE INDEX idx_healthcare_checklist_country ON public.healthcare_document_checklists(country_id, specialty);
