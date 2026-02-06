import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, AlertTriangle, Shield, FileText, CheckCircle, Eye, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Irreversa } from '@/components/irreversa/Irreversa';
import { useAuth } from '@/hooks/useAuth';
import { ModuleOnboarding } from '@/components/common/ModuleOnboarding';
import { NextStepSuggestion } from '@/components/common/NextStepSuggestion';

export default function IrreversaModule() {
  const { t } = useTranslation();
  useAuth();

  const onboardingSteps = [
    {
      title: t('irreversa.onboarding.step1.title', 'Qu\'est-ce qu\'un seuil irréversible ?'),
      description: t('irreversa.onboarding.step1.desc', 'Un seuil irréversible est un point de non-retour : une décision prise, un événement survenu, qui change définitivement la donne. Exemples : démission, divorce, investissement majeur.'),
      icon: <Lock className="w-5 h-5 text-destructive" />,
      tip: t('irreversa.onboarding.step1.tip', 'Documenter un seuil aide à clarifier la situation et à éviter le déni.'),
    },
    {
      title: t('irreversa.onboarding.step2.title', 'Pourquoi documenter ?'),
      description: t('irreversa.onboarding.step2.desc', 'La documentation crée une trace claire. Elle vous aide à accepter ce qui ne peut plus changer, et à concentrer votre énergie sur ce qui reste possible.'),
      icon: <FileText className="w-5 h-5 text-destructive" />,
    },
    {
      title: t('irreversa.onboarding.step3.title', 'Le processus de scellement'),
      description: t('irreversa.onboarding.step3.desc', 'Un seuil peut être "en observation" puis "scellé" quand vous confirmez son irréversibilité. Le scellement est un acte de lucidité, pas de résignation.'),
      icon: <CheckCircle className="w-5 h-5 text-destructive" />,
      tip: t('irreversa.onboarding.step3.tip', 'Prenez le temps de valider. Un seuil scellé génère un certificat horodaté.'),
    },
  ];

  const nextSteps = [
    {
      label: t('irreversa.nextSteps.latent', 'Module Latent'),
      description: t('irreversa.nextSteps.latentDesc', 'Surveiller les zones en tension'),
      href: '/latent',
      icon: <Eye className="w-4 h-4 text-primary" />,
    },
    {
      label: t('irreversa.nextSteps.exitKeys', 'Stratégies'),
      description: t('irreversa.nextSteps.exitKeysDesc', 'Trouver de nouvelles options'),
      href: '/exit-keys',
      icon: <Route className="w-4 h-4 text-primary" />,
      primary: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="py-8 md:py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back', 'Retour')}
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-destructive/20">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-destructive/30 text-destructive">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('irreversa.badge', 'Module Irreversa')}
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  {t('irreversa.title', 'Seuils Irréversibles')}
                </h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              {t('irreversa.subtitle', 'Documentez et scelllez les moments où une situation devient irréversible. Un outil de traçabilité et de clarté pour les décisions majeures.')}
            </p>

            {/* Onboarding */}
            <ModuleOnboarding
              moduleId="irreversa"
              title={t('irreversa.title', 'Seuils Irréversibles')}
              steps={onboardingSteps}
            />

            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('irreversa.disclaimer.title', 'Outil de documentation')}</strong> — {t('irreversa.disclaimer.text', 'Ce module vous aide à documenter les seuils franchis. Il a une valeur de clarification personnelle, pas légale.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <Irreversa />
          
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
