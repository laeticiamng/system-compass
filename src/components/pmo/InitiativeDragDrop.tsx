/**
 * Initiative Drag & Drop Component
 * 
 * Implements actual drag-and-drop reordering for PMO initiatives.
 * Completes the previously placeholder reordering functionality.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, ArrowUp, ArrowDown, Save, RotateCcw,
  Target, AlertTriangle, CheckCircle2
} from 'lucide-react';
import type { PmoInitiativeRow } from '@/lib/pmo-types';
import { INITIATIVE_STATUS_LABELS } from '@/lib/pmo-types';

interface InitiativeDragDropProps {
  initiatives: PmoInitiativeRow[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  isSaving?: boolean;
}

interface DragState {
  draggedId: string | null;
  targetId: string | null;
}

export function InitiativeDragDrop({ 
  initiatives, 
  onReorder,
  isSaving = false,
}: InitiativeDragDropProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  
  const [orderedItems, setOrderedItems] = useState<PmoInitiativeRow[]>(initiatives);
  const [dragState, setDragState] = useState<DragState>({ draggedId: null, targetId: null });
  const [hasChanges, setHasChanges] = useState(false);

  // Reset when initiatives change externally
  const resetOrder = useCallback(() => {
    setOrderedItems(initiatives);
    setHasChanges(false);
  }, [initiatives]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragState({ draggedId: id, targetId: null });
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.targetId !== targetId) {
      setDragState(prev => ({ ...prev, targetId }));
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const { draggedId } = dragState;
    
    if (draggedId && draggedId !== targetId) {
      const newItems = [...orderedItems];
      const draggedIndex = newItems.findIndex(i => i.id === draggedId);
      const targetIndex = newItems.findIndex(i => i.id === targetId);
      
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      
      setOrderedItems(newItems);
      setHasChanges(true);
    }
    
    setDragState({ draggedId: null, targetId: null });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragState({ draggedId: null, targetId: null });
  };

  // Move item up/down with buttons
  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = orderedItems.findIndex(i => i.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= orderedItems.length) return;
    
    const newItems = [...orderedItems];
    const [item] = newItems.splice(currentIndex, 1);
    newItems.splice(newIndex, 0, item);
    
    setOrderedItems(newItems);
    setHasChanges(true);
  };

  // Save order
  const saveOrder = async () => {
    const orderedIds = orderedItems.map(i => i.id);
    await onReorder(orderedIds);
    setHasChanges(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Target className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {t('pmo.reorder.title', 'Réordonner les initiatives')}
        </CardTitle>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" size="sm" onClick={resetOrder}>
                <RotateCcw className="w-4 h-4 mr-1" />
                {t('common.reset', 'Annuler')}
              </Button>
              <Button size="sm" onClick={saveOrder} disabled={isSaving}>
                <Save className="w-4 h-4 mr-1" />
                {t('common.save', 'Enregistrer')}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orderedItems.map((initiative, index) => {
            const isDragging = dragState.draggedId === initiative.id;
            const isTarget = dragState.targetId === initiative.id;
            
            return (
              <div
                key={initiative.id}
                draggable
                onDragStart={(e) => handleDragStart(e, initiative.id)}
                onDragOver={(e) => handleDragOver(e, initiative.id)}
                onDrop={(e) => handleDrop(e, initiative.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${isDragging ? 'opacity-50 border-dashed' : ''}
                  ${isTarget ? 'border-primary bg-primary/5' : 'border-border'}
                  ${!isDragging ? 'cursor-grab hover:border-primary/50' : ''}
                `}
              >
                {/* Drag handle */}
                <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                
                {/* Order number */}
                <Badge variant="outline" className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {index + 1}
                </Badge>
                
                {/* Initiative info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(initiative.status)}
                    <span className="font-medium truncate">{initiative.title}</span>
                  </div>
                  {initiative.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {initiative.description}
                    </p>
                  )}
                </div>
                
                {/* Status badge */}
                <Badge variant="secondary" className="flex-shrink-0">
                  {INITIATIVE_STATUS_LABELS[initiative.status as keyof typeof INITIATIVE_STATUS_LABELS]?.[lang] || initiative.status}
                </Badge>
                
                {/* Move buttons */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveItem(initiative.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveItem(initiative.id, 'down')}
                    disabled={index === orderedItems.length - 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {orderedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {t('pmo.reorder.empty', 'Aucune initiative à réordonner')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
