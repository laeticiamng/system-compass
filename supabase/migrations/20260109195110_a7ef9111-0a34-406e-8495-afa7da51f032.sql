-- Table for decision change history (audit log)
CREATE TABLE public.traceos_decision_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.traceos_decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted'
  changes JSONB NOT NULL DEFAULT '{}', -- stores field changes with old/new values
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traceos_decision_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "Users can view history of their decisions"
  ON public.traceos_decision_history
  FOR SELECT
  USING (decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create history entries for their decisions"
  ON public.traceos_decision_history
  FOR INSERT
  WITH CHECK (decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  ));

-- Table for approval workflows
CREATE TABLE public.traceos_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]', -- array of {order, name, required_approvers, type}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traceos_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workflows"
  ON public.traceos_workflows
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table for decision approvals
CREATE TABLE public.traceos_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.traceos_decisions(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.traceos_workflows(id) ON DELETE SET NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  step_name TEXT NOT NULL,
  approver_id UUID,
  approver_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  signature_hash TEXT, -- hash of approval for verification
  comment TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traceos_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approvals for their decisions"
  ON public.traceos_approvals
  FOR SELECT
  USING (decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create approvals for their decisions"
  ON public.traceos_approvals
  FOR INSERT
  WITH CHECK (decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update approvals"
  ON public.traceos_approvals
  FOR UPDATE
  USING (decision_id IN (
    SELECT id FROM public.traceos_decisions WHERE user_id = auth.uid()
  ));

-- Table for webhooks configuration
CREATE TABLE public.traceos_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'custom', -- 'slack', 'teams', 'notion', 'custom'
  events JSONB NOT NULL DEFAULT '["decision_created", "decision_updated", "decision_validated"]',
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traceos_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own webhooks"
  ON public.traceos_webhooks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_traceos_workflows_updated_at
  BEFORE UPDATE ON public.traceos_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_traceos_webhooks_updated_at
  BEFORE UPDATE ON public.traceos_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();