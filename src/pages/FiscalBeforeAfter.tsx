/**
 * Fiscal Before/After Comparison Page
 * Visual "France vs Destination" with animated delta
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountries } from '@/lib/countries-data';
import { useFiscalRulesMultiple } from '@/hooks/useFiscalData';
import { calculateCountryTax, formatCurrency, formatPercent, DEFAULT_TAX_RULES, type TaxProfile, type TaxCalculationResult } from '@/lib/fiscalEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  Wallet,
  PiggyBank,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ORIGIN_COUNTRY = 'france';

export default function FiscalBeforeAfter() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [destinationId, setDestinationId] = useState('');
  const [grossIncome, setGrossIncome] = useState(60000);

  const profile: TaxProfile = {
    status: 'single',
    children: 0,
    incomeType: 'salary',
    grossIncome,
  };

  const countryIds = useMemo(
    () => (destinationId ? [ORIGIN_COUNTRY, destinationId] : [ORIGIN_COUNTRY]),
    [destinationId]
  );

  const { data: countryNames } = useQuery({
    queryKey: ['country-names-ba', countryIds],
    queryFn: async () => {
      const { data } = await supabase
        .from('countries')
        .select('id, name')
        .in('id', countryIds);
      return data || [];
    },
    enabled: countryIds.length > 0,
  });

  const { data: rulesMap } = useFiscalRulesMultiple(countryIds);

  const results = useMemo(() => {
    if (!rulesMap || !countryNames) return null;

    const calc = (cId: string): TaxCalculationResult | null => {
      let rules = rulesMap[cId] || [];
      if (rules.length === 0 && DEFAULT_TAX_RULES[cId]) {
        const dr = DEFAULT_TAX_RULES[cId];
        rules = [
          { id: 'd-inc', country_id: cId, rule_type: 'income_tax', brackets: dr.incomeTax, deductions: {}, currency: 'EUR', notes_i18n: {}, source_url: null, valid_from: new Date().toISOString(), valid_to: null },
          { id: 'd-soc', country_id: cId, rule_type: 'social_contributions', brackets: [{ min: 0, max: null, rate: dr.socialRate }], deductions: {}, currency: 'EUR', notes_i18n: {}, source_url: null, valid_from: new Date().toISOString(), valid_to: null },
        ] as any;
      }
      if (rules.length === 0) return null;
      const name = countryNames.find((c) => c.id === cId)?.name || cId;
      return calculateCountryTax(profile, rules, cId, name);
    };

    const origin = calc(ORIGIN_COUNTRY);
    const dest = destinationId ? calc(destinationId) : null;
    return { origin, dest };
  }, [rulesMap, countryNames, profile, destinationId]);

  const delta = results?.origin && results?.dest
    ? {
        netMonthly: (results.dest.netIncome - results.origin.netIncome) / 12,
        netAnnual: results.dest.netIncome - results.origin.netIncome,
        rateDelta: results.dest.effectiveRate - results.origin.effectiveRate,
      }
    : null;

  const sortedCountries = useMemo(
    () => [...countries].filter((c) => c.id !== ORIGIN_COUNTRY).sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );

  return (
    <>
      <Helmet>
        <title>{t('beforeAfter.seoTitle', 'Avant/Après Fiscal | System Compass')}</title>
        <meta name="description" content={t('beforeAfter.seoDesc', 'Comparez votre salaire net entre la France et votre pays de destination. Visualisez le delta mensuel en un coup d\'œil.')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="relative py-14 sm:py-18 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="outline" className="mb-4 gap-2">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {t('beforeAfter.badge', 'Comparaison visuelle instantanée')}
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="block text-foreground">{t('beforeAfter.heroTitle1', 'Avant / Après')}</span>
                <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  {t('beforeAfter.heroTitle2', 'votre expatriation fiscale.')}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('beforeAfter.heroSubtitle', 'Visualisez en un coup d\'œil combien vous gagnez (ou perdez) en changeant de pays.')}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          {/* Controls */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t('beforeAfter.grossIncome', 'Revenu brut annuel (€)')}
                  </Label>
                  <Input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(Number(e.target.value) || 0)}
                    min={0}
                    step={5000}
                    className="text-lg font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t('beforeAfter.destination', 'Pays de destination')}
                  </Label>
                  <Select value={destinationId} onValueChange={setDestinationId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('beforeAfter.selectCountry', 'Choisir un pays...')} />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedCountries.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison cards */}
          {results?.origin && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Origin - France */}
              <ResultCard
                result={results.origin}
                label={t('beforeAfter.before', 'AVANT')}
                sublabel={t('beforeAfter.currentSituation', 'Situation actuelle')}
                variant="origin"
              />

              {/* Destination */}
              {results.dest ? (
                <ResultCard
                  result={results.dest}
                  label={t('beforeAfter.after', 'APRÈS')}
                  sublabel={t('beforeAfter.newSituation', 'Nouvelle situation')}
                  variant="destination"
                />
              ) : (
                <Card className="flex items-center justify-center min-h-[300px] border-dashed">
                  <div className="text-center text-muted-foreground">
                    <ArrowRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">{t('beforeAfter.selectDestination', 'Sélectionnez un pays')}</p>
                    <p className="text-sm mt-1">{t('beforeAfter.selectDestinationDesc', 'pour voir la comparaison')}</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Delta summary */}
          <AnimatePresence>
            {delta && results?.origin && results?.dest && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <Card className={cn(
                  'border-2',
                  delta.netAnnual > 0 ? 'border-emerald-500/40' : delta.netAnnual < 0 ? 'border-red-500/40' : 'border-border'
                )}>
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold mb-1">
                        {t('beforeAfter.deltaTitle', 'Impact de votre expatriation')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {results.origin.countryName} → {results.dest.countryName}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 text-center">
                      <DeltaMetric
                        label={t('beforeAfter.deltaMonthly', 'Delta net / mois')}
                        value={delta.netMonthly}
                        format="currency"
                      />
                      <DeltaMetric
                        label={t('beforeAfter.deltaAnnual', 'Delta net / an')}
                        value={delta.netAnnual}
                        format="currency"
                        large
                      />
                      <DeltaMetric
                        label={t('beforeAfter.deltaRate', 'Delta taux effectif')}
                        value={delta.rateDelta}
                        format="percent"
                        invert
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8">
            <SimulationDisclaimer />
          </div>
        </section>
      </div>
    </>
  );
}

function ResultCard({
  result,
  label,
  sublabel,
  variant,
}: {
  result: TaxCalculationResult;
  label: string;
  sublabel: string;
  variant: 'origin' | 'destination';
}) {
  const { t } = useTranslation();
  const monthlyNet = Math.round(result.netIncome / 12);

  return (
    <motion.div initial={{ opacity: 0, x: variant === 'origin' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}>
      <Card className={cn(
        'h-full',
        variant === 'origin' && 'border-muted-foreground/20',
        variant === 'destination' && 'border-primary/30'
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant={variant === 'destination' ? 'default' : 'outline'} className="text-xs">
              {label}
            </Badge>
            <span className="text-xs text-muted-foreground">{sublabel}</span>
          </div>
          <CardTitle className="text-xl mt-2">{result.countryName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <MetricRow
              icon={<Wallet className="w-4 h-4" />}
              label={t('beforeAfter.grossAnnual', 'Brut annuel')}
              value={formatCurrency(result.grossIncome, result.currency)}
              muted
            />
            <MetricRow
              icon={<Calculator className="w-4 h-4" />}
              label={t('beforeAfter.totalTax', 'Total impôts & charges')}
              value={`-${formatCurrency(result.totalTax, result.currency)}`}
              negative
            />
            <div className="border-t border-border pt-3">
              <MetricRow
                icon={<PiggyBank className="w-4 h-4" />}
                label={t('beforeAfter.netAnnual', 'Net annuel')}
                value={formatCurrency(result.netIncome, result.currency)}
                bold
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {t('beforeAfter.netMonthly', 'Net mensuel estimé')}
            </p>
            <motion.p
              key={monthlyNet}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-foreground"
            >
              {formatCurrency(monthlyNet, result.currency)}
            </motion.p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('beforeAfter.effectiveRate', 'Taux effectif')}</span>
            <span className="font-semibold">{formatPercent(result.effectiveRate)}</span>
          </div>
          <Progress value={result.effectiveRate * 100} className="h-1.5" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricRow({
  icon,
  label,
  value,
  muted,
  negative,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className={cn('flex items-center gap-2 text-sm', muted && 'text-muted-foreground')}>
        {icon}
        {label}
      </div>
      <span className={cn(
        'text-sm',
        negative && 'text-red-500',
        bold && 'text-base font-bold text-foreground',
        muted && 'text-muted-foreground'
      )}>
        {value}
      </span>
    </div>
  );
}

function DeltaMetric({
  label,
  value,
  format,
  large,
  invert,
}: {
  label: string;
  value: number;
  format: 'currency' | 'percent';
  large?: boolean;
  invert?: boolean;
}) {
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 1;
  const Icon = isPositive ? TrendingUp : value === 0 || isNeutral ? Minus : TrendingDown;

  const formatted = format === 'currency'
    ? `${value >= 0 ? '+' : ''}${formatCurrency(Math.round(value), 'EUR')}`
    : `${value >= 0 ? '+' : ''}${formatPercent(Math.abs(value))}`;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <motion.div
        key={formatted}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="flex items-center justify-center gap-2"
      >
        <Icon className={cn(
          'w-5 h-5',
          isPositive ? 'text-emerald-500' : isNeutral ? 'text-muted-foreground' : 'text-red-500'
        )} />
        <span className={cn(
          large ? 'text-3xl font-bold' : 'text-xl font-semibold',
          isPositive ? 'text-emerald-500' : isNeutral ? 'text-muted-foreground' : 'text-red-500'
        )}>
          {formatted}
        </span>
      </motion.div>
    </div>
  );
}
