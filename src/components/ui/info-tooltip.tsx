/**
 * Info Tooltip - Reusable info tooltip with consistent styling
 */
import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  variant?: 'info' | 'help';
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({
  content,
  side = 'top',
  align = 'center',
  variant = 'info',
  className,
  iconClassName,
}: InfoTooltipProps) {
  const Icon = variant === 'info' ? Info : HelpCircle;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              className
            )}
          >
            <Icon className={cn('w-4 h-4', iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-xs text-sm"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Label with Tooltip - Label component with integrated tooltip
 */
export function LabelWithTooltip({
  label,
  tooltip,
  required,
  htmlFor,
  className,
}: {
  label: string;
  tooltip: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <InfoTooltip content={tooltip} />
    </div>
  );
}
