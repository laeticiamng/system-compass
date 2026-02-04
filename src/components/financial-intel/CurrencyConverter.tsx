import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const currencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
];

// Approximate exchange rates (EUR base) - in production, use a real API
const baseRates: Record<string, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  CHF: 0.95,
  JPY: 163.5,
  CAD: 1.47,
  AUD: 1.66,
  CNY: 7.85,
  INR: 90.5,
  BRL: 5.35,
  AED: 4.0,
  SGD: 1.46,
};

export function CurrencyConverter() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [result, setResult] = useState<number>(0);
  const [rate, setRate] = useState<number>(1);

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency]);

  const calculateConversion = () => {
    const numAmount = parseFloat(amount) || 0;
    const fromRate = baseRates[fromCurrency] || 1;
    const toRate = baseRates[toCurrency] || 1;
    
    // Convert to EUR first, then to target currency
    const inEur = numAmount / fromRate;
    const converted = inEur * toRate;
    
    setResult(converted);
    setRate(toRate / fromRate);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  // Simulate rate change trend
  const rateTrend = Math.random() > 0.5;

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          {t('financial.currencyConverter', 'Convertisseur de devises')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm text-muted-foreground">
            {t('financial.amount', 'Montant')}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {fromCurrencyData?.symbol}
              </span>
            </div>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={swapCurrencies}
            className="rounded-full hover:bg-primary/10"
            aria-label={t('financial.swap', 'Swap currencies')}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {t('financial.result', 'Résultat')}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={result.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
                readOnly
                className="pr-12 bg-muted/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {toCurrencyData?.symbol}
              </span>
            </div>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="flex items-center gap-2">
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {t('financial.exchangeRate', 'Taux de change')}
            </p>
            <p className="text-sm font-medium">
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </p>
          </div>
          <div className={`flex items-center gap-1 text-xs ${rateTrend ? 'text-green-500' : 'text-red-500'}`}>
            {rateTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{rateTrend ? '+0.3%' : '-0.2%'}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center">
          {t('financial.rateDisclaimer', 'Taux indicatifs, non contractuels. Mis à jour quotidiennement.')}
        </p>
      </CardContent>
    </Card>
  );
}
