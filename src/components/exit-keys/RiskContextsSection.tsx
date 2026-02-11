import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Skull, DollarSign, Clock, Users, 
  Shield, ArrowRight, AlertCircle, Ban, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PyramidType } from '@/lib/types';

interface RiskContextsSectionProps {
  originCountryId?: string;
  originCountryName?: string;
  originPyramidType?: PyramidType;
  destinationCountryId?: string;
  destinationCountryName?: string;
  destinationPyramidType?: PyramidType;
}

interface RiskCategory {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  colorClass: {
    border: string;
    bg: string;
    iconBg: string;
    iconText: string;
  };
  examples: string[];
  consequences: string[];
  // Relevance criteria
  relevantFor?: {
    fromPyramids?: PyramidType[];
    toPyramids?: PyramidType[];
    fromCountries?: string[];
    toCountries?: string[];
  };
}

// All possible risk categories with relevance criteria
const ALL_RISK_CATEGORIES: RiskCategory[] = [
  // Critical risks - primarily for migrations from unstable to stable
  {
    id: 'dangerous-routes',
    titleKey: 'riskContexts.dangerousRoutes.title',
    descKey: 'riskContexts.dangerousRoutes.desc',
    icon: Skull,
    colorClass: {
      border: 'border-destructive/30',
      bg: 'bg-destructive/5',
      iconBg: 'bg-destructive/10',
      iconText: 'text-destructive'
    },
    examples: [
      'riskContexts.dangerousRoutes.examples.0',
      'riskContexts.dangerousRoutes.examples.1',
      'riskContexts.dangerousRoutes.examples.2'
    ],
    consequences: [
      'riskContexts.dangerousRoutes.consequences.0',
      'riskContexts.dangerousRoutes.consequences.1',
      'riskContexts.dangerousRoutes.consequences.2'
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
      toPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
      fromCountries: ['nigeria', 'senegal', 'mali', 'morocco', 'algeria', 'tunisia', 'libya', 'eritrea', 'sudan', 'syria', 'afghanistan', 'iraq', 'somalia', 'south-sudan']
    }
  },
  {
    id: 'scams',
    titleKey: 'riskContexts.scams.title',
    descKey: 'riskContexts.scams.desc',
    icon: DollarSign,
    colorClass: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-500'
    },
    examples: [
      'riskContexts.scams.examples.0',
      'riskContexts.scams.examples.1',
      'riskContexts.scams.examples.2'
    ],
    consequences: [
      'riskContexts.scams.consequences.0',
      'riskContexts.scams.consequences.1',
      'riskContexts.scams.consequences.2'
    ],
    // Universal - relevant for most migrations
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION', 'HYBRID_TRANSITION', 'GROWTH_RISK']
    }
  },
  {
    id: 'fake-intermediaries',
    titleKey: 'riskContexts.fakeIntermediaries.title',
    descKey: 'riskContexts.fakeIntermediaries.desc',
    icon: Users,
    colorClass: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/5',
      iconBg: 'bg-orange-500/10',
      iconText: 'text-orange-500'
    },
    examples: [
      'riskContexts.fakeIntermediaries.examples.0',
      'riskContexts.fakeIntermediaries.examples.1',
      'riskContexts.fakeIntermediaries.examples.2'
    ],
    consequences: [
      'riskContexts.fakeIntermediaries.consequences.0',
      'riskContexts.fakeIntermediaries.consequences.1',
      'riskContexts.fakeIntermediaries.consequences.2'
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION', 'HYBRID_TRANSITION']
    }
  },
  {
    id: 'hidden-costs',
    titleKey: 'riskContexts.hiddenCosts.title',
    descKey: 'riskContexts.hiddenCosts.desc',
    icon: Clock,
    colorClass: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      iconBg: 'bg-blue-500/10',
      iconText: 'text-blue-500'
    },
    examples: [
      'riskContexts.hiddenCosts.examples.0',
      'riskContexts.hiddenCosts.examples.1',
      'riskContexts.hiddenCosts.examples.2'
    ],
    consequences: [
      'riskContexts.hiddenCosts.consequences.0',
      'riskContexts.hiddenCosts.consequences.1',
      'riskContexts.hiddenCosts.consequences.2'
    ],
    // Universal - always relevant
  },
  // Risks for stable → unstable migrations
  {
    id: 'healthcare-abroad',
    titleKey: 'riskContexts.healthcareAbroad.title',
    descKey: 'riskContexts.healthcareAbroad.desc',
    icon: Shield,
    colorClass: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-500'
    },
    examples: [
      'riskContexts.healthcareAbroad.examples.0',
      'riskContexts.healthcareAbroad.examples.1',
      'riskContexts.healthcareAbroad.examples.2'
    ],
    consequences: [
      'riskContexts.healthcareAbroad.consequences.0',
      'riskContexts.healthcareAbroad.consequences.1',
      'riskContexts.healthcareAbroad.consequences.2'
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
      toPyramids: ['GROWTH_RISK', 'RESOURCE_EXTRACTION', 'PROBLEM_RENT']
    }
  },
  {
    id: 'cultural-shock',
    titleKey: 'riskContexts.culturalShock.title',
    descKey: 'riskContexts.culturalShock.desc',
    icon: AlertTriangle,
    colorClass: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/5',
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-500'
    },
    examples: [
      'riskContexts.culturalShock.examples.0',
      'riskContexts.culturalShock.examples.1',
      'riskContexts.culturalShock.examples.2'
    ],
    consequences: [
      'riskContexts.culturalShock.consequences.0',
      'riskContexts.culturalShock.consequences.1',
      'riskContexts.culturalShock.consequences.2'
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST']
    }
  },
  // Tax/admin risks for stable country residents
  {
    id: 'fiscal-complexity',
    titleKey: 'riskContexts.fiscalComplexity.title',
    descKey: 'riskContexts.fiscalComplexity.desc',
    icon: DollarSign,
    colorClass: {
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/5',
      iconBg: 'bg-cyan-500/10',
      iconText: 'text-cyan-500'
    },
    examples: [
      'riskContexts.fiscalComplexity.examples.0',
      'riskContexts.fiscalComplexity.examples.1',
      'riskContexts.fiscalComplexity.examples.2'
    ],
    consequences: [
      'riskContexts.fiscalComplexity.consequences.0',
      'riskContexts.fiscalComplexity.consequences.1',
      'riskContexts.fiscalComplexity.consequences.2'
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
      toCountries: ['usa', 'switzerland', 'uae', 'singapore', 'portugal', 'spain']
    }
  }
];

