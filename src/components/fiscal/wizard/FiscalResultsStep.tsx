/**
 * Fiscal Results Step - Step 3 of the fiscal calculator wizard
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Star, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

import { useFiscalRulesMultiple, useSpecialRegimesMultiple } from '@/hooks/useFiscalData';
import { calculateCountryTax, formatCurrency, formatPercent, DEFAULT_TAX_RULES, type TaxProfile, type TaxCalculationResult } from '@/lib/fiscalEngine';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface FiscalResultsStepProps {
  profile: TaxProfile;
  selectedCountries: string[];
}



export function FiscalResultsStep({ profile, selectedCountries }: FiscalResultsStepProps) {
  const { t } = useTranslation();
  
  // Fetch country names
  const { data: countries } = useQuery({
    queryKey: ['countries-names', selectedCountries],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2')
        .in('id', selectedCountries);
      
      if (error) throw error;
      return data;
    },
    enabled: selectedCountries.length > 0,
  });
  
  // Fetch fiscal rules
  const { data: rulesMap, isLoading: rulesLoading } = useFiscalRulesMultiple(selectedCountries);
  
  // Fetch special regimes
  const { data: regimesMap } = useSpecialRegimesMultiple(selectedCountries);
  
  // Calculate results for each country
  const results = useMemo(() => {
    if (!countries || !rulesMap) return [];
    
    const calculations: TaxCalculationResult[] = [];
    
    for (const country of countries) {
      let rules = rulesMap[country.id] || [];
      
      // Use default rules if no database rules
      if (rules.length === 0 && DEFAULT_TAX_RULES[country.id]) {
        const defaultRule = DEFAULT_TAX_RULES[country.id];
        rules = [
          {
            id: 'default-income',
            country_id: country.id,
            rule_type: 'income_tax',
            brackets: defaultRule.incomeTax,
            deductions: {},
            currency: country.id === 'switzerland' ? 'CHF' : 'EUR',
            notes_i18n: {},
            source_url: null,
            valid_from: new Date().toISOString(),
            valid_to: null,
          },
          {
            id: 'default-social',
            country_id: country.id,
            rule_type: 'social_contributions',
            brackets: [{ min: 0, max: null, rate: defaultRule.socialRate }],
            deductions: {},
            currency: country.id === 'switzerland' ? 'CHF' : 'EUR',
            notes_i18n: {},
            source_url: null,
            valid_from: new Date().toISOString(),
            valid_to: null,
          },
        ];
      }
      
      const result = calculateCountryTax(profile, rules, country.id, country.name);
      result.hasSpecialRegimes = (regimesMap?.[country.id]?.length || 0) > 0;
      calculations.push(result);
    }
    
    // Sort by effective rate (lowest first)
    return calculations.sort((a, b) => a.effectiveRate - b.effectiveRate);
  }, [countries, rulesMap, regimesMap, profile]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    return results.map(r => ({
      name: r.countryName,
      incomeTax: Math.round(r.incomeTax),
      socialContributions: Math.round(r.socialContributions),
      wealthTax: Math.round(r.wealthTax),
      netIncome: Math.round(r.netIncome),
    }));
  }, [results]);
  
  if (rulesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }
  
  const bestCountry = results[0];
  const worstCountry = results[results.length - 1];
  const savings = worstCountry && bestCountry
    ? worstCountry.totalTax - bestCountry.totalTax
    : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('fiscal.results.title', 'Comparaison de votre imposition')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('fiscal.results.subtitle', 'Pour un revenu brut de')} <strong>{formatCurrency(profile.grossIncome)}</strong>
        </p>
      </div>
      
      {/* Key insight */}
      {savings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
        >
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-700">
                {t('fiscal.results.savings', 'Économie potentielle :')} {formatCurrency(savings)}/an
              </p>
              <p className="text-sm text-muted-foreground">
                {t('fiscal.results.savingsDesc', 'En choisissant')} {bestCountry?.countryName} {t('fiscal.results.instead', 'plutôt que')} {worstCountry?.countryName}
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Stacked bar chart */}
      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar dataKey="incomeTax" name={t('fiscal.incomeTax', 'Impôt sur le revenu')} stackId="a" fill="hsl(var(--destructive))" />
              <Bar dataKey="socialContributions" name={t('fiscal.socialContributions', 'Cotisations sociales')} stackId="a" fill="hsl(var(--chart-4))" />
              <Bar dataKey="wealthTax" name={t('fiscal.wealthTax', 'Impôt fortune')} stackId="a" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Country cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result, index) => (
          <motion.div
            key={result.countryId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={index === 0 ? 'border-emerald-500/50 bg-emerald-500/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {result.countryName}
                      {index === 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-600 border-0">
                          <Star className="w-3 h-3 mr-1" />
                          {t('fiscal.results.mostFavorable', 'Plus favorable')}
                        </Badge>
                      )}
                    </h4>
                    {result.hasSpecialRegimes && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        <Info className="w-3 h-3 mr-1" />
                        {t('fiscal.results.hasRegimes', 'Régimes spéciaux disponibles')}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatPercent(result.effectiveRate)}</p>
                    <p className="text-xs text-muted-foreground">{t('fiscal.results.effectiveRate', 'Taux effectif')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('fiscal.results.grossIncome', 'Brut')}</p>
                    <p className="font-medium">{formatCurrency(result.grossIncome, result.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('fiscal.results.netIncome', 'Net')}</p>
                    <p className="font-medium text-primary">{formatCurrency(result.netIncome, result.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('fiscal.results.totalTax', 'Total impôts')}</p>
                    <p className="font-medium text-destructive">{formatCurrency(result.totalTax, result.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('fiscal.results.marginalRate', 'Taux marginal')}</p>
                    <p className="font-medium">{formatPercent(result.marginalRate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Disclaimer */}
      <SimulationDisclaimer variant="contextual" context="results" />
    </div>
  );
}
