import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useCountryById } from '@/lib/countries-data';
import { isExtendedCountry, getExtendedCountryMeta } from '@/lib/countries-extended';
import { CountryTroncSection } from '@/components/country/CountryTroncSection';
import { CountryVariantSection } from '@/components/country/CountryVariantSection';
import { CountryProjectAnalysis } from '@/components/country/CountryProjectAnalysis';
import { CountryIntelligenceSection } from '@/components/country/CountryIntelligenceSection';
import { CountryGovernanceSection } from '@/components/country/CountryGovernanceSection';
import { CountryExitKeys } from '@/components/CountryExitKeys';
import { NaturalRisksCard } from '@/components/NaturalRisksCard';
import { HealthcareCard } from '@/components/HealthcareCard';
import { PositivePointsCard } from '@/components/PositivePointsCard';
import { CountryMusicPlayer } from '@/components/CountryMusicPlayer';
import { FiscalSalaryCalculator } from '@/components/FiscalSalaryCalculator';
import { RetirementProjection } from '@/components/RetirementProjection';
import { LGBTQRightsIndicator } from '@/components/LGBTQRightsIndicator';
import { PlaybookSection } from '@/components/PlaybookSection';
import { CountryTagsRadar } from '@/components/country/CountryTagsRadar';
import { CountryPdfExport } from '@/components/CountryPdfExport';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, ExternalLink, Layers, Map, Target, Brain, Loader2, Sparkles, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserHistory } from '@/hooks/useUserHistory';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';
import { AiHelpButton } from '@/components/ai/AiHelpButton';
import { AiAction, AiContext } from '@/components/ai/AiSidePanel';

const PYRAMID_TYPE_LABELS: Record<string, string> = {
  PROBLEM_RENT: 'pyramids.problemRent.label',
  STABILITY_REDIS: 'pyramids.stabilityRedis.label',
  COMPETENCE_TRUST: 'pyramids.competenceTrust.label',
  GROWTH_RISK: 'pyramids.growthRisk.label',
  HYBRID_TRANSITION: 'pyramids.hybridTransition.label',
  RESOURCE_EXTRACTION: 'pyramids.resourceExtraction.label',
};

const PYRAMID_TYPE_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'pyramid-rent',
  STABILITY_REDIS: 'pyramid-stability',
  COMPETENCE_TRUST: 'pyramid-competence',
  GROWTH_RISK: 'pyramid-growth',
  HYBRID_TRANSITION: 'pyramid-hybrid',
  RESOURCE_EXTRACTION: 'pyramid-resource',
};

