import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Coins, 
  TrendingDown,
  ArrowRight,
  GraduationCap,
  Plane,
  Building2,
  Users,
  Shield,
  Target,
  Shuffle,
  Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface MistakeConfig {
  id: string;
  translationKey: string;
  icon: React.ElementType;
  pyramidTypes: { type: string; labelKey: string; color: string }[];
  relatedExitKeys?: string[];
}

const MISTAKE_CONFIGS: MistakeConfig[] = [
  {
    id: 'country-without-understanding',
    translationKey: 'countryWithoutUnderstanding',
    icon: Plane,
    pyramidTypes: [
      { type: 'PROBLEM_RENT', labelKey: 'pyramids.problemRent.label', color: 'pyramid-rent' },
      { type: 'STABILITY_REDIS', labelKey: 'pyramids.stabilityRedis.label', color: 'pyramid-stability' }
    ],
    relatedExitKeys: ['visa-skilled-worker', 'entrepreneur-visa']
  },
  {
    id: 'diplomas-in-network-system',
    translationKey: 'diplomasInNetworkSystem',
    icon: GraduationCap,
    pyramidTypes: [
      { type: 'PROBLEM_RENT', labelKey: 'pyramids.problemRent.label', color: 'pyramid-rent' }
    ],
    relatedExitKeys: ['remote-work', 'freelance-international']
  },
  {
    id: 'stability-in-growth-system',
    translationKey: 'stabilityInGrowthSystem',
    icon: Shield,
    pyramidTypes: [
      { type: 'GROWTH_RISK', labelKey: 'pyramids.growthRisk.label', color: 'pyramid-growth' }
    ],
    relatedExitKeys: ['golden-visa', 'retirement-visa']
  },
  {
    id: 'growth-in-stability-system',
    translationKey: 'growthInStabilitySystem',
    icon: Target,
    pyramidTypes: [
      { type: 'STABILITY_REDIS', labelKey: 'pyramids.stabilityRedis.label', color: 'pyramid-stability' }
    ],
    relatedExitKeys: ['entrepreneur-visa', 'digital-nomad']
  },
  {
    id: 'visibility-in-rent-system',
    translationKey: 'visibilityInRentSystem',
    icon: AlertTriangle,
    pyramidTypes: [
      { type: 'PROBLEM_RENT', labelKey: 'pyramids.problemRent.label', color: 'pyramid-rent' },
      { type: 'HYBRID_TRANSITION', labelKey: 'pyramids.hybridTransition.label', color: 'pyramid-hybrid' }
    ],
    relatedExitKeys: ['second-residency', 'offshore-structure']
  },
  {
    id: 'betting-against-state',
    translationKey: 'bettingAgainstState',
    icon: Shuffle,
    pyramidTypes: [
      { type: 'HYBRID_TRANSITION', labelKey: 'pyramids.hybridTransition.label', color: 'pyramid-hybrid' }
    ],
    relatedExitKeys: ['investor-visa', 'diversification']
  },
  {
    id: 'expecting-permanence-extraction',
    translationKey: 'expectingPermanenceExtraction',
    icon: Gem,
    pyramidTypes: [
      { type: 'RESOURCE_EXTRACTION', labelKey: 'pyramids.resourceExtraction.label', color: 'pyramid-resource' }
    ],
    relatedExitKeys: ['second-passport', 'retirement-planning']
  },
  {
    id: 'ignoring-local-credentials',
    translationKey: 'ignoringLocalCredentials',
    icon: Building2,
    pyramidTypes: [
      { type: 'COMPETENCE_TRUST', labelKey: 'pyramids.competenceTrust.label', color: 'pyramid-competence' }
    ],
    relatedExitKeys: ['skilled-migration', 'credential-recognition']
  },
  {
    id: 'single-income-source',
    translationKey: 'singleIncomeSource',
    icon: Users,
    pyramidTypes: [
      { type: 'STABILITY_REDIS', labelKey: 'pyramids.stabilityRedis.label', color: 'pyramid-stability' },
      { type: 'GROWTH_RISK', labelKey: 'pyramids.growthRisk.label', color: 'pyramid-growth' }
    ],
    relatedExitKeys: ['remote-work', 'side-business', 'investment']
  }
];

