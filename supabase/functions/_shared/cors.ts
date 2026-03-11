/**
 * Shared CORS configuration for all Edge Functions.
 * Restricts origins to the production domain to prevent unauthorized cross-origin requests.
 */

const ALLOWED_ORIGINS = [
  'https://system-compass.app',
  'https://world-alignment.lovable.app',
];

function isLovablePreview(origin: string): boolean {
  return /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/.test(origin);
}

function getAllowedOrigin(req?: Request): string {
  if (req) {
    const origin = req.headers.get('Origin') || '';
    if (ALLOWED_ORIGINS.includes(origin) || isLovablePreview(origin)) return origin;
  }
  return Deno.env.get('ALLOWED_ORIGIN') || ALLOWED_ORIGINS[0];
}

/**
 * Default CORS headers (fallback origin — prefer getCorsHeaders(req) for dynamic origin).
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

export function getCorsHeaders(req: Request): Record<string, string> {
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
  };
}

export function handleCorsPreflightRequest(req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(null, {
    headers: {
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
}
