import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ExitKey } from '@/lib/exit-keys-engine';

interface StepProgress {
  phaseIndex: number;
  actionIndex: number;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  reminderEnabled?: boolean;
}

interface PlanProgress {
  exitKeyId: string;
  startedAt: string;
  stepsProgress: StepProgress[];
  phaseNotes: { phaseIndex: number; note: string; updatedAt: string }[];
}

interface DeadlineCalendarProps {
  progress: PlanProgress;
  exitKey: ExitKey;
}

interface CalendarEvent {
  date: string;
  phaseIndex: number;
  actionIndex: number;
  action: string;
  phaseName: string;
  completed: boolean;
  isOverdue: boolean;
}

export function DeadlineCalendar({ progress, exitKey }: DeadlineCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  // i18n day and month names
  const DAYS = [
    t('calendar.days.sun', 'Dim'),
    t('calendar.days.mon', 'Lun'),
    t('calendar.days.tue', 'Mar'),
    t('calendar.days.wed', 'Mer'),
    t('calendar.days.thu', 'Jeu'),
    t('calendar.days.fri', 'Ven'),
    t('calendar.days.sat', 'Sam')
  ];
  const MONTHS = [
    t('calendar.months.january', 'Janvier'),
    t('calendar.months.february', 'Février'),
    t('calendar.months.march', 'Mars'),
    t('calendar.months.april', 'Avril'),
    t('calendar.months.may', 'Mai'),
    t('calendar.months.june', 'Juin'),
    t('calendar.months.july', 'Juillet'),
    t('calendar.months.august', 'Août'),
    t('calendar.months.september', 'Septembre'),
    t('calendar.months.october', 'Octobre'),
    t('calendar.months.november', 'Novembre'),
    t('calendar.months.december', 'Décembre')
  ];

  // Get calendar events from deadlines
  const events = useMemo(() => {
    const result: CalendarEvent[] = [];
    
    progress.stepsProgress.forEach(step => {
      if (!step.deadline) return;
      
      const phase = exitKey.steps[step.phaseIndex];
      const action = phase?.actions[step.actionIndex];
      if (!phase || !action) return;

      const deadlineDate = new Date(step.deadline);
      const isOverdue = !step.completed && deadlineDate < new Date();

      result.push({
        date: step.deadline,
        phaseIndex: step.phaseIndex,
        actionIndex: step.actionIndex,
        action,
        phaseName: phase.name,
        completed: step.completed,
        isOverdue
      });
    });

    return result;
  }, [progress, exitKey]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day: number): CalendarEvent[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Count stats
  const stats = useMemo(() => {
    const upcoming = events.filter(e => !e.completed && !e.isOverdue).length;
    const overdue = events.filter(e => e.isOverdue).length;
    const completed = events.filter(e => e.completed).length;
    return { upcoming, overdue, completed, total: events.length };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.upcoming}</div>
            <div className="text-xs text-muted-foreground">{t('calendar.upcoming', 'À venir')}</div>
          </CardContent>
        </Card>
        <Card className={stats.overdue > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-destructive' : ''}`}>
              {stats.overdue}
            </div>
            <div className="text-xs text-muted-foreground">{t('calendar.overdue', 'En retard')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">{t('calendar.completed', 'Complétées')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                {t('calendar.today', 'Aujourd\'hui')}
              </Button>
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDay(day);
              const hasOverdue = dayEvents.some(e => e.isOverdue);
              const hasUpcoming = dayEvents.some(e => !e.completed && !e.isOverdue);
              const allCompleted = dayEvents.length > 0 && dayEvents.every(e => e.completed);

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 rounded-lg border transition-all ${
                    isToday(day) ? 'border-primary bg-primary/10' : 'border-transparent'
                  } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                >
                  <div className={`text-sm text-center ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {hasOverdue && (
                        <div className="w-2 h-2 rounded-full bg-destructive" title="En retard" />
                      )}
                      {hasUpcoming && (
                        <div className="w-2 h-2 rounded-full bg-primary" title="À venir" />
                      )}
                      {allCompleted && (
                        <div className="w-2 h-2 rounded-full bg-green-500" title="Complété" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">{t('calendar.overdue', 'En retard')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">{t('calendar.upcoming', 'À venir')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">{t('calendar.completedSingle', 'Complété')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming & Overdue List */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overdue */}
        {stats.overdue > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                {t('calendar.overdueCount', 'En retard ({{count}})', { count: stats.overdue })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {events
                  .filter(e => e.isOverdue)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event, index) => (
                    <div key={index} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.action}</p>
                          <p className="text-xs text-muted-foreground">{event.phaseName}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('calendar.upcomingDeadlines', 'Prochaines échéances ({{count}})', { count: stats.upcoming })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {events
                .filter(e => !e.completed && !e.isOverdue)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 10)
                .map((event, index) => {
                  const daysUntil = Math.ceil(
                    (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.action}</p>
                          <p className="text-xs text-muted-foreground">{event.phaseName}</p>
                        </div>
                        <Badge 
                          variant={daysUntil <= 3 ? 'secondary' : 'outline'} 
                          className="text-xs shrink-0"
                        >
                          {daysUntil === 0 ? "Aujourd'hui" : 
                           daysUntil === 1 ? 'Demain' : 
                           `Dans ${daysUntil}j`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              {stats.upcoming === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('calendar.noUpcoming', 'Aucune échéance à venir. Définissez des échéances pour vos actions !')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed this month */}
        <Card className={stats.overdue === 0 ? 'md:col-span-1' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              {t('calendar.recentlyCompleted', 'Récemment complétées')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {events
                .filter(e => e.completed)
                .slice(0, 5)
                .map((event, index) => (
                  <div key={index} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate line-through text-muted-foreground">
                          {event.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{event.phaseName}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    </div>
                  </div>
                ))}
              {stats.completed === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('calendar.noCompleted', 'Aucune action complétée avec échéance.')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
