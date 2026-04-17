import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Window, windowToISO } from './utils';

interface Props {
  windowSize: Window;
  refreshKey: number;
}

export function SecuritySection({ windowSize, refreshKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    rateLimitHits: number;
    authFailures: number;
    deletions: number;
    rateByFunction: { name: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const since = windowToISO(windowSize);

    Promise.all([
      // Rate-limit hits surface as 429s logged via context.kind = 'rate-limit'
      supabase
        .from('error_logs')
        .select('id,context,message')
        .gte('created_at', since)
        .or('message.ilike.%rate%limit%,message.ilike.%too many%')
        .limit(2000),
      // Auth failures
      supabase
        .from('error_logs')
        .select('id')
        .gte('created_at', since)
        .or('message.ilike.%unauthorized%,message.ilike.%invalid login%,message.ilike.%auth%fail%')
        .limit(2000),
      // Account deletions
      supabase
        .from('account_deletion_audit')
        .select('id')
        .gte('created_at', since),
    ]).then(([rl, auth, del]) => {
      if (cancelled) return;
      const rlRows = (rl.data ?? []) as any[];
      const byFn = new Map<string, number>();
      for (const r of rlRows) {
        const fn = (r.context?.function as string) ?? (r.context?.kind as string) ?? 'unknown';
        byFn.set(fn, (byFn.get(fn) ?? 0) + 1);
      }
      setStats({
        rateLimitHits: rlRows.length,
        authFailures: auth.data?.length ?? 0,
        deletions: del.data?.length ?? 0,
        rateByFunction: [...byFn.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [windowSize, refreshKey]);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rate-limit déclenchés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{stats.rateLimitHits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Échecs d'authentification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{stats.authFailures}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comptes supprimés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{stats.deletions}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Rate-limit par fonction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.rateByFunction.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun déclenchement sur la période. (Les hits sont catégorisés via le contexte des
              logs).
            </p>
          ) : (
            <ul className="space-y-2">
              {stats.rateByFunction.map((r) => (
                <li
                  key={r.name}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                >
                  <span className="text-sm font-mono">{r.name}</span>
                  <Badge variant="secondary">{r.count}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
