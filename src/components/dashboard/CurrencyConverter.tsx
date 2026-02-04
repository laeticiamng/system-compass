/**
 * Currency Converter Widget
 * Quick currency conversion for expat planning
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
];

// Simplified exchange rates (in production, use a live API)
const BASE_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.94,
  AED: 3.97,
  SGD: 1.45,
  CAD: 1.47,
  AUD: 1.65,
  JPY: 162.5,
  THB: 38.5,
  MXN: 18.5,
  BRL: 5.35,
};

export function CurrencyConverter() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<number>(0);
  const [rate, setRate] = useState<number>(1);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const calculateConversion = useCallback(() => {
    const fromRate = BASE_RATES[fromCurrency] || 1;
    const toRate = BASE_RATES[toCurrency] || 1;
    const exchangeRate = toRate / fromRate;
    
    setRate(exchangeRate);
    setResult(parseFloat(amount || '0') * exchangeRate);
    setLastUpdate(new Date());
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    calculateConversion();
  }, [calculateConversion]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getCurrencyDetails = (code: string) => {
    return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
  };

  const fromDetails = getCurrencyDetails(fromCurrency);
  const toDetails = getCurrencyDetails(toCurrency);

  // Simulate rate change indicator
  const rateChange = ((rate - 1) * 100);
  const isRateUp = rateChange > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            {t('dashboard.currency.title', 'Convertisseur')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={calculateConversion}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* From Currency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-medium"
                min="0"
              />
            </div>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
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

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              className="rounded-full h-8 w-8 p-0"
            >
              <ArrowRightLeft className="h-4 w-4 rotate-90" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={formatNumber(result)}
                readOnly
                className="text-lg font-medium bg-muted"
              />
            </div>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
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

        {/* Exchange Rate Info */}
        <div className="pt-2 border-t space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              1 {fromDetails.code} =
            </span>
            <span className="font-medium flex items-center gap-1">
              {formatNumber(rate, 4)} {toDetails.code}
              {isRateUp ? (
                <TrendingUp className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.currency.lastUpdate', 'Dernière mise à jour')}: {' '}
            {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
