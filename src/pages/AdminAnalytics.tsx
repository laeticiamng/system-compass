import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, Users, MousePointer, BarChart3, RefreshCw, Download, AlertTriangle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DailyStat {
  date: string;
  event_name: string;
  event_category: string;
  event_count: number;
  unique_sessions: number;
}

interface PageStat {
  page_path: string;
  views: number;
}

interface CompletionStats {
  started: number;
  completed: number;
  dropped: number;
  rate: number;
}

interface RetentionStats {
  totalSessions: number;
  returnVisits: number;
  retentionRate: number;
}

interface AlertSettings {
  enabled: boolean;
  completionThreshold: number;
  retentionThreshold: number;
}

const ALERT_SETTINGS_KEY = 'analytics_alert_settings';

const getAlertSettings = (): AlertSettings => {
  const stored = localStorage.getItem(ALERT_SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { enabled: true, completionThreshold: 50, retentionThreshold: 10 };
};

const saveAlertSettings = (settings: AlertSettings) => {
  localStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(settings));
};

export default function AdminAnalytics() {
  useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topPages, setTopPages] = useState<PageStat[]>([]);
  const [completionStats, setCompletionStats] = useState<CompletionStats>({ started: 0, completed: 0, dropped: 0, rate: 0 });
  const [retentionStats, setRetentionStats] = useState<RetentionStats>({ totalSessions: 0, returnVisits: 0, retentionRate: 0 });
  const [topErrors, setTopErrors] = useState<{ error: string; clicks: number }[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(getAlertSettings);
  const [allEvents, setAllEvents] = useState<Array<{ created_at: string; event_name: string; event_category: string; page_path: string | null; session_id: string }>>([]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch daily stats from view
      const { data: daily } = await supabase
        .from('analytics_daily_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      
      setDailyStats((daily || []).map(d => ({
        ...d,
        date: d.date || '',
        event_name: d.event_name || '',
        event_category: d.event_category || '',
        event_count: d.event_count || 0,
        unique_sessions: d.unique_sessions || 0,
      })));

      // Fetch all events for CSV export (last 30 days)
      const { data: events } = await supabase
        .from('analytics_events')
        .select('created_at, event_name, event_category, page_path, session_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      setAllEvents(events || []);

      // Fetch top pages
      const { data: pages } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_name', 'page_view')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const pageCounts: Record<string, number> = {};
      pages?.forEach(p => {
        if (p.page_path) {
          pageCounts[p.page_path] = (pageCounts[p.page_path] || 0) + 1;
        }
      });
      
      setTopPages(
        Object.entries(pageCounts)
          .map(([page_path, views]) => ({ page_path, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10)
      );

      // Fetch simulation completion stats
      const { data: simEvents } = await supabase
        .from('analytics_events')
        .select('event_name')
        .in('event_name', ['simulation_started', 'simulation_completed', 'simulation_dropped'])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const started = simEvents?.filter(e => e.event_name === 'simulation_started').length || 0;
      const completed = simEvents?.filter(e => e.event_name === 'simulation_completed').length || 0;
      const dropped = simEvents?.filter(e => e.event_name === 'simulation_dropped').length || 0;
      
      setCompletionStats({
        started,
        completed,
        dropped,
        rate: started > 0 ? Math.round((completed / started) * 100) : 0
      });

      // Fetch retention stats
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('id, first_seen_at')
        .gte('first_seen_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: returnEvents } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'return_visit')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalSessions = sessions?.length || 0;
      const returnVisits = returnEvents?.length || 0;
      
      setRetentionStats({
        totalSessions,
        returnVisits,
        retentionRate: totalSessions > 0 ? Math.round((returnVisits / totalSessions) * 100) : 0
      });

      // Fetch top errors clicked
      const { data: errorClicks } = await supabase
        .from('analytics_events')
        .select('metadata')
        .eq('event_name', 'universal_errors_clicked')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const errorCounts: Record<string, number> = {};
      errorClicks?.forEach(e => {
        const errorId = (e.metadata as Record<string, unknown>)?.error_id as string;
        if (errorId) {
          errorCounts[errorId] = (errorCounts[errorId] || 0) + 1;
        }
      });

      setTopErrors(
        Object.entries(errorCounts)
          .map(([error, clicks]) => ({ error, clicks }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 5)
      );

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  // CSV Export function
  const exportToCSV = useCallback(() => {
    if (allEvents.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const headers = ['Date', 'Événement', 'Catégorie', 'Page', 'Session ID'];
    const csvContent = [
      headers.join(','),
      ...allEvents.map(event => [
        new Date(event.created_at).toISOString(),
        event.event_name,
        event.event_category,
        event.page_path || '',
        event.session_id
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${allEvents.length} événements exportés`);
  }, [allEvents]);

  // Export daily stats
  const exportDailyStats = useCallback(() => {
    if (dailyStats.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const headers = ['Date', 'Événement', 'Catégorie', 'Nombre', 'Sessions uniques'];
    const csvContent = [
      headers.join(','),
      ...dailyStats.map(stat => [
        stat.date,
        stat.event_name,
        stat.event_category,
        stat.event_count,
        stat.unique_sessions
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_daily_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${dailyStats.length} lignes exportées`);
  }, [dailyStats]);

  // Handle alert settings changes
  const updateAlertSettings = (updates: Partial<AlertSettings>) => {
    const newSettings = { ...alertSettings, ...updates };
    setAlertSettings(newSettings);
    saveAlertSettings(newSettings);
  };

  // Check for alerts
  const alerts: { type: 'completion' | 'retention'; message: string; value: number; threshold: number }[] = [];
  
  if (alertSettings.enabled) {
    if (completionStats.started > 0 && completionStats.rate < alertSettings.completionThreshold) {
      alerts.push({
        type: 'completion',
        message: `Taux de complétion sous le seuil`,
        value: completionStats.rate,
        threshold: alertSettings.completionThreshold
      });
    }
    if (retentionStats.totalSessions > 0 && retentionStats.retentionRate < alertSettings.retentionThreshold) {
      alerts.push({
        type: 'retention',
        message: `Rétention J+7 sous le seuil`,
        value: retentionStats.retentionRate,
        threshold: alertSettings.retentionThreshold
      });
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour accéder au tableau de bord analytics.
            </p>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = dailyStats.filter(s => s.date === today);
    return {
      events: todayEvents.reduce((sum, s) => sum + s.event_count, 0),
      sessions: new Set(todayEvents.map(s => s.unique_sessions)).size || todayEvents[0]?.unique_sessions || 0
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">📊 Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">Métriques internes - Usage réel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Alert Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Alertes
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Configuration des alertes</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="alerts-enabled">Alertes activées</Label>
                  <Switch
                    id="alerts-enabled"
                    checked={alertSettings.enabled}
                    onCheckedChange={(checked) => updateAlertSettings({ enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completion-threshold">Seuil taux complétion (%)</Label>
                  <Input
                    id="completion-threshold"
                    type="number"
                    min={0}
                    max={100}
                    value={alertSettings.completionThreshold}
                    onChange={(e) => updateAlertSettings({ completionThreshold: parseInt(e.target.value) || 0 })}
                    disabled={!alertSettings.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention-threshold">Seuil rétention J+7 (%)</Label>
                  <Input
                    id="retention-threshold"
                    type="number"
                    min={0}
                    max={100}
                    value={alertSettings.retentionThreshold}
                    onChange={(e) => updateAlertSettings({ retentionThreshold: parseInt(e.target.value) || 0 })}
                    disabled={!alertSettings.enabled}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* CSV Export */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Tous les événements
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={exportDailyStats}>
                  <Download className="h-4 w-4 mr-2" />
                  Stats journalières
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Alert key={i} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>⚠️ {alert.message}</AlertTitle>
              <AlertDescription>
                Valeur actuelle: <strong>{alert.value}%</strong> (seuil: {alert.threshold}%)
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions aujourd'hui</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.sessions}</div>
            <p className="text-xs text-muted-foreground">{todayStats.events} événements</p>
          </CardContent>
        </Card>

        <Card className={alerts.some(a => a.type === 'completion') ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux complétion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionStats.rate}%</div>
            <p className="text-xs text-muted-foreground">
              {completionStats.completed}/{completionStats.started} simulations
            </p>
          </CardContent>
        </Card>

        <Card className={alerts.some(a => a.type === 'retention') ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rétention J+7</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionStats.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {retentionStats.returnVisits} retours / {retentionStats.totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drops simulation</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionStats.dropped}</div>
            <p className="text-xs text-muted-foreground">abandons (30j)</p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📍 Top Pages (7j)</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {topPages.map((page, i) => (
                  <div key={page.page_path} className="flex justify-between items-center">
                    <span className="text-sm truncate flex-1">
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {page.page_path}
                    </span>
                    <span className="font-medium ml-2">{page.views}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚠️ Top Erreurs Universelles (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            {topErrors.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {topErrors.map((error, i) => (
                  <div key={error.error} className="flex justify-between items-center">
                    <span className="text-sm truncate flex-1">
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {error.error}
                    </span>
                    <span className="font-medium ml-2">{error.clicks} clics</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎯 Funnel Engagement (30j)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Home', event: 'home_opened' },
              { label: 'Filtre Prévention', event: 'filter_clicked' },
              { label: 'Clés de Sortie', event: 'exit_keys_clicked' },
              { label: 'Erreurs Universelles', event: 'universal_errors_clicked' }
            ].map(item => {
              const count = dailyStats
                .filter(s => s.event_name === item.event)
                .reduce((sum, s) => sum + s.event_count, 0);
              return (
                <div key={item.event} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            📊 {allEvents.length} événements collectés sur 30 jours • 
            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
