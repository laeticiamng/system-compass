import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, ArrowRight, Filter, AlertTriangle, Clock, Zap, 
  Coins, TrendingDown, Users, Brain, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { UNIVERSAL_ERRORS } from '@/lib/universal-errors-data';
import { useAnalytics } from '@/hooks/useAnalytics';

// Systemic mistakes config (from SystemicMistakes.tsx)
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
    icon: AlertTriangle,
    pyramidTypes: [
      { type: 'PROBLEM_RENT', labelKey: 'pyramids.problemRent.label', color: 'pyramid-rent' },
      { type: 'STABILITY_REDIS', labelKey: 'pyramids.stabilityRedis.label', color: 'pyramid-stability' }
    ],
    relatedExitKeys: ['visa-skilled-worker', 'entrepreneur-visa']
  },
  {
    id: 'diplomas-in-network-system',
    translationKey: 'diplomasInNetworkSystem',
    icon: Brain,
    pyramidTypes: [
      { type: 'PROBLEM_RENT', labelKey: 'pyramids.problemRent.label', color: 'pyramid-rent' }
    ],
    relatedExitKeys: ['remote-work', 'freelance-international']
  },
  {
    id: 'stability-in-growth-system',
    translationKey: 'stabilityInGrowthSystem',
    icon: AlertTriangle,
    pyramidTypes: [
      { type: 'GROWTH_RISK', labelKey: 'pyramids.growthRisk.label', color: 'pyramid-growth' }
    ],
    relatedExitKeys: ['golden-visa', 'retirement-visa']
  },
  {
    id: 'growth-in-stability-system',
    translationKey: 'growthInStabilitySystem',
    icon: TrendingDown,
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
    icon: AlertTriangle,
    pyramidTypes: [
      { type: 'HYBRID_TRANSITION', labelKey: 'pyramids.hybridTransition.label', color: 'pyramid-hybrid' }
    ],
    relatedExitKeys: ['investor-visa', 'diversification']
  },
  {
    id: 'expecting-permanence-extraction',
    translationKey: 'expectingPermanenceExtraction',
    icon: AlertTriangle,
    pyramidTypes: [
      { type: 'RESOURCE_EXTRACTION', labelKey: 'pyramids.resourceExtraction.label', color: 'pyramid-resource' }
    ],
    relatedExitKeys: ['second-passport', 'retirement-planning']
  },
  {
    id: 'ignoring-local-credentials',
    translationKey: 'ignoringLocalCredentials',
    icon: Brain,
    pyramidTypes: [
      { type: 'COMPETENCE_TRUST', labelKey: 'pyramids.competenceTrust.label', color: 'pyramid-competence' }
    ],
    relatedExitKeys: ['skilled-migration', 'credential-recognition']
  },
  {
    id: 'single-income-source',
    translationKey: 'singleIncomeSource',
    icon: Coins,
    pyramidTypes: [
      { type: 'STABILITY_REDIS', labelKey: 'pyramids.stabilityRedis.label', color: 'pyramid-stability' },
      { type: 'GROWTH_RISK', labelKey: 'pyramids.growthRisk.label', color: 'pyramid-growth' }
    ],
    relatedExitKeys: ['remote-work', 'side-business', 'investment']
  }
];

