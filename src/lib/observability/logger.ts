/**
 * In-house observability logger.
 * Batches client-side errors, warnings, info events and Web Vitals,
 * then flushes them to the `log-error` Edge Function.
 *
 * Public API:
 *   logError(message, { stack?, context? })
 *   logWarn(message, context?)
 *   logInfo(message, context?)
 *   flush()  // force-flush (called on pagehide)
 */

import { supabase } from '@/integrations/supabase/client';

type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: Level;
  source: 'web';
  message: string;
  stack?: string | null;
  context?: Record<string, unknown> | null;
  url?: string | null;
  release?: string | null;
}

const RELEASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_RELEASE) || 'dev';
const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH = 50;
const MAX_QUEUE = 200;

let queue: LogEntry[] = [];
let timer: number | null = null;
let installed = false;

function enqueue(entry: LogEntry) {
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push(entry);
  scheduleFlush();
}

function scheduleFlush() {
  if (timer != null) return;
  timer = window.setTimeout(() => {
    timer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
}

export async function flush(): Promise<void> {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    await supabase.functions.invoke('log-error', { body: { entries: batch } });
  } catch (err) {
    // Avoid recursion: never re-log errors from the logger itself.
    // Re-queue once if it looks transient (network), then drop.
    if (queue.length < MAX_QUEUE - batch.length) {
      queue.unshift(...batch);
    }
    if (import.meta.env.DEV) console.warn('[logger] flush failed', err);
  }
}

function makeEntry(
  level: Level,
  message: string,
  opts?: { stack?: string | null; context?: Record<string, unknown> | null },
): LogEntry {
  return {
    level,
    source: 'web',
    message: String(message).slice(0, 2000),
    stack: opts?.stack ?? null,
    context: opts?.context ?? null,
    url: typeof window !== 'undefined' ? window.location.href : null,
    release: RELEASE,
  };
}

export function logError(
  message: string,
  opts?: { stack?: string | null; context?: Record<string, unknown> },
) {
  // Mirror to console in dev for fast feedback
  if (import.meta.env.DEV) console.error('[obs:error]', message, opts);
  enqueue(makeEntry('error', message, opts));
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) console.warn('[obs:warn]', message, context);
  enqueue(makeEntry('warn', message, { context }));
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  enqueue(makeEntry('info', message, { context }));
}

/**
 * Install global handlers: window.onerror, unhandledrejection, pagehide flush.
 * Idempotent.
 */
export function installGlobalErrorHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    const err = event.error;
    logError(event.message || 'window.onerror', {
      stack: err?.stack ?? null,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: any = event.reason;
    const msg =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : 'Unhandled promise rejection';
    logError(msg, {
      stack: reason instanceof Error ? reason.stack : null,
      context: { kind: 'unhandledrejection' },
    });
  });

  // Best-effort flush before page unload
  window.addEventListener('pagehide', () => {
    void flush();
  });
}
