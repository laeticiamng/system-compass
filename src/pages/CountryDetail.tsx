import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCountryById } from '@/lib/countries-data';
import { PyramidVisualization } from '@/components/PyramidVisualization';
import { RiskBars } from '@/components/RiskBars';
import { RuleOfGoldBanner } from '@/components/RuleOfGoldBanner';
import { WhoWinsWhoLoses } from '@/components/WhoWinsWhoLoses';
import { PlaybookSection } from '@/components/PlaybookSection';
import { LGBTQRightsIndicator } from '@/components/LGBTQRightsIndicator';
import { CountryExitKeys } from '@/components/CountryExitKeys';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';

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
  const country = getCountryById(id || '');

  if (!country) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('countryDetail.notFound')}</h1>
          <Button onClick={() => navigate('/countries')}>{t('countryDetail.backToCountries')}</Button>
        </div>
      </div>
    );
  }

  const typeLabel = t(PYRAMID_TYPE_LABELS[country.pyramidType]);
  const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType];

  // Get translated country data
  const countryData = t(`countriesData.${country.id}`, { returnObjects: true }) as {
    name: string;
    region: string;
    ruleOfGold: string;
    pyramid: { top: string; institutions: string; gatekeepers: string; valueCreators: string; base: string; realAsset: string };
    whoWins: string[];
    whoLoses: string[];
    playbook: { do: string[]; dont: string[]; plan30Days: string[]; plan12Months: string[]; plan5Years: string[]; planB: string };
  };

  // Fallback to original data if translation not available
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
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-12">
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
        </div>

        {/* Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <SnapshotCard label={t('countryDetail.snapshot.gdpPerCapita')} value={`$${country.snapshot.gdpPerCapita.toLocaleString()}`} />
          <SnapshotCard label={t('countryDetail.snapshot.population')} value={formatPopulation(country.snapshot.population)} />
          <SnapshotCard label={t('countryDetail.snapshot.passportRank')} value={`#${country.snapshot.passportRank}`} />
          <SnapshotCard label={t('countryDetail.snapshot.corruptionIndex')} value={`${country.snapshot.corruptionIndex}/100`} />
          <SnapshotCard label={t('countryDetail.snapshot.freedomIndex')} value={`${country.snapshot.freedomIndex}/100`} />
        </div>

        {/* Rule of Gold */}
        <RuleOfGoldBanner rule={displayRuleOfGold} className="mb-12" />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Pyramid */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">{t('countryDetail.systemPyramid')}</h2>
            <PyramidVisualization country={country} translatedPyramid={displayPyramid} />
          </div>

          {/* Risk Assessment */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">{t('countryDetail.riskAssessment')}</h2>
            <div className="glass-card rounded-xl p-6">
              <RiskBars risks={country.risks} />
            </div>
          </div>
        </div>

        {/* Who Wins / Who Loses */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('countryDetail.whoWinsLoses')}</h2>
          <WhoWinsWhoLoses wins={displayWhoWins} loses={displayWhoLoses} />
        </div>

        {/* LGBTQ+ Rights */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('countryDetail.lgbtqRights', 'LGBTQ+ Rights')}</h2>
          <LGBTQRightsIndicator rights={country.lgbtqRights} />
        </div>

        {/* Exit Keys - Personalized Strategies */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">{t('exitKeys.title', 'Clés de Sortie')}</h2>
          <CountryExitKeys country={country} />
        </div>

        {/* Playbook */}
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
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground"
              >
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

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="font-display font-semibold text-lg">{value}</div>
    </div>
  );
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatPopulation(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
  return `${(num / 1000).toFixed(0)}K`;
}