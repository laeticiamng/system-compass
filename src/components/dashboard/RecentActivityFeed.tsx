import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Key, Gamepad2, FileText, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'exit_key' | 'game' | 'case' | 'export' | 'simulation';
  title: string;
  timestamp: Date;
  metadata?: Record<string, string>;
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

const activityIcons = {
  exit_key: Key,
  game: Gamepad2,
  case: FileText,
  export: TrendingUp,
  simulation: Activity,
};

const activityColors = {
  exit_key: 'text-amber-500 bg-amber-500/10',
  game: 'text-purple-500 bg-purple-500/10',
  case: 'text-emerald-500 bg-emerald-500/10',
  export: 'text-blue-500 bg-blue-500/10',
  simulation: 'text-primary bg-primary/10',
};

export const RecentActivityFeed = memo(function RecentActivityFeed({ activities = [], maxItems = 10 }: RecentActivityFeedProps) {
  const { t, i18n } = useTranslation();
  
  // Demo activities if none provided
  const displayActivities: ActivityItem[] = activities.length > 0 ? activities : [
    { id: '1', type: 'exit_key', title: 'Clé "Entrepreneur Global" consultée', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '2', type: 'game', title: 'Partie terminée - Score: 847', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '3', type: 'simulation', title: 'Simulation France → Suisse', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: '4', type: 'export', title: 'Export PDF généré', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ];

  const locale = i18n.language === 'fr' ? fr : undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          {t('dashboard.recentActivity', 'Activité récente')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {displayActivities.slice(0, maxItems).map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale })}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {displayActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('dashboard.noRecentActivity', 'Aucune activité récente')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
