import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Pause,
  Play,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'completed' 
  | 'error' 
  | 'warning' 
  | 'paused'
  | 'locked'
  | 'unlocked'
  | 'visible'
  | 'hidden'
  | 'draft'
  | 'published'
  | 'archived';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<StatusType, { 
  icon: typeof CheckCircle; 
  colorClass: string; 
  bgClass: string;
  defaultLabel: string;
}> = {
  active: { 
    icon: Play, 
    colorClass: 'text-green-500', 
    bgClass: 'bg-green-500/10 border-green-500/20',
    defaultLabel: 'Actif'
  },
  inactive: { 
    icon: Pause, 
    colorClass: 'text-muted-foreground', 
    bgClass: 'bg-muted/50 border-muted',
    defaultLabel: 'Inactif'
  },
  pending: { 
    icon: Clock, 
    colorClass: 'text-amber-500', 
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    defaultLabel: 'En attente'
  },
  completed: { 
    icon: CheckCircle, 
    colorClass: 'text-green-500', 
    bgClass: 'bg-green-500/10 border-green-500/20',
    defaultLabel: 'Terminé'
  },
  error: { 
    icon: XCircle, 
    colorClass: 'text-red-500', 
    bgClass: 'bg-red-500/10 border-red-500/20',
    defaultLabel: 'Erreur'
  },
  warning: { 
    icon: AlertTriangle, 
    colorClass: 'text-amber-500', 
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    defaultLabel: 'Attention'
  },
  paused: { 
    icon: Pause, 
    colorClass: 'text-blue-500', 
    bgClass: 'bg-blue-500/10 border-blue-500/20',
    defaultLabel: 'En pause'
  },
  locked: { 
    icon: Lock, 
    colorClass: 'text-muted-foreground', 
    bgClass: 'bg-muted/50 border-muted',
    defaultLabel: 'Verrouillé'
  },
  unlocked: { 
    icon: Unlock, 
    colorClass: 'text-green-500', 
    bgClass: 'bg-green-500/10 border-green-500/20',
    defaultLabel: 'Déverrouillé'
  },
  visible: { 
    icon: Eye, 
    colorClass: 'text-primary', 
    bgClass: 'bg-primary/10 border-primary/20',
    defaultLabel: 'Visible'
  },
  hidden: { 
    icon: EyeOff, 
    colorClass: 'text-muted-foreground', 
    bgClass: 'bg-muted/50 border-muted',
    defaultLabel: 'Masqué'
  },
  draft: { 
    icon: Clock, 
    colorClass: 'text-muted-foreground', 
    bgClass: 'bg-muted/50 border-muted',
    defaultLabel: 'Brouillon'
  },
  published: { 
    icon: CheckCircle, 
    colorClass: 'text-green-500', 
    bgClass: 'bg-green-500/10 border-green-500/20',
    defaultLabel: 'Publié'
  },
  archived: { 
    icon: Lock, 
    colorClass: 'text-muted-foreground', 
    bgClass: 'bg-muted/30 border-muted',
    defaultLabel: 'Archivé'
  },
};

export function StatusBadge({ 
  status, 
  label, 
  showIcon = true, 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: { text: 'text-xs', icon: 'w-3 h-3', padding: 'px-1.5 py-0.5' },
    md: { text: 'text-sm', icon: 'w-3.5 h-3.5', padding: 'px-2 py-1' },
    lg: { text: 'text-base', icon: 'w-4 h-4', padding: 'px-3 py-1.5' },
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium gap-1.5 border',
        config.bgClass,
        config.colorClass,
        sizeClasses[size].text,
        sizeClasses[size].padding,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses[size].icon} />}
      {label || config.defaultLabel}
    </Badge>
  );
}
