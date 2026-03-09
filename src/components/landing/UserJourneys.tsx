/**
 * Simplified User Journeys Section
 * 3 clear pathways: Explorer, Test rapide, Comparer
 * Reduces cognitive overload by directing users to the right feature immediately.
 */

import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Globe, Zap, GitCompareArrows, ArrowRight, Stethoscope } from 'lucide-react';

const journeys = [
  {
    id: 'explore',
    icon: Globe,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    route: '/countries',
    titleKey: 'landing.journeys.explore.title',
    titleDefault: 'Explorer les pays',
    descKey: 'landing.journeys.explore.desc',
    descDefault: 'Parcours les 80+ fiches pays : fiscalité, visas, coût de la vie, sécurité.',
    ctaKey: 'landing.journeys.explore.cta',
    ctaDefault: 'Explorer',
    time: '~5 min',
  },
  {
    id: 'test',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    route: '/quick-test',
    titleKey: 'landing.journeys.test.title',
    titleDefault: 'Test rapide',
    descKey: 'landing.journeys.test.desc',
    descDefault: 'Réponds à quelques questions et découvre les pays les plus compatibles avec ton profil.',
    ctaKey: 'landing.journeys.test.cta',
    ctaDefault: 'Faire le test',
    time: '2 min',
    highlight: true,
  },
  {
    id: 'compare',
    icon: GitCompareArrows,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    route: '/compare',
    titleKey: 'landing.journeys.compare.title',
    titleDefault: 'Comparer',
    descKey: 'landing.journeys.compare.desc',
    descDefault: 'Compare jusqu\'à 4 pays côte à côte : radar charts, fiscalité, qualité de vie.',
    ctaKey: 'landing.journeys.compare.cta',
    ctaDefault: 'Comparer',
    time: '~3 min',
  },
  {
    id: 'healthcare',
    icon: Stethoscope,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    route: '/healthcare',
    titleKey: 'landing.journeys.healthcare.title',
    titleDefault: 'Professionnel de Santé',
    descKey: 'landing.journeys.healthcare.desc',
    descDefault: 'Reconnaissance de diplôme, autorisation d\'exercer, simulateur fiscal transfrontalier et checklist documents personnalisée.',
    ctaKey: 'landing.journeys.healthcare.cta',
    ctaDefault: 'Parcours santé',
    time: '~10 min',
    highlight: false,
  },
];

export function UserJourneys() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const { trackEvent } = useAnalytics();

  const handleJourneyClick = (journey: typeof journeys[0]) => {
    trackEvent({
      event: 'filter_clicked',
      category: 'engagement',
      metadata: { journey: journey.id },
    });
    navigate(journey.route);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-medium mb-3 tracking-widest uppercase text-sm">
            {t('landing.journeys.label', 'Par où commencer ?')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            {t('landing.journeys.title', 'Choisis ton parcours')}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('landing.journeys.subtitle', 'Que tu saches déjà où tu veux aller ou que tu cherches l\'inspiration.')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {journeys.map((journey, i) => {
            const Icon = journey.icon;
            return (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card
                  className={`h-full cursor-pointer group transition-all hover:shadow-lg hover:-translate-y-1 ${
                    journey.highlight ? `border-primary/40 shadow-primary/10 shadow-md` : ''
                  }`}
                  onClick={() => handleJourneyClick(journey)}
                >
                  <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl ${journey.bgColor} flex items-center justify-center mb-5`}>
                      <Icon className={`w-7 h-7 ${journey.color}`} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{t(journey.titleKey, journey.titleDefault)}</h3>
                      {journey.highlight && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {t('landing.journeys.recommended', 'Recommandé')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                      {t(journey.descKey, journey.descDefault)}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground/70">{journey.time}</span>
                      <Button
                        variant={journey.highlight ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-1.5 group-hover:gap-2 transition-all"
                      >
                        {t(journey.ctaKey, journey.ctaDefault)}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
