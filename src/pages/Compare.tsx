import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RiskBars } from '@/components/RiskBars';
import { cn } from '@/lib/utils';
import { ArrowLeftRight, Check, X, MapPin, TrendingUp, Users, Shield, Scale } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PYRAMID_TYPE_LABELS: Record<string, string> = {
  PROBLEM_RENT: 'pyramids.problemRent.label',
  STABILITY_REDIS: 'pyramids.stabilityRedis.label',
  COMPETENCE_TRUST: 'pyramids.competenceTrust.label',
  GROWTH_RISK: 'pyramids.growthRisk.label',
};

const PYRAMID_TYPE_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'pyramid-rent',
  STABILITY_REDIS: 'pyramid-stability',
  COMPETENCE_TRUST: 'pyramid-competence',
  GROWTH_RISK: 'pyramid-growth',
};

export default function Compare() {
  const { t } = useTranslation();
  const [country1Id, setCountry1Id] = useState<string>('');
  const [country2Id, setCountry2Id] = useState<string>('');

  const country1 = countries.find(c => c.id === country1Id);
  const country2 = countries.find(c => c.id === country2Id);

  const swapCountries = () => {
    const temp = country1Id;
    setCountry1Id(country2Id);
    setCountry2Id(temp);
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

        {/* Country Selectors */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          <Select value={country1Id} onValueChange={setCountry1Id}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t('compare.selectFirst')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id} disabled={country.id === country2Id}>
                  {getFlagEmoji(country.iso2)} {country.name}
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
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id} disabled={country.id === country1Id}>
                  {getFlagEmoji(country.iso2)} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                value1={`${country1.snapshot.corruptionIndex}/100`}
                value2={`${country2.snapshot.corruptionIndex}/100`}
                better={country1.snapshot.corruptionIndex > country2.snapshot.corruptionIndex ? 1 : 2}
              />
              <MetricRow
                label={t('countryDetail.snapshot.freedomIndex')}
                value1={`${country1.snapshot.freedomIndex}/100`}
                value2={`${country2.snapshot.freedomIndex}/100`}
                better={country1.snapshot.freedomIndex > country2.snapshot.freedomIndex ? 1 : 2}
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

function ComparisonSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xl font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function MetricRow({ label, value1, value2, better }: { label: string; value1: string; value2: string; better: 1 | 2 }) {
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
