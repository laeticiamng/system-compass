/**
 * Partner Cost Calculator - Compares transfer/banking fees
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface TransferProvider {
  id: string;
  name: string;
  logo?: string;
  feeType: 'percentage' | 'fixed' | 'hybrid';
  feePercentage: number;
  fixedFee: number;
  exchangeMarkup: number; // % above mid-market rate
  deliveryTime: string;
  maxTransfer: number;
  affiliateLink: string;
  bonus?: string;
}

const TRANSFER_PROVIDERS: TransferProvider[] = [
  {
    id: 'wise',
    name: 'Wise',
    feeType: 'hybrid',
    feePercentage: 0.35,
    fixedFee: 0.4,
    exchangeMarkup: 0,
    deliveryTime: '1-2 jours',
    maxTransfer: 1000000,
    affiliateLink: 'https://wise.com',
    bonus: 'Premier transfert gratuit',
  },
  {
    id: 'revolut',
    name: 'Revolut',
    feeType: 'percentage',
    feePercentage: 0.5,
    fixedFee: 0,
    exchangeMarkup: 0.3,
    deliveryTime: 'Instantané',
    maxTransfer: 30000,
    affiliateLink: 'https://revolut.com',
    bonus: '3 mois Premium',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    feeType: 'hybrid',
    feePercentage: 2.9,
    fixedFee: 0.35,
    exchangeMarkup: 3.5,
    deliveryTime: '1-3 jours',
    maxTransfer: 60000,
    affiliateLink: 'https://paypal.com',
  },
  {
    id: 'westernunion',
    name: 'Western Union',
    feeType: 'fixed',
    feePercentage: 0,
    fixedFee: 8.9,
    exchangeMarkup: 3,
    deliveryTime: 'Minutes',
    maxTransfer: 50000,
    affiliateLink: 'https://westernunion.com',
  },
  {
    id: 'bank',
    name: 'Virement bancaire',
    feeType: 'fixed',
    feePercentage: 0,
    fixedFee: 25,
    exchangeMarkup: 2.5,
    deliveryTime: '3-5 jours',
    maxTransfer: Infinity,
    affiliateLink: '',
  },
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar US', symbol: '$' },
  { code: 'GBP', name: 'Livre Sterling', symbol: '£' },
  { code: 'CHF', name: 'Franc Suisse', symbol: 'CHF' },
  { code: 'CAD', name: 'Dollar Canadien', symbol: 'C$' },
  { code: 'AUD', name: 'Dollar Australien', symbol: 'A$' },
  { code: 'AED', name: 'Dirham EAU', symbol: 'AED' },
  { code: 'SGD', name: 'Dollar Singapour', symbol: 'S$' },
];

// Approximate exchange rates to EUR
const RATES_TO_EUR: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  CHF: 1.04,
  CAD: 0.68,
  AUD: 0.60,
  AED: 0.25,
  SGD: 0.68,
};

export function PartnerCostCalculator() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');

  const numericAmount = parseFloat(amount) || 0;

  const calculateTotalCost = (provider: TransferProvider): { fee: number; totalReceived: number; effectiveRate: number } => {
    let fee = provider.fixedFee;
    
    if (provider.feeType === 'percentage' || provider.feeType === 'hybrid') {
      fee += (numericAmount * provider.feePercentage) / 100;
    }

    // Exchange rate calculation
    const midMarketRate = RATES_TO_EUR[toCurrency] / RATES_TO_EUR[fromCurrency];
    const effectiveRate = midMarketRate * (1 - provider.exchangeMarkup / 100);
    const amountAfterFees = numericAmount - fee;
    const totalReceived = amountAfterFees * effectiveRate;

    return { fee, totalReceived, effectiveRate };
  };

  const sortedProviders = [...TRANSFER_PROVIDERS]
    .map(provider => ({
      ...provider,
      ...calculateTotalCost(provider),
    }))
    .filter(p => numericAmount <= p.maxTransfer)
    .sort((a, b) => b.totalReceived - a.totalReceived);

  const bestProvider = sortedProviders[0];

  const handleProviderClick = (provider: TransferProvider) => {
    if (provider.affiliateLink) {
      toast.success(t('partners.calculator.redirect', 'Redirection vers {{name}}', { name: provider.name }), {
        description: provider.bonus || t('partners.calculator.partnerBenefit', 'Profitez de notre partenariat'),
      });
      window.open(provider.affiliateLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          {t('partners.calculator.title', 'Comparateur de transferts')}
        </CardTitle>
        <CardDescription>
          {t('partners.calculator.description', 'Comparez les frais réels des différents services')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('partners.calculator.amount', 'Montant à envoyer')}</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('partners.calculator.from', 'Devise source')}</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('partners.calculator.to', 'Devise destination')}</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {numericAmount > 0 && (
          <div className="space-y-3">
            {sortedProviders.map((provider, index) => {
              const isBest = index === 0;
              const savings = bestProvider ? provider.totalReceived - sortedProviders[sortedProviders.length - 1].totalReceived : 0;
              
              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    isBest ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-secondary/30'
                  }`}
                  onClick={() => handleProviderClick(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isBest && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          {provider.bonus && (
                            <Badge variant="secondary" className="text-xs">
                              {provider.bonus}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Frais: {provider.fee.toFixed(2)} {fromCurrency} | {provider.deliveryTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {provider.totalReceived.toFixed(2)} {toCurrency}
                      </div>
                      {isBest && savings > 0 && (
                        <div className="text-xs text-emerald-500">
                          +{savings.toFixed(2)} vs pire option
                        </div>
                      )}
                    </div>
                    {provider.affiliateLink && (
                      <Button variant="ghost" size="icon" className="ml-2">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          * Estimations basées sur les taux moyens. Les frais réels peuvent varier.
        </p>
      </CardContent>
    </Card>
  );
}
