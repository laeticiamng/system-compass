import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Check {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
  detail?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const checks: Check[] = [];
  const t0 = Date.now();

  // 1. Database
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const start = Date.now();
    const { error } = await supabase.from('countries').select('id', { head: true, count: 'exact' }).limit(1);
    checks.push({
      name: 'database',
      status: error ? 'down' : 'ok',
      latency_ms: Date.now() - start,
      detail: error?.message,
    });
  } catch (e) {
    checks.push({ name: 'database', status: 'down', detail: String(e) });
  }

  // 2. Auth API
  try {
    const start = Date.now();
    const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/health`, {
      headers: { apikey: Deno.env.get('SUPABASE_ANON_KEY')! },
    });
    checks.push({
      name: 'auth',
      status: r.ok ? 'ok' : 'degraded',
      latency_ms: Date.now() - start,
    });
  } catch (e) {
    checks.push({ name: 'auth', status: 'down', detail: String(e) });
  }

  // 3. Recent error rate (degraded if > 20 in last 5min)
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const since = new Date(Date.now() - 5 * 60_000).toISOString();
    const { count } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .eq('level', 'error')
      .gte('created_at', since);
    const errs = count ?? 0;
    checks.push({
      name: 'error_rate_5min',
      status: errs > 20 ? 'degraded' : 'ok',
      detail: `${errs} errors in last 5min`,
    });
  } catch {
    // non-fatal
  }

  const overall: 'ok' | 'degraded' | 'down' = checks.some((c) => c.status === 'down')
    ? 'down'
    : checks.some((c) => c.status === 'degraded')
      ? 'degraded'
      : 'ok';

  return new Response(
    JSON.stringify({
      status: overall,
      checks,
      total_latency_ms: Date.now() - t0,
      timestamp: new Date().toISOString(),
    }),
    {
      status: overall === 'down' ? 503 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
