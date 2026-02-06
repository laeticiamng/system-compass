import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Globe, Key, BookOpen, AlertTriangle, Map, X, Command } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { EXIT_KEYS } from '@/lib/exit-keys-engine';
import { UNIVERSAL_ERRORS } from '@/lib/universal-errors-data';
import { DB_COMPLETE_COUNTRY_IDS, EXTENDED_COUNTRY_META } from '@/lib/countries-extended';

interface SearchResult {
  type: 'country' | 'exit_key' | 'error' | 'page';
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  path: string;
  score: number;
}

export function GlobalSearch() {
  const { t } = useTranslation();

  const PAGES = [
    { id: 'about', title: t('search.page.about', 'À propos & Orientation'), path: '/about', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'world-map', title: t('search.page.worldMap', 'Carte mondiale'), path: '/world-map', icon: <Globe className="w-4 h-4" /> },
    { id: 'prevention-filter', title: t('search.page.preventionFilter', 'Filtre de prévention'), path: '/prevention-filter', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'compare', title: t('search.page.compare', 'Comparer des pays'), path: '/compare', icon: <Map className="w-4 h-4" /> },
    { id: 'pyramid-types', title: t('search.page.pyramidTypes', 'Types de pyramides'), path: '/pyramid-types', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'life-game', title: t('search.page.lifeGame', 'Jeu de vie'), path: '/life-game', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'dashboard', title: t('search.page.dashboard', 'Tableau de bord'), path: '/dashboard', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'errors-illusions', title: t('search.page.errorsIllusions', 'Erreurs & Illusions'), path: '/errors-illusions', icon: <AlertTriangle className="w-4 h-4" /> },
  ];
  const navigate = useNavigate();
  const { countries } = useCountries();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search countries
    const allCountries = [
      ...countries,
      ...Object.entries(EXTENDED_COUNTRY_META)
        .filter(([id]) => !countries.find(c => c.id === id))
        .map(([id, meta]) => ({
          id,
          name: meta.name,
          nameLocal: meta.nameLocal,
          region: meta.region,
          pyramidType: meta.pyramidType,
        })),
    ];

    allCountries.forEach(country => {
      const nameMatch = country.name.toLowerCase().includes(q);
      const localMatch = country.nameLocal?.toLowerCase().includes(q);
      const regionMatch = country.region.toLowerCase().includes(q);
      
      if (nameMatch || localMatch || regionMatch) {
        const score = nameMatch ? 100 : localMatch ? 90 : 50;
        results.push({
          type: 'country',
          id: country.id,
          title: country.nameLocal || country.name,
          subtitle: `${country.region} • ${country.pyramidType}`,
          icon: <Globe className="w-4 h-4 text-blue-500" />,
          path: `/country/${country.id}`,
          score: score + (DB_COMPLETE_COUNTRY_IDS.includes(country.id as any) ? 20 : 0),
        });
      }
    });

    // Search exit keys
    EXIT_KEYS.forEach(key => {
      const nameMatch = key.id.toLowerCase().includes(q);
      const labelMatch = t(`exitKeys.${key.id}.label`, key.id).toLowerCase().includes(q);
      
      if (nameMatch || labelMatch) {
        results.push({
          type: 'exit_key',
          id: key.id,
          title: t(`exitKeys.${key.id}.label`, key.id),
          subtitle: `${key.steps.length} phases`,
          icon: <Key className="w-4 h-4 text-amber-500" />,
          path: `/exit-keys/catalog#${key.id}`,
          score: labelMatch ? 80 : 60,
        });
      }
    });

    // Search universal errors
    UNIVERSAL_ERRORS.forEach(error => {
      const nameMatch = error.id.toLowerCase().includes(q);
      const titleMatch = t(`universalErrors.${error.id}.title`, error.id).toLowerCase().includes(q);
      
      if (nameMatch || titleMatch) {
        results.push({
          type: 'error',
          id: error.id,
          title: t(`universalErrors.${error.id}.title`, error.id),
          subtitle: t('universalErrors.title'),
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          path: `/universal-errors/${error.id}`,
          score: titleMatch ? 70 : 50,
        });
      }
    });

    // Search pages
    PAGES.forEach(page => {
      if (page.title.toLowerCase().includes(q) || page.id.includes(q)) {
        results.push({
          type: 'page',
          id: page.id,
          title: page.title,
          subtitle: 'Page',
          icon: page.icon,
          path: page.path,
          score: 40,
        });
      }
    });

    // Sort by score
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [countries, query, t]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'country': return t('search.typeCountry', 'Pays');
      case 'exit_key': return t('search.typeExitKey', 'Clé de sortie');
      case 'error': return t('search.typeError', 'Erreur');
      case 'page': return t('search.typePage', 'Page');
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">{t('search.placeholder', 'Rechercher...')}</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border text-xs">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Search dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 gap-0">
          <DialogHeader className="p-4 pb-0 sr-only">
            <DialogTitle>{t('search.title', 'Recherche globale')}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('search.inputPlaceholder', 'Rechercher un pays, une clé de sortie, une erreur...')}
              className="border-0 shadow-none focus-visible:ring-0 text-base"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-auto p-2">
            {query.trim() === '' ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('search.startTyping', 'Commencez à taper pour rechercher')}
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('search.noResults', 'Aucun résultat trouvé')}
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      "hover:bg-muted focus:bg-muted focus:outline-none"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(result.type)}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>{t('search.hint', 'Utilisez ↑↓ pour naviguer, Entrée pour sélectionner')}</span>
            <span>ESC {t('search.close', 'pour fermer')}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
