-- Create AI Activity Log table for audit and transparency
CREATE TABLE public.ai_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  action_type TEXT NOT NULL,
  module TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  request_summary TEXT,
  response_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  units_consumed INTEGER DEFAULT 1,
  tokens_used INTEGER,
  model_used TEXT,
  processing_time_ms INTEGER,
  user_decision TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI activity"
ON public.ai_activity_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI activity"
ON public.ai_activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI activity"
ON public.ai_activity_log FOR UPDATE
USING (auth.uid() = user_id);

-- Create AI Usage Metering table for B2B billing
CREATE TABLE public.ai_usage_metering (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  dossiers_created INTEGER DEFAULT 0,
  dossier_items_added INTEGER DEFAULT 0,
  exports_generated INTEGER DEFAULT 0,
  ai_actions_count INTEGER DEFAULT 0,
  ai_tokens_used INTEGER DEFAULT 0,
  agent_runs_count INTEGER DEFAULT 0,
  total_case_units INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 100,
  alert_70_sent BOOLEAN DEFAULT false,
  alert_90_sent BOOLEAN DEFAULT false,
  alert_100_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage_metering ENABLE ROW LEVEL SECURITY;

-- RLS Policies for metering
CREATE POLICY "Users can view their own usage"
ON public.ai_usage_metering FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.ai_usage_metering FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.ai_usage_metering FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_ai_activity_log_user_created ON public.ai_activity_log(user_id, created_at DESC);
CREATE INDEX idx_ai_activity_log_module ON public.ai_activity_log(module, action_type);
CREATE INDEX idx_ai_usage_metering_user_period ON public.ai_usage_metering(user_id, period_start, period_end);

-- Create function to update usage metering
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id UUID,
  p_action_type TEXT,
  p_units INTEGER DEFAULT 1,
  p_tokens INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current billing period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  -- Upsert usage record
  INSERT INTO ai_usage_metering (user_id, period_start, period_end, ai_actions_count, ai_tokens_used, total_case_units)
  VALUES (p_user_id, v_period_start, v_period_end, 1, p_tokens, p_units)
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET
    ai_actions_count = ai_usage_metering.ai_actions_count + 1,
    ai_tokens_used = ai_usage_metering.ai_tokens_used + p_tokens,
    total_case_units = ai_usage_metering.total_case_units + p_units,
    updated_at = now();
END;
$$;

-- Add unique constraint for upsert
ALTER TABLE public.ai_usage_metering ADD CONSTRAINT unique_user_period UNIQUE (user_id, period_start, period_end);

-- Trigger to update timestamps
CREATE TRIGGER update_ai_usage_metering_updated_at
BEFORE UPDATE ON public.ai_usage_metering
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();