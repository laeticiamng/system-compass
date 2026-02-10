import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Languages, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Globe2,
  ChevronRight
} from 'lucide-react';

// Import all locale files
import frTranslations from '@/locales/fr.json';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';
import esTranslations from '@/locales/es.json';
import itTranslations from '@/locales/it.json';
import nlTranslations from '@/locales/nl.json';
import ptTranslations from '@/locales/pt.json';

type LocaleData = Record<string, unknown>;

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', data: frTranslations },
  { code: 'en', name: 'English', flag: '🇬🇧', data: enTranslations },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', data: deTranslations },
  { code: 'es', name: 'Español', flag: '🇪🇸', data: esTranslations },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', data: itTranslations },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', data: nlTranslations },
  { code: 'pt', name: 'Português', flag: '🇵🇹', data: ptTranslations },
];

// Helper to flatten nested object keys
function flattenKeys(obj: LocaleData, prefix = ''): string[] {
  return Object.entries(obj).reduce((acc: string[], [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return [...acc, ...flattenKeys(value as LocaleData, newKey)];
    }
    return [...acc, newKey];
  }, []);
}

// Get value from nested object by dot-separated path
function getNestedValue(obj: LocaleData, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export default function AdminTranslations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Use French as the reference (most complete)
  const referenceKeys = useMemo(() => flattenKeys(frTranslations), []);

  // Calculate stats for each language
  const languageStats = useMemo(() => {
    return LANGUAGES.map(lang => {
      const langKeys = flattenKeys(lang.data);
      const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
      const extraKeys = langKeys.filter(key => !referenceKeys.includes(key));
      const presentKeys = referenceKeys.filter(key => langKeys.includes(key));
      
      return {
        ...lang,
        totalKeys: referenceKeys.length,
        presentCount: presentKeys.length,
        missingCount: missingKeys.length,
        extraCount: extraKeys.length,
        missingKeys,
        extraKeys,
        percentage: Math.round((presentKeys.length / referenceKeys.length) * 100),
      };
    });
  }, [referenceKeys]);

  // Filter missing keys based on search
  const filteredMissingKeys = useMemo(() => {
    if (!selectedLanguage) return [];
    const langStat = languageStats.find(l => l.code === selectedLanguage);
    if (!langStat) return [];
    
    if (!searchQuery) return langStat.missingKeys;
    return langStat.missingKeys.filter(key => 
      key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedLanguage, searchQuery, languageStats]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalPossible = referenceKeys.length * (LANGUAGES.length - 1); // Exclude reference
    const totalPresent = languageStats
      .filter(l => l.code !== 'fr')
      .reduce((sum, l) => sum + l.presentCount, 0);
    
    return {
      totalKeys: referenceKeys.length,
      totalLanguages: LANGUAGES.length,
      overallPercentage: Math.round((totalPresent / totalPossible) * 100),
      fullyTranslated: languageStats.filter(l => l.missingCount === 0).length,
    };
  }, [languageStats, referenceKeys]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-500';
    if (percentage >= 80) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Languages className="w-8 h-8 text-primary" />
              Administration des traductions
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualisez et gérez les traductions manquantes dans l'application
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Référence: Français (FR)
          </Badge>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clés totales</p>
                  <p className="text-3xl font-bold">{overallStats.totalKeys}</p>
                </div>
                <Globe2 className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Langues</p>
                  <p className="text-3xl font-bold">{overallStats.totalLanguages}</p>
                </div>
                <Languages className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Couverture globale</p>
                  <p className={`text-3xl font-bold ${getStatusColor(overallStats.overallPercentage)}`}>
                    {overallStats.overallPercentage}%
                  </p>
                </div>
                <CheckCircle2 className={`w-8 h-8 ${getStatusColor(overallStats.overallPercentage)}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">100% complètes</p>
                  <p className="text-3xl font-bold">{overallStats.fullyTranslated}/{overallStats.totalLanguages}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="details">Détails par langue</TabsTrigger>
            <TabsTrigger value="search">Recherche de clés</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languageStats.map(lang => (
                <Card 
                  key={lang.code} 
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedLanguage === lang.code ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-2xl">{lang.flag}</span>
                        {lang.name}
                      </CardTitle>
                      <Badge variant={lang.code === 'fr' ? 'default' : 'outline'}>
                        {lang.code.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className={`font-medium ${getStatusColor(lang.percentage)}`}>
                          {lang.percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={lang.percentage} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {lang.presentCount} présentes
                        </span>
                        {lang.missingCount > 0 && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <AlertTriangle className="w-3 h-3" />
                            {lang.missingCount} manquantes
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Language List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Sélectionner une langue</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {languageStats.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`w-full flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors ${
                          selectedLanguage === lang.code ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lang.flag}</span>
                          <div className="text-left">
                            <p className="font-medium">{lang.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {lang.missingCount} clés manquantes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={lang.percentage === 100 ? 'default' : 'secondary'}
                            className={lang.percentage === 100 ? 'bg-green-500' : ''}
                          >
                            {lang.percentage}%
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Missing Keys List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedLanguage 
                          ? `Clés manquantes (${languageStats.find(l => l.code === selectedLanguage)?.name})`
                          : 'Sélectionnez une langue'
                        }
                      </CardTitle>
                      <CardDescription>
                        {selectedLanguage && (
                          <span>
                            {filteredMissingKeys.length} clés à traduire
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {selectedLanguage && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Rechercher..." 
                          className="pl-9 w-[200px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedLanguage ? (
                    <ScrollArea className="h-[400px]">
                      {filteredMissingKeys.length > 0 ? (
                        <div className="space-y-2">
                          {filteredMissingKeys.map(key => {
                            const frValue = getNestedValue(frTranslations, key);
                            return (
                              <div 
                                key={key} 
                                className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <code className="text-xs text-primary font-mono break-all">
                                      {key}
                                    </code>
                                    <p className="text-sm text-muted-foreground mt-1 truncate">
                                      FR: {typeof frValue === 'string' ? frValue : JSON.stringify(frValue)}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="shrink-0 text-orange-500 border-orange-500/50">
                                    Manquante
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                          <p className="text-lg font-medium">Toutes les clés sont traduites !</p>
                          <p className="text-sm text-muted-foreground">
                            Cette langue est complète à 100%
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                      <Languages className="w-12 h-12 mb-4 opacity-50" />
                      <p>Sélectionnez une langue dans la liste de gauche pour voir les clés manquantes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Recherche de clés de traduction</CardTitle>
                <CardDescription>
                  Recherchez une clé pour voir son statut dans toutes les langues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher une clé (ex: nav.countries, hero.title1)..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {searchQuery && (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {referenceKeys
                        .filter(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 50)
                        .map(key => {
                          const frValue = getNestedValue(frTranslations, key);
                          return (
                            <div key={key} className="p-4 rounded-lg border">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <code className="text-sm text-primary font-mono break-all">
                                  {key}
                                </code>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-2 rounded">
                                <span className="font-medium">FR:</span> {typeof frValue === 'string' ? frValue : JSON.stringify(frValue)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {languageStats.map(lang => {
                                  const hasKey = !lang.missingKeys.includes(key);
                                  return (
                                    <Badge 
                                      key={lang.code}
                                      variant={hasKey ? 'default' : 'outline'}
                                      className={hasKey ? 'bg-green-500' : 'text-orange-500 border-orange-500/50'}
                                    >
                                      {lang.flag} {lang.code.toUpperCase()}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                )}

                {!searchQuery && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                    <Search className="w-12 h-12 mb-4 opacity-50" />
                    <p>Entrez un terme de recherche pour trouver des clés de traduction</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
