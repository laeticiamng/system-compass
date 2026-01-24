import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslatedVariants } from '@/hooks/useTranslatedVariants';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Rocket, 
  Coffee,
  Lightbulb,
  UserCheck,
  UserX,
  Loader2,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  MapPin,
  DollarSign,
  Heart,
  Footprints,
  BookOpen
} from 'lucide-react';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CountryVariant {
  labor_market: string[];
  entrepreneurship: string[];
  daily_life: string[];
  institutions: string[];
  networks: string[];
  profiles_succeed: string[];
  profiles_struggle: string[];
  surprises: string[];
  example_trajectories: { profile: string; outcome: string }[];
  is_complete?: boolean;
  // New enriched fields
  typical_day?: { time: string; activity: string; cultural_note: string }[];
  year_one_reality?: { month: string; milestone: string; difficulty: string; tip: string }[];
  common_mistakes_timeline?: { phase: string; mistake: string; consequence: string; prevention: string }[];
  hidden_admin_steps?: { step: string; time_estimate: string; difficulty: string; insider_tip: string }[];
  cultural_shocks?: { shock: string; explanation: string; adaptation_time: string }[];
  real_costs_breakdown?: { category: string; official_cost: string; real_cost: string; notes: string }[];
  success_timeline_months?: { month_range: string; realistic_goal: string; warning: string }[];
  expat_communities?: { name: string; location: string; size: string; focus: string; entry_difficulty: string }[];
}

// Helper to safely parse JSONB data - handles both array and object formats
function parseToStringArray(data: Json | null): string[] {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        if (obj.profile && obj.outcome) {
          return `${obj.profile}: ${obj.outcome}`;
        }
      }
      return String(item);
    });
  }
  
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return obj.items.map(String);
    }
  }
  
  return [];
}

function parseTrajectories(data: Json | null): { profile: string; outcome: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        profile: String(obj.profile || ''),
        outcome: String(obj.outcome || ''),
      };
    }
    return { profile: '', outcome: String(item) };
  }).filter(t => t.profile || t.outcome);
}

function parseTypicalDay(data: Json | null): { time: string; activity: string; cultural_note: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        time: String(obj.time || ''),
        activity: String(obj.activity || ''),
        cultural_note: String(obj.cultural_note || ''),
      };
    }
    return { time: '', activity: '', cultural_note: '' };
  }).filter(t => t.time || t.activity);
}

function parseYearOneReality(data: Json | null): { month: string; milestone: string; difficulty: string; tip: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        month: String(obj.month || ''),
        milestone: String(obj.milestone || ''),
        difficulty: String(obj.difficulty || ''),
        tip: String(obj.tip || ''),
      };
    }
    return { month: '', milestone: '', difficulty: '', tip: '' };
  }).filter(t => t.month || t.milestone);
}

function parseMistakesTimeline(data: Json | null): { phase: string; mistake: string; consequence: string; prevention: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        phase: String(obj.phase || ''),
        mistake: String(obj.mistake || ''),
        consequence: String(obj.consequence || ''),
        prevention: String(obj.prevention || ''),
      };
    }
    return { phase: '', mistake: '', consequence: '', prevention: '' };
  }).filter(t => t.phase || t.mistake);
}

function parseHiddenAdminSteps(data: Json | null): { step: string; time_estimate: string; difficulty: string; insider_tip: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        step: String(obj.step || ''),
        time_estimate: String(obj.time_estimate || ''),
        difficulty: String(obj.difficulty || ''),
        insider_tip: String(obj.insider_tip || ''),
      };
    }
    return { step: '', time_estimate: '', difficulty: '', insider_tip: '' };
  }).filter(t => t.step);
}

function parseCulturalShocks(data: Json | null): { shock: string; explanation: string; adaptation_time: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        shock: String(obj.shock || ''),
        explanation: String(obj.explanation || ''),
        adaptation_time: String(obj.adaptation_time || ''),
      };
    }
    return { shock: '', explanation: '', adaptation_time: '' };
  }).filter(t => t.shock);
}

