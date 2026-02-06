/**
 * Member Spotlight Component
 * Highlights successful community members and their journeys
 */

import { useTranslation } from 'react-i18next';
import { Star, MapPin, Briefcase, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SpotlightMember {
  id: string;
  name: string;
  avatar?: string;
  originCountry: string;
  destinationCountry: string;
  profession: string;
  testimonial: string;
  successMetric: string;
  joinedDate: string;
}

const SPOTLIGHT_MEMBERS: SpotlightMember[] = [
  {
    id: 'member-1',
    name: 'Membre Beta #1',
    originCountry: 'Europe',
    destinationCountry: 'Portugal',
    profession: 'Développeur·se Web',
    testimonial: 'La plateforme m\'a aidé·e à comprendre les réalités fiscales du Portugal avant de m\'y installer.',
    successMetric: 'Installation réussie',
    joinedDate: '2025-06'
  },
  {
    id: 'member-2',
    name: 'Membre Beta #2',
    originCountry: 'Europe',
    destinationCountry: 'Émirats Arabes Unis',
    profession: 'Consultant·e Finance',
    testimonial: 'Les recommandations m\'ont permis de structurer ma transition. Les conseils sur les pièges à éviter étaient utiles.',
    successMetric: 'Transition réussie',
    joinedDate: '2025-03'
  },
  {
    id: 'member-3',
    name: 'Membre Beta #3',
    originCountry: 'Europe',
    destinationCountry: 'Singapour',
    profession: 'Entrepreneur·se Tech',
    testimonial: 'Le comparateur de pays m\'a fait découvrir des opportunités que je n\'aurais jamais envisagées.',
    successMetric: 'Nouvelles opportunités',
    joinedDate: '2024-11'
  }
];

export function MemberSpotlight() {
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          {t('community.spotlight.title', 'Membres en vedette')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {SPOTLIGHT_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="border rounded-lg p-4 space-y-4 bg-gradient-to-br from-background to-muted/30"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-semibold">{member.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {member.profession}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {member.originCountry} → {member.destinationCountry}
                </div>
              </div>

              <Badge variant="secondary" className="text-xs">
                {member.successMetric}
              </Badge>
            </div>

            <blockquote className="relative pl-4 border-l-2 border-primary/30">
              <Quote className="absolute -left-2 -top-1 h-4 w-4 text-primary/40" />
              <p className="text-sm italic text-muted-foreground">
                "{member.testimonial}"
              </p>
            </blockquote>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
