import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Window, windowToISO } from './utils';

interface Props {
  windowSize: Window;
  refreshKey: number;
}

export function ActivationSection({ windowSize, refreshKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    activeUsers: number;
    sessions: number;
    pageViews: number;
    topPages: { path: string; count: number }[];
    eventsByCategory: { name: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const since = windowToISO(windowSize);

    supabase
      .from('analytics_events')
      .select('event_name,event_category,page_path,session_id,user_id,created_at')
      .gte('created_at', since)
      .limit(5000)
      .then(({ data: events }) => {
        if (cancelled) return;
        const rows = events ?? [];
        const users = new Set<string>();
        const sessions = new Set<string>();
        const pages = new Map<string, number>();
        const categories = new Map<string, number>();
        let pageViews = 0;

        for (const e of rows) {
          if (e.user_id) users.add(e.user_id);
          if (e.session_id) sessions.add(e.session_id);
          if (e.event_name === 'page_view') pageViews++;
          if (e.page_path) pages.set(e.page_path, (pages.get(e.page_path) ?? 0) + 1);
          if (e.event_category)
            categories.set(e.event_category, (categories.get(e.event_category) ?? 0) + 1);
        }

        setData({
          activeUsers: users.size,
          sessions: sessions.size,
          pageViews,
          topPages: [...pages.entries()]
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          eventsByCategory: [...categories.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [windowSize, refreshKey]);

  if (loading || !data) {
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
              Utilisateurs actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{data.activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{data.sessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Page views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{data.pageViews}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            ) : (
              <ul className="space-y-2">
                {data.topPages.map((p) => (
                  <li
                    key={p.path}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <span className="text-sm font-mono truncate flex-1 mr-2">{p.path}</span>
                    <Badge variant="secondary">{p.count}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Événements par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {data.eventsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            ) : (
              <ul className="space-y-2">
                {data.eventsByCategory.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <span className="text-sm">{c.name}</span>
                    <Badge variant="secondary">{c.count}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
