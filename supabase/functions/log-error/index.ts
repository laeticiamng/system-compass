// Edge function: log-error
// Receives client-side errors / web vitals, sanitizes PII, persists to error_logs.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from 'https://esm.sh/zod@3.23.8';
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from '../_shared/rate-limit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LogEntrySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  source: z.enum(['web', 'edge', 'api']).default('web'),
  message: z.string().min(1).max(2000),
  stack: z.string().max(10000).optional().nullable(),
  context: z.record(z.unknown()).optional().nullable(),
  url: z.string().max(2000).optional().nullable(),
  release: z.string().max(100).optional().nullable(),
});

const BodySchema = z.object({
  entries: z.array(LogEntrySchema).min(1).max(50),
});

// PII scrubbing: emails, UUIDs, JWT-like tokens, long digit sequences (cards/phones)
function scrub(input: string | null | undefined): string | null {
  if (!input) return input ?? null;
  return input
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[uuid]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[jwt]')
    .replace(/\b\d{12,19}\b/g, '[num]');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limit: 60 requests/min per IP (each request can carry up to 50 entries)
  const rlKey = getRateLimitKey(req, 'log-error');
  const rl = checkRateLimit(rlKey, { maxRequests: 60, windowSeconds: 60 });
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Resolve user_id if a valid auth header is present (best-effort, never fails the request)
  let userId: string | null = null;
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const supa = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data } = await supa.auth.getClaims(authHeader.replace('Bearer ', ''));
      userId = (data?.claims?.sub as string) ?? null;
    } catch {
      /* ignore */
    }
  }

  const userAgent = scrub(req.headers.get('user-agent'));

  const rows = parsed.data.entries.map((e) => ({
    user_id: userId,
    level: e.level,
    source: e.source,
    message: scrub(e.message)!,
    stack: scrub(e.stack ?? null),
    context: e.context ?? {},
    url: scrub(e.url ?? null),
    user_agent: userAgent,
    release: e.release ?? null,
  }));

  // Use service role to bypass RLS on insert (we already validated/scrubbed)
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { error } = await admin.from('error_logs').insert(rows);

  if (error) {
    console.error('[log-error] insert failed:', error.message);
    return new Response(JSON.stringify({ error: 'Insert failed' }), {
      status: 500,
      headers: { ...corsHeaders, ...rl.headers, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ accepted: rows.length }), {
    status: 200,
    headers: { ...corsHeaders, ...rl.headers, 'Content-Type': 'application/json' },
  });
});
