import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCountries } from '@/lib/countries-data';
import { EXTENDED_COUNTRY_META } from '@/lib/countries-extended';
import { CountryCard } from '@/components/CountryCard';
import { PyramidType, Country } from '@/lib/types';
import { useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, X, ArrowUpDown, Database, Globe, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useSavedCountries } from '@/components/common/SavedCountriesButton';

const ITEMS_PER_PAGE = 12;

type SortOption = 'name-asc' | 'name-desc' | 'risk-asc' | 'risk-desc' | 'cost-asc' | 'cost-desc';

// Extended country card for DB-only countries
interface ExtendedCountryInfo {
  id: string;
  name: string;
  nameLocal: string;
  iso2: string;
  region: string;
  pyramidType: string;
  isExtended: true;
}

const calculateAverageRisk = (country: Country): number => {
  const { risks } = country;
  return (risks.legal + risks.safety + risks.corruption + risks.volatility + risks.bureaucracy) / 5;
};

const getCostOfLiving = (country: Country): number => {
  return country.costOfLiving?.monthlyBudgetSingle ?? 0;
};

// Convert extended countries to a displayable format
const extendedCountries: ExtendedCountryInfo[] = Object.entries(EXTENDED_COUNTRY_META).map(([id, meta]) => ({
  id,
  name: meta.name,
  nameLocal: meta.nameLocal,
  iso2: meta.iso2,
  region: meta.region,
  pyramidType: meta.pyramidType,
  isExtended: true as const,
}));

// Animated section wrapper
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Countries() {
  const { t, i18n } = useTranslation();
  const { countries, isLoading, error } = useCountries();
  const { savedIds } = useSavedCountries();
  const [filter, setFilter] = useState<PyramidType | 'all' | 'extended' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to get all translated country names for universal search across languages
  const getTranslatedNames = useCallback((country: Country | ExtendedCountryInfo): string[] => {
    const countryId = country.id?.toLowerCase() || '';
    if (!countryId) return [];
    
    // Search across all main languages for universal matching
    const languages = ['en', 'fr', 'es', 'de', 'pt', 'it', 'nl'];
    const names: string[] = [];
    
    for (const lang of languages) {
      const name = i18n.getResource(lang, 'translation', `countriesData.${countryId}.name`);
      if (name && typeof name === 'string') {
        names.push(name.toLowerCase());
      }
    }
    
    return names;
  }, [i18n]);

  const filteredAndSortedCountries = useMemo(() => {
    // When showing saved countries
    if (filter === 'saved') {
      let result = countries.filter(c => savedIds.includes(c.id));
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.nameLocal?.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query) ||
          getTranslatedNames(c).some(name => name.includes(query))
        );
      }
      
      result.sort((a, b) => {
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name, i18n.language, { sensitivity: 'base' });
        return a.name.localeCompare(b.name, i18n.language, { sensitivity: 'base' });
      });
      
      return result;
    }

    // When showing extended only
    if (filter === 'extended') {
      let result = [...extendedCountries];
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.nameLocal?.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query) ||
          getTranslatedNames(c).some(name => name.includes(query))
        );
      }
      
      // Sort extended countries by name only
      result.sort((a, b) => {
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name, i18n.language, { sensitivity: 'base' });
        return a.name.localeCompare(b.name, i18n.language, { sensitivity: 'base' });
      });
      
      return result;
    }

    // Regular countries
    let result = [...countries];
    
    // Filter by pyramid type
    if (filter !== 'all') {
      result = result.filter(c => c.pyramidType === filter);
    }
    
    // Filter by search query (including translated names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.nameLocal?.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query) ||
        getTranslatedNames(c).some(name => name.includes(query))
      );
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, i18n.language, { sensitivity: 'base' });
        case 'name-desc':
          return b.name.localeCompare(a.name, i18n.language, { sensitivity: 'base' });
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
  }, [countries, filter, searchQuery, sortBy, savedIds, i18n.language, getTranslatedNames]);

  const totalPages = Math.ceil(filteredAndSortedCountries.length / ITEMS_PER_PAGE);
  
  const paginatedCountries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedCountries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedCountries, currentPage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <EmptyState
            icon={AlertCircle}
            title={t('common.error', 'Erreur')}
            description={t('countries.loadError', 'Impossible de charger les pays. Veuillez réessayer.')}
            action={{
              label: t('common.retry', 'Réessayer'),
              onClick: () => window.location.reload(),
            }}
          />
        </div>
      </div>
    );
  }

  // Reset to page 1 when filter, search, or sort changes
  const handleFilterChange = (newFilter: PyramidType | 'all' | 'extended') => {
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
    { key: 'HYBRID_TRANSITION', labelKey: 'pyramids.hybridTransition.label', color: 'pyramid-hybrid' },
    { key: 'RESOURCE_EXTRACTION', labelKey: 'pyramids.resourceExtraction.label', color: 'pyramid-resource' },
  ];

  const isShowingExtended = filter === 'extended';

  return (
    <>
      <Helmet>
        <title>Explorer les pays - Pyramid Compass | 44 systèmes analysés</title>
        <meta name="description" content="Explorez 44 pays avec leurs systèmes analysés en profondeur. Comparez les pyramides, risques et opportunités. Trouvez le pays qui correspond à votre profil." />
        <meta property="og:title" content="Explorer les pays - Pyramid Compass" />
        <meta property="og:description" content="44 pays analysés avec leurs systèmes, risques et opportunités. Trouvez votre destination idéale." />
        <meta property="og:url" content="https://world-alignment.lovable.app/countries" />
        <meta name="twitter:title" content="Explorer les pays - Pyramid Compass" />
        <meta name="twitter:description" content="44 pays analysés avec leurs systèmes, risques et opportunités. Trouvez votre destination idéale." />
        <link rel="canonical" href="https://world-alignment.lovable.app/countries" />
      </Helmet>
      <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--pyramid-stability) / 0.08) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center mb-12">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {t('countries.badge', '{{count}} systèmes analysés', { count: countries.length + extendedCountries.length })}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              >
                <span className="block text-foreground">{t('countries.heroTitle1', 'Explore les règles')}</span>
                <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  {t('countries.heroTitle2', 'de chaque système.')}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                {t('countries.heroSubtitle', 'Chaque pays fonctionne selon sa propre logique. Découvre les mécanismes cachés.')}
              </motion.p>
            </div>
          </AnimatedSection>

          {/* Search Bar - Centered and prominent */}
          <AnimatedSection className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('countries.searchPlaceholder', 'Rechercher un pays...')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 pr-12 h-14 text-base rounded-full bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
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
            <FilterButton
              active={filter === 'extended'}
              onClick={() => handleFilterChange('extended')}
              colorClass="chart-4"
            >
              <Database className="w-3 h-3 mr-1" />
              {t('countries.extendedDb', '+15 pays')}
            </FilterButton>
          </div>

          {/* Sort and Results */}
          <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredAndSortedCountries.length}</span> {t('countries.results', { count: filteredAndSortedCountries.length })}
              {isShowingExtended && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-chart-4/20 text-chart-4 rounded-full">
                  {t('countries.dbOnly', 'Couverture étendue')}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
                <SelectTrigger className="w-[180px] rounded-full bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">{t('countries.sort.nameAsc', 'Nom (A-Z)')}</SelectItem>
                  <SelectItem value="name-desc">{t('countries.sort.nameDesc', 'Nom (Z-A)')}</SelectItem>
                  {!isShowingExtended && (
                    <>
                      <SelectItem value="risk-asc">{t('countries.sort.riskAsc', 'Risque (↑)')}</SelectItem>
                      <SelectItem value="risk-desc">{t('countries.sort.riskDesc', 'Risque (↓)')}</SelectItem>
                      <SelectItem value="cost-asc">{t('countries.sort.costAsc', 'Coût de vie (↑)')}</SelectItem>
                      <SelectItem value="cost-desc">{t('countries.sort.costDesc', 'Coût de vie (↓)')}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isShowingExtended ? (
              (paginatedCountries as ExtendedCountryInfo[]).map((country, index) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <ExtendedCountryCard country={country} />
                </motion.div>
              ))
            ) : (
              (paginatedCountries as Country[]).map((country, index) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <CountryCard country={country} />
                </motion.div>
              ))
            )}
          </div>

          {filteredAndSortedCountries.length === 0 && (
            <EmptyState
              icon={Globe}
              title={t('countries.noResults', 'Aucun résultat')}
              description={t('countries.noResultsDesc', 'Aucun pays ne correspond à vos critères de recherche.')}
              action={{
                label: t('common.reset', 'Réinitialiser'),
                onClick: () => {
                  setSearchQuery('');
                  setFilter('all');
                },
                variant: 'outline',
              }}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-16">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => setCurrentPage(page)}
                        className="w-12 rounded-full"
                      >
                        {page}
                      </Button>
                    );
                  }
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
                size="lg"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </section>
      </div>
    </>
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
        'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center',
        active
          ? colorClass
            ? `bg-${colorClass}/20 text-${colorClass} border border-${colorClass}/30`
            : 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-background text-muted-foreground hover:text-foreground border border-border/50 hover:border-border'
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

