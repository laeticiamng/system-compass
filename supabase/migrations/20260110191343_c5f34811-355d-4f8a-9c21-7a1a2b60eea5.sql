-- Create new tables for enhanced functionality

-- 1. Create notification_settings table for push notifications
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  slack_webhook_url TEXT,
  deadline_reminder_days INTEGER DEFAULT 3,
  weekly_digest BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create proper policies
CREATE POLICY "Users can view own notification settings" 
ON public.notification_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" 
ON public.notification_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" 
ON public.notification_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create i18n_coverage_alerts table to track coverage history
CREATE TABLE IF NOT EXISTS public.i18n_coverage_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coverage_percentage DECIMAL(5,2) NOT NULL,
  missing_keys_count INTEGER NOT NULL,
  languages_data JSONB DEFAULT '{}',
  alert_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.i18n_coverage_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT for monitoring
CREATE POLICY "Anyone can view coverage alerts" 
ON public.i18n_coverage_alerts 
FOR SELECT 
USING (true);

-- Only service role can insert/update
CREATE POLICY "Service role can manage coverage alerts" 
ON public.i18n_coverage_alerts 
FOR ALL 
USING (auth.role() = 'service_role');

-- 3. Create ovi_suggestions table to link simulations to OVI content
CREATE TABLE IF NOT EXISTS public.ovi_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  simulation_type TEXT NOT NULL, -- 'country_view', 'comparison', 'exit_key', etc.
  simulation_context JSONB NOT NULL, -- country_ids, exit_key_ids, etc.
  suggested_frameworks TEXT[] DEFAULT '{}',
  suggested_grids TEXT[] DEFAULT '{}',
  relevance_score INTEGER DEFAULT 0,
  viewed_at TIMESTAMP WITH TIME ZONE,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ovi_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
CREATE POLICY "Users can view own ovi suggestions" 
ON public.ovi_suggestions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage ovi suggestions" 
ON public.ovi_suggestions 
FOR ALL 
USING (auth.role() = 'service_role');

-- 4. Create exit_keys_history to track user's exit key explorations
CREATE TABLE IF NOT EXISTS public.exit_keys_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exit_key_id TEXT NOT NULL,
  country_id TEXT,
  compatibility_score INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'explored', -- 'explored', 'saved', 'dismissed', 'in_progress'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exit_keys_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exit keys history" 
ON public.exit_keys_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exit keys history" 
ON public.exit_keys_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exit keys history" 
ON public.exit_keys_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exit keys history" 
ON public.exit_keys_history 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE TRIGGER update_exit_keys_history_updated_at
BEFORE UPDATE ON public.exit_keys_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();