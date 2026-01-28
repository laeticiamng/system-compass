// Strategy Deadline Alerts Component for Exit Keys
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, AlertTriangle, Bell, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, differenceInDays, addDays } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface StrategyDeadline {
  id: string;
  strategyId: string;
  strategyName: string;
  stepName: string;
  deadline: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reminderDays: number[];
  notes?: string;
}

interface StrategyDeadlineAlertsProps {
  strategyId?: string;
  onDeadlineComplete?: (deadlineId: string) => void;
  onDeadlineDismiss?: (deadlineId: string) => void;
}

export function StrategyDeadlineAlerts({
  strategyId,
  onDeadlineComplete,
  onDeadlineDismiss
}: StrategyDeadlineAlertsProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;

  const [deadlines, setDeadlines] = useState<StrategyDeadline[]>([
    {
      id: '1',
      strategyId: 'swiss-doctor',
      strategyName: 'MEBEKO Suisse',
      stepName: 'Dépôt dossier MEBEKO',
      deadline: addDays(new Date(), 5),
      isCompleted: false,
      priority: 'critical',
      reminderDays: [7, 3, 1],
      notes: 'Inclure attestation de diplôme légalisée',
    },
    {
      id: '2',
      strategyId: 'swiss-doctor',
      strategyName: 'MEBEKO Suisse',
      stepName: 'Examen de langue B2',
      deadline: addDays(new Date(), 21),
      isCompleted: false,
      priority: 'high',
      reminderDays: [14, 7, 3],
      notes: 'Inscription Goethe Institut',
    },
    {
      id: '3',
      strategyId: 'france-expat',
      strategyName: 'Expatriation France',
      stepName: 'Demande visa long séjour',
      deadline: addDays(new Date(), 14),
      isCompleted: false,
      priority: 'high',
      reminderDays: [7, 3, 1],
    },
    {
      id: '4',
      strategyId: 'france-expat',
      strategyName: 'Expatriation France',
      stepName: 'Attestation d\'hébergement',
      deadline: addDays(new Date(), 10),
      isCompleted: true,
      priority: 'medium',
      reminderDays: [7, 3],
    },
    {
      id: '5',
      strategyId: 'portugal-dnr',
      strategyName: 'Portugal NHR',
      stepName: 'Ouverture compte bancaire',
      deadline: addDays(new Date(), 2),
      isCompleted: false,
      priority: 'critical',
      reminderDays: [3, 1],
      notes: 'RDV agence Lisbonne confirmé',
    },
  ]);

  const filteredDeadlines = strategyId 
    ? deadlines.filter(d => d.strategyId === strategyId)
    : deadlines;

  const sortedDeadlines = [...filteredDeadlines]
    .filter(d => !d.isCompleted)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const getDaysRemaining = useCallback((deadline: Date) => {
    return differenceInDays(deadline, new Date());
  }, []);

  const getUrgencyColor = (daysRemaining: number, priority: string) => {
    if (daysRemaining < 0) return 'bg-red-600 text-white';
    if (daysRemaining <= 3 || priority === 'critical') return 'bg-red-500 text-white';
    if (daysRemaining <= 7 || priority === 'high') return 'bg-orange-500 text-white';
    if (daysRemaining <= 14) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const getUrgencyLabel = (daysRemaining: number) => {
    if (daysRemaining < 0) return t('deadlines.overdue', 'En retard');
    if (daysRemaining === 0) return t('deadlines.today', 'Aujourd\'hui');
    if (daysRemaining === 1) return t('deadlines.tomorrow', 'Demain');
    return t('deadlines.inDays', 'Dans {{count}} jours', { count: daysRemaining });
  };

  const handleComplete = (deadlineId: string) => {
    setDeadlines(prev => 
      prev.map(d => d.id === deadlineId ? { ...d, isCompleted: true } : d)
    );
    onDeadlineComplete?.(deadlineId);
  };

  const handleDismiss = (deadlineId: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== deadlineId));
    onDeadlineDismiss?.(deadlineId);
  };

  const urgentCount = sortedDeadlines.filter(d => getDaysRemaining(d.deadline) <= 7).length;
  const overdueCount = sortedDeadlines.filter(d => getDaysRemaining(d.deadline) < 0).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {t('deadlines.title', 'Échéances Stratégie')}
          {urgentCount > 0 && (
            <Badge variant="destructive">{urgentCount}</Badge>
          )}
        </CardTitle>
        {overdueCount > 0 && (
          <Badge variant="destructive" className="bg-red-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {overdueCount} {t('deadlines.overdueItems', 'en retard')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {sortedDeadlines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>{t('deadlines.allComplete', 'Toutes les échéances sont complétées!')}</p>
          </div>
        ) : (
          sortedDeadlines.map((deadline) => {
            const daysRemaining = getDaysRemaining(deadline.deadline);
            
            return (
              <div
                key={deadline.id}
                className={`p-4 border rounded-lg transition-all ${
                  daysRemaining <= 3 ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={deadline.isCompleted}
                      onCheckedChange={() => handleComplete(deadline.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{deadline.stepName}</span>
                        <Badge 
                          className={getUrgencyColor(daysRemaining, deadline.priority)}
                          variant="secondary"
                        >
                          {getUrgencyLabel(daysRemaining)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deadline.strategyName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(deadline.deadline, 'PPP', { locale })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t('deadlines.reminderAt', 'Rappels: J-{{days}}', { 
                            days: deadline.reminderDays.join(', J-') 
                          })}
                        </span>
                      </div>
                      {deadline.notes && (
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          📌 {deadline.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleComplete(deadline.id)}
                      title={t('deadlines.markComplete', 'Marquer comme fait')}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDismiss(deadline.id)}
                      title={t('deadlines.dismiss', 'Ignorer')}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Completed Section */}
        {filteredDeadlines.filter(d => d.isCompleted).length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {t('deadlines.completed', 'Complétées')} ({filteredDeadlines.filter(d => d.isCompleted).length})
            </p>
            <div className="space-y-2">
              {filteredDeadlines.filter(d => d.isCompleted).slice(0, 3).map((deadline) => (
                <div key={deadline.id} className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {deadline.stepName}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
