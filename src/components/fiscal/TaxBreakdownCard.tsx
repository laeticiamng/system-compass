/**
 * Tax Breakdown Card - Detailed tax breakdown for a specific scenario
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, Wallet, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface TaxBreakdown {
  grossIncome: number;
  incomeTax: number;
  socialCharges: number;
  corporateTax?: number;
  capitalGainsTax?: number;
  wealthTax?: number;
  vatCredit?: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  currency: string;
}

interface TaxBreakdownCardProps {
  breakdown: TaxBreakdown;
  countryName: string;
  countryCode: string;
  scenario?: string;
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function TaxBreakdownCard({ 
  breakdown, 
  countryName, 
  countryCode,
  scenario = 'Standard' 
}: TaxBreakdownCardProps) {
  const taxItems = [
    { 
      label: 'Impôt sur le revenu', 
      amount: breakdown.incomeTax, 
      tooltip: 'Impôt progressif sur les revenus d\'activité',
      color: 'text-red-500' 
    },
    { 
      label: 'Charges sociales', 
      amount: breakdown.socialCharges, 
      tooltip: 'Cotisations sociales obligatoires',
      color: 'text-orange-500' 
    },
    ...(breakdown.corporateTax ? [{
      label: 'Impôt sur les sociétés',
      amount: breakdown.corporateTax,
      tooltip: 'Applicable si structure sociétaire',
      color: 'text-amber-500'
    }] : []),
    ...(breakdown.capitalGainsTax ? [{
      label: 'Plus-values',
      amount: breakdown.capitalGainsTax,
      tooltip: 'Imposition des gains en capital',
      color: 'text-purple-500'
    }] : []),
    ...(breakdown.wealthTax ? [{
      label: 'Impôt sur la fortune',
      amount: breakdown.wealthTax,
      tooltip: 'ISF ou équivalent local',
      color: 'text-pink-500'
    }] : []),
  ].filter(item => item.amount > 0);

  return (
    <TooltipProvider>
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="w-5 h-5 text-primary" />
              Simulation fiscale
            </CardTitle>
            <Badge variant="outline">{scenario}</Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {getFlagEmoji(countryCode)} {countryName}
          </p>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Gross Income */}
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="font-medium">Revenu brut annuel</span>
            <span className="text-xl font-bold">
              {formatCurrency(breakdown.grossIncome, breakdown.currency)}
            </span>
          </div>

          {/* Tax Items */}
          <div className="space-y-2">
            {taxItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className={`font-medium ${item.color}`}>
                  - {formatCurrency(item.amount, breakdown.currency)}
                </span>
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Total Tax */}
          <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="font-medium">Total impositions</span>
            </div>
            <span className="text-lg font-bold text-red-500">
              - {formatCurrency(breakdown.totalTax, breakdown.currency)}
            </span>
          </div>

          {/* Net Income */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span className="font-bold">Revenu net</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-500">
                {formatCurrency(breakdown.netIncome, breakdown.currency)}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3" />
                Taux effectif: {breakdown.effectiveRate.toFixed(1)}%
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    'FR': '🇫🇷', 'PT': '🇵🇹', 'ES': '🇪🇸', 'CH': '🇨🇭', 'AE': '🇦🇪',
    'SG': '🇸🇬', 'MC': '🇲🇨', 'AD': '🇦🇩', 'MT': '🇲🇹', 'CY': '🇨🇾',
  };
  return flags[countryCode] || '🏳️';
}
