DO $$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'purge-error-logs-daily';
  IF v_jobid IS NOT NULL THEN PERFORM cron.unschedule(v_jobid); END IF;

  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'check-error-rate-15min';
  IF v_jobid IS NOT NULL THEN PERFORM cron.unschedule(v_jobid); END IF;
END $$;

SELECT cron.schedule(
  'purge-error-logs-daily',
  '17 3 * * *',
  $$ SELECT public.purge_old_error_logs(); $$
);

SELECT cron.schedule(
  'check-error-rate-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://abysiagseykztutnbjtu.supabase.co/functions/v1/check-error-rate',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);