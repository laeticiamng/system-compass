import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Globe, Filter, TrendingUp, Shield, Search, BarChart3, Layers, Info } from 'lucide-react';
import { WorldMap } from '@/components/WorldMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { countries } from '@/lib/countries-data';
import { DB_COMPLETE_COUNTRY_IDS, EXTENDED_COUNTRY_META } from '@/lib/countries-extended';
import { cn } from '@/lib/utils';

const PYRAMID_TYPES = [
  { id: 'all', label: 'Tous les types', color: 'bg-gray-500' },
  { id: 'PROBLEM_RENT', label: 'Problème-Rente', color: 'bg-orange-500' },
  { id: 'STABILITY_REDIS', label: 'Stabilité-Redis', color: 'bg-blue-500' },
  { id: 'COMPETENCE_TRUST', label: 'Compétence-Confiance', color: 'bg-emerald-500' },
  { id: 'GROWTH_RISK', label: 'Croissance-Risque', color: 'bg-amber-500' },
  { id: 'HYBRID_TRANSITION', label: 'Hybride-Transition', color: 'bg-purple-500' },
  { id: 'RESOURCE_EXTRACTION', label: 'Extraction-Ressources', color: 'bg-red-500' },
];

const REGIONS = [
  { id: 'all', label: 'Toutes les régions' },
  { id: 'europe', label: 'Europe' },
  { id: 'americas', label: 'Amériques' },
  { id: 'asia', label: 'Asie' },
  { id: 'africa', label: 'Afrique' },
  { id: 'oceania', label: 'Océanie' },
  { id: 'middle_east', label: 'Moyen-Orient' },
];

