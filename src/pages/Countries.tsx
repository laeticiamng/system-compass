import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { CountryCard } from '@/components/CountryCard';
import { PyramidType } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Countries() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<PyramidType | 'all'>('all');

  const filteredCountries = filter === 'all' 
    ? countries 
    : countries.filter(c => c.pyramidType === filter);

  const pyramidTypes: { key: PyramidType; labelKey: string; color: string }[] = [
    { key: 'PROBLEM_RENT', labelKey: 'pyramids.problemRent.label', color: 'pyramid-rent' },
    { key: 'STABILITY_REDIS', labelKey: 'pyramids.stabilityRedis.label', color: 'pyramid-stability' },
    { key: 'COMPETENCE_TRUST', labelKey: 'pyramids.competenceTrust.label', color: 'pyramid-competence' },
    { key: 'GROWTH_RISK', labelKey: 'pyramids.growthRisk.label', color: 'pyramid-growth' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">
            {t('countries.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('countries.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {t('countries.allSystems')}
          </FilterButton>
          {pyramidTypes.map((type) => (
            <FilterButton
              key={type.key}
              active={filter === type.key}
              onClick={() => setFilter(type.key)}
              colorClass={type.color}
            >
              {t(type.labelKey)}
            </FilterButton>
          ))}
        </div>

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            {t('countries.noResults')}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  colorClass,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
        active
          ? colorClass
            ? `bg-${colorClass}/20 text-${colorClass} border border-${colorClass}/30`
            : 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
      )}
      style={
        active && colorClass
          ? {
              backgroundColor: `hsl(var(--${colorClass}) / 0.15)`,
              color: `hsl(var(--${colorClass}))`,
              borderColor: `hsl(var(--${colorClass}) / 0.3)`,
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}
