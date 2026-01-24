import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Key, AlertTriangle, Clock, Target, Zap, FileText, ExternalLink, 
  CheckCircle2, MapPin, Briefcase, Shield, Users, Brain, TrendingUp, 
  Lightbulb, Scale, Globe, Heart, Wallet, Home, UserCheck,
  Calendar, DollarSign, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';
import { EXIT_KEYS } from '@/lib/exit-keys-engine';
import { getProfession } from '@/lib/profession-data';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';
import { findStrategy, CountryProfessionStrategy } from '@/lib/country-profession-strategies';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StrategyCostSimulator } from './StrategyCostSimulator';
import { StrategyChecklist } from './StrategyChecklist';

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

// Types for country data
interface CountryIntelligence {
  social_norms: string | null;
  authority_relation: string | null;
  risk_attitude: string | null;
  conflict_approach: string | null;
  mobility_speed: string | null;
  mobility_speed_reason: string | null;
  mental_cost: string | null;
  mental_cost_reason: string | null;
  strategies_rewarded: any[];
  strategies_punished: any[];
  newcomer_mistakes: any[];
  mobility_elevators: any[];
  trust_signals: any[];
  distrust_signals: any[];
  unspoken_rules: any[];
  negotiation_styles: any[];
  exit_difficulty: any[];
  career_ceiling_by_profile: any[];
  hidden_hierarchies: any[];
  taboo_topics: any[];
  time_perception: any[];
}

interface CountryVariants {
  labor_market: string[];
  entrepreneurship: string[];
  daily_life: string[];
  institutions: string[];
  networks: string[];
  profiles_succeed: string[];
  profiles_struggle: string[];
  surprises: string[];
  typical_day: any[];
  year_one_reality: any[];
  common_mistakes_timeline: any[];
  hidden_admin_steps: any[];
  cultural_shocks: any[];
  real_costs_breakdown: any[];
  success_timeline_months: any[];
  expat_communities: any[];
}

