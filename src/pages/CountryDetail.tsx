import { useParams, useNavigate } from 'react-router-dom';
import { getCountryById } from '@/lib/countries-data';
import { PYRAMID_TYPE_INFO } from '@/lib/types';
import { PyramidVisualization } from '@/components/PyramidVisualization';
import { RiskBars } from '@/components/RiskBars';
import { RuleOfGoldBanner } from '@/components/RuleOfGoldBanner';
import { WhoWinsWhoLoses } from '@/components/WhoWinsWhoLoses';
import { PlaybookSection } from '@/components/PlaybookSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';

export default function CountryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const country = getCountryById(id || '');

  if (!country) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Country not found</h1>
          <Button onClick={() => navigate('/countries')}>Back to Countries</Button>
        </div>
      </div>
    );
  }

  const typeInfo = PYRAMID_TYPE_INFO[country.pyramidType];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/countries')}
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Countries
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-12">
          <div className="text-6xl">{getFlagEmoji(country.iso2)}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-4xl font-bold">{country.name}</h1>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `hsl(var(--${typeInfo.color}) / 0.15)`,
                  color: `hsl(var(--${typeInfo.color}))`,
                }}
              >
                {typeInfo.label}
              </span>
            </div>
            <p className="text-muted-foreground">{country.region}</p>
          </div>
        </div>

        {/* Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <SnapshotCard label="GDP/Capita" value={`$${country.snapshot.gdpPerCapita.toLocaleString()}`} />
          <SnapshotCard label="Population" value={formatPopulation(country.snapshot.population)} />
          <SnapshotCard label="Passport Rank" value={`#${country.snapshot.passportRank}`} />
          <SnapshotCard label="Corruption Index" value={`${country.snapshot.corruptionIndex}/100`} />
          <SnapshotCard label="Freedom Index" value={`${country.snapshot.freedomIndex}/100`} />
        </div>

        {/* Rule of Gold */}
        <RuleOfGoldBanner rule={country.ruleOfGold} className="mb-12" />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Pyramid */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">System Pyramid</h2>
            <PyramidVisualization country={country} />
          </div>

          {/* Risk Assessment */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Risk Assessment</h2>
            <div className="glass-card rounded-xl p-6">
              <RiskBars risks={country.risks} />
            </div>
          </div>
        </div>

        {/* Who Wins / Who Loses */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Who Wins / Who Loses</h2>
          <WhoWinsWhoLoses wins={country.whoWins} loses={country.whoLoses} />
        </div>

        {/* Playbook */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Survival Playbook</h2>
          <PlaybookSection playbook={country.playbook} />
        </div>

        {/* Sources */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Sources & Updates</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Last updated: {country.lastUpdated}
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
