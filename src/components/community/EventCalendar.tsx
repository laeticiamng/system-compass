import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Video, Users, BookOpen, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEventRegistration } from '@/hooks/useEventRegistration';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'webinar' | 'meetup' | 'workshop' | 'ama';
  speaker?: string;
  location?: string;
  description?: string;
}

const getUpcomingDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const UPCOMING_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'AMA: Fiscalité des Digital Nomads',
    date: getUpcomingDate(7),
    time: '19:00 CET',
    type: 'webinar',
    speaker: 'Maître Sophie Laurent',
    description: 'Questions-réponses en direct sur la fiscalité internationale',
  },
  {
    id: 'event-2',
    title: 'Meetup Paris - Expats & Entrepreneurs',
    date: getUpcomingDate(14),
    time: '18:30',
    type: 'meetup',
    location: 'Paris, France',
    description: 'Networking et partage d\'expériences',
  },
  {
    id: 'event-3',
    title: 'Workshop: Préparer son départ en 90 jours',
    date: getUpcomingDate(21),
    time: '14:00 CET',
    type: 'workshop',
    description: 'Atelier pratique avec checklist et planning personnalisé',
  },
];

const eventTypeConfig = {
  webinar: { icon: Video, label: 'Webinar', color: 'bg-blue-500/20 text-blue-500' },
  meetup: { icon: Users, label: 'Meetup', color: 'bg-emerald-500/20 text-emerald-500' },
  workshop: { icon: BookOpen, label: 'Workshop', color: 'bg-amber-500/20 text-amber-500' },
  ama: { icon: Video, label: 'AMA', color: 'bg-purple-500/20 text-purple-500' },
};

interface EventCalendarProps {
  maxEvents?: number;
  showTitle?: boolean;
}

export function EventCalendar({ maxEvents = 3, showTitle = true }: EventCalendarProps) {
  const { register, isRegistered, isLoading } = useEventRegistration();
  const [registering, setRegistering] = useState<string | null>(null);

  const displayEvents = UPCOMING_EVENTS.slice(0, maxEvents);

  const handleRegister = async (event: Event) => {
    setRegistering(event.id);
    try {
      const success = await register({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventType: event.type,
      });
      if (success) {
        toast.success(`Inscrit à "${event.title}"`, {
          description: 'Vous recevrez un rappel avant l\'événement.',
        });
      }
    } finally {
      setRegistering(null);
    }
  };

  return (
    <Card className="glass-card">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Événements à venir
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="space-y-4">
          {displayEvents.map((event) => {
            const config = eventTypeConfig[event.type];
            const EventIcon = config.icon;
            const registered = isRegistered(event.id);

            return (
              <div
                key={event.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={config.color}>
                        <EventIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </p>
                      {event.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      )}
                      {event.speaker && (
                        <p className="text-primary">Avec {event.speaker}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {registered ? (
                      <Button variant="secondary" size="sm" disabled className="gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Inscrit
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegister(event)}
                        disabled={isLoading || registering === event.id}
                        className="gap-1"
                      >
                        S'inscrire
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {UPCOMING_EVENTS.length > maxEvents && (
          <Button variant="ghost" className="w-full mt-4">
            Voir tous les événements ({UPCOMING_EVENTS.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
