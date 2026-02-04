/**
 * Draggable Widget Grid - Customizable dashboard layout
 * Allows users to reorder widgets via drag and drop
 */
import { useState, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  GripVertical, 
  Settings, 
  Eye, 
  EyeOff,
  RotateCcw,
  Check,
  X,
  Layout
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  title: string;
  icon?: ReactNode;
  visible: boolean;
  order: number;
  size?: 'small' | 'medium' | 'large' | 'full';
}

interface DraggableWidgetGridProps {
  widgets: WidgetConfig[];
  onLayoutChange: (widgets: WidgetConfig[]) => void;
  children: (config: WidgetConfig) => ReactNode;
  className?: string;
}

const STORAGE_KEY = 'dashboard-widget-layout';

export function useDashboardLayout(defaultWidgets: WidgetConfig[]) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new widgets
        return defaultWidgets.map(defaultWidget => {
          const saved = parsed.find((w: WidgetConfig) => w.id === defaultWidget.id);
          return saved ? { ...defaultWidget, ...saved } : defaultWidget;
        });
      }
    } catch (e) {
      console.error('Failed to load widget layout:', e);
    }
    return defaultWidgets;
  });

  const updateLayout = useCallback((newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    } catch (e) {
      console.error('Failed to save widget layout:', e);
    }
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
    localStorage.removeItem(STORAGE_KEY);
  }, [defaultWidgets]);

  return { widgets, updateLayout, resetLayout };
}

function WidgetItem({ 
  config, 
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onToggleVisibility,
  isEditing,
}: {
  config: WidgetConfig;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onToggleVisibility: () => void;
  isEditing: boolean;
}) {
  return (
    <div
      draggable={isEditing}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        isDragging && 'opacity-50 bg-primary/10 border-primary',
        isEditing && 'cursor-grab active:cursor-grabbing',
        !config.visible && 'opacity-60'
      )}
    >
      {isEditing && (
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-medium text-sm truncate">{config.title}</span>
        </div>
      </div>
      
      {isEditing ? (
        <Switch
          checked={config.visible}
          onCheckedChange={onToggleVisibility}
        />
      ) : (
        config.visible ? (
          <Eye className="h-4 w-4 text-muted-foreground" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )
      )}
    </div>
  );
}

export function DashboardLayoutEditor({
  widgets,
  onSave,
  onReset,
}: {
  widgets: WidgetConfig[];
  onSave: (widgets: WidgetConfig[]) => void;
  onReset: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newWidgets = [...localWidgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, removed);
    
    // Update order values
    newWidgets.forEach((w, i) => w.order = i);
    
    setLocalWidgets(newWidgets);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleVisibility = (id: string) => {
    setLocalWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
    );
  };

  const handleSave = () => {
    onSave(localWidgets);
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleReset = () => {
    onReset();
    setLocalWidgets(widgets);
  };

  const visibleCount = localWidgets.filter(w => w.visible).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) setLocalWidgets(widgets);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Layout className="h-4 w-4" />
          Personnaliser
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Personnaliser le tableau de bord
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {visibleCount}/{localWidgets.length} widgets visibles
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Terminer' : 'Réorganiser'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
          
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              Glissez-déposez pour réorganiser les widgets
            </p>
          )}
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {localWidgets
              .sort((a, b) => a.order - b.order)
              .map((widget, index) => (
                <WidgetItem
                  key={widget.id}
                  config={widget}
                  isDragging={draggedIndex === index}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={() => handleDragOver(index)}
                  onDragEnd={handleDragEnd}
                  onToggleVisibility={() => toggleVisibility(widget.id)}
                  isEditing={isEditing}
                />
              ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DraggableWidgetGrid({
  widgets,
  children,
  className,
}: Omit<DraggableWidgetGridProps, 'onLayoutChange'>) {
  const sortedVisibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const getSizeClass = (size?: string) => {
    switch (size) {
      case 'small': return 'md:col-span-1';
      case 'large': return 'md:col-span-2 lg:col-span-2';
      case 'full': return 'md:col-span-2 lg:col-span-3';
      case 'medium':
      default: return 'md:col-span-1';
    }
  };

  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {sortedVisibleWidgets.map((config) => (
        <div key={config.id} className={getSizeClass(config.size)}>
          {children(config)}
        </div>
      ))}
    </div>
  );
}
