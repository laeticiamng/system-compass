-- Tighten the public insert policy on error_logs with payload validation.
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;

CREATE POLICY "Anyone can insert validated error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (
    level IN ('error','warn','info','fatal')
    AND char_length(message) BETWEEN 1 AND 2000
    AND char_length(source) BETWEEN 1 AND 100
  );
