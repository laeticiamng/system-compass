/**
 * Status Badge - Consistent status indicators across the platform
 */
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2, Pause, LucideIcon } from 'lucide-react';

type StatusType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'pending' 
  | 'loading' 
  | 'paused'
  | 'draft'
  | 'active'
  | 'inactive'
  | 'archived';

interface StatusConfig {
  icon: LucideIcon;
  className: string;
  iconClassName?: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-500/20 text-red-600 border-red-500/30 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400',
  },
  info: {
    icon: Clock,
    className: 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-400',
  },
  pending: {
    icon: Clock,
    className: 'bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400',
  },
  loading: {
    icon: Loader2,
    className: 'bg-primary/20 text-primary border-primary/30',
    iconClassName: 'animate-spin',
  },
  paused: {
    icon: Pause,
    className: 'bg-slate-500/20 text-slate-600 border-slate-500/30 dark:text-slate-400',
  },
  draft: {
    icon: Clock,
    className: 'bg-gray-500/20 text-gray-600 border-gray-500/30 dark:text-gray-400',
  },
  active: {
    icon: CheckCircle,
    className: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  },
  inactive: {
    icon: XCircle,
    className: 'bg-gray-500/20 text-gray-600 border-gray-500/30 dark:text-gray-400',
  },
  archived: {
    icon: Pause,
    className: 'bg-slate-500/20 text-slate-600 border-slate-500/30 dark:text-slate-400',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-0.5',
        'flex items-center gap-1.5',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5',
            config.iconClassName
          )}
        />
      )}
      <span>{label || status}</span>
    </Badge>
  );
}

/**
 * Risk Level Badge - For risk indicators
 */
export function RiskBadge({
  level,
  showLabel = true,
  className,
}: {
  level: 'low' | 'medium' | 'high' | 'critical';
  showLabel?: boolean;
  className?: string;
}) {
  const configs = {
    low: {
      className: 'bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400',
      label: 'Low',
    },
    medium: {
      className: 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400',
      label: 'Medium',
    },
    high: {
      className: 'bg-orange-500/20 text-orange-600 border-orange-500/30 dark:text-orange-400',
      label: 'High',
    },
    critical: {
      className: 'bg-red-500/20 text-red-600 border-red-500/30 dark:text-red-400',
      label: 'Critical',
    },
  };

  const config = configs[level];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {showLabel ? config.label : level.charAt(0).toUpperCase()}
    </Badge>
  );
}

/**
 * Progress Badge - Shows completion percentage
 */
export function ProgressBadge({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const percentage = Math.round((value / max) * 100);
  
  let statusClass = 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  if (percentage >= 100) {
    statusClass = 'bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400';
  } else if (percentage >= 75) {
    statusClass = 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-400';
  } else if (percentage >= 50) {
    statusClass = 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400';
  }

  return (
    <Badge variant="outline" className={cn(statusClass, className)}>
      {percentage}%
    </Badge>
  );
}
