import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressIndicator({
  steps,
  orientation = 'horizontal',
  size = 'md',
  className
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const connectorSizes = {
    sm: 'h-0.5',
    md: 'h-1',
    lg: 'h-1.5'
  };

  return (
    <div 
      className={cn(
        'flex items-center',
        orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-1',
        className
      )}
    >
      {steps.map((step, index) => (
        <div 
          key={step.id}
          className={cn(
            'flex items-center',
            orientation === 'vertical' ? 'flex-col' : 'flex-row'
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center rounded-full transition-colors',
              step.status === 'completed' && 'text-risk-low',
              step.status === 'in-progress' && 'text-primary',
              step.status === 'pending' && 'text-muted-foreground',
              step.status === 'error' && 'text-destructive'
            )}>
              {step.status === 'completed' && (
                <CheckCircle className={sizeClasses[size]} />
              )}
              {step.status === 'in-progress' && (
                <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />
              )}
              {step.status === 'pending' && (
                <Circle className={sizeClasses[size]} />
              )}
              {step.status === 'error' && (
                <Circle className={cn(sizeClasses[size], 'fill-destructive/20')} />
              )}
            </div>
            <span className={cn(
              textSizes[size],
              'font-medium',
              step.status === 'completed' && 'text-risk-low',
              step.status === 'in-progress' && 'text-foreground',
              step.status === 'pending' && 'text-muted-foreground',
              step.status === 'error' && 'text-destructive'
            )}>
              {step.label}
            </span>
          </div>
          
          {/* Connector */}
          {index < steps.length - 1 && (
            <div className={cn(
              'transition-colors',
              orientation === 'vertical' 
                ? 'w-0.5 h-6 mx-auto my-1' 
                : cn(connectorSizes[size], 'w-8 mx-2'),
              step.status === 'completed' ? 'bg-risk-low' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// Simple percentage progress with label
interface LabeledProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function LabeledProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  className
}: LabeledProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-risk-low',
    warning: 'bg-risk-medium',
    danger: 'bg-destructive'
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-medium tabular-nums">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-secondary rounded-full overflow-hidden',
        heightClasses[size]
      )}>
        <motion.div 
          className={cn(
            'h-full rounded-full',
            variantClasses[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  showValue = true,
  variant = 'default',
  className
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-risk-low',
    warning: 'stroke-risk-medium',
    danger: 'stroke-destructive'
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', variantColors[variant])}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
