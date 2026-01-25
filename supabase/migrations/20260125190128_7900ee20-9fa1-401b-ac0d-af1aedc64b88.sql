-- Phase 2: Evidence Vault & Priority Board tables

-- Evidence Vault table for storing sources, documents, and citations
CREATE TABLE public.pmo_evidence_vault (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'link', 'note', 'decision', 'extract')),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  source_name TEXT,
  source_date DATE,
  reliability TEXT NOT NULL DEFAULT 'unverified' CHECK (reliability IN ('high', 'medium', 'low', 'unverified')),
  tags TEXT[] DEFAULT '{}',
  version TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- AI Citations table for linking AI responses to evidence sources
CREATE TABLE public.pmo_ai_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  response_id TEXT,
  evidence_id UUID REFERENCES public.pmo_evidence_vault(id) ON DELETE CASCADE,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  citation_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Priority Scores table for storing calculated priority scores
CREATE TABLE public.pmo_priority_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  initiative_id UUID REFERENCES public.pmo_initiatives(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  weights_snapshot JSONB DEFAULT '{"businessImpact":30,"effort":20,"riskReduction":25,"deadline":15,"regulatory":10}',
  breakdown JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_mvp_mode BOOLEAN DEFAULT false,
  investor_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pmo_evidence_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_ai_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_priority_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pmo_evidence_vault
CREATE POLICY "Users can view their own evidence" 
ON public.pmo_evidence_vault 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evidence" 
ON public.pmo_evidence_vault 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence" 
ON public.pmo_evidence_vault 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence" 
ON public.pmo_evidence_vault 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for pmo_ai_citations
CREATE POLICY "Users can view their own citations" 
ON public.pmo_ai_citations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own citations" 
ON public.pmo_ai_citations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own citations" 
ON public.pmo_ai_citations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for pmo_priority_scores
CREATE POLICY "Users can view their own priority scores" 
ON public.pmo_priority_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own priority scores" 
ON public.pmo_priority_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own priority scores" 
ON public.pmo_priority_scores 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own priority scores" 
ON public.pmo_priority_scores 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_pmo_evidence_vault_updated_at
BEFORE UPDATE ON public.pmo_evidence_vault
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_pmo_evidence_vault_case_id ON public.pmo_evidence_vault(case_id);
CREATE INDEX idx_pmo_evidence_vault_type ON public.pmo_evidence_vault(evidence_type);
CREATE INDEX idx_pmo_ai_citations_case_id ON public.pmo_ai_citations(case_id);
CREATE INDEX idx_pmo_ai_citations_evidence_id ON public.pmo_ai_citations(evidence_id);
CREATE INDEX idx_pmo_priority_scores_case_id ON public.pmo_priority_scores(case_id);
CREATE INDEX idx_pmo_priority_scores_initiative_id ON public.pmo_priority_scores(initiative_id);