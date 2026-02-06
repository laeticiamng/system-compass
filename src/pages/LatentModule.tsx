import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Layers, AlertTriangle, Lightbulb, Target, Brain, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Latent } from '@/components/latent/Latent';
import { LatentZoneExport } from '@/components/latent/LatentZoneExport';
import { useAuth } from '@/hooks/useAuth';
import { useLatentZones } from '@/hooks/useLatentZones';
import { ModuleOnboarding } from '@/components/common/ModuleOnboarding';
import { NextStepSuggestion } from '@/components/common/NextStepSuggestion';
import { GranularErrorBoundary } from '@/components/common/GranularErrorBoundary';

export default function LatentModule() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { zones } = useLatentZones();

  const onboardingSteps = [
    {
      title: t('latent.onboarding.step1.title', 'Qu\'est-ce qu\'une zone latente ?'),
      description: t('latent.onboarding.step1.desc', 'Une zone latente est un aspect de votre vie en tension, pas encore en crise, mais qui demande attention. Exemple : une relation professionnelle qui se dégrade, une santé qu\'on néglige.'),
      icon: <Lightbulb className="w-5 h-5 text-primary" />,
      tip: t('latent.onboarding.step1.tip', 'Les zones latentes évoluent. Une zone "dormante" peut devenir "active" selon les circonstances.'),
    },
    {
      title: t('latent.onboarding.step2.title', 'Comment les identifier ?'),
      description: t('latent.onboarding.step2.desc', 'Pensez aux domaines où vous ressentez un malaise diffus : travail, relations, finances, santé, projets. Les signaux faibles sont souvent ignorés.'),
      icon: <Target className="w-5 h-5 text-primary" />,
    },
    {
      title: t('latent.onboarding.step3.title', 'L\'objectif : anticiper'),
      description: t('latent.onboarding.step3.desc', 'Ce module vous aide à surveiller ces zones AVANT qu\'elles ne deviennent des crises. C\'est un outil de lucidité, pas de diagnostic.'),
      icon: <Brain className="w-5 h-5 text-primary" />,
      tip: t('latent.onboarding.step3.tip', 'Relisez vos zones régulièrement. La prise de conscience est déjà une forme d\'action.'),
    },
  ];

  const nextSteps = [
    {
      label: t('latent.nextSteps.irreversa', 'Module Irreversa'),
      description: t('latent.nextSteps.irreversaDesc', 'Documenter les seuils déjà franchis'),
      href: '/irreversa',
      icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
    },
    {
      label: t('latent.nextSteps.exitKeys', 'Stratégies'),
      description: t('latent.nextSteps.exitKeysDesc', 'Explorer vos options concrètes'),
      href: '/exit-keys',
      icon: <Route className="w-4 h-4 text-primary" />,
      primary: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-32 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-64 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Hero Section */}
      <section className="py-8 md:py-12 border-b border-primary/10 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('common.back', 'Retour')}
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 glow-gold">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
                  <Layers className="w-3 h-3 mr-1" />
                  {t('latent.badge', 'Module Latent')}
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold gold-text">
                  {t('latent.title', 'Zones Latentes')}
                </h1>
              </div>
              {/* Export Button */}
              {user && zones.length > 0 && (
                <div className="ml-auto">
                  <LatentZoneExport zones={zones} />
                </div>
              )}
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              {t('latent.subtitle', 'Identifiez et surveillez les zones de votre vie qui sont en tension mais pas encore en crise. Un outil de prévention et de lucidité.')}
            </p>

            {/* Onboarding */}
            <ModuleOnboarding
              moduleId="latent"
              title={t('latent.title', 'Zones Latentes')}
              steps={onboardingSteps}
            />

            <div className="glass-card p-4 rounded-xl border-primary/10 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">{t('latent.disclaimer.title', 'Outil de réflexion personnelle')}</strong> — {t('latent.disclaimer.text', 'Ce module vous aide à cartographier vos zones de tension. Il ne remplace pas un accompagnement professionnel.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <GranularErrorBoundary componentName="Latent Zones">
            <Latent />
          </GranularErrorBoundary>
          
          {/* Sidebar with next steps */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <NextStepSuggestion steps={nextSteps} />
            </div>
          </aside>
        </div>

        {/* Mobile next steps */}
        <div className="lg:hidden mt-8">
          <NextStepSuggestion steps={nextSteps} />
        </div>
      </div>
    </div>
  );
}