export default function SystemicMistakes() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {t('systemicMistakes.title', 'Erreurs systémiques fréquentes')}
              </h1>
              <p className="text-muted-foreground">
                {t('systemicMistakes.subtitle', 'Ce que les systèmes ne pardonnent pas — et comment les éviter')}
              </p>
            </div>
          </div>

          <SimulationDisclaimer variant="compact" className="mt-6" />
        </div>

        {/* Introduction */}
        <div className="glass-card rounded-xl p-6 mb-12 max-w-4xl">
          <p className="text-muted-foreground leading-relaxed">
            {t('systemicMistakes.intro', "Ces erreurs ne sont pas des jugements moraux. Ce sont des décalages entre les attentes d'un individu et les règles réelles d'un système.")}
          </p>
          <p className="text-sm text-muted-foreground/80 mt-4">
            {t('systemicMistakes.introDetail', 'Chaque erreur est analysée en termes de contexte, pyramides concernées, et conséquences typiques.')}
          </p>
        </div>

        {/* Mistakes Grid */}
        <div className="space-y-8">
          {MISTAKE_CONFIGS.map((config, index) => {
            const Icon = config.icon;
            const baseKey = `systemicMistakes.mistakes.${config.translationKey}`;
            
            return (
              <article 
                key={config.id}
                id={config.id}
                className="glass-card rounded-2xl p-6 md:p-8 scroll-mt-24"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-destructive/10 flex-shrink-0">
                    <Icon className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-muted-foreground">#{index + 1}</span>
                    </div>
                    <h2 className="font-display text-xl md:text-2xl font-bold mb-2">
                      {t(`${baseKey}.title`)}
                    </h2>
                    <p className="text-muted-foreground">
                      {t(`${baseKey}.description`)}
                    </p>
                  </div>
                </div>

                {/* Typical Context */}
                <div className="bg-muted/30 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    {t('systemicMistakes.typicalContext', 'Contexte typique')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`${baseKey}.context`)}
                  </p>
                </div>

                {/* Pyramids Concerned */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">
                    {t('systemicMistakes.pyramidsConcerned', 'Pyramides concernées')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {config.pyramidTypes.map((pyramid) => (
                      <Link
                        key={pyramid.type}
                        to={`/pyramid-types#${pyramid.type.toLowerCase()}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: `hsl(var(--${pyramid.color}) / 0.15)`,
                          color: `hsl(var(--${pyramid.color}))`
                        }}
                      >
                        {t(pyramid.labelKey)}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Consequences */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">
                    {t('systemicMistakes.frequentConsequences', 'Conséquences fréquentes')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ConsequenceCard
                      icon={Clock}
                      label={t('systemicMistakes.time', 'Temps')}
                      value={t(`${baseKey}.time`)}
                      color="text-blue-500"
                    />
                    <ConsequenceCard
                      icon={Zap}
                      label={t('systemicMistakes.energy', 'Énergie')}
                      value={t(`${baseKey}.energy`)}
                      color="text-amber-500"
                    />
                    <ConsequenceCard
                      icon={Coins}
                      label={t('systemicMistakes.money', 'Argent')}
                      value={t(`${baseKey}.money`)}
                      color="text-emerald-500"
                    />
                    <ConsequenceCard
                      icon={TrendingDown}
                      label={t('systemicMistakes.stagnation', 'Stagnation')}
                      value={t(`${baseKey}.stagnation`)}
                      color="text-destructive"
                    />
                  </div>
                </div>

                {/* Related Exit Keys */}
                {config.relatedExitKeys && config.relatedExitKeys.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t('systemicMistakes.exploreExitKeys', 'Explorer les clés de sortie associées')}
                      </span>
                      <Link to="/exit-keys">
                        <Button variant="ghost" size="sm" className="gap-2">
                          {t('systemicMistakes.viewExitKeys', 'Voir les clés de sortie')}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 glass-card rounded-2xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            {t('systemicMistakes.ctaTitle', 'Éviter ces erreurs commence par comprendre ton système')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('systemicMistakes.ctaSubtitle', 'Analyse ta situation actuelle, identifie les décalages potentiels, et explore les stratégies adaptées à ton profil.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/exit-keys">
              <Button size="lg" className="gap-2">
                {t('systemicMistakes.simulateTrajectory', 'Simuler ma trajectoire')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/pyramid-types">
              <Button variant="outline" size="lg" className="gap-2">
                {t('systemicMistakes.understandPyramids', 'Comprendre les pyramides')}
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            {t('common.disclaimer', 'Outil d\'analyse uniquement. Tu restes responsable de tes décisions.')}
          </p>
        </div>
      </div>
    </main>
  );
}

function ConsequenceCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-muted/20 rounded-lg p-3">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{value}</p>
    </div>
  );
}
