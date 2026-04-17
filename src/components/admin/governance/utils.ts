/**
 * Shared helpers for governance dashboard sections.
 */
export type Window = '24h' | '7d' | '30d';

export function windowToISO(w: Window): string {
  const ms = w === '24h' ? 24 * 3600e3 : w === '7d' ? 7 * 24 * 3600e3 : 30 * 24 * 3600e3;
  return new Date(Date.now() - ms).toISOString();
}

export function bucketCount(w: Window): number {
  return w === '24h' ? 24 : w === '7d' ? 7 : 30;
}

export function bucketLabel(w: Window, idx: number, total: number): string {
  if (w === '24h') return `${idx}h`;
  return `J-${total - idx - 1}`;
}

export function groupByBucket<T extends { created_at: string }>(
  rows: T[],
  w: Window,
): { label: string; count: number; items: T[] }[] {
  const total = bucketCount(w);
  const now = Date.now();
  const sliceMs =
    w === '24h' ? 3600e3 : w === '7d' ? 24 * 3600e3 : 24 * 3600e3;
  const buckets = Array.from({ length: total }, (_, i) => ({
    label: bucketLabel(w, i, total),
    count: 0,
    items: [] as T[],
  }));
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    const ageMs = now - t;
    const idx = total - 1 - Math.floor(ageMs / sliceMs);
    if (idx >= 0 && idx < total) {
      buckets[idx].count++;
      buckets[idx].items.push(r);
    }
  }
  return buckets;
}
