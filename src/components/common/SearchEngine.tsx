/**
 * SearchEngine - Global search across all modules
 * Addresses: "Recherche globale sous-exploitée" from audit
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useCountries } from '@/lib/countries-store';
import { useSavedCountries } from '@/components/common/SavedCountriesButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Globe, Key, Calculator, Filter, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'country' | 'tool' | 'content' | 'guide';
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
  priority: number;
}

interface GlobalSearchProps {
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showResults?: boolean;
}

export function GlobalSearch({ 
  className, 
  onResultSelect, 
  placeholder,
  showResults = true 
}: GlobalSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { savedIds } = useSavedCountries();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // Build searchable content
  const searchableContent = useMemo(() => {
    const results: SearchResult[] = [];

    // Countries
    countries.forEach(country => {
      results.push({
        id: `country-${country.id}`,
        type: 'country',
        title: country.name,
        description: `${country.region} • ${country.pyramidType}`,
        href: `/countries/${country.id}`,
        icon: <Globe className="w-4 h-4" />,
        keywords: [country.name, country.nameLocal, country.region, country.pyramidType].filter(Boolean) as string[],
        priority: savedIds.includes(country.id) ? 10 : 5,
      });
    });

    // Tools
    const tools = [
      {
        id: 'exit-keys',
        type: 'tool' as const,
        title: 'Stratégies',
        description: 'Stratégies personnalisées d\'expatriation',
        href: '/exit-keys',
        icon: <Key className="w-4 h-4" />,
        keywords: ['strategie', 'expatriation', 'visa', 'résidence', 'sortie'],
        priority: 8,
      },
      {
        id: 'compare',
        type: 'tool' as const,
        title: 'Comparateur de pays',
        description: 'Comparer jusqu\'à 4 pays simultanément',
        href: '/compare',
        icon: <Calculator className="w-4 h-4" />,
        keywords: ['comparaison', 'compare', 'versus', 'difference'],
        priority: 7,
      },
      {
        id: 'prevention-filter',
        type: 'tool' as const,
        title: 'Filtre de Prévention',
        description: 'Analyse des risques avant décision',
        href: '/prevention-filter',
        icon: <Filter className="w-4 h-4" />,
        keywords: ['risque', 'decision', 'prevention', 'analyse'],
        priority: 6,
      },
      {
        id: 'life-game',
        type: 'tool' as const,
        title: 'Jeu de la Vie',
        description: 'Simulation interactive des systèmes',
        href: '/life-game',
        icon: <Users className="w-4 h-4" />,
        keywords: ['simulation', 'jeu', 'apprentissage', 'systeme'],
        priority: 6,
      },
      {
        id: 'financial-intel',
        type: 'tool' as const,
        title: 'Financial Safety Intel',
        description: 'Détecter les arnaques financières',
        href: '/financial-safety-intel',
        icon: <FileText className="w-4 h-4" />,
        keywords: ['finance', 'arnaque', 'sécurité', 'investissement'],
        priority: 7,
      },
    ];

    results.push(...tools);

    return results;
  }, [countries, savedIds]);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase().trim();
    
    return searchableContent
      .filter(item => {
        const searchText = [
          item.title,
          item.description,
          ...item.keywords
        ].join(' ').toLowerCase();
        
        return searchText.includes(lowerQuery);
      })
      .sort((a, b) => {
        // Exact title matches first
        if (a.title.toLowerCase().includes(lowerQuery) && !b.title.toLowerCase().includes(lowerQuery)) {
          return -1;
        }
        if (!a.title.toLowerCase().includes(lowerQuery) && b.title.toLowerCase().includes(lowerQuery)) {
          return 1;
        }
        
        // Then by priority
        return b.priority - a.priority;
      })
      .slice(0, 6);
  }, [query, searchableContent]);

  const handleSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      navigate(result.href);
    }
    setQuery('');
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredResults.length > 0) {
      handleSelect(filteredResults[0]);
    }
    if (e.key === 'Escape') {
      setQuery('');
      setFocused(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            // Delay to allow clicking on results
            setTimeout(() => {
              if (!e.currentTarget.contains(document.activeElement)) {
                setFocused(false);
              }
            }, 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('search.placeholder', 'Rechercher pays, outils...')}
          className="pl-10 pr-4"
        />
      </div>

      {/* Results dropdown */}
      {showResults && focused && filteredResults.length > 0 && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border-primary/20">
          <CardContent className="p-2">
            {filteredResults.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left",
                  index === 0 && "bg-primary/5"
                )}
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-muted/50">
                  {result.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{result.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.description}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            {query.length > 2 && filteredResults.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun résultat pour "{query}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook to manage global search state
export function useGlobalSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches
    try {
      const stored = localStorage.getItem('pyramid_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }

    // Keyboard shortcut to open search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToRecentSearches = (query: string) => {
    if (query.trim().length < 2) return;
    
    const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('pyramid_recent_searches', JSON.stringify(updated));
  };

  return {
    isSearchOpen,
    setIsSearchOpen,
    recentSearches,
    addToRecentSearches,
  };
}

// Full-screen search modal (to be integrated in Header)
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { recentSearches, addToRecentSearches } = useGlobalSearch();
  
  if (!open) return null;

  const handleResultSelect = (result: SearchResult) => {
    addToRecentSearches(result.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
      <Card className="w-full max-w-2xl mx-4 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            {t('search.title', 'Recherche globale')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('search.shortcut', 'Raccourci: Cmd/Ctrl + K')}
          </p>
        </CardHeader>
        <CardContent>
          <GlobalSearch 
            onResultSelect={handleResultSelect}
            placeholder={t('search.placeholder', 'Tapez pour rechercher...')}
          />
          
          {recentSearches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {t('search.recent', 'Recherches récentes')}
              </p>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      // Re-trigger search with this term
                      const event = new Event('input', { bubbles: true });
                      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (searchInput) {
                        searchInput.value = search;
                        searchInput.dispatchEvent(event);
                      }
                    }}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}