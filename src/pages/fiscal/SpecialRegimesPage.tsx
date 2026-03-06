/**
 * Special Regimes Page - Catalogue of tax-advantaged regimes
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, Filter, Clock, ExternalLink, CheckCircle2, AlertTriangle, 
  Briefcase, Building2, Wallet, Users, MapPin, Star 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LocalizedLink as Link } from '@/components/i18n';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface SpecialRegime {
  id: string;
  country_id: string;
  regime_name: string;
  conditions: Record<string, string>;
  benefits: Record<string, string>;
  duration_years: number | null;
  application_deadline: string | null;
  is_active: boolean;
  description_i18n: Record<string, string>;
  source_url: string | null;
}

interface CountryInfo {
  id: string;
  name: string;
  iso2: string;
}

// Profile types for regime matching
const PROFILE_TYPES = [
  { id: 'all', label: 'Tous les profils', icon: Users },
  { id: 'employee', label: 'Salarié expatrié', icon: Briefcase },
  { id: 'entrepreneur', label: 'Entrepreneur', icon: Building2 },
  { id: 'investor', label: 'Investisseur/Rentier', icon: Wallet },
  { id: 'retiree', label: 'Retraité', icon: Users },
];

export default function SpecialRegimesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  
  // Fetch all special regimes
  const { data: regimes, isLoading } = useQuery({
    queryKey: ['all-special-regimes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_special_regimes')
        .select('*')
        .eq('is_active', true)
        .order('regime_name');
      
      if (error) throw error;
      return data as SpecialRegime[];
    },
  });
  
  // Fetch country info
  const { data: countries } = useQuery({
    queryKey: ['countries-for-regimes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2, region');
      
      if (error) throw error;
      return data as (CountryInfo & { region: string })[];
    },
  });
  
  // Create lookup maps
  const countryMap = useMemo(() => {
    const map: Record<string, CountryInfo & { region: string }> = {};
    countries?.forEach(c => { map[c.id] = c; });
    return map;
  }, [countries]);
  
  // Filter regimes
  const filteredRegimes = useMemo(() => {
    if (!regimes) return [];
    
    return regimes.filter(regime => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || 
        regime.regime_name.toLowerCase().includes(searchLower) ||
        countryMap[regime.country_id]?.name.toLowerCase().includes(searchLower);
      
      // Region filter
      const matchesRegion = regionFilter === 'all' || 
        countryMap[regime.country_id]?.region === regionFilter;
      
      // Profile filter (simplified matching based on regime characteristics)
      let matchesProfile = profileFilter === 'all';
      if (!matchesProfile) {
        const benefitsStr = JSON.stringify(regime.benefits).toLowerCase();
        const conditionsStr = JSON.stringify(regime.conditions).toLowerCase();
        
        switch (profileFilter) {
          case 'employee':
            matchesProfile = benefitsStr.includes('salari') || conditionsStr.includes('employ');
            break;
          case 'entrepreneur':
            matchesProfile = benefitsStr.includes('socié') || benefitsStr.includes('corporate');
            break;
          case 'investor':
            matchesProfile = benefitsStr.includes('dividend') || benefitsStr.includes('plus-value');
            break;
          case 'retiree':
            matchesProfile = benefitsStr.includes('retrait') || benefitsStr.includes('pension');
            break;
        }
      }
      
      return matchesSearch && matchesRegion && matchesProfile;
    });
  }, [regimes, search, regionFilter, profileFilter, countryMap]);
  
  // Get unique regions
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    countries?.forEach(c => regionSet.add(c.region));
    return Array.from(regionSet).sort();
  }, [countries]);
  
  const getFlagEmoji = (iso2: string): string => {
    const flags: Record<string, string> = {
      'FR': '🇫🇷', 'PT': '🇵🇹', 'ES': '🇪🇸', 'CH': '🇨🇭', 'AE': '🇦🇪',
      'SG': '🇸🇬', 'MC': '🇲🇨', 'AD': '🇦🇩', 'MT': '🇲🇹', 'CY': '🇨🇾',
      'LU': '🇱🇺', 'IE': '🇮🇪', 'NL': '🇳🇱', 'BE': '🇧🇪', 'DE': '🇩🇪',
      'IT': '🇮🇹', 'GB': '🇬🇧', 'US': '🇺🇸', 'GR': '🇬🇷',
    };
    return flags[iso2] || '🏳️';
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('specialRegimes.title', 'Régimes Fiscaux Spéciaux')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('specialRegimes.subtitle', 'Découvrez les régimes fiscaux avantageux pour les expatriés, investisseurs et retraités à travers le monde.')}
        </p>
      </div>
      
      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('specialRegimes.searchPlaceholder', 'Rechercher un régime ou pays...')}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Profil" />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_TYPES.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredRegimes.length} {t('specialRegimes.resultsCount', 'régime(s) trouvé(s)')}
        </p>
        <Button variant="outline" asChild>
          <Link to="/tools/fiscal-calculator">
            {t('specialRegimes.goToCalculator', 'Calculateur fiscal')}
          </Link>
        </Button>
      </div>
      
      {/* Regimes list */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRegimes.map((regime, index) => {
            const country = countryMap[regime.country_id];
            
            return (
              <motion.div
                key={regime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {country ? getFlagEmoji(country.iso2) : '🏳️'}
                        </span>
                        <div>
                          <CardTitle className="text-lg">{regime.regime_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{country?.name}</p>
                        </div>
                      </div>
                      {regime.duration_years && (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {regime.duration_years} ans
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {regime.description_i18n[lang] || regime.description_i18n['fr'] || regime.description_i18n['en']}
                    </p>
                    
                    <Accordion type="single" collapsible>
                      <AccordionItem value="conditions" className="border-0">
                        <AccordionTrigger className="text-sm py-2">
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Conditions d'éligibilité
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            {Object.entries(regime.conditions).map(([key, value]) => (
                              <li key={key} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 mt-1 text-muted-foreground shrink-0" />
                                <span>{value}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="benefits" className="border-0">
                        <AccordionTrigger className="text-sm py-2">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            Avantages fiscaux
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            {Object.entries(regime.benefits).map(([key, value]) => (
                              <li key={key} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 mt-1 text-primary shrink-0" />
                                <span>{value}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {regime.source_url && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <Button variant="ghost" size="sm" asChild className="w-full">
                          <a href={regime.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Source officielle
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* CTA and Disclaimer */}
      <div className="mt-12 space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t('specialRegimes.cta.title', 'Quel régime pour votre profil ?')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('specialRegimes.cta.description', 'Utilisez notre calculateur pour comparer les régimes fiscaux selon votre situation.')}
                </p>
              </div>
              <Button asChild>
                <Link to="/tools/fiscal-calculator">
                  {t('specialRegimes.cta.button', 'Comparer maintenant')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <SimulationDisclaimer variant="prominent" />
      </div>
    </div>
  );
}
