/**
 * Expert Calendar - Advanced booking calendar with availability management
 * Supports multiple time zones and slot selection
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Globe2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { fr, enUS, de, es, nl, it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
}

interface ExpertCalendarProps {
  expertId: string;
  expertName: string;
  onSlotSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  duration?: 30 | 60 | 90;
}

const TIMEZONES = [
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/London', label: 'Londres (GMT)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
];

const WORKING_HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Generate mock availability for demo
function generateMockAvailability(startDate: Date, days: number): DayAvailability[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(startDate, i);
    const dayOfWeek = date.getDay();
    
    // No availability on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { date, slots: [] };
    }
    
    // Random availability for weekdays
    const slots: TimeSlot[] = WORKING_HOURS.map(time => ({
      time,
      available: Math.random() > 0.3,
      booked: Math.random() > 0.8,
    }));
    
    return { date, slots };
  });
}

export function ExpertCalendar({ 
  expertId, 
  expertName, 
  onSlotSelect, 
  selectedDate, 
  selectedTime,
  duration = 60 
}: ExpertCalendarProps) {
  const { t, i18n } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date());
  const [timezone, setTimezone] = useState('Europe/Paris');

  // Get locale for date-fns
  const getLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'de': return de;
      case 'es': return es;
      case 'nl': return nl;
      case 'it': return it;
      default: return enUS;
    }
  };

  // Generate availability for the next 30 days
  const availability = useMemo(() => {
    return generateMockAvailability(new Date(), 30);
  }, [expertId]);

  // Get week view data
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAvailabilityForDate = (date: Date) => {
    return availability.find(a => isSameDay(a.date, date));
  };

  const handlePrevWeek = () => setViewDate(addWeeks(viewDate, -1));
  const handleNextWeek = () => setViewDate(addWeeks(viewDate, 1));

  const handleSlotClick = (date: Date, time: string) => {
    onSlotSelect(date, time);
  };

  const isSlotSelected = (date: Date, time: string) => {
    return selectedDate && selectedTime && isSameDay(date, selectedDate) && time === selectedTime;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {t('marketplace.calendar.title', 'Réserver un créneau')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[180px]">
                <Globe2 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">
            {format(weekStart, 'd MMMM', { locale: getLocale() })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: getLocale() })}
          </h3>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('marketplace.calendar.duration', 'Durée')}: {duration} min
          </span>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "text-center text-sm font-medium pb-2 border-b",
                isSameDay(day, new Date()) && "text-primary"
              )}
            >
              <div>{format(day, 'EEE', { locale: getLocale() })}</div>
              <div className={cn(
                "text-lg",
                isSameDay(day, new Date()) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}

          {/* Time slots for each day */}
          {weekDays.map((day, dayIndex) => {
            const dayAvailability = getAvailabilityForDate(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const isPast = day < new Date();

            return (
              <div key={dayIndex} className="min-h-[200px]">
                {isWeekend || isPast ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    {isPast ? t('marketplace.calendar.past', 'Passé') : t('marketplace.calendar.closed', 'Fermé')}
                  </div>
                ) : dayAvailability?.slots.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                    {t('marketplace.calendar.noSlots', 'Aucun créneau')}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {dayAvailability?.slots.filter(s => s.available && !s.booked).slice(0, 6).map((slot, slotIndex) => (
                      <button
                        key={slotIndex}
                        onClick={() => handleSlotClick(day, slot.time)}
                        className={cn(
                          "w-full py-1.5 px-2 text-xs rounded-md transition-all",
                          "hover:bg-primary hover:text-primary-foreground",
                          isSlotSelected(day, slot.time)
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                            : "bg-muted/50 text-foreground"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                    {dayAvailability && dayAvailability.slots.filter(s => s.available && !s.booked).length > 6 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{dayAvailability.slots.filter(s => s.available && !s.booked).length - 6} {t('marketplace.calendar.more', 'autres')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted/50" />
            <span>{t('marketplace.calendar.available', 'Disponible')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>{t('marketplace.calendar.selected', 'Sélectionné')}</span>
          </div>
        </div>

        {/* Selected slot summary */}
        {selectedDate && selectedTime && (
          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {format(selectedDate, 'EEEE d MMMM', { locale: getLocale() })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTime} • {duration} min avec {expertName}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Video className="h-3 w-3" />
                Visio
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExpertCalendar;
