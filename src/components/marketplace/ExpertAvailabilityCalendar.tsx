import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, ChevronLeft, ChevronRight, 
  Globe, Check, X
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface ExpertAvailabilityCalendarProps {
  expertId: string;
  expertName: string;
  timezone: string;
  onSlotSelect?: (date: Date, time: string) => void;
}

const MOCK_AVAILABILITY: Record<string, TimeSlot[]> = {
  '0': [], // Dimanche - pas de disponibilité
  '1': [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: false, booked: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
  ],
  '2': [
    { time: '09:00', available: true },
    { time: '10:00', available: false, booked: true },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: false, booked: true },
  ],
  '3': [
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
  ],
  '4': [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '14:00', available: false, booked: true },
    { time: '15:00', available: true },
  ],
  '5': [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
  ],
  '6': [], // Samedi - pas de disponibilité
};

export function ExpertAvailabilityCalendar({
  expertId: _expertId,
  expertName,
  timezone,
  onSlotSelect,
}: ExpertAvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    onSlotSelect?.(date, time);
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isPast = (date: Date) => date < new Date() && !isToday(date);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Disponibilités de {expertName}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {timezone}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            disabled={isPast(weekStart)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(weekStart, 'd MMM', { locale: fr })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center p-2 rounded-t-lg ${
                isToday(day) ? 'bg-primary/10' : 'bg-muted/30'
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {format(day, 'EEE', { locale: fr })}
              </p>
              <p className={`font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}

          {/* Time Slots */}
          {weekDays.map((day, dayIndex) => {
            const dayOfWeek = day.getDay().toString();
            const slots = MOCK_AVAILABILITY[dayOfWeek] || [];
            const dayIsPast = isPast(day);

            return (
              <div key={dayIndex} className="min-h-[200px] border-t p-1 space-y-1">
                {slots.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Indisponible
                    </span>
                  </div>
                ) : (
                  slots.map((slot, slotIndex) => {
                    const isSelected = selectedSlot &&
                      isSameDay(selectedSlot.date, day) &&
                      selectedSlot.time === slot.time;

                    return (
                      <button
                        key={slotIndex}
                        onClick={() => slot.available && !dayIsPast && handleSlotClick(day, slot.time)}
                        disabled={!slot.available || dayIsPast}
                        className={`w-full px-2 py-1.5 rounded text-xs font-medium transition-all
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                            : slot.available && !dayIsPast
                              ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border border-green-500/30'
                              : slot.booked
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {slot.time}
                          {slot.booked && <X className="h-3 w-3" />}
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Sélectionné</span>
          </div>
        </div>

        {/* Selected Slot Confirmation */}
        {selectedSlot && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Créneau sélectionné</p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedSlot.date, 'EEEE d MMMM yyyy', { locale: fr })} à {selectedSlot.time}
                </p>
              </div>
              <Button size="sm">
                Confirmer la réservation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