// Determine relevant risks based on origin and destination
function getRelevantRisks(
  originPyramid?: PyramidType,
  destinationPyramid?: PyramidType,
  originCountryId?: string,
  destinationCountryId?: string
): RiskCategory[] {
  // If no context, return default universal risks
  if (!originPyramid && !destinationPyramid) {
    return ALL_RISK_CATEGORIES.filter(r => 
      r.id === 'scams' || r.id === 'hidden-costs' || r.id === 'fake-intermediaries'
    );
  }

  const relevantRisks = ALL_RISK_CATEGORIES.filter(risk => {
    // Always include hidden-costs as it's universal
    if (risk.id === 'hidden-costs') return true;

    const { relevantFor } = risk;
    if (!relevantFor) return true; // No criteria = always relevant

    let isRelevant = false;

    // Check if origin country matches
    if (relevantFor.fromCountries?.length && originCountryId) {
      if (relevantFor.fromCountries.includes(originCountryId)) {
        isRelevant = true;
      }
    }

    // Check if destination country matches
    if (relevantFor.toCountries?.length && destinationCountryId) {
      if (relevantFor.toCountries.includes(destinationCountryId)) {
        isRelevant = true;
      }
    }

    // Check if origin pyramid type matches
    if (relevantFor.fromPyramids?.length && originPyramid) {
      if (relevantFor.fromPyramids.includes(originPyramid)) {
        // Also check destination pyramid if specified
        if (relevantFor.toPyramids?.length) {
          if (destinationPyramid && relevantFor.toPyramids.includes(destinationPyramid)) {
            isRelevant = true;
          }
        } else {
          isRelevant = true;
        }
      }
    }

    // Check if only destination pyramid is specified
    if (relevantFor.toPyramids?.length && !relevantFor.fromPyramids?.length && destinationPyramid) {
      if (relevantFor.toPyramids.includes(destinationPyramid)) {
        isRelevant = true;
      }
    }

    return isRelevant;
  });

  // Limit to 4 most relevant risks
  return relevantRisks.slice(0, 4);
}