export default function ErrorsAndIllusions() {
  const { t } = useTranslation();
  const { trackUniversalErrorsClicked } = useAnalytics();

  const handleErrorClick = (errorId: string) => {
    trackUniversalErrorsClicked();
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
      slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
      green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
      gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToHome', 'Retour')}
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {t('errorsIllusions.title', 'Erreurs & Illusions')}
              </h1>
              <p className="text-muted-foreground">
                {t('errorsIllusions.subtitle', 'Ce que les systèmes ne pardonnent pas — et comment les éviter')}
              </p>
            </div>
          </div>
        </div>

        <SimulationDisclaimer />

        {/* Central Message */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-lg font-medium mb-2">
                  {t('errorsIllusions.centralMessage', 'Ces erreurs ne sont pas des fautes morales.')}
                </p>
                <p className="text-muted-foreground">
                  {t('errorsIllusions.centralMessageDesc', 'Ce sont des décalages entre les attentes d\'un individu et les règles réelles d\'un système. Les reconnaître permet de les anticiper — pas de les juger.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="cognitive" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="cognitive" className="gap-2">
              <Brain className="w-4 h-4" />
              {t('errorsIllusions.tabs.cognitive', 'Erreurs cognitives')}
            </TabsTrigger>
            <TabsTrigger value="systemic" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('errorsIllusions.tabs.systemic', 'Erreurs systémiques')}
            </TabsTrigger>
          </TabsList>

          {/* Cognitive Errors Tab */}
          <TabsContent value="cognitive" className="space-y-6">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {t('errorsIllusions.cognitiveIntro', 'Les 10 erreurs de décision les plus coûteuses. Des patterns récurrents qui coûtent du temps, de l\'argent et de l\'énergie.')}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {UNIVERSAL_ERRORS.map((error, index) => {
                const Icon = error.icon;
                const colors = getColorClasses(error.color);
                
                return (
                  <Card 
                    key={error.id}
                    className={`${colors.border} ${colors.bg} hover:border-primary/50 transition-all group`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2 text-xs">
                              #{index + 1}
                            </Badge>
                            <CardTitle className="text-lg">
                              {t(`universalErrors.errors.${error.translationKey}.name`)}
                            </CardTitle>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {t(`universalErrors.errors.${error.translationKey}.shortDescription`)}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {error.relatedPyramids.slice(0, 2).map(pyramid => (
                          <Badge key={pyramid} variant="secondary" className="text-xs">
                            {t(`pyramidTypes.${pyramid}`, pyramid)}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button asChild variant="outline" size="sm" className="flex-1" onClick={() => handleErrorClick(error.id)}>
                          <Link to={`/universal-errors/${error.id}`}>
                            {t('universalErrors.learnMore', 'En savoir plus')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="flex-1 gap-2">
                          <Link 
                            to={`/prevention-filter?type=${error.defaultDecisionType}&horizon=${error.defaultHorizon}`}
                          >
                            <Filter className="w-4 h-4" />
                            {t('universalErrors.simulate', 'Simuler')}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Systemic Errors Tab */}
          <TabsContent value="systemic" className="space-y-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {t('errorsIllusions.systemicIntro', 'Ces erreurs sont spécifiques aux types de pyramides. Elles se produisent quand on applique les règles d\'un système dans un système qui fonctionne autrement.')}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {MISTAKE_CONFIGS.map((config, index) => {
                const Icon = config.icon;
                const baseKey = `systemicMistakes.mistakes.${config.translationKey}`;
                
                return (
                  <Card 
                    key={config.id}
                    id={config.id}
                    className="hover:border-primary/30 transition-all"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-destructive/10 flex-shrink-0">
                          <Icon className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">
                            {t(`${baseKey}.title`)}
                          </CardTitle>
                          <p className="text-muted-foreground">
                            {t(`${baseKey}.description`)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Typical Context */}
                      <div className="bg-muted/30 rounded-xl p-4">
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          {t('systemicMistakes.typicalContext', 'Contexte typique')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(`${baseKey}.context`)}
                        </p>
                      </div>

                      {/* Pyramids Concerned */}
                      <div>
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-amber-500/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-3">
              {t('errorsIllusions.ctaTitle', 'Vous reconnaissez une de ces erreurs ?')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {t('errorsIllusions.ctaDescription', 'Passez votre décision au filtre de prévention pour identifier les risques avant qu\'il ne soit trop tard.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/prevention-filter" className="gap-2">
                  <Filter className="w-5 h-5" />
                  {t('preventionFilter.cta', 'Passer une décision au filtre')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/orientation-hub" className="gap-2">
                  {t('errorsIllusions.goToHub', 'Trouver le bon outil')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
