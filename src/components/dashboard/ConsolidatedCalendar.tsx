import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserCases } from '@/hooks/useUserCases';
import { useIrreversa } from '@/hooks/useIrreversa';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'milestone' | 'threshold' | 'reminder';
  source: string;
  sourceId: string;
  link?: string;
  completed?: boolean;
}

export function ConsolidatedCalendar() {
  const { t } = useTranslation();
  const { cases } = useUserCases();
  const { thresholds } = useIrreversa();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Aggregate all events
  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];

    // Case milestones
    (cases || []).forEach(caseItem => {
      const milestones = caseItem.milestones || [];
      milestones.forEach(milestone => {
        if (milestone.deadline) {
          result.push({
            id: `milestone-${caseItem.id}-${milestone.id}`,
            title: milestone.title,
            date: new Date(milestone.deadline),
            type: milestone.completed ? 'milestone' : 'deadline',
            source: caseItem.title,
            sourceId: caseItem.id,
            link: `/case/${caseItem.id}`,
            completed: milestone.completed,
          });
        }
      });
    });

    // Threshold dates
    (thresholds || []).forEach(threshold => {
      result.push({
        id: `threshold-${threshold.id}`,
        title: threshold.title,
        date: new Date(threshold.detection_date),
        type: 'threshold',
        source: 'Irreversa',
        sourceId: threshold.id,
        link: '/irreversa',
        completed: threshold.status === 'sealed',
      });
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cases, thresholds]);

  // Get events for current month
  const monthEvents = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return events.filter(e => e.date >= start && e.date <= end);
  }, [events, currentMonth]);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(e => e.date >= now && e.date <= weekFromNow && !e.completed);
  }, [events]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before first of month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }, [currentMonth]);

  const getEventsForDay = (day: number) => {
    return monthEvents.filter(e => e.date.getDate() === day);
  };

  const typeConfig: Record<string, { color: string; icon: typeof CalendarIcon }> = {
    deadline: { color: 'bg-red-500', icon: AlertTriangle },
    milestone: { color: 'bg-green-500', icon: CheckCircle2 },
    threshold: { color: 'bg-amber-500', icon: Shield },
    reminder: { color: 'bg-blue-500', icon: Clock },
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Export to ICS format
  const exportToICS = () => {
    if (events.length === 0) {
      toast.error(t('dashboard.calendar.noEvents', 'Aucun événement à exporter'));
      return;
    }

    try {
      const formatDateICS = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//System Compass//Calendar Export//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        ...events.map(event => {
          const endDate = new Date(event.date.getTime() + 60 * 60 * 1000); // 1 hour duration
          return [
            'BEGIN:VEVENT',
            `UID:${event.id}@system-compass`,
            `DTSTAMP:${formatDateICS(new Date())}`,
            `DTSTART:${formatDateICS(event.date)}`,
            `DTEND:${formatDateICS(endDate)}`,
            `SUMMARY:${event.title.replace(/[,;]/g, ' ')}`,
            `DESCRIPTION:Source: ${event.source}`,
            `CATEGORIES:${event.type.toUpperCase()}`,
            event.completed ? 'STATUS:COMPLETED' : 'STATUS:CONFIRMED',
            'END:VEVENT'
          ].join('\r\n');
        }),
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `calendrier-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('dashboard.calendar.exported', 'Calendrier exporté'));
    } catch (error) {
      console.error('ICS export error:', error);
      toast.error(t('dashboard.calendar.exportError', 'Erreur lors de l\'export'));
    }
  };

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {t('dashboard.calendar.title', 'Calendrier consolidé')}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={exportToICS}
              title={t('dashboard.calendar.export', 'Exporter ICS')}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium capitalize min-w-[120px] text-center">
              {monthName}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, idx) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day && 
              today.getDate() === day && 
              today.getMonth() === currentMonth.getMonth() && 
              today.getFullYear() === currentMonth.getFullYear();
            
            return (
              <div 
                key={idx}
                className={`min-h-[40px] p-1 text-center rounded-lg ${
                  day ? 'hover:bg-muted/50' : ''
                } ${isToday ? 'bg-primary/10 font-bold' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-sm ${isToday ? 'text-primary' : ''}`}>{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className={`w-1.5 h-1.5 rounded-full ${typeConfig[event.type].color}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-xs">
          {Object.entries(typeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${config.color}`} />
              <span className="capitalize">{t(`dashboard.calendar.${type}`, type)}</span>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('dashboard.calendar.upcoming', 'Cette semaine')}
            </h4>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 4).map(event => {
                const config = typeConfig[event.type];
                const daysUntil = Math.ceil(
                  (event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <div className={`w-2 h-2 rounded-full ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.source}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {daysUntil === 0 
                        ? t('dashboard.calendar.today', "Aujourd'hui")
                        : daysUntil === 1 
                          ? t('dashboard.calendar.tomorrow', 'Demain')
                          : `${daysUntil}j`
                      }
                    </Badge>
                    {event.link && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                        <Link to={event.link}>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('dashboard.calendar.empty', 'Aucun événement')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
