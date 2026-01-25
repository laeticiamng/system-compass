-- ============================================
-- PMO Phase 3: Compliance Matrix Framework
-- ============================================

-- Compliance Frameworks (RGPD, AI Act, MDR, EHDS...)
CREATE TABLE public.pmo_compliance_frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  user_id UUID NOT NULL,
  framework_type TEXT NOT NULL, -- 'rgpd', 'ai_act', 'mdr', 'ehds', 'custom'
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  activation_questionnaire JSONB, -- Stored answers from activation wizard
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.pmo_compliance_frameworks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own compliance frameworks"
ON public.pmo_compliance_frameworks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own compliance frameworks"
ON public.pmo_compliance_frameworks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance frameworks"
ON public.pmo_compliance_frameworks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance frameworks"
ON public.pmo_compliance_frameworks
FOR DELETE
USING (auth.uid() = user_id);

-- Compliance Requirements (macro-level requirements per framework)
CREATE TABLE public.pmo_compliance_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.pmo_compliance_frameworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  requirement_code TEXT, -- e.g., 'RGPD-ART6', 'MDR-ANNEX-I'
  title TEXT NOT NULL,
  description TEXT,
  criticality TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  category TEXT, -- grouping within framework
  source_reference TEXT,
  source_version TEXT,
  source_date DATE,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'compliant', 'non_compliant', 'not_applicable'
  notes TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.pmo_compliance_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own compliance requirements"
ON public.pmo_compliance_requirements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own compliance requirements"
ON public.pmo_compliance_requirements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance requirements"
ON public.pmo_compliance_requirements
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance requirements"
ON public.pmo_compliance_requirements
FOR DELETE
USING (auth.uid() = user_id);

-- Compliance Mappings (requirement ↔ feature/initiative ↔ evidence ↔ owner)
CREATE TABLE public.pmo_compliance_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID NOT NULL REFERENCES public.pmo_compliance_requirements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mapping_type TEXT NOT NULL, -- 'initiative', 'evidence', 'milestone'
  target_id UUID NOT NULL, -- ID of the linked item
  target_title TEXT, -- Cached title for display
  coverage_status TEXT DEFAULT 'partial', -- 'full', 'partial', 'none'
  owner_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.pmo_compliance_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own compliance mappings"
ON public.pmo_compliance_mappings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own compliance mappings"
ON public.pmo_compliance_mappings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance mappings"
ON public.pmo_compliance_mappings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compliance mappings"
ON public.pmo_compliance_mappings
FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_pmo_compliance_frameworks_updated_at
  BEFORE UPDATE ON public.pmo_compliance_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_compliance_requirements_updated_at
  BEFORE UPDATE ON public.pmo_compliance_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pmo_compliance_mappings_updated_at
  BEFORE UPDATE ON public.pmo_compliance_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_pmo_compliance_frameworks_case ON public.pmo_compliance_frameworks(case_id);
CREATE INDEX idx_pmo_compliance_frameworks_user ON public.pmo_compliance_frameworks(user_id);
CREATE INDEX idx_pmo_compliance_requirements_framework ON public.pmo_compliance_requirements(framework_id);
CREATE INDEX idx_pmo_compliance_mappings_requirement ON public.pmo_compliance_mappings(requirement_id);