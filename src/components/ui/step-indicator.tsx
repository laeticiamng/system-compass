/**
 * Step Indicator - Progress indicator for multi-step processes
 */
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps = [],
  orientation = 'horizontal',
  size = 'md',
  className,
  onStepClick,
}: StepIndicatorProps) {
  const sizes = {
    sm: { circle: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs', connector: 'h-0.5' },
    md: { circle: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm', connector: 'h-0.5' },
    lg: { circle: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base', connector: 'h-1' },
  };

  const sizeStyles = sizes[size];
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-col gap-2' : 'flex-row items-start gap-0',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index) || index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = !!onStepClick && (isCompleted || isCurrent);

        return (
          <div
            key={step.id}
            className={cn(
              'flex',
              isVertical ? 'flex-row gap-3' : 'flex-col items-center',
              !isVertical && index < steps.length - 1 && 'flex-1'
            )}
          >
            <div className={cn('flex items-center', isVertical ? 'flex-col' : 'flex-row w-full')}>
              {/* Circle */}
              <button
                type="button"
                onClick={isClickable ? () => onStepClick(index) : undefined}
                disabled={!isClickable}
                className={cn(
                  'flex items-center justify-center rounded-full font-medium transition-all',
                  sizeStyles.circle,
                  sizeStyles.text,
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && !isCompleted && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className={sizeStyles.icon} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Connector */}
              {index < steps.length - 1 && !isVertical && (
                <div
                  className={cn(
                    'flex-1 mx-2',
                    sizeStyles.connector,
                    isCompleted || index < currentStep - 1
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              )}
              {index < steps.length - 1 && isVertical && (
                <div
                  className={cn(
                    'w-0.5 h-8 my-1',
                    isCompleted || index < currentStep - 1
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div
              className={cn(
                'mt-2',
                isVertical && 'mt-0 flex-1',
                !isVertical && 'text-center'
              )}
            >
              <p
                className={cn(
                  'font-medium',
                  sizeStyles.text,
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Progress Steps - Minimal step indicator
 */
export function SimpleProgressSteps({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === current
              ? 'w-6 bg-primary'
              : i < current
              ? 'w-3 bg-primary/60'
              : 'w-3 bg-muted'
          )}
        />
      ))}
    </div>
  );
}
