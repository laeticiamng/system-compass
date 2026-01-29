import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  current: number;
  previous: number;
  format?: 'percentage' | 'absolute' | 'both';
  size?: 'sm' | 'md' | 'lg';
  invertColors?: boolean;
  showValue?: boolean;
  className?: string;
}

export function TrendIndicator({
  current,
  previous,
  format = 'percentage',
  size = 'md',
  invertColors = false,
  showValue = true,
  className
}: TrendIndicatorProps) {
  const diff = current - previous;
  const percentChange = previous !== 0 ? ((diff / previous) * 100) : (current > 0 ? 100 : 0);
  
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const isNeutral = diff === 0;

  const getColorClass = () => {
    if (isNeutral) return 'text-muted-foreground';
    const positive = invertColors ? isNegative : isPositive;
    const negative = invertColors ? isPositive : isNegative;
    if (positive) return 'text-green-500';
    if (negative) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getBgClass = () => {
    if (isNeutral) return 'bg-muted/50';
    const positive = invertColors ? isNegative : isPositive;
    const negative = invertColors ? isPositive : isNegative;
    if (positive) return 'bg-green-500/10';
    if (negative) return 'bg-red-500/10';
    return 'bg-muted/50';
  };

  const sizeClasses = {
    sm: { icon: 'w-3 h-3', text: 'text-xs', padding: 'px-1.5 py-0.5' },
    md: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-2 py-1' },
    lg: { icon: 'w-5 h-5', text: 'text-base', padding: 'px-3 py-1.5' },
  };

  const formatValue = () => {
    const absPercent = Math.abs(percentChange);
    const absDiff = Math.abs(diff);
    
    switch (format) {
      case 'absolute':
        return `${isPositive ? '+' : isNegative ? '-' : ''}${absDiff}`;
      case 'both':
        return `${isPositive ? '+' : isNegative ? '-' : ''}${absDiff} (${absPercent.toFixed(1)}%)`;
      case 'percentage':
      default:
        return `${isPositive ? '+' : isNegative ? '-' : ''}${absPercent.toFixed(1)}%`;
    }
  };

  const IconComponent = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        getBgClass(),
        getColorClass(),
        sizeClasses[size].padding,
        sizeClasses[size].text,
        className
      )}
    >
      <IconComponent className={sizeClasses[size].icon} />
      {showValue && <span>{formatValue()}</span>}
    </div>
  );
}
