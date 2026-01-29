/**
 * Tax Comparison Chart - Visual comparison of tax rates across countries
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaxData {
  country: string;
  countryCode: string;
  incomeTax: number;
  corporateTax: number;
  vat: number;
  capitalGains: number;
  totalEffective: number;
}

interface TaxComparisonChartProps {
  data: TaxData[];
  highlightCountry?: string;
}

export function TaxComparisonChart({ data, highlightCountry }: TaxComparisonChartProps) {
  const maxRate = Math.max(...data.map(d => d.totalEffective));
  const sortedData = [...data].sort((a, b) => a.totalEffective - b.totalEffective);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Comparaison fiscale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedData.map((item, index) => {
          const isHighlighted = item.countryCode === highlightCountry;
          const barWidth = (item.totalEffective / maxRate) * 100;
          const savings = index > 0 
            ? sortedData[index - 1].totalEffective - item.totalEffective 
            : 0;

          return (
            <motion.div
              key={item.countryCode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${
                isHighlighted 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-secondary/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFlagEmoji(item.countryCode)}</span>
                  <span className="font-medium">{item.country}</span>
                  {index === 0 && (
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-0">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Moins imposé
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {savings > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{savings.toFixed(1)}%
                    </span>
                  )}
                  <span className="font-bold text-lg">
                    {item.totalEffective.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    isHighlighted 
                      ? 'bg-primary' 
                      : item.totalEffective > 40 
                        ? 'bg-red-500' 
                        : item.totalEffective > 25 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>IR: {item.incomeTax}%</span>
                <span>IS: {item.corporateTax}%</span>
                <span>TVA: {item.vat}%</span>
                <span>PV: {item.capitalGains}%</span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    'FR': '🇫🇷', 'PT': '🇵🇹', 'ES': '🇪🇸', 'CH': '🇨🇭', 'AE': '🇦🇪',
    'SG': '🇸🇬', 'MC': '🇲🇨', 'AD': '🇦🇩', 'MT': '🇲🇹', 'CY': '🇨🇾',
    'LU': '🇱🇺', 'IE': '🇮🇪', 'NL': '🇳🇱', 'BE': '🇧🇪', 'DE': '🇩🇪',
    'IT': '🇮🇹', 'UK': '🇬🇧', 'US': '🇺🇸', 'HK': '🇭🇰',
  };
  return flags[countryCode] || '🏳️';
}
