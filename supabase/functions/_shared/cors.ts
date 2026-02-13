/**
 * Shared CORS configuration for all Edge Functions.
 * Restricts origins to the production domain to prevent unauthorized cross-origin requests.
 */

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://system-compass.app';

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}
