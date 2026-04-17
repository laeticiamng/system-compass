/**
 * NextBestActionHero — surfaces the single most useful next step
 * for a connected user, based on profile / plan state.
 * Displayed at the top of the Dashboard to remove ambiguity post-login.
 */
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocalizedLink as Link } from '@/components/i18n';
import { Sparkles, ArrowRight, Compass, Map, Target } from 'lucide-react';

interface Props {
  hasProfile: boolean;
  hasPlan: boolean;
  hasFollowedCountries: boolean;
}

export function NextBestActionHero({ hasProfile, hasPlan, hasFollowedCountries }: Props) {
  const { t } = useTranslation();

  // Determine the single most relevant next step
  const action = (() => {
    if (!hasProfile) {
      return {
        icon: Sparkles,
        title: t('dashboard.nextBest.profile.title', 'Définissez votre profil en 2 minutes'),
        description: t('dashboard.nextBest.profile.description', 'Sans profil, vos recommandations seront génériques. Le test rapide vous suggère immédiatement les pays compatibles.'),
        cta: t('dashboard.nextBest.profile.cta', 'Faire le test rapide'),
        href: '/quick-test',
      };
    }
    if (!hasFollowedCountries) {
      return {
        icon: Map,
        title: t('dashboard.nextBest.explore.title', 'Explorez les pays compatibles avec votre profil'),
        description: t('dashboard.nextBest.explore.description', "Suivez 2 ou 3 pays pour recevoir leurs mises à jour et débloquer la comparaison personnalisée."),
        cta: t('dashboard.nextBest.explore.cta', 'Voir les pays recommandés'),
        href: '/countries',
      };
    }
    if (!hasPlan) {
      return {
        icon: Compass,
        title: t('dashboard.nextBest.strategy.title', 'Choisissez une stratégie d\'expatriation'),
        description: t('dashboard.nextBest.strategy.description', 'Une stratégie structure votre projet en phases concrètes : préparation, transition, installation. Vous gagnez 6 mois de tâtonnements.'),
        cta: t('dashboard.nextBest.strategy.cta', 'Découvrir les stratégies'),
        href: '/exit-keys',
      };
    }
    return {
      icon: Target,
      title: t('dashboard.nextBest.execute.title', 'Suivez votre prochaine étape'),
      description: t('dashboard.nextBest.execute.description', "Continuez votre plan en cours et cochez les actions terminées pour voir votre progression."),
      cta: t('dashboard.nextBest.execute.cta', 'Voir mon plan'),
      href: '/dashboard#plan',
    };
  })();

  const Icon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mb-6"
    >
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-5 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-xl bg-primary/15 text-primary flex-shrink-0">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-1">
                  {t('dashboard.nextBest.label', 'Prochaine étape recommandée')}
                </p>
                <h2 className="text-base sm:text-lg font-semibold mb-1 leading-tight">
                  {action.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="btn-premium text-primary-foreground gap-2 flex-shrink-0 w-full sm:w-auto">
              <Link to={action.href}>
                {action.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
