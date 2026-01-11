import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { countries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RiskBars } from '@/components/RiskBars';
import { cn } from '@/lib/utils';
import { 
  ArrowLeftRight, Check, X, Scale, Share2, Copy, CheckCircle,
  Plane, DollarSign, Heart, Wifi
} from 'lucide-react';
import { OVISuggestionsWidget } from '@/components/ovi/OVISuggestionsWidget';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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

const ALL_PYRAMID_TYPES = [
  'PROBLEM_RENT',
  'STABILITY_REDIS', 
  'COMPETENCE_TRUST',
  'GROWTH_RISK',
  'HYBRID_TRANSITION',
  'RESOURCE_EXTRACTION',
];

export default function Compare() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [country1Id, setCountry1Id] = useState<string>(searchParams.get('c1') || '');
  const [country2Id, setCountry2Id] = useState<string>(searchParams.get('c2') || '');
  const [filter1, setFilter1] = useState<string>('all');
  const [filter2, setFilter2] = useState<string>('all');

  const country1 = countries.find(c => c.id === country1Id);
  const country2 = countries.find(c => c.id === country2Id);

  // Filter countries by pyramid type
  const filteredCountries1 = filter1 === 'all' 
    ? countries 
    : countries.filter(c => c.pyramidType === filter1);
  const filteredCountries2 = filter2 === 'all' 
    ? countries 
    : countries.filter(c => c.pyramidType === filter2);

  // Update URL when countries change
  useEffect(() => {
    if (country1Id || country2Id) {
      const params = new URLSearchParams();
      if (country1Id) params.set('c1', country1Id);
      if (country2Id) params.set('c2', country2Id);
      setSearchParams(params, { replace: true });
    }
  }, [country1Id, country2Id, setSearchParams]);

  const swapCountries = () => {
    const temp = country1Id;
    setCountry1Id(country2Id);
    setCountry2Id(temp);
    const tempFilter = filter1;
    setFilter1(filter2);
    setFilter2(tempFilter);
  };

  const shareComparison = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('compare.linkCopied'));
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">
            {t('compare.title')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('compare.subtitle')}
          </p>
        </div>

        {/* Pyramid Type Filters */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('compare.filterByType')}</span>
            <Select value={filter1} onValueChange={(val) => { setFilter1(val); setCountry1Id(''); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('countries.allSystems')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('countries.allSystems')}</SelectItem>
                {ALL_PYRAMID_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[type] || 'primary'}))` }}
                      />
                      {t(PYRAMID_TYPE_LABELS[type])}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:block w-8" />

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('compare.filterByType')}</span>
            <Select value={filter2} onValueChange={(val) => { setFilter2(val); setCountry2Id(''); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('countries.allSystems')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('countries.allSystems')}</SelectItem>
                {ALL_PYRAMID_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[type] || 'primary'}))` }}
                      />
                      {t(PYRAMID_TYPE_LABELS[type])}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Country Selectors */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <Select value={country1Id} onValueChange={setCountry1Id}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t('compare.selectFirst')} />
            </SelectTrigger>
            <SelectContent>
              {filteredCountries1.map((country) => (
                <SelectItem key={country.id} value={country.id} disabled={country.id === country2Id}>
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[country.pyramidType] || 'primary'}))` }}
                    />
                    {getFlagEmoji(country.iso2)} {country.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={swapCountries}
            disabled={!country1Id || !country2Id}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>

          <Select value={country2Id} onValueChange={setCountry2Id}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t('compare.selectSecond')} />
            </SelectTrigger>
            <SelectContent>
              {filteredCountries2.map((country) => (
                <SelectItem key={country.id} value={country.id} disabled={country.id === country1Id}>
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[country.pyramidType] || 'primary'}))` }}
                    />
                    {getFlagEmoji(country.iso2)} {country.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Share Button */}
        {country1 && country2 && (
          <div className="flex justify-center mb-8">
            <Button variant="outline" onClick={shareComparison} className="gap-2">
              <Share2 className="w-4 h-4" />
              {t('compare.shareComparison')}
            </Button>
          </div>
        )}

        {/* Comparison Grid */}
        {country1 && country2 ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <CountryHeader country={country1} />
              </div>
              <div className="flex items-center justify-center">
                <Scale className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <CountryHeader country={country2} />
              </div>
            </div>

            {/* Snapshot Comparison */}
            <ComparisonSection title={t('compare.keyMetrics')}>
              <MetricRow
                label={t('countryDetail.snapshot.gdpPerCapita')}
                value1={`$${country1.snapshot.gdpPerCapita.toLocaleString()}`}
                value2={`$${country2.snapshot.gdpPerCapita.toLocaleString()}`}
                better={country1.snapshot.gdpPerCapita > country2.snapshot.gdpPerCapita ? 1 : 2}
              />
              <MetricRow
                label={t('countryDetail.snapshot.passportRank')}
                value1={`#${country1.snapshot.passportRank}`}
                value2={`#${country2.snapshot.passportRank}`}
                better={country1.snapshot.passportRank < country2.snapshot.passportRank ? 1 : 2}
              />
              <MetricRow
                label={t('countryDetail.snapshot.corruptionIndex')}
                value1={`${100 - country1.snapshot.corruptionIndex}/100`}
                value2={`${100 - country2.snapshot.corruptionIndex}/100`}
                better={country1.snapshot.corruptionIndex > country2.snapshot.corruptionIndex ? 1 : 2}
              />
              <MetricRow
                label={t('countryDetail.snapshot.freedomIndex')}
                value1={`${country1.snapshot.freedomIndex}/100`}
                value2={`${country2.snapshot.freedomIndex}/100`}
                better={country1.snapshot.freedomIndex > country2.snapshot.freedomIndex ? 1 : 2}
              />
            </ComparisonSection>

            {/* Visa & Immigration */}
            <ComparisonSection title={t('compare.visaInfo')} icon={<Plane className="w-5 h-5" />}>
              <MetricRow
                label={t('visa.workVisa')}
                value1={t(`visa.${country1.visa.workVisa}`)}
                value2={t(`visa.${country2.visa.workVisa}`)}
                better={getVisaDifficultyScore(country1.visa.workVisa) < getVisaDifficultyScore(country2.visa.workVisa) ? 1 : 2}
              />
              <MetricRow
                label={t('visa.digitalNomadVisa')}
                value1={country1.visa.digitalNomadVisa ? t('visa.available') : t('visa.notAvailable')}
                value2={country2.visa.digitalNomadVisa ? t('visa.available') : t('visa.notAvailable')}
                better={country1.visa.digitalNomadVisa && !country2.visa.digitalNomadVisa ? 1 : (!country1.visa.digitalNomadVisa && country2.visa.digitalNomadVisa ? 2 : 0)}
              />
              <MetricRow
                label={t('visa.startupVisa')}
                value1={country1.visa.startupVisa ? t('visa.available') : t('visa.notAvailable')}
                value2={country2.visa.startupVisa ? t('visa.available') : t('visa.notAvailable')}
                better={country1.visa.startupVisa && !country2.visa.startupVisa ? 1 : (!country1.visa.startupVisa && country2.visa.startupVisa ? 2 : 0)}
              />
              <MetricRow
                label={t('visa.citizenshipYears')}
                value1={`${country1.visa.citizenshipYears} ${t('common.years')}`}
                value2={`${country2.visa.citizenshipYears} ${t('common.years')}`}
                better={country1.visa.citizenshipYears < country2.visa.citizenshipYears ? 1 : 2}
              />
            </ComparisonSection>

            {/* Cost of Living */}
            <ComparisonSection title={t('compare.costOfLiving')} icon={<DollarSign className="w-5 h-5" />}>
              <MetricRow
                label={t('costOfLiving.index')}
                value1={`${country1.costOfLiving.index}/100`}
                value2={`${country2.costOfLiving.index}/100`}
                better={country1.costOfLiving.index < country2.costOfLiving.index ? 1 : 2}
              />
              <MetricRow
                label={t('costOfLiving.monthlyBudgetSingle')}
                value1={`$${country1.costOfLiving.monthlyBudgetSingle.toLocaleString()}`}
                value2={`$${country2.costOfLiving.monthlyBudgetSingle.toLocaleString()}`}
                better={country1.costOfLiving.monthlyBudgetSingle < country2.costOfLiving.monthlyBudgetSingle ? 1 : 2}
              />
              <MetricRow
                label={t('costOfLiving.monthlyBudgetFamily')}
                value1={`$${country1.costOfLiving.monthlyBudgetFamily.toLocaleString()}`}
                value2={`$${country2.costOfLiving.monthlyBudgetFamily.toLocaleString()}`}
                better={country1.costOfLiving.monthlyBudgetFamily < country2.costOfLiving.monthlyBudgetFamily ? 1 : 2}
              />
              <MetricRow
                label={t('costOfLiving.rentIndex')}
                value1={`${country1.costOfLiving.rentIndex}/100`}
                value2={`${country2.costOfLiving.rentIndex}/100`}
                better={country1.costOfLiving.rentIndex < country2.costOfLiving.rentIndex ? 1 : 2}
              />
            </ComparisonSection>

            {/* Quality of Life */}
            <ComparisonSection title={t('compare.qualityOfLife')} icon={<Heart className="w-5 h-5" />}>
              <MetricRow
                label={t('qualityOfLife.healthcareRank')}
                value1={`#${country1.qualityOfLife.healthcareRank}`}
                value2={`#${country2.qualityOfLife.healthcareRank}`}
                better={country1.qualityOfLife.healthcareRank < country2.qualityOfLife.healthcareRank ? 1 : 2}
              />
              <MetricRow
                label={t('qualityOfLife.safetyIndex')}
                value1={`${country1.qualityOfLife.safetyIndex}/100`}
                value2={`${country2.qualityOfLife.safetyIndex}/100`}
                better={country1.qualityOfLife.safetyIndex > country2.qualityOfLife.safetyIndex ? 1 : 2}
              />
              <MetricRow
                label={t('qualityOfLife.workLifeBalance')}
                value1={`${country1.qualityOfLife.workLifeBalance}/10`}
                value2={`${country2.qualityOfLife.workLifeBalance}/10`}
                better={country1.qualityOfLife.workLifeBalance > country2.qualityOfLife.workLifeBalance ? 1 : 2}
              />
              <MetricRow
                label={t('qualityOfLife.internetSpeed')}
                value1={`${country1.qualityOfLife.internetSpeed} Mbps`}
                value2={`${country2.qualityOfLife.internetSpeed} Mbps`}
                better={country1.qualityOfLife.internetSpeed > country2.qualityOfLife.internetSpeed ? 1 : 2}
              />
            </ComparisonSection>

            {/* Risk Comparison */}
            <ComparisonSection title={t('countryDetail.riskAssessment')}>
              <div className="grid grid-cols-2 gap-8">
                <div className="glass-card rounded-xl p-4">
                  <RiskBars risks={country1.risks} />
                </div>
                <div className="glass-card rounded-xl p-4">
                  <RiskBars risks={country2.risks} />
                </div>
              </div>
            </ComparisonSection>

            {/* System Type */}
            <ComparisonSection title={t('compare.systemType')}>
              <div className="grid grid-cols-2 gap-8">
                <PyramidTypeCard country={country1} />
                <PyramidTypeCard country={country2} />
              </div>
            </ComparisonSection>

            {/* Do / Dont Comparison */}
            <ComparisonSection title={t('compare.strategies')}>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="font-semibold text-risk-low mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" /> {t('playbook.do')}
                    </h4>
                    <ul className="space-y-2">
                      {country1.playbook.do.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="w-3 h-3 text-risk-low mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="font-semibold text-risk-critical mb-3 flex items-center gap-2">
                      <X className="w-4 h-4" /> {t('playbook.dont')}
                    </h4>
                    <ul className="space-y-2">
                      {country1.playbook.dont.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <X className="w-3 h-3 text-risk-critical mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="font-semibold text-risk-low mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" /> {t('playbook.do')}
                    </h4>
                    <ul className="space-y-2">
                      {country2.playbook.do.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="w-3 h-3 text-risk-low mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="font-semibold text-risk-critical mb-3 flex items-center gap-2">
                      <X className="w-4 h-4" /> {t('playbook.dont')}
                    </h4>
                    <ul className="space-y-2">
                      {country2.playbook.dont.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <X className="w-3 h-3 text-risk-critical mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ComparisonSection>

            {/* OVI Suggestions Widget */}
            <OVISuggestionsWidget 
              simulationType="comparison" 
              context={{ countryIds: [country1Id, country2Id] }}
              className="mt-8"
            />
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-xl">
            <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('compare.selectBoth')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getVisaDifficultyScore(difficulty: 'easy' | 'moderate' | 'difficult'): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'moderate': return 2;
    case 'difficult': return 3;
    default: return 2;
  }
}

function CountryHeader({ country }: { country: Country }) {
  const { t } = useTranslation();
  const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType];
  
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="text-5xl mb-3">{getFlagEmoji(country.iso2)}</div>
      <h2 className="font-display text-2xl font-bold mb-2">{country.name}</h2>
      <span
        className="inline-block px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
          color: `hsl(var(--${typeColor}))`,
        }}
      >
        {t(PYRAMID_TYPE_LABELS[country.pyramidType])}
      </span>
      <p className="text-sm text-muted-foreground mt-2">{country.region}</p>
    </div>
  );
}

function ComparisonSection({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function MetricRow({ label, value1, value2, better }: { label: string; value1: string; value2: string; better: 0 | 1 | 2 }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/50">
      <div className={cn('text-right font-semibold', better === 1 && 'text-risk-low')}>
        {value1}
      </div>
      <div className="text-center text-sm text-muted-foreground">{label}</div>
      <div className={cn('text-left font-semibold', better === 2 && 'text-risk-low')}>
        {value2}
      </div>
    </div>
  );
}

function PyramidTypeCard({ country }: { country: Country }) {
  const { t } = useTranslation();
  const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType];
  
  return (
    <div className="glass-card rounded-xl p-6">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: `hsl(var(--${typeColor}) / 0.2)` }}
      >
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: `hsl(var(--${typeColor}))` }}
        />
      </div>
      <h4 className="font-display font-semibold mb-2">{t(PYRAMID_TYPE_LABELS[country.pyramidType])}</h4>
      <p className="text-sm text-muted-foreground italic">&quot;{country.ruleOfGold}&quot;</p>
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
