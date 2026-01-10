-- IRREVERSA - B2B Threshold Protocol Tables

-- Main table for irreversible thresholds
CREATE TABLE public.irreversa_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_name TEXT,
  
  -- Threshold identification
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  domain TEXT NOT NULL, -- 'strategic', 'financial', 'organizational', 'legal', 'ethical'
  
  -- Detection phase
  detection_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  detection_source TEXT NOT NULL, -- 'compass_analysis', 'manual', 'external_signal'
  compass_country_id TEXT, -- If detected via Pyramid Compass analysis
  
  -- Point of no return
  threshold_nature TEXT NOT NULL, -- 'resource_commitment', 'contractual', 'reputational', 'structural', 'temporal'
  irreversibility_reason TEXT NOT NULL,
  alternatives_before JSONB NOT NULL DEFAULT '[]'::jsonb, -- Frozen alternatives
  
  -- Human validation
  validated_by TEXT NOT NULL, -- Name of validator
  validator_role TEXT NOT NULL, -- 'ceo', 'board', 'founder', 'director', 'comex'
  validation_date TIMESTAMP WITH TIME ZONE,
  validation_statement TEXT, -- Explicit statement from validator
  
  -- Status (only forward movement)
  status TEXT NOT NULL DEFAULT 'detected', -- 'detected', 'marked', 'validated', 'sealed'
  sealed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata (non-editable after sealing)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Witnesses for each threshold (multiple witnesses possible)
CREATE TABLE public.irreversa_witnesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threshold_id UUID NOT NULL REFERENCES public.irreversa_thresholds(id) ON DELETE CASCADE,
  witness_name TEXT NOT NULL,
  witness_role TEXT NOT NULL,
  witness_statement TEXT,
  witnessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signature_hash TEXT -- Optional cryptographic signature
);

-- Immutable audit log (append-only)
CREATE TABLE public.irreversa_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threshold_id UUID NOT NULL REFERENCES public.irreversa_thresholds(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'marked', 'witness_added', 'validated', 'sealed'
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash TEXT, -- Hashed IP for non-repudiation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.irreversa_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irreversa_witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irreversa_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for thresholds
CREATE POLICY "Users can view their own thresholds"
  ON public.irreversa_thresholds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create thresholds"
  ON public.irreversa_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update non-sealed thresholds"
  ON public.irreversa_thresholds FOR UPDATE
  USING (auth.uid() = user_id AND status != 'sealed');

-- No delete policy - thresholds cannot be deleted

-- RLS Policies for witnesses
CREATE POLICY "Users can view witnesses of their thresholds"
  ON public.irreversa_witnesses FOR SELECT
  USING (threshold_id IN (
    SELECT id FROM public.irreversa_thresholds WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can add witnesses to non-sealed thresholds"
  ON public.irreversa_witnesses FOR INSERT
  WITH CHECK (threshold_id IN (
    SELECT id FROM public.irreversa_thresholds 
    WHERE user_id = auth.uid() AND status != 'sealed'
  ));

-- No update or delete for witnesses

-- RLS Policies for audit log (read-only for users, insert via triggers)
CREATE POLICY "Users can view audit logs of their thresholds"
  ON public.irreversa_audit_log FOR SELECT
  USING (threshold_id IN (
    SELECT id FROM public.irreversa_thresholds WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create audit entries for their thresholds"
  ON public.irreversa_audit_log FOR INSERT
  WITH CHECK (threshold_id IN (
    SELECT id FROM public.irreversa_thresholds WHERE user_id = auth.uid()
  ));

-- No update or delete for audit log

-- Create indexes
CREATE INDEX idx_irreversa_thresholds_user_id ON public.irreversa_thresholds(user_id);
CREATE INDEX idx_irreversa_thresholds_status ON public.irreversa_thresholds(status);
CREATE INDEX idx_irreversa_witnesses_threshold ON public.irreversa_witnesses(threshold_id);
CREATE INDEX idx_irreversa_audit_threshold ON public.irreversa_audit_log(threshold_id);