function parseRealCosts(data: Json | null): { category: string; official_cost: string; real_cost: string; notes: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        category: String(obj.category || ''),
        official_cost: String(obj.official_cost || ''),
        real_cost: String(obj.real_cost || ''),
        notes: String(obj.notes || ''),
      };
    }
    return { category: '', official_cost: '', real_cost: '', notes: '' };
  }).filter(t => t.category);
}

function parseSuccessTimeline(data: Json | null): { month_range: string; realistic_goal: string; warning: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        month_range: String(obj.month_range || ''),
        realistic_goal: String(obj.realistic_goal || ''),
        warning: String(obj.warning || ''),
      };
    }
    return { month_range: '', realistic_goal: '', warning: '' };
  }).filter(t => t.month_range);
}

function parseExpatCommunities(data: Json | null): { name: string; location: string; size: string; focus: string; entry_difficulty: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        name: String(obj.name || ''),
        location: String(obj.location || ''),
        size: String(obj.size || ''),
        focus: String(obj.focus || ''),
        entry_difficulty: String(obj.entry_difficulty || ''),
      };
    }
    return { name: '', location: '', size: '', focus: '', entry_difficulty: '' };
  }).filter(t => t.name);
}

interface CountryVariantSectionProps {
  countryId: string;
  countryName: string;
}

export function CountryVariantSection({ countryId, countryName }: CountryVariantSectionProps) {
  const { t } = useTranslation();
  const { canAccessPremium, loading: subscriptionLoading } = useSubscription();
  const [originalVariant, setOriginalVariant] = useState<CountryVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setFetchError] = useState<string | null>(null);

  const { translatedData: variant, isTranslating } = useTranslatedVariants(
    countryId,
    originalVariant
  );

  useEffect(() => {
    async function fetchVariant() {
      if (!canAccessPremium) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('country_variants')
          .select('*')
          .eq('country_id', countryId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          const parsed = {
            institutions: parseToStringArray(data.institutions),
            networks: parseToStringArray(data.networks),
            labor_market: parseToStringArray(data.labor_market),
            entrepreneurship: parseToStringArray(data.entrepreneurship),
            daily_life: parseToStringArray(data.daily_life),
            surprises: parseToStringArray(data.surprises),
            profiles_succeed: parseToStringArray(data.profiles_succeed),
            profiles_struggle: parseToStringArray(data.profiles_struggle),
            example_trajectories: parseTrajectories(data.example_trajectories),
            is_complete: data.is_complete,
            // New enriched fields
            typical_day: parseTypicalDay(data.typical_day),
            year_one_reality: parseYearOneReality(data.year_one_reality),
            common_mistakes_timeline: parseMistakesTimeline(data.common_mistakes_timeline),
            hidden_admin_steps: parseHiddenAdminSteps(data.hidden_admin_steps),
            cultural_shocks: parseCulturalShocks(data.cultural_shocks),
            real_costs_breakdown: parseRealCosts(data.real_costs_breakdown),
            success_timeline_months: parseSuccessTimeline(data.success_timeline_months),
            expat_communities: parseExpatCommunities(data.expat_communities),
          };
          setOriginalVariant(parsed);
        }
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchVariant();
  }, [countryId, canAccessPremium]);

  if (!canAccessPremium) {
    return (
      <PremiumPaywall
        title={t('countryDetail.variant.paywallTitle', 'Variante Pays')}
        description={t('countryDetail.variant.paywallDesc', `Débloquez les spécificités locales de ${countryName} : institutions, réseaux, marché du travail, entrepreneuriat, et plus encore.`)}
        tier="premium"
      />
    );
  }

  if (loading || subscriptionLoading || isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        {isTranslating && (
          <span className="text-sm text-muted-foreground">
            {t('intelligence.translating', 'Traduction en cours...')}
          </span>
        )}
      </div>
    );
  }

  if (!originalVariant || !originalVariant.is_complete) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold mb-2">
          {t('countryDetail.variant.comingSoon', 'Contenu en cours de rédaction')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('countryDetail.variant.comingSoonDesc', `Les données spécifiques pour ${countryName} sont en cours de préparation. Revenez bientôt pour découvrir les insights locaux.`)}
        </p>
      </div>
    );
  }

  const displayData = variant || originalVariant;

  // Double-check displayData is valid before rendering
  if (!displayData) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold mb-2">
          {t('countryDetail.variant.noData', 'Données non disponibles')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('countryDetail.variant.noDataDesc', 'Les données pour ce pays ne sont pas encore disponibles.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
          ⭐ {t('countryDetail.variant.badge', 'Variante Pays — Premium')}
        </span>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="overview" className="text-xs gap-1">
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.overview', 'Aperçu')}</span>
          </TabsTrigger>
          <TabsTrigger value="typical-day" className="text-xs gap-1">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.typicalDay', 'Journée')}</span>
          </TabsTrigger>
          <TabsTrigger value="year-one" className="text-xs gap-1">
            <Calendar className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.yearOne', 'Année 1')}</span>
          </TabsTrigger>
          <TabsTrigger value="mistakes" className="text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.mistakes', 'Erreurs')}</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="text-xs gap-1">
            <BookOpen className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.admin', 'Admin')}</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="text-xs gap-1">
            <DollarSign className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.costs', 'Coûts')}</span>
          </TabsTrigger>
          <TabsTrigger value="culture" className="text-xs gap-1">
            <Heart className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.culture', 'Culture')}</span>
          </TabsTrigger>
          <TabsTrigger value="communities" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">{t('variant.tabs.communities', 'Communautés')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Original content */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <OverviewSection displayData={displayData} t={t} />
        </TabsContent>

        {/* Typical Day Tab */}
        <TabsContent value="typical-day" className="space-y-4 mt-4">
          <TypicalDaySection typicalDay={displayData.typical_day} t={t} />
        </TabsContent>

        {/* Year One Tab */}
        <TabsContent value="year-one" className="space-y-4 mt-4">
          <YearOneSection 
            yearOneReality={displayData.year_one_reality} 
            successTimeline={displayData.success_timeline_months}
            t={t} 
          />
        </TabsContent>

        {/* Mistakes Tab */}
        <TabsContent value="mistakes" className="space-y-4 mt-4">
          <MistakesSection mistakes={displayData.common_mistakes_timeline} t={t} />
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-4 mt-4">
          <AdminStepsSection steps={displayData.hidden_admin_steps} t={t} />
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4 mt-4">
          <RealCostsSection costs={displayData.real_costs_breakdown} t={t} />
        </TabsContent>

        {/* Culture Tab */}
        <TabsContent value="culture" className="space-y-4 mt-4">
          <CultureShocksSection shocks={displayData.cultural_shocks} surprises={displayData.surprises} t={t} />
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities" className="space-y-4 mt-4">
          <CommunitiesSection communities={displayData.expat_communities} t={t} />
        </TabsContent>
      </Tabs>

      <SimulationDisclaimer variant="contextual" context="results" />
    </div>
  );
}

