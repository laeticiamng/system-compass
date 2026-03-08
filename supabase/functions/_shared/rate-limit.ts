/**
 * Simple in-memory rate limiter for Edge Functions.
 * Uses a sliding window approach per IP/user.
 * 
 * Note: This is per-instance. For distributed rate limiting,
 * use a database-backed approach.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  headers: Record<string, string>;
}

/**
 * Check rate limit for a given key (IP, user ID, etc.)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 30, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  
  let entry = store.get(key);
  
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }
  
  entry.count++;
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(entry.resetAt / 1000).toString(),
  };
  
  if (!allowed) {
    headers['Retry-After'] = Math.ceil((entry.resetAt - now) / 1000).toString();
  }
  
  return { allowed, remaining, resetAt: entry.resetAt, headers };
}

/**
 * Get rate limit key from request (IP-based)
 */
export function getRateLimitKey(req: Request, prefix: string = ''): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${prefix}:${ip}`;
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
    }),
    { 
      status: 429, 
      headers: { ...corsHeaders, ...result.headers, 'Content-Type': 'application/json' }
    }
  );
}