export default function WorldMapExplorer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [pyramidFilter, setPyramidFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine all countries
  const allCountries = useMemo(() => {
    const fromData = countries.map(c => ({
      id: c.id,
      name: c.name,
      nameLocal: c.nameLocal,
      pyramidType: c.pyramidType,
      region: c.region,
      hasIntelligence: DB_COMPLETE_COUNTRY_IDS.includes(c.id as any),
    }));

    const fromExtended = Object.entries(EXTENDED_COUNTRY_META)
      .filter(([id]) => !fromData.find(c => c.id === id))
      .map(([id, meta]) => ({
        id,
        name: meta.name,
        nameLocal: meta.nameLocal,
        pyramidType: meta.pyramidType,
        region: meta.region,
        hasIntelligence: true,
      }));

    return [...fromData, ...fromExtended];
  }, []);

  // Filter countries
  const filteredCountries = useMemo(() => {
    return allCountries.filter(c => {
      if (pyramidFilter !== 'all' && c.pyramidType !== pyramidFilter) return false;
      if (regionFilter !== 'all' && !c.region.toLowerCase().includes(regionFilter)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!c.name.toLowerCase().includes(query) && 
            !c.nameLocal?.toLowerCase().includes(query) &&
            !c.region.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [allCountries, pyramidFilter, regionFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const byPyramid = allCountries.reduce((acc, c) => {
      acc[c.pyramidType] = (acc[c.pyramidType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const withIntelligence = allCountries.filter(c => c.hasIntelligence).length;

    return { byPyramid, withIntelligence, total: allCountries.length };
  }, [allCountries]);

  const selectedCountryData = selectedCountry 
    ? allCountries.find(c => c.id === selectedCountry) 
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            {t('worldMap.badge', 'Exploration mondiale')}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('worldMap.title', 'Carte des Systèmes')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('worldMap.subtitle', 'Explorez visuellement les {{count}} pays analysés et leurs types de pyramides', { count: stats.total })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('worldMap.stats.total', 'Pays analysés')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-emerald-500 mb-1">{stats.withIntelligence}</div>
              <div className="text-sm text-muted-foreground">{t('worldMap.stats.intelligence', 'Intelligence Layer')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-amber-500 mb-1">{PYRAMID_TYPES.length - 1}</div>
              <div className="text-sm text-muted-foreground">{t('worldMap.stats.pyramids', 'Types de pyramides')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-1">13</div>
              <div className="text-sm text-muted-foreground">{t('worldMap.stats.languages', 'Langues')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('worldMap.search', 'Rechercher un pays...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select value={pyramidFilter} onValueChange={setPyramidFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type de pyramide" />
              </SelectTrigger>
              <SelectContent>
                {PYRAMID_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", type.color)} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px]">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region.id} value={region.id}>{region.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="text-sm">
              {filteredCountries.length} {t('worldMap.results', 'pays')}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="map" className="gap-2">
              <Globe className="w-4 h-4" />
              {t('worldMap.tabs.map', 'Carte')}
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('worldMap.tabs.stats', 'Statistiques')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <WorldMap
              onSelectCountry={setSelectedCountry}
              selectedCountryId={selectedCountry || undefined}
              highlightCountries={filteredCountries.map(c => c.id)}
              showLegend={true}
              interactive={true}
            />

            {/* Selected country panel */}
            {selectedCountryData && (
              <Card className="mt-6 border-2 border-primary/30 animate-in fade-in slide-in-from-bottom-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{getFlagEmoji(selectedCountryData.id)}</span>
                      <div>
                        <div className="font-bold">{selectedCountryData.nameLocal || selectedCountryData.name}</div>
                        <div className="text-sm text-muted-foreground font-normal">{selectedCountryData.region}</div>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {selectedCountryData.hasIntelligence && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Intelligence
                        </Badge>
                      )}
                      <Button onClick={() => navigate(`/country/${selectedCountryData.id}`)}>
                        {t('worldMap.viewDetails', 'Voir les détails')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        PYRAMID_TYPES.find(p => p.id === selectedCountryData.pyramidType)?.color,
                        "text-white border-none"
                      )}
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      {PYRAMID_TYPES.find(p => p.id === selectedCountryData.pyramidType)?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pyramid distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    {t('worldMap.pyramidDistribution', 'Distribution par type')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PYRAMID_TYPES.filter(p => p.id !== 'all').map(type => {
                    const count = stats.byPyramid[type.id] || 0;
                    const percentage = (count / stats.total) * 100;
                    return (
                      <div key={type.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", type.color)} />
                            {type.label}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all", type.color)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Country list */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t('worldMap.countryList', 'Liste des pays')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-auto space-y-2">
                    {filteredCountries.map(country => (
                      <button
                        key={country.id}
                        onClick={() => {
                          setSelectedCountry(country.id);
                          navigate(`/country/${country.id}`);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getFlagEmoji(country.id)}</span>
                          <div>
                            <div className="font-medium">{country.nameLocal || country.name}</div>
                            <div className="text-xs text-muted-foreground">{country.region}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {country.hasIntelligence && (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            PYRAMID_TYPES.find(p => p.id === country.pyramidType)?.color
                          )} />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('worldMap.info.title', 'Comment lire la carte ?')}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('worldMap.info.colors', 'Les couleurs représentent les types de pyramides')}</li>
                  <li>• {t('worldMap.info.size', 'Les points plus grands indiquent des pays avec Intelligence Layer')}</li>
                  <li>• {t('worldMap.info.click', 'Cliquez sur un pays pour voir ses détails')}</li>
                  <li>• {t('worldMap.info.zoom', 'Utilisez les contrôles pour zoomer et naviguer')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper to get flag emoji from country ID
function getFlagEmoji(countryId: string): string {
  const ISO_MAP: Record<string, string> = {
    france: 'FR', germany: 'DE', switzerland: 'CH', usa: 'US', canada: 'CA',
    japan: 'JP', china: 'CN', india: 'IN', brazil: 'BR', australia: 'AU',
    singapore: 'SG', uae: 'AE', netherlands: 'NL', portugal: 'PT',
    cameroon: 'CM', senegal: 'SN', morocco: 'MA', nigeria: 'NG',
    'ivory-coast': 'CI', drc: 'CD', russia: 'RU', argentina: 'AR',
    austria: 'AT', belgium: 'BE', chile: 'CL', colombia: 'CO',
    cuba: 'CU', denmark: 'DK', italy: 'IT', mexico: 'MX',
    peru: 'PE', poland: 'PL', spain: 'ES', sweden: 'SE',
    'south-africa': 'ZA', 'united-kingdom': 'GB',
  };
  
  const iso2 = ISO_MAP[countryId] || countryId.toUpperCase().slice(0, 2);
  const codePoints = iso2.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
