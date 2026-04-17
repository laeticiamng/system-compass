/**
 * Observability domain — re-export of the existing logger module.
 * Physical move of `lib/observability` is intentionally deferred to keep
 * this PR low-risk; the new import path becomes the canonical one.
 */
export * from '@/lib/observability';
