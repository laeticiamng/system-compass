import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercentage?: boolean;
  colorScheme?: 'default' | 'risk' | 'success' | 'warning';
  className?: string;
}

export function ScoreGauge({
  score,
  maxScore = 100,
  size = 'md',
  label,
  showPercentage = true,
  colorScheme = 'default',
  className
}: ScoreGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm': return { outer: 60, stroke: 6, fontSize: 'text-sm', labelSize: 'text-xs' };
      case 'lg': return { outer: 120, stroke: 10, fontSize: 'text-2xl', labelSize: 'text-sm' };
      default: return { outer: 80, stroke: 8, fontSize: 'text-lg', labelSize: 'text-xs' };
    }
  }, [size]);

  const radius = (dimensions.outer - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = () => {
    if (colorScheme === 'risk') {
      if (percentage >= 70) return 'text-risk-high';
      if (percentage >= 40) return 'text-risk-medium';
      return 'text-risk-low';
    }
    if (colorScheme === 'success') {
      if (percentage >= 70) return 'text-green-500';
      if (percentage >= 40) return 'text-amber-500';
      return 'text-red-500';
    }
    if (colorScheme === 'warning') {
      if (percentage >= 70) return 'text-red-500';
      if (percentage >= 40) return 'text-amber-500';
      return 'text-green-500';
    }
    return 'text-primary';
  };

  const getStrokeColor = () => {
    if (colorScheme === 'risk') {
      if (percentage >= 70) return 'stroke-risk-high';
      if (percentage >= 40) return 'stroke-risk-medium';
      return 'stroke-risk-low';
    }
    if (colorScheme === 'success') {
      if (percentage >= 70) return 'stroke-green-500';
      if (percentage >= 40) return 'stroke-amber-500';
      return 'stroke-red-500';
    }
    if (colorScheme === 'warning') {
      if (percentage >= 70) return 'stroke-red-500';
      if (percentage >= 40) return 'stroke-amber-500';
      return 'stroke-green-500';
    }
    return 'stroke-primary';
  };

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={dimensions.outer}
        height={dimensions.outer}
        viewBox={`0 0 ${dimensions.outer} ${dimensions.outer}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimensions.outer / 2}
          cy={dimensions.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={dimensions.outer / 2}
          cy={dimensions.outer / 2}
          r={radius}
          fill="none"
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500 ease-out', getStrokeColor())}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', dimensions.fontSize, getColorClass())}>
          {showPercentage ? `${Math.round(percentage)}%` : score}
        </span>
        {label && (
          <span className={cn('text-muted-foreground text-center px-2', dimensions.labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
