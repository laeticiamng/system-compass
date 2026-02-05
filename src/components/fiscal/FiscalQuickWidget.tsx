/**
 * Fiscal Quick Widget - Quick tax estimation on country detail pages
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, ArrowRight, TrendingDown } from 'lucide-react';

import { useFiscalRules } from '@/hooks/useFiscalData';
import { calculateCountryTax, formatCurrency, formatPercent, DEFAULT_TAX_RULES } from '@/lib/fiscalEngine';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface FiscalQuickWidgetProps {
  countryId: string;
  countryName: string;
}

export function FiscalQuickWidget({ countryId, countryName }: FiscalQuickWidgetProps) {
  const { t } = useTranslation();
  const [grossIncome, setGrossIncome] = useState(50000);
  
  const { data: rules, isLoading } = useFiscalRules(countryId);
  
  // Calculate quick estimate
  const result = useMemo(() => {
    let effectiveRules = rules || [];
    
    // Use default rules if no database rules
    if (effectiveRules.length === 0 && DEFAULT_TAX_RULES[countryId]) {
      const defaultRule = DEFAULT_TAX_RULES[countryId];
      effectiveRules = [
        {
          id: 'default-income',
          country_id: countryId,
          rule_type: 'income_tax',
          brackets: defaultRule.incomeTax,
          deductions: {},
          currency: countryId === 'switzerland' ? 'CHF' : 'EUR',
          notes_i18n: {},
          source_url: null,
          valid_from: new Date().toISOString(),
          valid_to: null,
        },
        {
          id: 'default-social',
          country_id: countryId,
          rule_type: 'social_contributions',
          brackets: [{ min: 0, max: null, rate: defaultRule.socialRate }],
          deductions: {},
          currency: countryId === 'switzerland' ? 'CHF' : 'EUR',
          notes_i18n: {},
          source_url: null,
          valid_from: new Date().toISOString(),
          valid_to: null,
        },
      ];
    }
    
    if (effectiveRules.length === 0) return null;
    
    return calculateCountryTax(
      { status: 'single', children: 0, incomeType: 'salary', grossIncome },
      effectiveRules,
      countryId,
      countryName
    );
  }, [rules, grossIncome, countryId, countryName]);
  
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          {t('fiscal.widget.title', 'Simulez votre impôt en')} {countryName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            {t('fiscal.widget.grossIncome', 'Revenu brut annuel')}
          </label>
          <div className="flex gap-3 items-center">
            <Slider
              value={[grossIncome]}
              onValueChange={([v]) => setGrossIncome(v)}
              min={20000}
              max={300000}
              step={5000}
              className="flex-1"
            />
            <Input
              type="number"
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value) || 0)}
              className="w-28"
            />
          </div>
        </div>
        
        {result ? (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">{t('fiscal.widget.netIncome', 'Revenu net estimé')}</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(result.netIncome, result.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('fiscal.widget.effectiveRate', 'Taux effectif')}</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                {formatPercent(result.effectiveRate)}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg">
            {t('fiscal.widget.noData', 'Données fiscales non disponibles pour ce pays')}
          </div>
        )}
        
        <SimulationDisclaimer variant="inline" />
        
        <Button asChild className="w-full">
          <Link to="/tools/fiscal-calculator">
            {t('fiscal.widget.fullCalculator', 'Calculateur complet')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
