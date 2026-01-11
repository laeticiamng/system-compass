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
  Loader2,
  Eye,
  EyeOff,
  MessageCircle,
  Clock,
  Lock,
  Unlock,
  Target,
  Layers,
  Ban
} from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

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
  // New enriched fields
  unspoken_rules?: { rule: string; consequence: string; how_to_know: string }[];
  negotiation_styles?: { context: string; style: string; taboo: string }[];
  trust_signals?: string[];
  distrust_signals?: string[];
  exit_difficulty?: { scenario: string; difficulty: string; timeline: string; hidden_costs: string }[];
  career_ceiling_by_profile?: { profile: string; ceiling: string; workaround: string }[];
  hidden_hierarchies?: { hierarchy: string; how_it_works: string; access_method: string }[];
  taboo_topics?: string[];
  decision_making_patterns?: { context: string; who_decides: string; how_long: string; influence_method: string }[];
  time_perception?: { aspect: string; local_norm: string; foreigner_trap: string }[];
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

// Parse functions for new fields
function parseUnspokenRules(data: Json | null): CountryIntelligence['unspoken_rules'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        rule: String(obj.rule || ''),
        consequence: String(obj.consequence || ''),
        how_to_know: String(obj.how_to_know || ''),
      };
    }
    return { rule: '', consequence: '', how_to_know: '' };
  }).filter(r => r.rule);
}

function parseNegotiationStyles(data: Json | null): CountryIntelligence['negotiation_styles'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        context: String(obj.context || ''),
        style: String(obj.style || ''),
        taboo: String(obj.taboo || ''),
      };
    }
    return { context: '', style: '', taboo: '' };
  }).filter(n => n.context);
}

function parseExitDifficulty(data: Json | null): CountryIntelligence['exit_difficulty'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        scenario: String(obj.scenario || ''),
        difficulty: String(obj.difficulty || ''),
        timeline: String(obj.timeline || ''),
        hidden_costs: String(obj.hidden_costs || ''),
      };
    }
    return { scenario: '', difficulty: '', timeline: '', hidden_costs: '' };
  }).filter(e => e.scenario);
}

function parseCareerCeiling(data: Json | null): CountryIntelligence['career_ceiling_by_profile'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        profile: String(obj.profile || ''),
        ceiling: String(obj.ceiling || ''),
        workaround: String(obj.workaround || ''),
      };
    }
    return { profile: '', ceiling: '', workaround: '' };
  }).filter(c => c.profile);
}

function parseHiddenHierarchies(data: Json | null): CountryIntelligence['hidden_hierarchies'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        hierarchy: String(obj.hierarchy || ''),
        how_it_works: String(obj.how_it_works || ''),
        access_method: String(obj.access_method || ''),
      };
    }
    return { hierarchy: '', how_it_works: '', access_method: '' };
  }).filter(h => h.hierarchy);
}

function parseDecisionMaking(data: Json | null): CountryIntelligence['decision_making_patterns'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        context: String(obj.context || ''),
        who_decides: String(obj.who_decides || ''),
        how_long: String(obj.how_long || ''),
        influence_method: String(obj.influence_method || ''),
      };
    }
    return { context: '', who_decides: '', how_long: '', influence_method: '' };
  }).filter(d => d.context);
}

function parseTimePerception(data: Json | null): CountryIntelligence['time_perception'] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        aspect: String(obj.aspect || ''),
        local_norm: String(obj.local_norm || ''),
        foreigner_trap: String(obj.foreigner_trap || ''),
      };
    }
    return { aspect: '', local_norm: '', foreigner_trap: '' };
  }).filter(t => t.aspect);
}

function parseStringArray(data: Json | null): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map(String);
  return [];
}

