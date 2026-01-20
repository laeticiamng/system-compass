import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, AlertTriangle, Clock, Target, Zap, FileText, Building, ExternalLink, CheckCircle2, MapPin, Briefcase, GraduationCap, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';
import { EXIT_KEYS, ExitKey } from '@/lib/exit-keys-engine';
import { getProfession } from '@/lib/profession-data';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';
import { findStrategy, CountryProfessionStrategy } from '@/lib/country-profession-strategies';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PersonalizedExitKeysProps {
  destinationCountryId: string;
  currentCountryId: string;
  intention: ProjectIntention;
  age: number;
  professionId?: string;
  hasCapital: boolean;
  hasCredentials: boolean;
  hasNetwork: boolean;
  educationLevel?: string;
}

function getFlagEmoji(iso2: string) {
  return iso2.toUpperCase().split('').map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

const difficultyConfig = {
  accessible: { label: 'Accessible', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  medium: { label: 'Modéré', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  high: { label: 'Exigeant', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  expert: { label: 'Expert', color: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  exigeant: { label: 'Exigeant', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
};

export function PersonalizedExitKeys({
  destinationCountryId,
  currentCountryId,
  intention,
  age,
  professionId,
  hasCapital,
  hasCredentials,
  hasNetwork,
  educationLevel,
}: PersonalizedExitKeysProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { getPyramidLabel } = usePyramidTranslations();

  const destination = countries.find(c => c.id === destinationCountryId);
  const currentCountry = countries.find(c => c.id === currentCountryId);
  const profession = professionId ? getProfession(professionId) : null;

  // Find the ultra-detailed strategy for this country + profession combination
  const detailedStrategy = useMemo<CountryProfessionStrategy | null>(() => {
    if (!destination || !profession) return null;
    return findStrategy(destination.id, profession.id, profession.category);
  }, [destination, profession]);

  // Find relevant exit keys from the engine
  const relevantExitKeys = useMemo(() => {
    if (!destination) return [];
    return EXIT_KEYS.filter(key => {
      const matchesPyramid = key.targetPyramids.includes(destination.pyramidType);
      const matchesProfession = !profession || profession.compatibleExitKeys.length === 0 || profession.compatibleExitKeys.includes(key.id);
      return matchesPyramid && matchesProfession && intention !== 'vacation';
    }).slice(0, 3);
  }, [destination, intention, profession]);

  // Generate fallback steps if no detailed strategy exists
  const fallbackSteps = useMemo(() => {
    if (!destination) return [];
    const countryName = destination.name;
    const steps = [];
    
    switch (intention) {
      case 'installation':
        steps.push({ phase: 1, name: 'Recherche', actions: [`Rechercher opportunités en ${countryName}`, 'Évaluer le marché de l\'emploi', 'Vérifier équivalences diplômes'] });
        steps.push({ phase: 2, name: 'Visa & Admin', actions: ['Préparer dossier visa', 'Rassembler documents', 'Soumettre demande'] });
        steps.push({ phase: 3, name: 'Installation', actions: ['Trouver logement', 'Ouvrir compte bancaire', 'S\'inscrire administration locale'] });
        break;
      case 'vacation':
        steps.push({ phase: 1, name: 'Préparation', actions: ['Vérifier conditions d\'entrée', 'Réserver hébergement', 'Souscrire assurance voyage'] });
        break;
      default:
        steps.push({ phase: 1, name: 'Recherche', actions: ['Analyser les opportunités', 'Préparer documents'] });
    }
    return steps;
  }, [destination, intention]);

  if (!destination) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('exitKeys.personalized.selectDestination', 'Sélectionnez une destination pour voir les clés personnalisées')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Destination header with detailed info */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/20">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl">{getFlagEmoji(destination.iso2)}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{destination.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {getPyramidLabel(destination.pyramidType)}
            </p>
            {detailedStrategy && (
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("text-xs px-2 py-1 rounded-full", difficultyConfig[detailedStrategy.difficultyLevel]?.color)}>
                  {difficultyConfig[detailedStrategy.difficultyLevel]?.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {detailedStrategy.estimatedTimeTotal}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {detailedStrategy?.estimatedTimeTotal || '6-12 mois'}
            </div>
            <p className="text-xs text-muted-foreground">{t('exitKeys.personalized.estimatedTimeline', 'Délai estimé')}</p>
          </div>
        </div>

        {/* Profile summary */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <span className="px-3 py-1 rounded-full bg-muted text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {currentCountry?.name || 'France'}
          </span>
          <span className="px-3 py-1 rounded-full bg-muted text-sm">
            {age} {t('common.years', 'ans')}
          </span>
          {profession && (
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {profession.name}
            </span>
          )}
          {hasCapital && <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-sm">💰 Capital</span>}
          {hasCredentials && <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">📜 Diplômes</span>}
          {hasNetwork && <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm">🤝 Réseau</span>}
        </div>
      </div>

      {/* DETAILED STRATEGY (if available) */}
      {detailedStrategy ? (
        <div className="space-y-6">
          {/* Success metric */}
          <div className="glass-card rounded-xl p-4 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('exitKeys.personalized.successMetric', 'Objectif de réussite')}</p>
                <p className="font-semibold text-green-600 dark:text-green-400">{detailedStrategy.successMetric}</p>
              </div>
            </div>
          </div>

          {/* Detailed phases with accordion */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('exitKeys.personalized.detailedRoadmap', 'Feuille de route détaillée')}
              <span className="text-xs text-muted-foreground ml-2">({detailedStrategy.steps.length} phases)</span>
            </h3>
            
            <div className="space-y-4">
              {detailedStrategy.steps.map((step, index) => (
                <div key={index} className="relative pl-8 pb-4 border-l-2 border-primary/30 last:border-l-0">
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.phase}
                  </div>
                  
                  <div className="glass-card rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{step.name}</h4>
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {step.duration}
                      </span>
                    </div>
                    
                    <ul className="space-y-2 mb-3">
                      {step.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>

                    {(step.documents || step.authority || step.costs || step.criticalRule || step.milestone) && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
                        {step.documents && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">📄 Documents:</span>
                            <p className="text-foreground">{step.documents.join(', ')}</p>
                          </div>
                        )}
                        {step.authority && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">🏛️ Autorité:</span>
                            <p className="text-foreground">{step.authority}</p>
                          </div>
                        )}
                        {step.costs && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">💰 Coûts:</span>
                            <p className="text-foreground">{step.costs}</p>
                          </div>
                        )}
                        {step.milestone && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">🎯 Jalon:</span>
                            <p className="text-green-600 dark:text-green-400 font-medium">{step.milestone}</p>
                          </div>
                        )}
                        {step.criticalRule && (
                          <div className="col-span-2 mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              ⚠️ <strong>Règle critique:</strong> {step.criticalRule}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Accelerators */}
          <div className="grid md:grid-cols-2 gap-4">
            {detailedStrategy.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t('exitKeys.personalized.warnings', 'Points d\'attention')}
                </h4>
                <ul className="space-y-2">
                  {detailedStrategy.warnings.map((warning, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailedStrategy.accelerators.length > 0 && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t('exitKeys.personalized.accelerators', 'Vos atouts')}
                </h4>
                <ul className="space-y-2">
                  {detailedStrategy.accelerators.map((acc, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Plan B */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {t('exitKeys.personalized.planB', 'Plan B')}
            </h4>
            <p className="text-sm text-muted-foreground">{detailedStrategy.planB}</p>
          </div>

          {/* Key Resources */}
          {detailedStrategy.keyResources.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                {t('exitKeys.personalized.keyResources', 'Ressources clés')}
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {detailedStrategy.keyResources.map((resource, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border",
                    resource.type === 'official' ? 'border-blue-500/30 bg-blue-500/5' :
                    resource.type === 'community' ? 'border-purple-500/30 bg-purple-500/5' :
                    'border-border bg-muted/30'
                  )}>
                    <p className="text-sm font-medium">{resource.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FALLBACK: Generic steps when no detailed strategy */
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('exitKeys.personalized.yourSteps', 'Vos étapes personnalisées')}
          </h3>
          <ol className="space-y-3">
            {fallbackSteps.flatMap(step => step.actions).map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Relevant Exit Keys from engine */}
      {intention !== 'vacation' && relevantExitKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('exitKeys.personalized.relevantStrategies', 'Stratégies avancées compatibles')}
          </h3>
          <Accordion type="single" collapsible className="space-y-2">
            {relevantExitKeys.map((key, index) => (
              <AccordionItem key={key.id} value={key.id} className="glass-card rounded-xl border-0">
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-3xl">{key.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{key.name}</h4>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", difficultyConfig[key.difficulty]?.color)}>
                          {difficultyConfig[key.difficulty]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{key.unlocks}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  <div className="space-y-4 pt-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          <Target className="w-3 h-3 inline mr-1" />
                          Condition de réussite
                        </p>
                        <p className="text-sm">{key.successCondition}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Durée totale
                        </p>
                        <p className="text-sm font-medium">{key.timeframe}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive mb-1">⚠️ Risque principal</p>
                      <p className="text-sm">{key.mainRisk}</p>
                    </div>
                    <blockquote className="border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                      "{key.rawTruth}"
                    </blockquote>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Country-specific info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          {t('exitKeys.personalized.countryInfo', 'Informations clés sur')} {destination.name}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {destination.costOfLiving && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">💰 Coût de vie mensuel</p>
              <p className="font-bold text-lg">~{destination.costOfLiving.monthlyBudgetSingle}€</p>
            </div>
          )}
          {destination.healthcare && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">🏥 Système de santé</p>
              <p className="font-bold text-lg">{destination.healthcare.qualityScore}/100</p>
            </div>
          )}
          {destination.visa && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">🛂 Visa travail</p>
              <p className="font-bold text-lg capitalize">{destination.visa.workVisa}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
