/**
 * Upcoming Events Component
 * Displays a list of upcoming community events with registration
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { format, isToday, differenceInDays } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'webinar' | 'meetup' | 'workshop' | 'ama';
  capacity: number;
  registered: number;
  isOnline: boolean;
  link?: string;
}

const SAMPLE_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Expatriation fiscale 2026',
    description: 'Webinaire sur les meilleures stratégies fiscales pour expatriés',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'En ligne',
    type: 'webinar',
    capacity: 100,
    registered: 67,
    isOnline: true,
    link: '#'
  },
  {
    id: 'evt-2',
    title: 'Meetup Paris - Nomades Digitaux',
    description: 'Rencontre mensuelle des nomades digitaux parisiens',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Paris, France',
    type: 'meetup',
    capacity: 30,
    registered: 18,
    isOnline: false
  },
  {
    id: 'evt-3',
    title: 'Workshop: Préparer sa stratégie',
    description: 'Atelier pratique pour construire votre stratégie de relocalisation',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'En ligne',
    type: 'workshop',
    capacity: 25,
    registered: 22,
    isOnline: true,
    link: '#'
  }
];

export function UpcomingEvents() {
  const { t, i18n } = useTranslation();
  const [events] = useState<CommunityEvent[]>(SAMPLE_EVENTS);
  const { register, isLoading, isRegistered: checkIsRegistered } = useEventRegistration();
  const [localRegistered, setLocalRegistered] = useState<string[]>([]);

  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  const handleRegister = async (event: CommunityEvent) => {
    try {
      await register({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventType: event.type
      });
      setLocalRegistered(prev => [...prev, event.id]);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const getEventTypeBadge = (type: CommunityEvent['type']) => {
    const colors = {
      webinar: 'bg-blue-500/10 text-blue-500',
      meetup: 'bg-green-500/10 text-green-500',
      workshop: 'bg-purple-500/10 text-purple-500',
      ama: 'bg-orange-500/10 text-orange-500'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  const getTimeUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const days = differenceInDays(eventDate, new Date());
    
    if (isToday(eventDate)) return t('community.events.today');
    if (days === 1) return t('community.events.tomorrow');
    if (days < 7) return t('community.events.inDays', { days });
    return format(eventDate, 'PPP', { locale: dateLocale });
  };

  const isFull = (event: CommunityEvent) => event.registered >= event.capacity;
  const isEventRegistered = (eventId: string) => localRegistered.includes(eventId) || checkIsRegistered(eventId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t('community.events.title', 'Événements à venir')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('community.events.noEvents', 'Aucun événement prévu')}
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getEventTypeBadge(event.type)}>
                      {t(`community.events.types.${event.type}`, event.type)}
                    </Badge>
                    {event.isOnline && (
                      <Badge variant="outline" className="text-xs">
                        {t('community.events.online', 'En ligne')}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTimeUntil(event.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.registered}/{event.capacity}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isEventRegistered(event.id) ? (
                  <Button variant="outline" size="sm" disabled>
                    ✓ {t('community.events.registered', 'Inscrit')}
                  </Button>
                ) : isFull(event) ? (
                  <Button variant="outline" size="sm" disabled>
                    {t('community.events.full', 'Complet')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleRegister(event)}
                    disabled={isLoading}
                  >
                    {t('community.events.register', "S'inscrire")}
                  </Button>
                )}
                {event.link && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={event.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
