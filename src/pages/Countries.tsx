import { countries } from '@/lib/countries-data';
import { CountryCard } from '@/components/CountryCard';
import { PYRAMID_TYPE_INFO, PyramidType } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Countries() {
  const [filter, setFilter] = useState<PyramidType | 'all'>('all');

  const filteredCountries = filter === 'all' 
    ? countries 
    : countries.filter(c => c.pyramidType === filter);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">
            Country Intelligence
          </h1>
          <p className="text-muted-foreground">
            Deep analysis of national systems. Understand what each country 
            really rewards, the risks, and your strategic options.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All Systems
          </FilterButton>
          {(Object.entries(PYRAMID_TYPE_INFO) as [PyramidType, typeof PYRAMID_TYPE_INFO[PyramidType]][]).map(
            ([key, info]) => (
              <FilterButton
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
                colorClass={info.color}
              >
                {info.label}
              </FilterButton>
            )
          )}
        </div>

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No countries match this filter.
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
