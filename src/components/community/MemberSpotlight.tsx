/**
 * Member Spotlight Component
 * Modern testimonial cards inspired by 21st.dev patterns
 * Features: gradient accents, hover lift, animated entrance, star ratings
 */

import { useTranslation } from 'react-i18next';
import { Star, MapPin, Briefcase, Quote, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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
  rating?: number;
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
    joinedDate: '2025-06',
    rating: 5,
  },
  {
    id: 'member-2',
    name: 'Membre Beta #2',
    originCountry: 'Europe',
    destinationCountry: 'Émirats Arabes Unis',
    profession: 'Consultant·e Finance',
    testimonial: 'Les recommandations m\'ont permis de structurer ma transition. Les conseils sur les pièges à éviter étaient utiles.',
    successMetric: 'Transition réussie',
    joinedDate: '2025-03',
    rating: 4,
  },
  {
    id: 'member-3',
    name: 'Membre Beta #3',
    originCountry: 'Europe',
    destinationCountry: 'Singapour',
    profession: 'Entrepreneur·se Tech',
    testimonial: 'Le comparateur de pays m\'a fait découvrir des opportunités que je n\'aurais jamais envisagées.',
    successMetric: 'Nouvelles opportunités',
    joinedDate: '2024-11',
    rating: 5,
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? 'fill-primary text-primary'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ member, index }: { member: SpotlightMember; index: number }) {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      {/* Gradient border effect */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 group-hover:shadow-[var(--shadow-elevated)] group-hover:-translate-y-1">
        {/* Quote icon - decorative */}
        <div className="absolute top-4 right-4 opacity-[0.06]">
          <Quote className="h-16 w-16" />
        </div>

        {/* Stars */}
        {member.rating && <StarRating rating={member.rating} />}

        {/* Testimonial */}
        <blockquote className="mt-4 mb-6 text-sm leading-relaxed text-foreground/80">
          "{member.testimonial}"
        </blockquote>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            {member.avatar ? (
              <AvatarImage src={member.avatar} alt={member.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{member.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{member.profession}</span>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="text-[10px] shrink-0 bg-primary/5 text-primary border-primary/10"
          >
            <MapPin className="h-2.5 w-2.5 mr-1" />
            {member.destinationCountry}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

export function MemberSpotlight() {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-4 w-4 text-primary" />
            </div>
            {t('community.spotlight.title', 'Membres en vedette')}
          </CardTitle>
          <span className="text-xs text-muted-foreground flex items-center gap-1 group cursor-pointer hover:text-primary transition-colors">
            {t('community.spotlight.seeAll', 'Voir tout')}
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-4 md:grid-cols-3">
          {SPOTLIGHT_MEMBERS.map((member, index) => (
            <TestimonialCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
