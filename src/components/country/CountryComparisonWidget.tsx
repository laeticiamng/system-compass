/**
 * CountryComparisonWidget - Quick comparison widget for dashboard
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Globe } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/i18n';

interface Country {
  id: string;
  name: string;
  iso2: string;
  pyramid_type: string;
}

export function CountryComparisonWidget() {
  const { t } = useTranslation();
  const [country1, setCountry1] = useState<string>('');
  const [country2, setCountry2] = useState<string>('');
  
  const { data: countries = [] } = useQuery({
    queryKey: ['countries-list-widget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2, pyramid_type')
        .order('name');
      if (error) throw error;
      return data as Country[];
    },
  });
  
  const selectedCountries = countries.filter(c => c.id === country1 || c.id === country2);
  
  const getScoreForCountry = (countryId: string) => {
    // Simulated scores - in production would come from actual data
    const scores: Record<string, number> = {
      'france': 72,
      'portugal': 85,
      'spain': 78,
      'uae': 88,
      'singapore': 92,
    };
    return scores[countryId] || Math.floor(Math.random() * 30) + 60;
  };
  
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          {t('dashboard.quickCompare', 'Comparaison rapide')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Select value={country1} onValueChange={setCountry1}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Pays 1" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Select value={country2} onValueChange={setCountry2}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Pays 2" />
              </SelectTrigger>
              <SelectContent>
                {countries.filter(c => c.id !== country1).map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {country1 && country2 && (
          <div className="space-y-3 pt-2">
            {selectedCountries.map((country) => {
              const score = getScoreForCountry(country.id);
              const isHigher = score >= 80;
              
              return (
                <div key={country.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{country.name}</span>
                    <Badge variant={isHigher ? 'default' : 'secondary'} className="text-xs">
                      {score}%
                    </Badge>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              );
            })}
            
            <Button asChild variant="outline" size="sm" className="w-full mt-3">
              <Link to={`/compare?countries=${country1},${country2}`}>
                {t('dashboard.viewFullComparison', 'Voir la comparaison complète')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
        
        {(!country1 || !country2) && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t('dashboard.selectCountries', 'Sélectionnez deux pays pour les comparer')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
