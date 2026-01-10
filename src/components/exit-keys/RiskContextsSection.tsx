import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Skull, DollarSign, Clock, Users, 
  Shield, ArrowRight, AlertCircle, Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RiskCategory {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  color: string;
  examples: string[];
  consequences: string[];
}

const RISK_CATEGORIES: RiskCategory[] = [
  {
    id: 'dangerous-routes',
    titleKey: 'riskContexts.dangerousRoutes.title',
    descKey: 'riskContexts.dangerousRoutes.desc',
    icon: Skull,
    color: 'destructive',
    examples: [
      'riskContexts.dangerousRoutes.examples.0',
      'riskContexts.dangerousRoutes.examples.1',
      'riskContexts.dangerousRoutes.examples.2'
    ],
    consequences: [
      'riskContexts.dangerousRoutes.consequences.0',
      'riskContexts.dangerousRoutes.consequences.1',
      'riskContexts.dangerousRoutes.consequences.2'
    ]
  },
  {
    id: 'scams',
    titleKey: 'riskContexts.scams.title',
    descKey: 'riskContexts.scams.desc',
    icon: DollarSign,
    color: 'amber-500',
    examples: [
      'riskContexts.scams.examples.0',
      'riskContexts.scams.examples.1',
      'riskContexts.scams.examples.2'
    ],
    consequences: [
      'riskContexts.scams.consequences.0',
      'riskContexts.scams.consequences.1',
      'riskContexts.scams.consequences.2'
    ]
  },
  {
    id: 'fake-intermediaries',
    titleKey: 'riskContexts.fakeIntermediaries.title',
    descKey: 'riskContexts.fakeIntermediaries.desc',
    icon: Users,
    color: 'orange-500',
    examples: [
      'riskContexts.fakeIntermediaries.examples.0',
      'riskContexts.fakeIntermediaries.examples.1',
      'riskContexts.fakeIntermediaries.examples.2'
    ],
    consequences: [
      'riskContexts.fakeIntermediaries.consequences.0',
      'riskContexts.fakeIntermediaries.consequences.1',
      'riskContexts.fakeIntermediaries.consequences.2'
    ]
  },
  {
    id: 'hidden-costs',
    titleKey: 'riskContexts.hiddenCosts.title',
    descKey: 'riskContexts.hiddenCosts.desc',
    icon: Clock,
    color: 'blue-500',
    examples: [
      'riskContexts.hiddenCosts.examples.0',
      'riskContexts.hiddenCosts.examples.1',
      'riskContexts.hiddenCosts.examples.2'
    ],
    consequences: [
      'riskContexts.hiddenCosts.consequences.0',
      'riskContexts.hiddenCosts.consequences.1',
      'riskContexts.hiddenCosts.consequences.2'
    ]
  }
];

const ALTERNATIVES = [
  { icon: '🏠', labelKey: 'riskContexts.alternatives.stayBuild' },
  { icon: '⏰', labelKey: 'riskContexts.alternatives.migrateLater' },
  { icon: '🔄', labelKey: 'riskContexts.alternatives.migrateOther' },
  { icon: '📚', labelKey: 'riskContexts.alternatives.trainFirst' },
  { icon: '🎯', labelKey: 'riskContexts.alternatives.changeGoal' }
];

export function RiskContextsSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {t('riskContexts.title', 'Contextes à risque')}
              </CardTitle>
              <CardDescription>
                {t('riskContexts.subtitle', 'Ce que beaucoup ne vous diront pas — mais que vous devez savoir')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('riskContexts.intro', 'Avant d\'engager votre argent, votre temps ou votre vie dans une trajectoire internationale, il est crucial de distinguer les fantasmes des réalités, et les opportunités légales des impasses dangereuses.')}
          </p>
        </CardContent>
      </Card>

      {/* Risk Categories Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {RISK_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id}
              className={`border-${category.color}/30 bg-${category.color}/5 hover:border-${category.color}/50 transition-all`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${category.color}/10`}>
                    <Icon className={`w-5 h-5 text-${category.color}`} />
                  </div>
                  <CardTitle className="text-lg">
                    {t(category.titleKey)}
                  </CardTitle>
                </div>
                <CardDescription>
                  {t(category.descKey)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('riskContexts.examples', 'Exemples fréquents')}
                  </p>
                  <ul className="text-sm space-y-1">
                    {category.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span className="text-muted-foreground">{t(ex)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    {t('riskContexts.consequences', 'Conséquences')}
                  </p>
                  <ul className="text-sm space-y-1">
                    {category.consequences.map((cons, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">→</span>
                        <span className="text-muted-foreground">{t(cons)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Warning Box */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">
                {t('riskContexts.warningTitle', 'Ce que Pyramid Compass peut faire pour vous')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('riskContexts.warningDesc', 'La plateforme ne promet rien et n\'oriente pas vers l\'illégal. Elle structure la lucidité pour que vous puissiez prendre des décisions éclairées. Parfois, la meilleure décision est de ne pas partir — ou de partir autrement.')}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {ALTERNATIVES.map((alt, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border/50 text-sm"
                  >
                    <span>{alt.icon}</span>
                    <span className="text-muted-foreground">{t(alt.labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/errors-illusions" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('riskContexts.cta.errors', 'Voir les erreurs fréquentes')}
          </Link>
        </Button>
        <Button asChild>
          <Link to="/prevention-filter" className="gap-2">
            <Shield className="w-4 h-4" />
            {t('riskContexts.cta.prevention', 'Filtrer mes risques')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
