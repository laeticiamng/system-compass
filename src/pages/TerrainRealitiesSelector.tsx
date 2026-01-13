import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Map, Search, ArrowRight, AlertTriangle, HeartPulse, Scale, Shield, Building2 } from 'lucide-react';
import { useCountries } from '@/lib/countries-store';
import { useTerrainHistory } from '@/hooks/useTerrainHistory';

export default function TerrainRealitiesSelector() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { history } = useTerrainHistory();
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const recentCountries = history.slice(0, 5);

  const handleSelectCountry = (countryId: string) => {
    navigate(`/terrain/${countryId}`);
  };

  const getRiskColor = (level?: string) => {
    if (level === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (level === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (level === 'low') return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Map className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t('terrainRealities.title', 'Réalités Terrain')}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            {t('terrainRealities.selectorSubtitle', 'Données vérifiées sur les risques sanitaires, juridiques, sécuritaires et administratifs par pays.')}
          </p>
        </div>

        {/* What it covers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
            <HeartPulse className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <p className="text-xs font-medium">{t('terrainRealities.healthcare', 'Santé')}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
            <Scale className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs font-medium">{t('terrainRealities.justice', 'Justice')}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
            <Shield className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xs font-medium">{t('terrainRealities.security', 'Sécurité')}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
            <Building2 className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xs font-medium">{t('terrainRealities.administration', 'Admin')}</p>
          </div>
        </div>

        {/* Recent history */}
        {recentCountries.length > 0 && (
          <Card className="mb-6 bg-card/50 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                {t('terrainRealities.recentAnalyses', 'Analyses récentes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentCountries.map((item) => (
                  <Button
                    key={item.countryId}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleSelectCountry(item.countryId)}
                  >
                    <Badge variant="outline" className={`text-xs ${getRiskColor(item.riskLevel)}`}>
                      {item.riskLevel || '?'}
                    </Badge>
                    {item.countryName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Country selector */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('terrainRealities.selectCountry', 'Sélectionner un pays')}
            </CardTitle>
            <CardDescription>
              {t('terrainRealities.selectCountryDesc', 'Choisissez un pays pour obtenir son analyse terrain détaillée.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.searchCountry', 'Rechercher un pays...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <ScrollArea className="h-[300px] pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCountries.map((country) => (
                    <Button
                      key={country.id}
                      variant="ghost"
                      className="justify-between h-auto py-3 px-4 hover:bg-primary/10"
                      onClick={() => handleSelectCountry(country.id)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🌍</span>
                        <span>{country.name}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
