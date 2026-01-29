-- Fix 1: Add input validation whitelist to increment_b2b_usage() function
CREATE OR REPLACE FUNCTION public.increment_b2b_usage(p_user_id uuid, p_metric text, p_increment integer DEFAULT 1)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
  v_valid_metrics TEXT[] := ARRAY[
    'cases_created', 'cases_active', 'exports_light', 
    'exports_deep', 'risk_register_items', 'partners_vetted',
    'governance_actors', 'milestones_created'
  ];
BEGIN
  -- Validate metric name against whitelist
  IF NOT (p_metric = ANY(v_valid_metrics)) THEN
    RAISE EXCEPTION 'Invalid metric name: %', p_metric;
  END IF;
  
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  INSERT INTO b2b_usage_metering (user_id, period_start, period_end)
  VALUES (p_user_id, v_period_start, v_period_end)
  ON CONFLICT (user_id, period_start, period_end) DO NOTHING;
  
  EXECUTE format(
    'UPDATE b2b_usage_metering SET %I = %I + $1, updated_at = now() 
     WHERE user_id = $2 AND period_start = $3 AND period_end = $4',
    p_metric, p_metric
  ) USING p_increment, p_user_id, v_period_start, v_period_end;
END;
$function$;