import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WINDOW_MIN = 15;
const ERROR_THRESHOLD = Number(Deno.env.get('ERROR_RATE_THRESHOLD') ?? '10');
const ALERT_TO = Deno.env.get('ALERT_EMAIL_TO') ?? '';
const ALERT_FROM = Deno.env.get('ALERT_EMAIL_FROM') ?? 'onboarding@resend.dev';
const COOLDOWN_MIN = 60;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
    const { count, error } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .eq('level', 'error')
      .gte('created_at', since);

    if (error) throw error;
    const errorCount = count ?? 0;

    if (errorCount < ERROR_THRESHOLD) {
      return json({ ok: true, errorCount, threshold: ERROR_THRESHOLD, alerted: false });
    }

    // Cooldown: do not spam if we already alerted in the last hour
    const cooldownSince = new Date(Date.now() - COOLDOWN_MIN * 60_000).toISOString();
    const { count: recentAlerts } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'alerting')
      .gte('created_at', cooldownSince);

    if ((recentAlerts ?? 0) > 0) {
      return json({ ok: true, errorCount, alerted: false, reason: 'cooldown' });
    }

    const RESEND = Deno.env.get('RESEND_API_KEY');
    if (!RESEND || !ALERT_TO) {
      return json({ ok: false, errorCount, alerted: false, reason: 'missing_secrets' }, 200);
    }

    // Top 5 messages
    const { data: top } = await supabase
      .from('error_logs')
      .select('message, source, url')
      .eq('level', 'error')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5);

    const html = `
      <h2>🚨 Error rate alert</h2>
      <p><strong>${errorCount}</strong> errors in the last ${WINDOW_MIN} minutes
        (threshold: ${ERROR_THRESHOLD}).</p>
      <h3>Recent samples</h3>
      <ul>${(top ?? [])
        .map(
          (e) =>
            `<li><code>${escapeHtml(e.source)}</code> — ${escapeHtml(
              e.message
            )} <small>${escapeHtml(e.url ?? '')}</small></li>`
        )
        .join('')}</ul>
      <p><a href="https://world-alignment.lovable.app/admin/governance">Open governance dashboard →</a></p>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: ALERT_FROM,
        to: [ALERT_TO],
        subject: `🚨 ${errorCount} errors in ${WINDOW_MIN}min`,
        html,
      }),
    });

    const sent = resp.ok;

    // Log the alert itself (so cooldown works)
    await supabase.from('error_logs').insert([
      {
        level: sent ? 'info' : 'warn',
        source: 'alerting',
        message: sent
          ? `Alert sent: ${errorCount} errors`
          : `Alert send failed: ${resp.status}`,
        context: { errorCount, threshold: ERROR_THRESHOLD, window_min: WINDOW_MIN },
      },
    ]);

    return json({ ok: true, errorCount, alerted: sent });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
