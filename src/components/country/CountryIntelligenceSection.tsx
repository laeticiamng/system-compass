import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CountryTagsRadar } from './CountryTagsRadar';
import { useTranslatedIntelligence } from '@/hooks/useTranslatedIntelligence';
import { 
  translateIntelligenceValue, 
  getMobilitySpeedColor, 
  getMentalCostColor, 
  getCycleStatusColor 
} from '@/lib/intelligence-translations';
import { 
  Crown, 
  Network, 
  Scale, 
  TrendingUp, 
  Brain, 
  Globe, 
  History,
  Users,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2
} from 'lucide-react';

interface CountryIntelligence {
  country_id: string;
  is_complete: boolean;
  power_formal: string[];
  power_informal: string[];
  power_keys_ranking: { diplomas: number; networks: number; capital: number; visibility: number; conformity: number };
  social_norms: string;
  authority_relation: string;
  risk_attitude: string;
  conflict_approach: string;
  strategies_rewarded: string[];
  strategies_punished: string[];
  newcomer_mistakes: string[];
  mobility_elevators: string[];
  mobility_speed: string;
  mobility_speed_reason: string;
  mental_cost: string;
  mental_cost_reason: string;
  system_produces: string[];
  adaptive_behaviors: string[];
  backfiring_behaviors: string[];
  dependencies: string[];
  cycle_status: string;
  macro_risks: string[];
  historical_traces: string[];
  legacy_implications: { trust: string; institutions: string; merit: string; risk: string };
}

interface CountryTags {
  network_weight: number;
  diploma_weight: number;
  risk_tolerance: number;
  admin_speed: number;
  authority_verticality: number;
  mental_friction: number;
  social_mobility: number;
  predictability: number;
  reputation_requirement: number;
  compliance_sensitivity: number;
}

interface Props {
  countryId: string;
  countryName: string;
}