export default function CountryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trackCountryView } = useUserHistory();
  const { profile } = useExitKeysProfile();
  const { country } = useCountryById(id);
  const extendedMeta = !country && id ? getExtendedCountryMeta(id) : null;
  const isExtended = !country && extendedMeta !== null;

  // Track country view
  useEffect(() => {
    if (id && (country || extendedMeta)) {
      trackCountryView(id, country?.name || extendedMeta?.name || id);
    }
  }, [id, country, extendedMeta, trackCountryView]);

  // For extended countries, we need to fetch tags from DB
  const [extendedTags, setExtendedTags] = useState<any>(null);
  const [loadingExtended, setLoadingExtended] = useState(isExtended);

  useEffect(() => {
    if (isExtended && id) {
      Promise.all([
        supabase.from('country_tags').select('*').eq('country_id', id).single(),
      ]).then(([tagsRes]) => {
        if (tagsRes.data) setExtendedTags(tagsRes.data);
        setLoadingExtended(false);
      });
    }
  }, [isExtended, id]);

  // Not found for both regular and extended
  if (!country && !isExtended) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('countryDetail.notFound')}</h1>
          <Button onClick={() => navigate('/countries')}>{t('countryDetail.backToCountries')}</Button>
        </div>
      </div>
    );
  }

  // Extended country view (DB-only)
  if (isExtended && extendedMeta) {
    const typeLabel = t(PYRAMID_TYPE_LABELS[extendedMeta.pyramidType] || 'pyramids.hybridTransition.label');
    const typeColor = PYRAMID_TYPE_COLORS[extendedMeta.pyramidType] || 'pyramid-hybrid';

    if (loadingExtended) {
      return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/countries')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('countryDetail.backToCountries')}
            </Button>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
            <div className="text-6xl">{getFlagEmoji(extendedMeta.iso2)}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-4xl font-bold">{extendedMeta.name}</h1>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
                    color: `hsl(var(--${typeColor}))`,
                  }}
                >
                  {typeLabel}
                </span>
              </div>
              <p className="text-muted-foreground">{extendedMeta.region}</p>
            </div>
          </div>

          {/* Music Player */}
          <CountryMusicPlayer
            countryId={id!}
            countryName={extendedMeta.name}
            pyramidType={extendedMeta.pyramidType as any}
            className="mb-8"
          />

          {/* Tags Radar */}
          {extendedTags && (
            <div className="mb-8">
              <CountryTagsRadar tags={extendedTags} countryName={extendedMeta.name} />
            </div>
          )}

          {/* Intelligence Layer */}
          <Tabs defaultValue="intelligence" className="mb-12">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="intelligence" className="gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">{t('countryDetail.tabs.intelligence', 'Intelligence')}</span>
                <span className="sm:hidden">Intel</span>
              </TabsTrigger>
              <TabsTrigger value="variant" className="gap-2">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">{t('countryDetail.tabs.variant', 'Variante Pays')}</span>
                <span className="sm:hidden">Variante</span>
              </TabsTrigger>
              <TabsTrigger value="project" className="gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">{t('countryDetail.tabs.project', 'Analyse Projet')}</span>
                <span className="sm:hidden">Projet</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="intelligence">
              <CountryIntelligenceSection countryId={id!} countryName={extendedMeta.name} />
            </TabsContent>

            <TabsContent value="variant">
              <CountryVariantSection countryId={id!} countryName={extendedMeta.name} />
            </TabsContent>

            <TabsContent value="project">
              <CountryProjectAnalysis countryId={id!} countryName={extendedMeta.name} />
            </TabsContent>
          </Tabs>

          {/* Note about extended country */}
          <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
            <p>{t('countryDetail.extendedNote', 'This country has intelligence layer data. Full profile data coming soon.')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Regular country view
  if (!country) return null;

  // Fetch governance data for PDF export
  const { governance: governanceData } = useCountryGovernance(country.id, country.pyramidType);

  const typeLabel = t(PYRAMID_TYPE_LABELS[country.pyramidType]);
  const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType];

  const countryData = t(`countriesData.${country.id}`, { returnObjects: true }) as {
    name: string;
    region: string;
    ruleOfGold: string;
    pyramid: { top: string; institutions: string; gatekeepers: string; valueCreators: string; base: string; realAsset: string };
    whoWins: string[];
    whoLoses: string[];
    playbook: { do: string[]; dont: string[]; plan30Days: string[]; plan12Months: string[]; plan5Years: string[]; planB: string };
  };

  const displayName = countryData?.name || country.name;
  const displayRegion = countryData?.region || country.region;
  const displayRuleOfGold = countryData?.ruleOfGold || country.ruleOfGold;
  const displayPyramid = countryData?.pyramid || country.pyramid;
  const displayWhoWins = countryData?.whoWins || country.whoWins;
  const displayWhoLoses = countryData?.whoLoses || country.whoLoses;
  const displayPlaybook = countryData?.playbook || country.playbook;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/countries')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('countryDetail.backToCountries')}
          </Button>
          <CountryPdfExport 
            country={country} 
            governanceData={governanceData}
          />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          <div className="text-6xl">{getFlagEmoji(country.iso2)}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-4xl font-bold">{displayName}</h1>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
                  color: `hsl(var(--${typeColor}))`,
                }}
              >
                {typeLabel}
              </span>
            </div>
            <p className="text-muted-foreground">{displayRegion}</p>
          </div>
          <AiHelpButton
            title={t('ai.countryAnalysisAssistant', 'Assistant Analyse Pays')}
            actions={[
              { id: 'compare_countries', label: t('ai.actions.compareCountries', 'Comparer avec un autre pays'), description: t('ai.actions.compareCountriesDesc', 'Critères et trade-offs selon votre profil') },
              { id: 'summarize_for_profile', label: t('ai.actions.summarizeForProfile', 'Résumer selon mes contraintes'), description: t('ai.actions.summarizeForProfileDesc', 'Résumé focalisé sur ce qui compte pour vous') },
              { id: 'attention_points', label: t('ai.actions.attentionPoints', 'Points d\'attention'), description: t('ai.actions.attentionPointsDesc', 'Risques et contraintes pouvant casser une trajectoire') },
            ]}
            context={{
              module: 'country-analysis',
              country: {
                id: country.id,
                name: displayName,
                region: displayRegion,
                pyramidType: country.pyramidType,
                snapshot: country.snapshot,
                ruleOfGold: displayRuleOfGold,
              },
              profile: profile || undefined,
            }}
            variant="secondary"
            size="default"
          />
        </div>

        {/* Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <SnapshotCard label={t('countryDetail.snapshot.gdpPerCapita')} value={`$${country.snapshot.gdpPerCapita.toLocaleString()}`} />
          <SnapshotCard label={t('countryDetail.snapshot.population')} value={formatPopulation(country.snapshot.population)} />
          <SnapshotCard label={t('countryDetail.snapshot.passportRank')} value={`#${country.snapshot.passportRank}`} />
          <SnapshotCard label={t('countryDetail.snapshot.corruptionIndex')} value={`${100 - country.snapshot.corruptionIndex}/100`} colorClass={getCorruptionColor(country.snapshot.corruptionIndex)} />
          <SnapshotCard label={t('countryDetail.snapshot.freedomIndex')} value={`${country.snapshot.freedomIndex}/100`} colorClass={getFreedomColor(country.snapshot.freedomIndex)} />
        </div>

        {/* Music Player */}
        <CountryMusicPlayer
          countryId={country.id}
          countryName={displayName}
          pyramidType={country.pyramidType}
          className="mb-8"
        />

        {/* 5-Layer Tabs */}
        <Tabs defaultValue="tronc" className="mb-12">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="tronc" className="gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">{t('countryDetail.tabs.tronc', 'Tronc Pyramide')}</span>
              <span className="sm:hidden">Tronc</span>
            </TabsTrigger>
            <TabsTrigger value="variant" className="gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">{t('countryDetail.tabs.variant', 'Variante Pays')}</span>
              <span className="sm:hidden">Variante</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">{t('countryDetail.tabs.intelligence', 'Intelligence')}</span>
              <span className="sm:hidden">Intel</span>
            </TabsTrigger>
            <TabsTrigger value="governance" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t('countryDetail.tabs.governance', 'Gouvernance')}</span>
              <span className="sm:hidden">Gouv.</span>
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">{t('countryDetail.tabs.project', 'Analyse Projet')}</span>
              <span className="sm:hidden">Projet</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tronc">
            <CountryTroncSection
              country={country}
              displayPyramid={displayPyramid}
              displayRuleOfGold={displayRuleOfGold}
              displayWhoWins={displayWhoWins}
              displayWhoLoses={displayWhoLoses}
            />
          </TabsContent>

          <TabsContent value="variant">
            <CountryVariantSection countryId={country.id} countryName={displayName} />
          </TabsContent>

          <TabsContent value="intelligence">
            <CountryIntelligenceSection countryId={country.id} countryName={displayName} />
          </TabsContent>

          <TabsContent value="governance">
            <CountryGovernanceSection 
              countryId={country.id} 
              countryName={displayName}
              pyramidType={country.pyramidType}
              snapshot={country.snapshot}
            />
          </TabsContent>

          <TabsContent value="project">
            <CountryProjectAnalysis countryId={country.id} countryName={displayName} />
          </TabsContent>
        </Tabs>

        {/* Additional Sections */}
        {country.positivePoints && (
          <div className="mb-12">
            <PositivePointsCard positivePoints={country.positivePoints} countryId={country.id} />
          </div>
        )}

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('countryDetail.lgbtqRights', 'LGBTQ+ Rights')}</h2>
          <LGBTQRightsIndicator rights={country.lgbtqRights} />
        </div>

        {(country.naturalRisks || country.healthcare) && (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {country.naturalRisks && <NaturalRisksCard risks={country.naturalRisks} />}
            {country.healthcare && <HealthcareCard healthcare={country.healthcare} />}
          </div>
        )}

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('fiscal.salaryCalculator', 'Calculateur de Salaire Net')}</h2>
          <FiscalSalaryCalculator initialCountryId={country.id} />
        </div>

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('retirement.projectionTitle', 'Projection Retraite')}</h2>
          <RetirementProjection initialCountryId={country.id} />
        </div>

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('exitKeys.title', 'Clés de Sortie')}</h2>
          <CountryExitKeys country={country} />
        </div>

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('countryDetail.survivalPlaybook')}</h2>
          <PlaybookSection playbook={displayPlaybook} />
        </div>

        {/* Sources */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">{t('countryDetail.sourcesUpdates')}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {t('countryDetail.lastUpdated')}: {country.lastUpdated}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {country.sources.map((source, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapshotCard({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`font-display font-semibold text-lg ${colorClass || ''}`}>{value}</div>
    </div>
  );
}

function getCorruptionColor(index: number): string {
  // TI scale: 100 = clean, 0 = corrupt
  // We display inverted (100 - index), so color based on inverted value
  const inverted = 100 - index;
  if (inverted <= 30) return 'text-green-500';
  if (inverted <= 50) return 'text-yellow-500';
  if (inverted <= 70) return 'text-orange-500';
  return 'text-red-500';
}

function getFreedomColor(index: number): string {
  if (index >= 70) return 'text-green-500';
  if (index >= 50) return 'text-yellow-500';
  if (index >= 30) return 'text-orange-500';
  return 'text-red-500';
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatPopulation(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
  return `${(num / 1000).toFixed(0)}K`;
}
