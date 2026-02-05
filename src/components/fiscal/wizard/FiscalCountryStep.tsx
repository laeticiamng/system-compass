/**
 * Fiscal Country Step - Step 2 of the fiscal calculator wizard
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Search, Check, AlertCircle } from 'lucide-react';
import { useSpecialRegimesMultiple } from '@/hooks/useFiscalData';

interface FiscalCountryStepProps {
  selectedCountries: string[];
  onSelectionChange: (countries: string[]) => void;
}

export function FiscalCountryStep({ selectedCountries, onSelectionChange }: FiscalCountryStepProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  
  // Fetch all countries
  const { data: countries, isLoading } = useQuery({
    queryKey: ['countries-fiscal-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2, region')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch special regimes for selected countries
  const { data: regimes } = useSpecialRegimesMultiple(selectedCountries);
  
  const filteredCountries = countries?.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.iso2.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  const toggleCountry = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      onSelectionChange(selectedCountries.filter(id => id !== countryId));
    } else if (selectedCountries.length < 4) {
      onSelectionChange([...selectedCountries, countryId]);
    }
  };
  
  const getCountryFlag = (iso2: string): string => {
    const flags: Record<string, string> = {
      'FR': '🇫🇷', 'PT': '🇵🇹', 'ES': '🇪🇸', 'CH': '🇨🇭', 'AE': '🇦🇪',
      'SG': '🇸🇬', 'MC': '🇲🇨', 'AD': '🇦🇩', 'MT': '🇲🇹', 'CY': '🇨🇾',
      'LU': '🇱🇺', 'IE': '🇮🇪', 'NL': '🇳🇱', 'BE': '🇧🇪', 'DE': '🇩🇪',
      'IT': '🇮🇹', 'GB': '🇬🇧', 'US': '🇺🇸', 'HK': '🇭🇰', 'JP': '🇯🇵',
      'KR': '🇰🇷', 'TH': '🇹🇭', 'VN': '🇻🇳', 'MY': '🇲🇾', 'ID': '🇮🇩',
      'IN': '🇮🇳', 'MX': '🇲🇽', 'CO': '🇨🇴', 'CR': '🇨🇷', 'CL': '🇨🇱',
      'AR': '🇦🇷', 'BR': '🇧🇷', 'UY': '🇺🇾', 'PL': '🇵🇱', 'CZ': '🇨🇿',
      'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬', 'EE': '🇪🇪', 'HR': '🇭🇷',
      'MA': '🇲🇦', 'ZA': '🇿🇦',
    };
    return flags[iso2] || '🏳️';
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          {t('fiscal.countries.title', 'Sélectionnez 2 à 4 pays à comparer')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('fiscal.countries.description', 'Comparez votre imposition dans différents pays pour identifier la destination fiscale la plus avantageuse.')}
        </p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('fiscal.countries.search', 'Rechercher un pays...')}
          className="pl-10"
        />
      </div>
      
      {/* Selected countries badges */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map(countryId => {
            const country = countries?.find(c => c.id === countryId);
            if (!country) return null;
            return (
              <Badge
                key={countryId}
                variant="secondary"
                className="px-3 py-1.5 cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleCountry(countryId)}
              >
                {getCountryFlag(country.iso2)} {country.name}
                <span className="ml-2 text-muted-foreground">×</span>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Validation message */}
      {selectedCountries.length < 2 && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {t('fiscal.countries.selectMin', 'Sélectionnez au moins 2 pays pour comparer')}
        </div>
      )}
      
      {/* Country list */}
      <ScrollArea className="h-[300px] border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="p-2">
            {filteredCountries.map(country => {
              const isSelected = selectedCountries.includes(country.id);
              const countryRegimes = regimes?.[country.id] || [];
              
              return (
                <div
                  key={country.id}
                  onClick={() => toggleCountry(country.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCountry(country.id)}
                    disabled={!isSelected && selectedCountries.length >= 4}
                  />
                  
                  <span className="text-2xl">{getCountryFlag(country.iso2)}</span>
                  
                  <div className="flex-1">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-xs text-muted-foreground">{country.region}</div>
                  </div>
                  
                  {countryRegimes.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {countryRegimes.length} régime{countryRegimes.length > 1 ? 's' : ''} spécial
                    </Badge>
                  )}
                  
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