function ExtendedCountryCard({ country }: { country: ExtendedCountryInfo }) {
  const { t } = useTranslation();
  
  const PYRAMID_TYPE_COLORS: Record<string, string> = {
    PROBLEM_RENT: 'pyramid-rent',
    STABILITY_REDIS: 'pyramid-stability',
    COMPETENCE_TRUST: 'pyramid-competence',
    GROWTH_RISK: 'pyramid-growth',
    HYBRID_TRANSITION: 'pyramid-hybrid',
    RESOURCE_EXTRACTION: 'pyramid-resource',
  };

  const PYRAMID_TYPE_LABELS: Record<string, string> = {
    PROBLEM_RENT: 'pyramids.problemRent.label',
    STABILITY_REDIS: 'pyramids.stabilityRedis.label',
    COMPETENCE_TRUST: 'pyramids.competenceTrust.label',
    GROWTH_RISK: 'pyramids.growthRisk.label',
    HYBRID_TRANSITION: 'pyramids.hybridTransition.label',
    RESOURCE_EXTRACTION: 'pyramids.resourceExtraction.label',
  };

  const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType] || 'pyramid-hybrid';
  const typeLabel = t(PYRAMID_TYPE_LABELS[country.pyramidType] || 'pyramids.hybridTransition.label');

  const getFlagEmoji = (iso2: string): string => {
    const codePoints = iso2.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Link
      to={`/country/${country.id}`}
      className="block p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] group"
    >
      {/* DB badge */}
      <div className="flex justify-end mb-3">
        <span className="text-xs px-2.5 py-1 bg-chart-4/20 text-chart-4 rounded-full flex items-center gap-1.5">
          <Database className="w-3 h-3" />
          DB
        </span>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <span className="text-4xl">{getFlagEmoji(country.iso2)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">
            {country.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{country.region}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
            color: `hsl(var(--${typeColor}))`,
          }}
        >
          {typeLabel}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('countries.intelligenceAvailable', 'Intelligence Layer disponible')}
      </p>
    </Link>
  );
}
