import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Bell,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PmoMilestoneRow } from '@/lib/pmo-types';

interface MilestoneAlertsProps {
  milestones: PmoMilestoneRow[];
  onMilestoneClick?: (milestone: PmoMilestoneRow) => void;
  alertDays?: number; // Default J-7
}

interface AlertedMilestone {
  milestone: PmoMilestoneRow;
  daysUntil: number;
  urgency: 'overdue' | 'today' | 'critical' | 'warning' | 'upcoming';
}

export function MilestoneAlerts({ 
  milestones, 
  onMilestoneClick,
  alertDays = 7 
}: MilestoneAlertsProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;

  const alertedMilestones = useMemo<AlertedMilestone[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return milestones
      .filter(m => {
        // Only non-completed milestones with target dates
        if (!m.target_date || m.status === 'completed') return false;
        const targetDate = parseISO(m.target_date);
        const daysUntil = differenceInDays(targetDate, today);
        // Include overdue and upcoming within alertDays
        return daysUntil <= alertDays;
      })
      .map(m => {
        const targetDate = parseISO(m.target_date!);
        const daysUntil = differenceInDays(targetDate, today);
        
        let urgency: AlertedMilestone['urgency'];
        if (daysUntil < 0) urgency = 'overdue';
        else if (daysUntil === 0) urgency = 'today';
        else if (daysUntil <= 2) urgency = 'critical';
        else if (daysUntil <= 4) urgency = 'warning';
        else urgency = 'upcoming';
        
        return { milestone: m, daysUntil, urgency };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [milestones, alertDays]);

  const urgencyConfig = {
    overdue: {
      color: 'bg-destructive text-destructive-foreground',
      icon: AlertTriangle,
      label: t('pmo.alerts.overdue', 'En retard'),
      borderColor: 'border-l-destructive'
    },
    today: {
      color: 'bg-orange-500 text-white',
      icon: Clock,
      label: t('pmo.alerts.today', "Aujourd'hui"),
      borderColor: 'border-l-orange-500'
    },
    critical: {
      color: 'bg-amber-500 text-white',
      icon: AlertTriangle,
      label: t('pmo.alerts.critical', 'Critique'),
      borderColor: 'border-l-amber-500'
    },
    warning: {
      color: 'bg-yellow-500 text-black',
      icon: Bell,
      label: t('pmo.alerts.warning', 'Attention'),
      borderColor: 'border-l-yellow-500'
    },
    upcoming: {
      color: 'bg-blue-500 text-white',
      icon: Calendar,
      label: t('pmo.alerts.upcoming', 'À venir'),
      borderColor: 'border-l-blue-500'
    }
  };

  const formatDaysUntil = (days: number): string => {
    if (days < 0) {
      const absDays = Math.abs(days);
      return absDays === 1 
        ? t('pmo.alerts.dayOverdue', '1 jour de retard')
        : t('pmo.alerts.daysOverdue', { count: absDays, defaultValue: `${absDays} jours de retard` });
    }
    if (days === 0) return t('pmo.alerts.dueToday', "Échéance aujourd'hui");
    if (days === 1) return t('pmo.alerts.dueTomorrow', 'Échéance demain');
    return t('pmo.alerts.daysRemaining', { count: days, defaultValue: `${days} jours restants` });
  };

  if (alertedMilestones.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('pmo.alerts.noAlerts', 'Aucune échéance critique dans les 7 prochains jours')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = alertedMilestones.filter(a => a.urgency === 'overdue').length;
  const criticalCount = alertedMilestones.filter(a => a.urgency === 'today' || a.urgency === 'critical').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            {t('pmo.alerts.title', 'Alertes J-7')}
          </div>
          <div className="flex gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueCount} {t('pmo.alerts.overdue', 'en retard')}
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge className="bg-amber-500 text-white text-xs">
                {criticalCount} {t('pmo.alerts.criticalBadge', 'critique(s)')}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {alertedMilestones.map(({ milestone, daysUntil, urgency }) => {
              const config = urgencyConfig[urgency];
              const Icon = config.icon;
              
              return (
                <div
                  key={milestone.id}
                  className={`p-3 rounded-lg border-l-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer ${config.borderColor}`}
                  onClick={() => onMilestoneClick?.(milestone)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${urgency === 'overdue' ? 'text-destructive' : urgency === 'today' ? 'text-orange-500' : 'text-amber-500'}`} />
                        <span className="font-medium text-sm truncate">{milestone.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {milestone.target_date && format(parseISO(milestone.target_date), 'dd MMM yyyy', { locale })}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className={urgency === 'overdue' ? 'text-destructive font-medium' : ''}>
                          {formatDaysUntil(daysUntil)}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${config.color} text-xs flex-shrink-0`}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {alertedMilestones.length > 3 && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
              {t('pmo.alerts.viewAll', 'Voir tous les jalons')}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