// Overview Section (original content)
function OverviewSection({ displayData, t }: { displayData: CountryVariant; t: any }) {
  // Safely ensure arrays - handle arrays, objects with items property, or null/undefined
  const ensureArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val;
    // Handle objects with { title, items } structure from database
    if (val && typeof val === 'object' && 'items' in val) {
      const items = (val as { items?: unknown }).items;
      if (Array.isArray(items)) return items;
    }
    return [];
  };

  const institutions = ensureArray(displayData?.institutions);
  const networks = ensureArray(displayData?.networks);
  const labor_market = ensureArray(displayData?.labor_market);
  const entrepreneurship = ensureArray(displayData?.entrepreneurship);
  const daily_life = ensureArray(displayData?.daily_life);

  const sections = [
    { icon: Building2, title: t('countryDetail.variant.institutions', 'Institutions & Administration'), data: institutions, color: 'text-blue-500' },
    { icon: Users, title: t('countryDetail.variant.networks', 'Réseaux & Réputation'), data: networks, color: 'text-purple-500' },
    { icon: Briefcase, title: t('countryDetail.variant.laborMarket', 'Marché du Travail'), data: labor_market, color: 'text-green-500' },
    { icon: Rocket, title: t('countryDetail.variant.entrepreneurship', 'Entrepreneuriat'), data: entrepreneurship, color: 'text-orange-500' },
    { icon: Coffee, title: t('countryDetail.variant.dailyLife', 'Vie Quotidienne'), data: daily_life, color: 'text-pink-500' },
  ];

  // Filter sections that have data
  const sectionsWithData = sections.filter(s => s.data.length > 0);

  if (sectionsWithData.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectionsWithData.map(({ icon: Icon, title, data, color }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm flex items-center gap-2 ${color}`}>
                <Icon className="w-4 h-4" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {data.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className={color}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profiles Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {Array.isArray(displayData?.profiles_succeed) && displayData.profiles_succeed.length > 0 && (
          <Card className="border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <UserCheck className="w-4 h-4" />
                {t('countryDetail.variant.profilesSucceed', 'Profils qui réussissent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {displayData.profiles_succeed.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                    <span className="text-green-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {Array.isArray(displayData?.profiles_struggle) && displayData.profiles_struggle.length > 0 && (
          <Card className="border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <UserX className="w-4 h-4" />
                {t('countryDetail.variant.profilesStruggle', 'Profils qui galèrent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {displayData.profiles_struggle.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                    <span className="text-red-500">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trajectories */}
      {Array.isArray(displayData?.example_trajectories) && displayData.example_trajectories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('countryDetail.variant.trajectories', 'Exemples de trajectoires')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayData.example_trajectories.map((traj, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-sm text-primary mb-1">{traj?.profile || ''}</div>
                  <p className="text-sm text-muted-foreground">{traj?.outcome || ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// Typical Day Section
function TypicalDaySection({ typicalDay, t }: { typicalDay?: CountryVariant['typical_day']; t: any }) {
  if (!typicalDay || typicalDay.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {t('variant.typicalDay.title', 'Une journée typique')}
        </CardTitle>
        <CardDescription>{t('variant.typicalDay.desc', 'Comment se déroule une journée de travail classique')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {typicalDay.map((slot, i) => (
            <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-mono font-bold text-primary min-w-[60px]">{slot.time}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{slot.activity}</div>
                {slot.cultural_note && (
                  <div className="text-xs text-muted-foreground mt-1 italic">💡 {slot.cultural_note}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Year One Section
function YearOneSection({ yearOneReality, successTimeline, t }: { 
  yearOneReality?: CountryVariant['year_one_reality']; 
  successTimeline?: CountryVariant['success_timeline_months'];
  t: any 
}) {
  return (
    <div className="space-y-4">
      {yearOneReality && yearOneReality.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {t('variant.yearOne.title', 'Réalité de la première année')}
            </CardTitle>
            <CardDescription>{t('variant.yearOne.desc', 'Mois par mois, ce qui vous attend vraiment')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yearOneReality.map((phase, i) => (
                <div key={i} className="p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{phase.month}</Badge>
                    <Badge className={
                      phase.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' :
                      phase.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-green-500/10 text-green-500'
                    }>
                      {phase.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{phase.milestone}</p>
                  {phase.tip && <p className="text-xs text-muted-foreground">💡 {phase.tip}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {successTimeline && successTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Footprints className="w-4 h-4 text-primary" />
              {t('variant.successTimeline.title', 'Timeline réaliste de succès')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {successTimeline.map((milestone, i) => (
                <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="font-mono text-sm font-bold text-primary min-w-[80px]">{milestone.month_range}</div>
                  <div className="flex-1">
                    <div className="text-sm">{milestone.realistic_goal}</div>
                    {milestone.warning && (
                      <div className="text-xs text-amber-500 mt-1">⚠️ {milestone.warning}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!yearOneReality || yearOneReality.length === 0) && (!successTimeline || successTimeline.length === 0) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Mistakes Section
function MistakesSection({ mistakes, t }: { mistakes?: CountryVariant['common_mistakes_timeline']; t: any }) {
  if (!mistakes || mistakes.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          {t('variant.mistakes.title', 'Erreurs courantes par phase')}
        </CardTitle>
        <CardDescription>{t('variant.mistakes.desc', 'Ce que font la plupart des nouveaux arrivants — et comment éviter')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mistakes.map((m, i) => (
            <div key={i} className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
              <Badge variant="outline" className="mb-2">{m.phase}</Badge>
              <p className="text-sm font-medium text-red-600 mb-1">❌ {m.mistake}</p>
              <p className="text-xs text-muted-foreground mb-2">→ {m.consequence}</p>
              <p className="text-xs text-green-600">✅ {m.prevention}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Admin Steps Section
function AdminStepsSection({ steps, t }: { steps?: CountryVariant['hidden_admin_steps']; t: any }) {
  if (!steps || steps.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          {t('variant.admin.title', 'Étapes administratives cachées')}
        </CardTitle>
        <CardDescription>{t('variant.admin.desc', 'Ce que personne ne vous dit sur les démarches')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="p-4 border border-border/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{i + 1}. {step.step}</span>
              </div>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">⏱ {step.time_estimate}</Badge>
                <Badge className={
                  step.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' :
                  step.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-green-500/10 text-green-500'
                }>
                  {step.difficulty}
                </Badge>
              </div>
              {step.insider_tip && <p className="text-xs text-primary">💡 {step.insider_tip}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Real Costs Section
function RealCostsSection({ costs, t }: { costs?: CountryVariant['real_costs_breakdown']; t: any }) {
  if (!costs || costs.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <DollarSign className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          {t('variant.costs.title', 'Coûts réels vs officiels')}
        </CardTitle>
        <CardDescription>{t('variant.costs.desc', 'La différence entre ce qu\'on vous dit et la réalité')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">{t('variant.costs.category', 'Catégorie')}</th>
                <th className="text-left p-2">{t('variant.costs.official', 'Officiel')}</th>
                <th className="text-left p-2">{t('variant.costs.real', 'Réel')}</th>
                <th className="text-left p-2">{t('variant.costs.notes', 'Notes')}</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-2 font-medium">{cost.category}</td>
                  <td className="p-2 text-muted-foreground">{cost.official_cost}</td>
                  <td className="p-2 text-amber-500 font-medium">{cost.real_cost}</td>
                  <td className="p-2 text-xs text-muted-foreground">{cost.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Cultural Shocks Section
function CultureShocksSection({ shocks, surprises, t }: { 
  shocks?: CountryVariant['cultural_shocks']; 
  surprises: string[];
  t: any 
}) {
  return (
    <div className="space-y-4">
      {shocks && shocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              {t('variant.culture.title', 'Chocs culturels')}
            </CardTitle>
            <CardDescription>{t('variant.culture.desc', 'Ce qui surprend le plus les nouveaux arrivants')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shocks.map((shock, i) => (
                <div key={i} className="p-4 border border-pink-500/30 rounded-lg bg-pink-500/5">
                  <p className="text-sm font-medium mb-1">😮 {shock.shock}</p>
                  <p className="text-xs text-muted-foreground mb-2">{shock.explanation}</p>
                  <Badge variant="outline">Adaptation: {shock.adaptation_time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {surprises.length > 0 && (
        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              {t('countryDetail.variant.surprises', 'Ce qui surprend souvent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-2">
              {surprises.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-amber-500">💡</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(!shocks || shocks.length === 0) && surprises.length === 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-8 text-center">
            <Heart className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Communities Section
function CommunitiesSection({ communities, t }: { communities?: CountryVariant['expat_communities']; t: any }) {
  if (!communities || communities.length === 0) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('variant.noData', 'Données bientôt disponibles')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          {t('variant.communities.title', 'Communautés expat')}
        </CardTitle>
        <CardDescription>{t('variant.communities.desc', 'Où trouver du soutien et des connexions')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {communities.map((comm, i) => (
            <div key={i} className="p-4 border border-border/50 rounded-lg">
              <div className="font-medium text-sm mb-2">{comm.name}</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="text-muted-foreground">{comm.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span className="text-muted-foreground">{comm.size}</span>
                </div>
                <div className="text-muted-foreground">{comm.focus}</div>
              </div>
              <Badge className="mt-2" variant="outline">
                Entrée: {comm.entry_difficulty}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
