import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { CountryCard } from '@/components/CountryCard';
import { PyramidType, Country } from '@/lib/types';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, X, ArrowUpDown } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

type SortOption = 'name-asc' | 'name-desc' | 'risk-asc' | 'risk-desc' | 'cost-asc' | 'cost-desc';

const calculateAverageRisk = (country: Country): number => {
  const { risks } = country;
  return (risks.legal + risks.safety + risks.corruption + risks.volatility + risks.bureaucracy) / 5;
};

const getCostOfLiving = (country: Country): number => {
  return country.costOfLiving?.monthlyBudgetSingle ?? 0;
};

export default function Countries() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<PyramidType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedCountries = useMemo(() => {
    let result = [...countries];
    
    // Filter by pyramid type
    if (filter !== 'all') {
      result = result.filter(c => c.pyramidType === filter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.nameLocal?.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'risk-asc':
          return calculateAverageRisk(a) - calculateAverageRisk(b);
        case 'risk-desc':
          return calculateAverageRisk(b) - calculateAverageRisk(a);
        case 'cost-asc':
          return getCostOfLiving(a) - getCostOfLiving(b);
        case 'cost-desc':
          return getCostOfLiving(b) - getCostOfLiving(a);
        default:
          return 0;
      }
    });
    
    return result;
  }, [filter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedCountries.length / ITEMS_PER_PAGE);
  
  const paginatedCountries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedCountries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedCountries, currentPage]);

  // Reset to page 1 when filter, search, or sort changes
  const handleFilterChange = (newFilter: PyramidType | 'all') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

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

        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('countries.searchPlaceholder', 'Rechercher un pays...')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterButton
            active={filter === 'all'}
            onClick={() => handleFilterChange('all')}
          >
            {t('countries.allSystems')}
          </FilterButton>
          {pyramidTypes.map((type) => (
            <FilterButton
              key={type.key}
              active={filter === type.key}
              onClick={() => handleFilterChange(type.key)}
              colorClass={type.color}
            >
              {t(type.labelKey)}
            </FilterButton>
          ))}
        </div>

        {/* Sort and Results */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedCountries.length} {t('countries.results', { count: filteredAndSortedCountries.length })}
          </div>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">{t('countries.sort.nameAsc', 'Nom (A-Z)')}</SelectItem>
                <SelectItem value="name-desc">{t('countries.sort.nameDesc', 'Nom (Z-A)')}</SelectItem>
                <SelectItem value="risk-asc">{t('countries.sort.riskAsc', 'Risque (↑)')}</SelectItem>
                <SelectItem value="risk-desc">{t('countries.sort.riskDesc', 'Risque (↓)')}</SelectItem>
                <SelectItem value="cost-asc">{t('countries.sort.costAsc', 'Coût de vie (↑)')}</SelectItem>
                <SelectItem value="cost-desc">{t('countries.sort.costDesc', 'Coût de vie (↓)')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Countries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>

        {filteredAndSortedCountries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            {t('countries.noResults')}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  );
                }
                // Show ellipsis for gaps
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