const ALTERNATIVES = [
  { icon: '🏠', labelKey: 'riskContexts.alternatives.stayBuild' },
  { icon: '⏰', labelKey: 'riskContexts.alternatives.migrateLater' },
  { icon: '🔄', labelKey: 'riskContexts.alternatives.migrateOther' },
  { icon: '📚', labelKey: 'riskContexts.alternatives.trainFirst' },
  { icon: '🎯', labelKey: 'riskContexts.alternatives.changeGoal' }
];

export function RiskContextsSection({ 
  originCountryId,
  originCountryName,
  originPyramidType,
  destinationCountryId,
  destinationCountryName,
  destinationPyramidType
}: RiskContextsSectionProps) {
  const { t } = useTranslation();

  const relevantRisks = useMemo(() => {
    return getRelevantRisks(
      originPyramidType,
      destinationPyramidType,
      originCountryId,
      destinationCountryId
    );
  }, [originPyramidType, destinationPyramidType, originCountryId, destinationCountryId]);

  // Generate dynamic subtitle based on countries
  const dynamicSubtitle = useMemo(() => {
    if (originCountryName && destinationCountryName) {
      return t('riskContexts.subtitleDynamic', {
        origin: originCountryName,
        destination: destinationCountryName,
        defaultValue: `Risques spécifiques pour un trajet ${originCountryName} → ${destinationCountryName}`
      });
    }
    return t('riskContexts.subtitle', 'Ce que beaucoup ne vous diront pas — mais que vous devez savoir');
  }, [originCountryName, destinationCountryName, t]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-destructive/10 w-fit">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">
                {t('riskContexts.title', 'Contextes à risque')}
              </CardTitle>
              <CardDescription className="text-sm flex items-center gap-2">
                {originCountryName && destinationCountryName && (
                  <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {originCountryName} → {destinationCountryName}
                  </span>
                )}
                <span>{dynamicSubtitle}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('riskContexts.intro', 'Avant d\'engager votre argent, votre temps ou votre vie dans une trajectoire internationale, il est crucial de distinguer les fantasmes des réalités, et les opportunités légales des impasses dangereuses.')}
          </p>
        </CardContent>
      </Card>

      {/* Risk Categories Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {relevantRisks.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id}
              className={`${category.colorClass.border} ${category.colorClass.bg} hover:opacity-90 transition-all`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${category.colorClass.iconBg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${category.colorClass.iconText}`} />
                  </div>
                  <CardTitle className="text-base sm:text-lg leading-tight">
                    {t(category.titleKey)}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {t(category.descKey)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('riskContexts.examples', 'Exemples fréquents')}
                  </p>
                  <ul className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                    {category.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                        <span className="text-destructive mt-0.5 flex-shrink-0">•</span>
                        <span className="text-muted-foreground">{t(ex)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2 flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    {t('riskContexts.consequences', 'Conséquences')}
                  </p>
                  <ul className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                    {category.consequences.map((cons, i) => (
                      <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
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

      {/* Warning Box - Mobile Optimized */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0" />
            <div className="w-full">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {t('riskContexts.warningTitle', 'Ce que System Compass peut faire pour vous')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {t('riskContexts.warningDesc', 'La plateforme ne promet rien et n\'oriente pas vers l\'illégal. Elle structure la lucidité pour que vous puissiez prendre des décisions éclairées. Parfois, la meilleure décision est de ne pas partir — ou de partir autrement.')}
              </p>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {ALTERNATIVES.map((alt, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-background border border-border/50 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base">{alt.icon}</span>
                    <span className="text-muted-foreground">{t(alt.labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA - Stack on Mobile */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-center">
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link to="/errors-illusions" className="gap-2 justify-center">
            <AlertTriangle className="w-4 h-4" />
            {t('riskContexts.cta.errors', 'Voir les erreurs fréquentes')}
          </Link>
        </Button>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link to="/prevention-filter" className="gap-2 justify-center">
            <Shield className="w-4 h-4" />
            {t('riskContexts.cta.prevention', 'Filtrer mes risques')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
