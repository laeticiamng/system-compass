import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  History, 
  Moon, 
  Sunrise, 
  Wind, 
  Lock,
  RefreshCw,
  GitMerge,
  Pause,
  Archive,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LatentZone, ZoneHistory, ZoneStatus } from '@/hooks/useLatentZones';
import { supabase } from '@/integrations/supabase/client';

interface ZoneHistoryTimelineProps {
  zone: LatentZone;
}

const STATUS_ICONS: Record<ZoneStatus, typeof Moon> = {
  dormant: Moon,
  emergent: Sunrise,
  fragile: Wind,
  blocked: Lock
};

const ACTION_ICONS: Record<string, typeof RefreshCw> = {
  created: Plus,
  status_changed: ArrowRight,
  transformed: RefreshCw,
  merged: GitMerge,
  put_to_sleep: Pause,
  archived: Archive
};

const STATUS_COLORS: Record<ZoneStatus, string> = {
  dormant: 'bg-slate-500',
  emergent: 'bg-amber-500',
  fragile: 'bg-blue-500',
  blocked: 'bg-red-500'
};

export function ZoneHistoryTimeline({ zone }: ZoneHistoryTimelineProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<ZoneHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('latent_zone_history')
          .select('*')
          .eq('zone_id', zone.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory((data || []) as ZoneHistory[]);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [zone.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('common.loading')}
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('latent.history.title', 'Évolution de la zone')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          {t('latent.history.empty', 'Aucun historique disponible')}
        </CardContent>
      </Card>
    );
  }

  // Non-linear timeline: group by significant events
  const groupedHistory = history.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, ZoneHistory[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5" />
          {t('latent.history.title', 'Évolution de la zone')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('latent.history.subtitle', 'Timeline non-linéaire des transformations')}
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, entries]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-1 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {date}
                  </Badge>
                </div>

                {/* Events for this date - Non-linear layout */}
                <div className="space-y-3 pl-4 border-l-2 border-muted">
                  {entries.map((entry, idx) => {
                    const ActionIcon = ACTION_ICONS[entry.action] || RefreshCw;
                    const isStatusChange = entry.action === 'status_changed';
                    
                    return (
                      <div 
                        key={entry.id}
                        className={`relative flex items-start gap-3 p-3 rounded-lg transition-all
                          ${idx === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}
                        `}
                      >
                        {/* Connection dot */}
                        <div className={`absolute -left-[25px] top-4 w-3 h-3 rounded-full border-2 border-background
                          ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/50'}
                        `} />

                        {/* Action Icon */}
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                          ${idx === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                        `}>
                          <ActionIcon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {t(`latent.history.action.${entry.action}`, entry.action)}
                          </p>

                          {/* Status Change Visualization */}
                          {isStatusChange && entry.previous_status && entry.new_status && (
                            <div className="flex items-center gap-2 mt-2">
                              <StatusBadge status={entry.previous_status as ZoneStatus} small />
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <StatusBadge status={entry.new_status as ZoneStatus} small />
                            </div>
                          )}

                          {/* Notes */}
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              "{entry.notes}"
                            </p>
                          )}

                          {/* Time */}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, small }: { status: ZoneStatus; small?: boolean }) {
  const { t } = useTranslation();
  const Icon = STATUS_ICONS[status];
  const color = STATUS_COLORS[status];

  return (
    <Badge 
      variant="outline" 
      className={`gap-1 ${small ? 'text-xs px-1.5 py-0.5' : ''}`}
    >
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {!small && <Icon className="w-3 h-3" />}
      {t(`latent.status.${status}`)}
    </Badge>
  );
}
