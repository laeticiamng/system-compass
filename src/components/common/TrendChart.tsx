import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus, BarChart2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
  showAverage?: boolean;
  color?: string;
  height?: number;
  className?: string;
}

export function TrendChart({
  title,
  data,
  unit = '',
  trend,
  changePercent,
  showAverage = true,
  color = 'hsl(var(--primary))',
  height = 200,
  className,
}: TrendChartProps) {
  const { t } = useTranslation();

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-risk-low' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  const trendBg = trend === 'up' ? 'bg-risk-low/10' : trend === 'down' ? 'bg-destructive/10' : 'bg-muted';

  const average = data.length > 0 
    ? data.reduce((sum, d) => sum + d.value, 0) / data.length 
    : 0;

  const latestValue = data.length > 0 ? data[data.length - 1].value : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <Badge variant="outline" className={cn('gap-1', trendBg, trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {changePercent !== undefined && (
              <span>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
            )}
          </Badge>
        </div>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-2xl font-bold">{latestValue.toLocaleString()}{unit}</span>
          {showAverage && (
            <span className="text-xs text-muted-foreground mb-1">
              {t('trend.average', 'Moy')}: {average.toFixed(1)}{unit}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={formatDate}
              formatter={(value: number) => [`${value}${unit}`, title]}
            />
            {showAverage && (
              <ReferenceLine 
                y={average} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                label={{ 
                  value: t('trend.average', 'Moy'), 
                  position: 'right',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Date range indicator */}
        {data.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(data[0].date)} - {formatDate(data[data.length - 1].date)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
