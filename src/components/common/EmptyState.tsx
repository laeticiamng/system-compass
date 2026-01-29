import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileX, 
  Search, 
  FolderOpen, 
  Inbox, 
  Users, 
  MapPin, 
  FileText, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'file' | 'search' | 'folder' | 'inbox' | 'users' | 'map' | 'document' | 'error' | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const getIcon = () => {
    if (typeof icon !== 'string') return icon;

    const iconClass = 'h-12 w-12 text-muted-foreground/50';
    switch (icon) {
      case 'file':
        return <FileX className={iconClass} />;
      case 'search':
        return <Search className={iconClass} />;
      case 'folder':
        return <FolderOpen className={iconClass} />;
      case 'inbox':
        return <Inbox className={iconClass} />;
      case 'users':
        return <Users className={iconClass} />;
      case 'map':
        return <MapPin className={iconClass} />;
      case 'document':
        return <FileText className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      default:
        return <Inbox className={iconClass} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 rounded-full bg-muted/50">{getIcon()}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.icon || <Plus className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
