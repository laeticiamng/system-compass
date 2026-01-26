// PMO Budget Burn Rate Chart Component
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, Flame } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Line,
  ComposedChart,
} from 'recharts';
import { cn } from '@/lib/utils';

interface BudgetLine {
  id: string;
  amount: number;
  budget_type: 'capex' | 'opex';
  category: string;
  created_at: string;
}

interface BurnRateChartProps {
  budgetLines: BudgetLine[];
  totalBudget: number;
  monthsPlanned: number;
  currency?: string;
}

export function BurnRateChart({ 
  budgetLines, 
  totalBudget, 
  monthsPlanned,
  currency = '€' 
}: BurnRateChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const data: Array<{
      month: string;
      planned: number;
      actual: number;
      remaining: number;
    }> = [];

    const monthlyPlanned = totalBudget / monthsPlanned;
    
    // Group budget lines by month
    const linesByMonth: Record<string, number> = {};
    budgetLines.forEach(line => {
      const month = new Date(line.created_at).toISOString().slice(0, 7);
      linesByMonth[month] = (linesByMonth[month] || 0) + line.amount;
    });

    let cumulativeActual = 0;
    let cumulativePlanned = 0;

    for (let i = 0; i < monthsPlanned; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (monthsPlanned - i - 1));
      const monthKey = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

      const monthActual = linesByMonth[monthKey] || 0;
      cumulativeActual += monthActual;
      cumulativePlanned += monthlyPlanned;

      data.push({
        month: monthLabel,
        planned: Math.round(cumulativePlanned),
        actual: Math.round(cumulativeActual),
        remaining: Math.max(0, totalBudget - cumulativeActual),
      });
    }

    return data;
  }, [budgetLines, totalBudget, monthsPlanned]);

  // Calculate metrics
  const spent = budgetLines.reduce((acc, line) => acc + line.amount, 0);
  const remaining = Math.max(0, totalBudget - spent);
  const burnRate = monthsPlanned > 0 ? spent / monthsPlanned : 0;
  const projectedMonthsRemaining = burnRate > 0 ? remaining / burnRate : Infinity;
  const burnPercentage = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

  // Determine status
  const isOverBudget = spent > totalBudget;
  const isAtRisk = projectedMonthsRemaining < monthsPlanned * 0.3;
  const isHealthy = projectedMonthsRemaining >= monthsPlanned * 0.5;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === '€' ? 'EUR' : 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="w-5 h-5" />
            {t('pmo.burnRate.title', 'Burn Rate')}
          </CardTitle>
          <Badge 
            variant={isOverBudget ? 'destructive' : isAtRisk ? 'secondary' : 'default'}
            className={cn(
              isHealthy && !isOverBudget && "bg-green-500/10 text-green-600 border-green-500/30"
            )}
          >
            {isOverBudget 
              ? t('pmo.burnRate.overBudget', 'Over Budget')
              : isAtRisk 
                ? t('pmo.burnRate.atRisk', 'At Risk')
                : t('pmo.burnRate.healthy', 'Healthy')
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              {t('pmo.burnRate.spent', 'Spent')}
            </div>
            <p className="text-lg font-bold">{formatCurrency(spent)}</p>
            <p className="text-xs text-muted-foreground">
              {burnPercentage.toFixed(1)}% {t('pmo.burnRate.ofBudget', 'of budget')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Flame className="w-3 h-3" />
              {t('pmo.burnRate.monthlyRate', 'Monthly Rate')}
            </div>
            <p className="text-lg font-bold">{formatCurrency(burnRate)}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {burnRate > (totalBudget / monthsPlanned) ? (
                <>
                  <TrendingUp className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">{t('pmo.burnRate.abovePlan', 'Above plan')}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">{t('pmo.burnRate.belowPlan', 'Below plan')}</span>
                </>
              )}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              {t('pmo.burnRate.runway', 'Runway')}
            </div>
            <p className={cn(
              "text-lg font-bold",
              isAtRisk && "text-destructive",
              isHealthy && !isOverBudget && "text-green-600"
            )}>
              {projectedMonthsRemaining === Infinity 
                ? '∞' 
                : `${projectedMonthsRemaining.toFixed(1)} ${t('pmo.months', 'mo')}`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {t('pmo.burnRate.remaining', 'remaining')}: {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground"
              />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-lg text-sm">
                      <p className="font-medium mb-1">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                          {entry.name}: {formatCurrency(entry.value as number)}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <ReferenceLine 
                y={totalBudget} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5"
                label={{ value: t('pmo.burnRate.budget', 'Budget'), fontSize: 10 }}
              />
              <Area 
                type="monotone" 
                dataKey="planned" 
                fill="hsl(var(--muted))" 
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                name={t('pmo.burnRate.planned', 'Planned')}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name={t('pmo.burnRate.actual', 'Actual')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Warning */}
        {isAtRisk && !isOverBudget && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">
                {t('pmo.burnRate.runwayWarning', 'Low Runway Warning')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('pmo.burnRate.runwayWarningDesc', 'At current burn rate, budget will be exhausted before project completion.')}
              </p>
            </div>
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {t('pmo.burnRate.overBudgetWarning', 'Budget Exceeded')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('pmo.burnRate.overBudgetDesc', 'Spending has exceeded the allocated budget by {{amount}}.', {
                  amount: formatCurrency(spent - totalBudget)
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