export function CountryIntelligenceSection({ countryId, countryName }: Props) {
  const { t, i18n } = useTranslation();
  const { canAccessPro } = useSubscription();
  const [originalIntelligence, setOriginalIntelligence] = useState<CountryIntelligence | null>(null);
  const [tags, setTags] = useState<CountryTags | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the translation hook
  const { translatedData: intelligence, isTranslating } = useTranslatedIntelligence(
    countryId,
    originalIntelligence as any
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const [intelligenceRes, tagsRes] = await Promise.all([
        supabase
          .from('country_intelligence')
          .select('*')
          .eq('country_id', countryId)
          .single(),
        supabase
          .from('country_tags')
          .select('*')
          .eq('country_id', countryId)
          .single()
      ]);

      if (intelligenceRes.data) {
        setOriginalIntelligence(intelligenceRes.data as unknown as CountryIntelligence);
      }
      if (tagsRes.data) {
        setTags(tagsRes.data as unknown as CountryTags);
      }
      
      setLoading(false);
    }

    fetchData();
  }, [countryId]);

  if (!canAccessPro) {
    return (
      <PremiumPaywall
        title={t('intelligence.paywallTitle', 'Intelligence Système')}
        description={t('intelligence.paywallDesc', 'Accédez aux dynamiques de pouvoir, stratégies sociales et héritages historiques de ce pays.')}
        tier="pro"
      />
    );
  }

  if (loading || isTranslating) {
    return (
      <div className="space-y-4">
        {isTranslating && (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {t('intelligence.translating', 'Traduction en cours...')}
            </span>
          </div>
        )}
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!originalIntelligence || !originalIntelligence.is_complete || !intelligence) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('intelligence.comingSoon', 'Intelligence Système bientôt disponible')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('intelligence.comingSoonDesc', 'Nous travaillons sur l\'analyse approfondie de ce pays. Revenez bientôt.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Cast translated data to the expected type
  const displayData = intelligence as unknown as CountryIntelligence;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          {t('intelligence.disclaimer', 'Outil d\'analyse : pas de conseil. Simulation ≠ prédiction. Tendances générales, variations individuelles possibles.')}
        </p>
      </div>

      {/* Tags Radar Chart */}
      {tags && <CountryTagsRadar tags={tags} countryName={countryName} />}

      {/* Tags Overview */}
      {tags && <TagsOverview tags={tags} />}

      {/* Sub-tabs for sections */}
      <Tabs defaultValue="power" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="power" className="text-xs gap-1">
            <Crown className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.powerMap', 'Pouvoir')}</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.socialOS', 'Social')}</span>
          </TabsTrigger>
          <TabsTrigger value="strategies" className="text-xs gap-1">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.strategies', 'Stratégies')}</span>
          </TabsTrigger>
          <TabsTrigger value="mobility" className="text-xs gap-1">
            <TrendingUp className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.mobility', 'Mobilité')}</span>
          </TabsTrigger>
          <TabsTrigger value="psycho" className="text-xs gap-1">
            <Brain className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.psychoSocio', 'Psycho')}</span>
          </TabsTrigger>
          <TabsTrigger value="geo" className="text-xs gap-1">
            <Globe className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.geopolitics', 'Géo')}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1">
            <History className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.historical', 'Histoire')}</span>
          </TabsTrigger>
        </TabsList>

        {/* A. Power Map */}
        <TabsContent value="power" className="space-y-4 mt-4">
          <PowerMapSection intelligence={displayData} />
        </TabsContent>

        {/* B. Social Operating System */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <SocialSystemSection intelligence={displayData} />
        </TabsContent>

        {/* C. Strategies */}
        <TabsContent value="strategies" className="space-y-4 mt-4">
          <StrategiesSection intelligence={displayData} />
        </TabsContent>

        {/* D. Mobility */}
        <TabsContent value="mobility" className="space-y-4 mt-4">
          <MobilitySection intelligence={displayData} />
        </TabsContent>

        {/* E. Psycho/Socio */}
        <TabsContent value="psycho" className="space-y-4 mt-4">
          <PsychoSection intelligence={displayData} />
        </TabsContent>

        {/* F. Geopolitics */}
        <TabsContent value="geo" className="space-y-4 mt-4">
          <GeopoliticsSection intelligence={displayData} />
        </TabsContent>

        {/* G. Historical Legacy */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <HistorySection intelligence={displayData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Tags Overview Component
function TagsOverview({ tags }: { tags: CountryTags }) {
  const { t } = useTranslation();
  
  const tagLabels = [
    { key: 'network_weight', label: t('tags.networkWeight', 'Poids des réseaux'), value: tags.network_weight },
    { key: 'diploma_weight', label: t('tags.diplomaWeight', 'Poids des diplômes'), value: tags.diploma_weight },
    { key: 'risk_tolerance', label: t('tags.riskTolerance', 'Tolérance au risque'), value: tags.risk_tolerance },
    { key: 'admin_speed', label: t('tags.adminSpeed', 'Vitesse administrative'), value: tags.admin_speed },
    { key: 'authority_verticality', label: t('tags.authorityVerticality', 'Verticalité autorité'), value: tags.authority_verticality },
    { key: 'mental_friction', label: t('tags.mentalFriction', 'Coût mental'), value: tags.mental_friction },
    { key: 'social_mobility', label: t('tags.socialMobility', 'Mobilité sociale'), value: tags.social_mobility },
    { key: 'predictability', label: t('tags.predictability', 'Prévisibilité'), value: tags.predictability },
    { key: 'reputation_requirement', label: t('tags.reputationRequirement', 'Exigence réputation'), value: tags.reputation_requirement },
    { key: 'compliance_sensitivity', label: t('tags.complianceSensitivity', 'Sensibilité règles'), value: tags.compliance_sensitivity },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="w-4 h-4" />
          {t('intelligence.tagsTitle', 'Indicateurs système (1-5)')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tagLabels.map(tag => (
            <div key={tag.key} className="text-center">
              <div className="text-xs text-muted-foreground mb-1 line-clamp-1">{tag.label}</div>
              <div className="flex items-center justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-4 rounded-sm ${
                      i <= tag.value ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs font-medium mt-1">{tag.value}/5</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// A. Power Map
function PowerMapSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();
  const ranking = intelligence.power_keys_ranking;
  
  const keys = [
    { key: 'diplomas', label: t('power.diplomas', 'Diplômes'), value: ranking.diplomas },
    { key: 'networks', label: t('power.networks', 'Réseaux'), value: ranking.networks },
    { key: 'capital', label: t('power.capital', 'Capital'), value: ranking.capital },
    { key: 'visibility', label: t('power.visibility', 'Visibilité'), value: ranking.visibility },
    { key: 'conformity', label: t('power.conformity', 'Conformité'), value: ranking.conformity },
  ].sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              {t('power.formal', 'Pouvoir formel')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('power.formalDesc', 'Institutions, règles visibles')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.power_formal.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-500" />
              {t('power.informal', 'Pouvoir informel')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('power.informalDesc', 'Réseaux, réputation, gatekeepers')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.power_informal.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Network className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {t('power.keysRanking', 'Ce qui ouvre les portes (classement)')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keys.map((key, i) => (
              <div key={key.key} className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                <span className="flex-1 text-sm">{key.label}</span>
                <Progress value={key.value * 20} className="w-24 h-2" />
                <span className="text-sm font-medium w-8">{key.value}/5</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// B. Social Operating System
function SocialSystemSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  const aspects = [
    { 
      label: t('intelligence.socialOS.norms', 'Normes'), 
      value: intelligence.social_norms,
      desc: t('intelligence.socialOS.normsDesc', 'Conformité vs différenciation')
    },
    { 
      label: t('intelligence.socialOS.authority', 'Relation à l\'autorité'), 
      value: intelligence.authority_relation,
      desc: t('intelligence.socialOS.authorityDesc', 'Verticalité / négociation / contournement')
    },
    { 
      label: t('intelligence.socialOS.risk', 'Rapport au risque'), 
      value: intelligence.risk_attitude,
      desc: t('intelligence.socialOS.riskDesc', 'Toléré / puni / encadré')
    },
    { 
      label: t('intelligence.socialOS.conflict', 'Rapport au conflit'), 
      value: intelligence.conflict_approach,
      desc: t('intelligence.socialOS.conflictDesc', 'Frontal / indirect / juridique / relationnel')
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {aspects.map((aspect, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{aspect.label}</CardTitle>
            <CardDescription className="text-xs">{aspect.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aspect.value || t('common.notAvailable', 'Non disponible')}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// C. Strategies
function StrategiesSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            {t('intelligence.strategies.rewarded', 'Souvent récompensées')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {intelligence.strategies_rewarded.map((item, i) => (
              <li key={i} className="text-sm p-2 bg-green-500/10 rounded-lg">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-red-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            {t('intelligence.strategies.punished', 'Souvent punies')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {intelligence.strategies_punished.map((item, i) => (
              <li key={i} className="text-sm p-2 bg-red-500/10 rounded-lg">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t('intelligence.strategies.newcomerMistakes', 'Erreurs des nouveaux')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {intelligence.newcomer_mistakes.map((item, i) => (
              <li key={i} className="text-sm p-2 bg-amber-500/10 rounded-lg">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// D. Mobility
function MobilitySection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {t('mobility.elevators', 'Ascenseurs sociaux')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {intelligence.mobility_elevators.map((elevator, i) => (
              <Badge key={i} variant="outline">{elevator}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {t('mobility.speed', 'Vitesse de mobilité')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getMobilitySpeedColor(intelligence.mobility_speed)}>
              {translateIntelligenceValue('mobility_speed', intelligence.mobility_speed)}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">{intelligence.mobility_speed_reason}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {t('mobility.mentalCost', 'Coût mental')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getMentalCostColor(intelligence.mental_cost)}>
              {translateIntelligenceValue('mental_cost', intelligence.mental_cost)}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">{intelligence.mental_cost_reason}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// E. Psycho/Socio
function PsychoSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {t('psycho.produces', 'Ce que le système produit')}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('psycho.producesDesc', 'Comportements induits par les règles du système')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {intelligence.system_produces.map((item, i) => (
              <Badge key={i} variant="secondary">{item}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('psycho.adaptive', 'Comportements adaptatifs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.adaptive_behaviors.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Minus className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              {t('psycho.backfiring', 'Se retournent contre toi')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.backfiring_behaviors.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Minus className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// F. Geopolitics
function GeopoliticsSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {t('geo.dependencies', 'Dépendances structurelles')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {intelligence.dependencies.map((dep, i) => (
              <Badge key={i} variant="outline">{dep}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {t('geo.cycle', 'Cycle actuel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getCycleStatusColor(intelligence.cycle_status)}>
              {translateIntelligenceValue('cycle_status', intelligence.cycle_status)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {t('geo.macroRisks', 'Risques macro')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {intelligence.macro_risks.map((risk, i) => (
                <Badge key={i} variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/30">
                  {risk}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// G. Historical Legacy
function HistorySection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();
  const legacy = intelligence.legacy_implications;

  const implications = [
    { key: 'trust', label: t('history.trust', 'Confiance'), value: legacy.trust },
    { key: 'institutions', label: t('history.institutions', 'Institutions'), value: legacy.institutions },
    { key: 'merit', label: t('history.merit', 'Rapport au mérite'), value: legacy.merit },
    { key: 'risk', label: t('history.risk', 'Rapport au risque'), value: legacy.risk },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {t('history.traces', 'Traces historiques')}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('history.tracesDesc', 'Ce qui explique les règles actuelles')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {intelligence.historical_traces.map((trace, i) => (
              <li key={i} className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                <History className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {trace}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {t('history.implications', 'Ce que cela implique')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {implications.filter(imp => imp.value).map(imp => (
              <div key={imp.key} className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{imp.label}</div>
                <p className="text-sm">{imp.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