function getFlagEmoji(iso2: string) {
  return iso2.toUpperCase().split('').map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  accessible: { label: 'Accessible', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  medium: { label: 'Modéré', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  high: { label: 'Exigeant', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  expert: { label: 'Expert', color: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  exigeant: { label: 'Exigeant', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
};

// Helper to safely parse arrays
function safeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
}

export function PersonalizedExitKeys({
  destinationCountryId,
  currentCountryId,
  intention,
  age,
  professionId,
  hasCapital,
  hasCredentials,
  hasNetwork,
}: PersonalizedExitKeysProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { getPyramidLabel } = usePyramidTranslations();
  
  // Country data
  const destination = countries.find(c => c.id === destinationCountryId);
  const currentCountry = countries.find(c => c.id === currentCountryId);
  const profession = professionId ? getProfession(professionId) : null;
  
  // Fetch extended country data from Supabase
  const [intelligence, setIntelligence] = useState<CountryIntelligence | null>(null);
  const [variants, setVariants] = useState<CountryVariants | null>(null);
  const [loadingExtended, setLoadingExtended] = useState(true);
  
  const { governance } = useCountryGovernance(
    destinationCountryId, 
    destination?.pyramidType
  );

  useEffect(() => {
    async function fetchExtendedData() {
      if (!destinationCountryId) return;
      setLoadingExtended(true);
      
      const [intelligenceRes, variantsRes] = await Promise.all([
        supabase
          .from('country_intelligence')
          .select('*')
          .eq('country_id', destinationCountryId)
          .maybeSingle(),
        supabase
          .from('country_variants')
          .select('*')
          .eq('country_id', destinationCountryId)
          .maybeSingle()
      ]);
      
      if (intelligenceRes.data) {
        setIntelligence(intelligenceRes.data as unknown as CountryIntelligence);
      }
      if (variantsRes.data) {
        const data = variantsRes.data;
        setVariants({
          labor_market: safeArray(data.labor_market),
          entrepreneurship: safeArray(data.entrepreneurship),
          daily_life: safeArray(data.daily_life),
          institutions: safeArray(data.institutions),
          networks: safeArray(data.networks),
          profiles_succeed: safeArray(data.profiles_succeed),
          profiles_struggle: safeArray(data.profiles_struggle),
          surprises: safeArray(data.surprises),
          typical_day: safeArray(data.typical_day),
          year_one_reality: safeArray(data.year_one_reality),
          common_mistakes_timeline: safeArray(data.common_mistakes_timeline),
          hidden_admin_steps: safeArray(data.hidden_admin_steps),
          cultural_shocks: safeArray(data.cultural_shocks),
          real_costs_breakdown: safeArray(data.real_costs_breakdown),
          success_timeline_months: safeArray(data.success_timeline_months),
          expat_communities: safeArray(data.expat_communities),
        });
      }
      
      setLoadingExtended(false);
    }
    
    fetchExtendedData();
  }, [destinationCountryId]);

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

  // Filter content based on intention
  const filteredContent = useMemo(() => {
    const content: {
      keyInsights: { icon: React.ReactNode; title: string; value: string }[];
      warnings: string[];
      opportunities: string[];
      practicalTips: string[];
    } = {
      keyInsights: [],
      warnings: [],
      opportunities: [],
      practicalTips: [],
    };
    
    if (!destination) return content;
    
    // Base insights from country data
    if (destination.costOfLiving) {
      content.keyInsights.push({
        icon: <Wallet className="w-4 h-4" />,
        title: t('exitKeys.insights.costOfLiving', 'Coût de vie'),
        value: `~${destination.costOfLiving.monthlyBudgetSingle}€/mois`,
      });
    }
    if (destination.healthcare) {
      content.keyInsights.push({
        icon: <Heart className="w-4 h-4" />,
        title: t('exitKeys.insights.healthcare', 'Santé'),
        value: `${destination.healthcare.qualityScore}/100`,
      });
    }
    
    // Intention-specific content
    switch (intention) {
      case 'installation':
        if (intelligence?.mobility_speed) {
          content.keyInsights.push({
            icon: <TrendingUp className="w-4 h-4" />,
            title: t('exitKeys.insights.mobilitySpeed', 'Mobilité sociale'),
            value: intelligence.mobility_speed,
          });
        }
        if (variants?.labor_market?.length) {
          content.opportunities.push(...variants.labor_market.slice(0, 3));
        }
        if (variants?.profiles_struggle?.length) {
          content.warnings.push(...variants.profiles_struggle.slice(0, 3));
        }
        if (intelligence?.newcomer_mistakes?.length) {
          content.practicalTips.push(
            ...safeArray<any>(intelligence.newcomer_mistakes).slice(0, 3).map((m: any) => 
              typeof m === 'string' ? m : m.mistake || m.description || JSON.stringify(m)
            )
          );
        }
        break;
        
      case 'retirement':
        if (destination.healthcare) {
          content.keyInsights.push({
            icon: <Shield className="w-4 h-4" />,
            title: t('exitKeys.insights.healthcareAccess', 'Accès soins'),
            value: destination.healthcare.systemType === 'universal' ? 'Système universel' : 
                   destination.healthcare.systemType === 'mixed' ? 'Système mixte' : 'Privé dominant',
          });
        }
        if (variants?.daily_life?.length) {
          content.opportunities.push(...variants.daily_life.slice(0, 3));
        }
        break;
        
      case 'digital_nomad':
        if (destination.visa) {
          content.keyInsights.push({
            icon: <Globe className="w-4 h-4" />,
            title: t('exitKeys.insights.nomadVisa', 'Visa Nomade'),
            value: destination.visa.digitalNomadVisa ? 'Disponible' : 'Non spécifique',
          });
        }
        if (variants?.networks?.length) {
          content.opportunities.push(...variants.networks.slice(0, 3));
        }
        if (variants?.expat_communities?.length) {
          content.practicalTips.push(
            ...safeArray<any>(variants.expat_communities).slice(0, 2).map((c: any) =>
              typeof c === 'string' ? c : `${c.name} (${c.location})` || JSON.stringify(c)
            )
          );
        }
        break;
        
      case 'internship':
        if (variants?.institutions?.length) {
          content.opportunities.push(...variants.institutions.slice(0, 3));
        }
        if (intelligence?.authority_relation) {
          content.keyInsights.push({
            icon: <Users className="w-4 h-4" />,
            title: t('exitKeys.insights.hierarchyStyle', 'Relation hiérarchique'),
            value: intelligence.authority_relation,
          });
        }
        break;
        
      case 'vacation':
        if (variants?.surprises?.length) {
          content.practicalTips.push(...variants.surprises.slice(0, 3));
        }
        break;
    }
    
    // Add governance insights
    if (governance) {
      if (governance.stability_score) {
        content.keyInsights.push({
          icon: <Scale className="w-4 h-4" />,
          title: t('exitKeys.insights.stability', 'Stabilité'),
          value: `${governance.stability_score}/5`,
        });
      }
    }
    
    return content;
  }, [destination, intelligence, variants, governance, intention, t]);

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
      {/* Destination header */}
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
          <Link to={`/country/${destinationCountryId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              {t('exitKeys.personalized.seeFullProfile', 'Voir fiche complète')}
            </Button>
          </Link>
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

      {/* Key Insights Grid - from country data */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          {t('exitKeys.personalized.keyInsights', 'Indicateurs clés pour votre projet')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredContent.keyInsights.map((insight, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary">
                {insight.icon}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{insight.title}</p>
              <p className="font-bold">{insight.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="roadmap" className="gap-1 text-xs md:text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">{t('exitKeys.tabs.roadmap', 'Parcours')}</span>
          </TabsTrigger>
          <TabsTrigger value="culture" className="gap-1 text-xs md:text-sm">
            <Brain className="w-4 h-4" />
            <span className="hidden md:inline">{t('exitKeys.tabs.culture', 'Mentalité')}</span>
          </TabsTrigger>
          <TabsTrigger value="practical" className="gap-1 text-xs md:text-sm">
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">{t('exitKeys.tabs.practical', 'Pratique')}</span>
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-1 text-xs md:text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden md:inline">{t('exitKeys.tabs.risks', 'Risques')}</span>
          </TabsTrigger>
        </TabsList>

        {/* ROADMAP TAB */}
        <TabsContent value="roadmap" className="space-y-6">
          {detailedStrategy ? (
            <>
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

              {/* Detailed phases */}
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

                      {(step.documents || step.authority || step.costs || step.criticalRule) && (
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

              {/* Plan B */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {t('exitKeys.personalized.planB', 'Plan B')}
                </h4>
                <p className="text-sm text-muted-foreground">{detailedStrategy.planB}</p>
              </div>
            </>
          ) : (
            /* Fallback steps */
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('exitKeys.personalized.yourSteps', 'Vos étapes')}</h3>
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

          {/* Hidden Admin Steps from variants */}
          {variants?.hidden_admin_steps && variants.hidden_admin_steps.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                {t('exitKeys.personalized.hiddenSteps', 'Étapes administratives cachées')}
              </h3>
              <div className="space-y-3">
                {variants.hidden_admin_steps.slice(0, 5).map((step: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="font-medium text-sm">{typeof step === 'string' ? step : step.step}</p>
                    {step.time_estimate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {step.time_estimate}
                      </p>
                    )}
                    {step.insider_tip && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        💡 {step.insider_tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* CULTURE TAB */}
        <TabsContent value="culture" className="space-y-6">
          {intelligence ? (
            <>
              {/* Social norms */}
              {intelligence.social_norms && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {t('exitKeys.culture.socialNorms', 'Normes sociales')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{intelligence.social_norms}</p>
                </div>
              )}

              {/* Trust & Distrust signals */}
              <div className="grid md:grid-cols-2 gap-4">
                {intelligence.trust_signals && safeArray(intelligence.trust_signals).length > 0 && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      {t('exitKeys.culture.trustSignals', 'Signaux de confiance')}
                    </h4>
                    <ul className="space-y-2">
                      {safeArray<string>(intelligence.trust_signals).slice(0, 4).map((signal, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {intelligence.distrust_signals && safeArray(intelligence.distrust_signals).length > 0 && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <h4 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {t('exitKeys.culture.distrustSignals', 'Signaux de méfiance')}
                    </h4>
                    <ul className="space-y-2">
                      {safeArray<string>(intelligence.distrust_signals).slice(0, 4).map((signal, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">✗</span>
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Newcomer Mistakes */}
              {intelligence.newcomer_mistakes && safeArray(intelligence.newcomer_mistakes).length > 0 && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    {t('exitKeys.culture.newcomerMistakes', 'Erreurs de débutant à éviter')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {safeArray<any>(intelligence.newcomer_mistakes).slice(0, 6).map((mistake, i) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <p className="text-sm">{typeof mistake === 'string' ? mistake : mistake.mistake || mistake.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Shocks from variants */}
              {variants?.cultural_shocks && variants.cultural_shocks.length > 0 && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    {t('exitKeys.culture.culturalShocks', 'Chocs culturels à anticiper')}
                  </h3>
                  <div className="space-y-3">
                    {variants.cultural_shocks.slice(0, 4).map((shock: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <p className="font-medium text-sm">{typeof shock === 'string' ? shock : shock.shock}</p>
                        {shock.explanation && (
                          <p className="text-xs text-muted-foreground mt-1">{shock.explanation}</p>
                        )}
                        {shock.adaptation_time && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            ⏱️ Adaptation: {shock.adaptation_time}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {loadingExtended ? t('common.loading', 'Chargement...') : t('exitKeys.culture.noData', 'Données culturelles non disponibles')}
            </div>
          )}
        </TabsContent>

        {/* PRACTICAL TAB */}
        <TabsContent value="practical" className="space-y-6">
          {/* Cost Simulator and Checklist - NEW COMPONENTS */}
          <div className="grid md:grid-cols-2 gap-6">
            <StrategyCostSimulator
              countryId={destinationCountryId}
              countryName={destination.name}
              professionId={professionId}
              intention={intention}
            />
            <StrategyChecklist
              countryId={destinationCountryId}
              countryName={destination.name}
              intention={intention}
            />
          </div>
          {/* Real Costs Breakdown */}
          {variants?.real_costs_breakdown && variants.real_costs_breakdown.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                {t('exitKeys.practical.realCosts', 'Coûts réels vs officiels')}
              </h3>
              <div className="space-y-3">
                {variants.real_costs_breakdown.slice(0, 6).map((cost: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium text-sm">{cost.category}</span>
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="line-through text-muted-foreground mr-2">{cost.official_cost}</span>
                        <span className="font-bold text-primary">{cost.real_cost}</span>
                      </p>
                      {cost.notes && <p className="text-xs text-muted-foreground">{cost.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Year One Reality */}
          {variants?.year_one_reality && variants.year_one_reality.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t('exitKeys.practical.yearOneReality', 'La réalité de la première année')}
              </h3>
              <div className="space-y-3">
                {variants.year_one_reality.map((month: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{month.month}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        month.difficulty === 'hard' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                        month.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                        'bg-green-500/20 text-green-600 dark:text-green-400'
                      )}>
                        {month.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{month.milestone}</p>
                    {month.tip && (
                      <p className="text-xs text-primary mt-1">💡 {month.tip}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expat Communities */}
          {variants?.expat_communities && variants.expat_communities.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('exitKeys.practical.expatCommunities', 'Communautés d\'expatriés')}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {variants.expat_communities.slice(0, 4).map((community: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <p className="font-medium text-sm">{community.name}</p>
                    <p className="text-xs text-muted-foreground">{community.location} • {community.size}</p>
                    {community.focus && <p className="text-xs text-primary mt-1">{community.focus}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Resources */}
          {detailedStrategy?.keyResources && detailedStrategy.keyResources.length > 0 && (
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
        </TabsContent>

        {/* RISKS TAB */}
        <TabsContent value="risks" className="space-y-6">
          {/* Warnings from strategy */}
          {detailedStrategy?.warnings && detailedStrategy.warnings.length > 0 && (
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

          {/* Profiles that struggle */}
          {variants?.profiles_struggle && variants.profiles_struggle.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t('exitKeys.risks.profilesStruggle', 'Profils qui galèrent')}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {variants.profiles_struggle.slice(0, 4).map((profile, i) => (
                  <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-sm">{profile}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes Timeline */}
          {variants?.common_mistakes_timeline && variants.common_mistakes_timeline.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                {t('exitKeys.risks.commonMistakes', 'Erreurs courantes par phase')}
              </h3>
              <div className="space-y-3">
                {variants.common_mistakes_timeline.slice(0, 5).map((item: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        {item.phase}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{item.mistake}</p>
                    {item.consequence && (
                      <p className="text-xs text-red-500 mt-1">⚠️ {item.consequence}</p>
                    )}
                    {item.prevention && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {item.prevention}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Governance risks */}
          {governance?.friction_risks?.redFlags && governance.friction_risks.redFlags.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-500" />
                {t('exitKeys.risks.governanceRisks', 'Risques de gouvernance')}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {governance.friction_risks.redFlags.map((flag: any, i: number) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border",
                    flag.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    flag.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-muted/30 border-border'
                  )}>
                    <p className="text-sm">{flag.label}</p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
                      flag.severity === 'high' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                      flag.severity === 'medium' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {flag.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accelerators */}
          {detailedStrategy?.accelerators && detailedStrategy.accelerators.length > 0 && (
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
        </TabsContent>
      </Tabs>

      {/* Relevant Exit Keys from engine */}
      {intention !== 'vacation' && relevantExitKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('exitKeys.personalized.relevantStrategies', 'Stratégies avancées compatibles')}
          </h3>
          <Accordion type="single" collapsible className="space-y-2">
            {relevantExitKeys.map((key) => (
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
                          {t('exitKeys.strategy.successCondition', 'Condition de réussite')}
                        </p>
                        <p className="text-sm">{key.successCondition}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {t('exitKeys.strategy.duration', 'Durée totale')}
                        </p>
                        <p className="text-sm font-medium">{key.timeframe}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive mb-1">⚠️ {t('exitKeys.strategy.mainRisk', 'Risque principal')}</p>
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
    </div>
  );
}