export function CountryIntelligenceSection({ countryId, countryName }: Props) {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const [originalIntelligence, setOriginalIntelligence] = useState<CountryIntelligence | null>(null);
  const [tags, setTags] = useState<CountryTags | null>(null);
  const [loading, setLoading] = useState(true);

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
        const data = intelligenceRes.data;
        setOriginalIntelligence({
          ...data as unknown as CountryIntelligence,
          // Parse new fields
          unspoken_rules: parseUnspokenRules(data.unspoken_rules),
          negotiation_styles: parseNegotiationStyles(data.negotiation_styles),
          trust_signals: parseStringArray(data.trust_signals),
          distrust_signals: parseStringArray(data.distrust_signals),
          exit_difficulty: parseExitDifficulty(data.exit_difficulty),
          career_ceiling_by_profile: parseCareerCeiling(data.career_ceiling_by_profile),
          hidden_hierarchies: parseHiddenHierarchies(data.hidden_hierarchies),
          taboo_topics: parseStringArray(data.taboo_topics),
          decision_making_patterns: parseDecisionMaking(data.decision_making_patterns),
          time_perception: parseTimePerception(data.time_perception),
        });
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

      {/* Main Tabs */}
      <Tabs defaultValue="power" className="w-full">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="power" className="text-xs gap-1">
            <Crown className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.power', 'Pouvoir')}</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.social', 'Social')}</span>
          </TabsTrigger>
          <TabsTrigger value="unspoken" className="text-xs gap-1">
            <EyeOff className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.unspoken', 'Non-dits')}</span>
          </TabsTrigger>
          <TabsTrigger value="negotiation" className="text-xs gap-1">
            <MessageCircle className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.negotiation', 'Négo')}</span>
          </TabsTrigger>
          <TabsTrigger value="trust" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.trust', 'Confiance')}</span>
          </TabsTrigger>
          <TabsTrigger value="careers" className="text-xs gap-1">
            <Target className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.careers', 'Plafonds')}</span>
          </TabsTrigger>
          <TabsTrigger value="exit" className="text-xs gap-1">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.exit', 'Sortie')}</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs gap-1">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.time', 'Temps')}</span>
          </TabsTrigger>
          <TabsTrigger value="geo" className="text-xs gap-1">
            <Globe className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.geo', 'Géo')}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1">
            <History className="w-3 h-3" />
            <span className="hidden sm:inline">{t('intelligence.tabs.history', 'Histoire')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="power" className="space-y-4 mt-4">
          <PowerMapSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="social" className="space-y-4 mt-4">
          <SocialSystemSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="unspoken" className="space-y-4 mt-4">
          <UnspokenRulesSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-4 mt-4">
          <NegotiationSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="trust" className="space-y-4 mt-4">
          <TrustSignalsSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="careers" className="space-y-4 mt-4">
          <CareerCeilingSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="exit" className="space-y-4 mt-4">
          <ExitDifficultySection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="time" className="space-y-4 mt-4">
          <TimePerceptionSection intelligence={displayData} />
        </TabsContent>

        <TabsContent value="geo" className="space-y-4 mt-4">
          <GeopoliticsSection intelligence={displayData} />
        </TabsContent>

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
    { key: 'network_weight', label: t('tags.networkWeight', 'Poids réseaux'), value: tags.network_weight },
    { key: 'diploma_weight', label: t('tags.diplomaWeight', 'Poids diplômes'), value: tags.diploma_weight },
    { key: 'risk_tolerance', label: t('tags.riskTolerance', 'Tolérance risque'), value: tags.risk_tolerance },
    { key: 'admin_speed', label: t('tags.adminSpeed', 'Vitesse admin'), value: tags.admin_speed },
    { key: 'authority_verticality', label: t('tags.authorityVerticality', 'Verticalité'), value: tags.authority_verticality },
    { key: 'mental_friction', label: t('tags.mentalFriction', 'Coût mental'), value: tags.mental_friction },
    { key: 'social_mobility', label: t('tags.socialMobility', 'Mobilité'), value: tags.social_mobility },
    { key: 'predictability', label: t('tags.predictability', 'Prévisibilité'), value: tags.predictability },
    { key: 'reputation_requirement', label: t('tags.reputationRequirement', 'Réputation'), value: tags.reputation_requirement },
    { key: 'compliance_sensitivity', label: t('tags.complianceSensitivity', 'Conformité'), value: tags.compliance_sensitivity },
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
                  <div key={i} className={`w-2 h-4 rounded-sm ${i <= tag.value ? 'bg-primary' : 'bg-muted'}`} />
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

// Power Map Section
function PowerMapSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();
  const ranking = intelligence.power_keys_ranking;
  
  const keys = [
    { key: 'diplomas', label: t('power.diplomas', 'Diplômes'), value: ranking?.diplomas || 0 },
    { key: 'networks', label: t('power.networks', 'Réseaux'), value: ranking?.networks || 0 },
    { key: 'capital', label: t('power.capital', 'Capital'), value: ranking?.capital || 0 },
    { key: 'visibility', label: t('power.visibility', 'Visibilité'), value: ranking?.visibility || 0 },
    { key: 'conformity', label: t('power.conformity', 'Conformité'), value: ranking?.conformity || 0 },
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
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(intelligence.power_formal || []).map((item, i) => (
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
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(intelligence.power_informal || []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Network className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Hidden Hierarchies */}
      {intelligence.hidden_hierarchies && intelligence.hidden_hierarchies.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              {t('power.hiddenHierarchies', 'Hiérarchies cachées')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {intelligence.hidden_hierarchies.map((h, i) => (
                <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <p className="text-sm font-medium mb-1">{h.hierarchy}</p>
                  <p className="text-xs text-muted-foreground mb-1">{h.how_it_works}</p>
                  <p className="text-xs text-primary">🔑 {h.access_method}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('power.keysRanking', 'Clés d\'accès (classement)')}</CardTitle>
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

// Social System Section
function SocialSystemSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: t('social.norms', 'Normes sociales'), value: intelligence.social_norms },
          { label: t('social.authority', 'Relation à l\'autorité'), value: intelligence.authority_relation },
          { label: t('social.risk', 'Rapport au risque'), value: intelligence.risk_attitude },
          { label: t('social.conflict', 'Rapport au conflit'), value: intelligence.conflict_approach },
        ].map((aspect, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{aspect.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{aspect.value || t('common.notAvailable', 'Non disponible')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategies */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              {t('strategies.rewarded', 'Récompensées')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(intelligence.strategies_rewarded || []).map((item, i) => (
                <li key={i} className="text-sm p-2 bg-green-500/10 rounded-lg">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <ArrowDownRight className="w-4 h-4" />
              {t('strategies.punished', 'Punies')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(intelligence.strategies_punished || []).map((item, i) => (
                <li key={i} className="text-sm p-2 bg-red-500/10 rounded-lg">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              {t('strategies.newcomerMistakes', 'Erreurs des nouveaux')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(intelligence.newcomer_mistakes || []).map((item, i) => (
                <li key={i} className="text-sm p-2 bg-amber-500/10 rounded-lg">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// NEW: Unspoken Rules Section
function UnspokenRulesSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  if (!intelligence.unspoken_rules || intelligence.unspoken_rules.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <EyeOff className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('intelligence.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-purple-500" />
            {t('intelligence.unspokenRules.title', 'Règles non-écrites')}
          </CardTitle>
          <CardDescription>{t('intelligence.unspokenRules.desc', 'Ce que personne ne vous dit mais que tout le monde sait')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intelligence.unspoken_rules.map((rule, i) => (
              <div key={i} className="p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
                <p className="text-sm font-medium mb-2">🤫 {rule.rule}</p>
                <p className="text-xs text-red-500 mb-1">⚠️ Si ignoré : {rule.consequence}</p>
                <p className="text-xs text-muted-foreground">💡 Comment le savoir : {rule.how_to_know}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Taboo Topics */}
      {intelligence.taboo_topics && intelligence.taboo_topics.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <Ban className="w-4 h-4" />
              {t('intelligence.tabooTopics', 'Sujets tabous')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {intelligence.taboo_topics.map((topic, i) => (
                <Badge key={i} variant="destructive" className="bg-red-500/10 text-red-500">
                  🚫 {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// NEW: Negotiation Section
function NegotiationSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  if (!intelligence.negotiation_styles || intelligence.negotiation_styles.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('intelligence.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          {t('intelligence.negotiation.title', 'Styles de négociation')}
        </CardTitle>
        <CardDescription>{t('intelligence.negotiation.desc', 'Comment négocier efficacement dans ce pays')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {intelligence.negotiation_styles.map((style, i) => (
            <div key={i} className="p-4 border border-border/50 rounded-lg">
              <div className="font-medium text-sm mb-2">{style.context}</div>
              <p className="text-sm text-muted-foreground mb-2">✅ Style adapté : {style.style}</p>
              <p className="text-xs text-red-500">🚫 Tabou : {style.taboo}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NEW: Trust Signals Section
function TrustSignalsSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  const hasTrustSignals = intelligence.trust_signals && intelligence.trust_signals.length > 0;
  const hasDistrustSignals = intelligence.distrust_signals && intelligence.distrust_signals.length > 0;

  if (!hasTrustSignals && !hasDistrustSignals) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('intelligence.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {hasTrustSignals && (
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              {t('intelligence.trustSignals', 'Signaux de confiance')}
            </CardTitle>
            <CardDescription className="text-xs">{t('intelligence.trustSignals.desc', 'Ce qui inspire confiance')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.trust_signals!.map((signal, i) => (
                <li key={i} className="text-sm flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                  <span className="text-green-500">✓</span>
                  {signal}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {hasDistrustSignals && (
        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              {t('intelligence.distrustSignals', 'Signaux de méfiance')}
            </CardTitle>
            <CardDescription className="text-xs">{t('intelligence.distrustSignals.desc', 'Ce qui crée la méfiance')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {intelligence.distrust_signals!.map((signal, i) => (
                <li key={i} className="text-sm flex items-start gap-2 p-2 bg-red-500/10 rounded-lg">
                  <span className="text-red-500">✗</span>
                  {signal}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// NEW: Career Ceiling Section
function CareerCeilingSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  if (!intelligence.career_ceiling_by_profile || intelligence.career_ceiling_by_profile.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('intelligence.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          {t('intelligence.careerCeiling.title', 'Plafonds de carrière par profil')}
        </CardTitle>
        <CardDescription>{t('intelligence.careerCeiling.desc', 'Les limites invisibles et comment les contourner')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {intelligence.career_ceiling_by_profile.map((ceiling, i) => (
            <div key={i} className="p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
              <div className="font-medium text-sm mb-2">👤 {ceiling.profile}</div>
              <p className="text-sm text-red-500 mb-1">🚧 Plafond : {ceiling.ceiling}</p>
              <p className="text-xs text-green-600">🔑 Contournement : {ceiling.workaround}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NEW: Exit Difficulty Section
function ExitDifficultySection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  if (!intelligence.exit_difficulty || intelligence.exit_difficulty.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('intelligence.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lock className="w-4 h-4 text-red-500" />
          {t('intelligence.exitDifficulty.title', 'Difficulté de sortie')}
        </CardTitle>
        <CardDescription>{t('intelligence.exitDifficulty.desc', 'Ce qu\'il faut savoir avant de s\'engager')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {intelligence.exit_difficulty.map((exit, i) => (
            <div key={i} className="p-4 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{exit.scenario}</span>
                <Badge className={
                  exit.difficulty === 'very_hard' ? 'bg-red-500/20 text-red-500' :
                  exit.difficulty === 'hard' ? 'bg-orange-500/20 text-orange-500' :
                  exit.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-green-500/20 text-green-500'
                }>
                  {exit.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">⏱ Timeline : {exit.timeline}</p>
              <p className="text-xs text-red-500">💸 Coûts cachés : {exit.hidden_costs}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// NEW: Time Perception Section
function TimePerceptionSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  const hasTimePerception = intelligence.time_perception && intelligence.time_perception.length > 0;
  const hasDecisionMaking = intelligence.decision_making_patterns && intelligence.decision_making_patterns.length > 0;

  if (!hasTimePerception && !hasDecisionMaking) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('intelligence.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hasTimePerception && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              {t('intelligence.timePerception.title', 'Perception du temps')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {intelligence.time_perception!.map((time, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-sm mb-1">{time.aspect}</div>
                  <p className="text-xs text-muted-foreground mb-1">📍 Norme locale : {time.local_norm}</p>
                  <p className="text-xs text-amber-500">⚠️ Piège étranger : {time.foreigner_trap}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasDecisionMaking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              {t('intelligence.decisionMaking.title', 'Prise de décision')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t('intelligence.decisionMaking.context', 'Contexte')}</th>
                    <th className="text-left p-2">{t('intelligence.decisionMaking.whoDecides', 'Qui décide')}</th>
                    <th className="text-left p-2">{t('intelligence.decisionMaking.howLong', 'Durée')}</th>
                    <th className="text-left p-2">{t('intelligence.decisionMaking.influence', 'Comment influencer')}</th>
                  </tr>
                </thead>
                <tbody>
                  {intelligence.decision_making_patterns!.map((pattern, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-2 font-medium">{pattern.context}</td>
                      <td className="p-2 text-muted-foreground">{pattern.who_decides}</td>
                      <td className="p-2">{pattern.how_long}</td>
                      <td className="p-2 text-xs text-primary">{pattern.influence_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Geopolitics Section
function GeopoliticsSection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('geo.dependencies', 'Dépendances structurelles')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(intelligence.dependencies || []).map((dep, i) => (
              <Badge key={i} variant="outline">{dep}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('geo.cycle', 'Cycle actuel')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getCycleStatusColor(intelligence.cycle_status)}>
              {translateIntelligenceValue('cycle_status', intelligence.cycle_status)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('geo.macroRisks', 'Risques macro')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(intelligence.macro_risks || []).map((risk, i) => (
                <Badge key={i} variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/30">
                  {risk}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobility */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('mobility.speed', 'Vitesse de mobilité')}</CardTitle>
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
            <CardTitle className="text-sm">{t('mobility.mentalCost', 'Coût mental')}</CardTitle>
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

// History Section
function HistorySection({ intelligence }: { intelligence: CountryIntelligence }) {
  const { t } = useTranslation();
  const legacy = intelligence.legacy_implications || { trust: '', institutions: '', merit: '', risk: '' };

  const implications = [
    { key: 'trust', label: t('history.trust', 'Confiance'), value: (legacy as any).trust || '' },
    { key: 'institutions', label: t('history.institutions', 'Institutions'), value: (legacy as any).institutions || '' },
    { key: 'merit', label: t('history.merit', 'Rapport au mérite'), value: (legacy as any).merit || '' },
    { key: 'risk', label: t('history.risk', 'Rapport au risque'), value: (legacy as any).risk || '' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('history.traces', 'Traces historiques')}</CardTitle>
          <CardDescription className="text-xs">{t('history.tracesDesc', 'Ce qui explique les règles actuelles')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {(intelligence.historical_traces || []).map((trace, i) => (
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
          <CardTitle className="text-sm">{t('history.implications', 'Ce que cela implique')}</CardTitle>
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
