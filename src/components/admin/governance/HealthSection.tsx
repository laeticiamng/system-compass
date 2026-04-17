import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Window, windowToISO, groupByBucket } from './utils';

interface ErrorRow {
  id: string;
  level: string;
  message: string;
  source: string;
  context: any;
  created_at: string;
}

interface Props {
  windowSize: Window;
  refreshKey: number;
}

export function HealthSection({ windowSize, refreshKey }: Props) {
  const [rows, setRows] = useState<ErrorRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(null);
    const since = windowToISO(windowSize);
    supabase
      .from('error_logs')
      .select('id,level,message,source,context,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as ErrorRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [windowSize, refreshKey]);

  const errorRows = useMemo(
    () => (rows ?? []).filter((r) => r.level === 'error' || r.level === 'fatal'),
    [rows],
  );
  const warnRows = useMemo(() => (rows ?? []).filter((r) => r.level === 'warn'), [rows]);
  const vitals = useMemo(
    () =>
      (rows ?? []).filter(
        (r) => r.level === 'info' && r.context?.kind === 'web-vital',
      ),
    [rows],
  );

  const errorBuckets = useMemo(() => groupByBucket(errorRows, windowSize), [errorRows, windowSize]);
  const chartData = errorBuckets.map((b) => ({ name: b.label, errors: b.count }));

  // Top error messages
  const topErrors = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of errorRows) {
      const key = r.message.slice(0, 120);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [errorRows]);

  // Web vitals percentiles per metric
  const vitalsStats = useMemo(() => {
    const groups: Record<string, number[]> = {};
    for (const v of vitals) {
      const name = v.context?.name as string | undefined;
      const value = v.context?.value as number | undefined;
      if (!name || typeof value !== 'number') continue;
      (groups[name] ??= []).push(value);
    }
    return Object.entries(groups).map(([name, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const p = (q: number) => sorted[Math.floor(sorted.length * q)] ?? 0;
      return { name, count: values.length, p50: p(0.5), p75: p(0.75), p95: p(0.95) };
    });
  }, [vitals]);

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm">Erreur de chargement: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (rows === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{errorRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{warnRows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mesures Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{vitals.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Erreurs dans le temps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stroke="hsl(var(--destructive))"
                  fill="url(#errGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            {topErrors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune erreur sur la période.</p>
            ) : (
              <ul className="space-y-2">
                {topErrors.map(([msg, count]) => (
                  <li
                    key={msg}
                    className="flex items-start justify-between gap-3 py-1.5 border-b last:border-0"
                  >
                    <span className="text-sm font-mono break-all flex-1">{msg}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Web Vitals (p50 / p75 / p95)</CardTitle>
          </CardHeader>
          <CardContent>
            {vitalsStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="py-2">Métrique</th>
                    <th>n</th>
                    <th>p50</th>
                    <th>p75</th>
                    <th>p95</th>
                  </tr>
                </thead>
                <tbody>
                  {vitalsStats.map((v) => (
                    <tr key={v.name} className="border-t">
                      <td className="py-2 font-mono">{v.name}</td>
                      <td>{v.count}</td>
                      <td>{v.p50.toFixed(1)}</td>
                      <td>{v.p75.toFixed(1)}</td>
                      <td>{v.p95.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
