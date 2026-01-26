import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PmoInitiativeRow, InitiativeStatus } from '@/lib/pmo-types';

interface InitiativeReorderListProps {
  initiatives: PmoInitiativeRow[];
  onReorder: (reorderedIds: string[]) => void;
  onStatusChange?: (id: string, status: InitiativeStatus) => void;
}

const STATUS_CONFIG: Record<InitiativeStatus, { icon: typeof Circle; color: string; label: string }> = {
  todo: { icon: Circle, color: 'text-muted-foreground', label: 'À faire' },
  in_progress: { icon: Clock, color: 'text-primary', label: 'En cours' },
  blocked: { icon: AlertCircle, color: 'text-destructive', label: 'Bloqué' },
  done: { icon: CheckCircle2, color: 'text-green-600', label: 'Terminé' },
  cancelled: { icon: AlertCircle, color: 'text-muted-foreground', label: 'Annulé' },
};

export function InitiativeReorderList({ 
  initiatives, 
  onReorder,
}: InitiativeReorderListProps) {
  const { t } = useTranslation();
  const [orderedIds, setOrderedIds] = useState<string[]>(initiatives.map(i => i.id));
  const [isDirty, setIsDirty] = useState(false);

  // Keep orderedIds in sync with initiatives prop
  const orderedInitiatives = orderedIds
    .map(id => initiatives.find(i => i.id === id))
    .filter((i): i is PmoInitiativeRow => i !== undefined);

  // Add any new initiatives not in orderedIds
  const newInitiatives = initiatives.filter(i => !orderedIds.includes(i.id));
  const allOrdered = [...orderedInitiatives, ...newInitiatives];

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedIds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrderedIds(newOrder);
    setIsDirty(true);
  }, [orderedIds]);

  const moveDown = useCallback((index: number) => {
    if (index === orderedIds.length - 1) return;
    const newOrder = [...orderedIds];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderedIds(newOrder);
    setIsDirty(true);
  }, [orderedIds]);

  const handleSave = useCallback(() => {
    onReorder(orderedIds);
    setIsDirty(false);
  }, [orderedIds, onReorder]);

  const handleReset = useCallback(() => {
    setOrderedIds(initiatives.map(i => i.id));
    setIsDirty(false);
  }, [initiatives]);

  if (initiatives.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('pmo.reorder.noInitiatives', 'Aucune initiative à réordonner')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            {t('pmo.reorder.title', 'Ordre des initiatives')}
          </div>
          {isDirty && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t('common.cancel', 'Annuler')}
              </Button>
              <Button size="sm" onClick={handleSave}>
                {t('common.save', 'Enregistrer')}
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {allOrdered.map((initiative, index) => {
            const statusConfig = STATUS_CONFIG[initiative.status as InitiativeStatus] || STATUS_CONFIG.todo;
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={initiative.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-50 group-hover:opacity-100"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-50 group-hover:opacity-100"
                    onClick={() => moveDown(index)}
                    disabled={index === allOrdered.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="w-4 h-4 cursor-grab" />
                  <span className="text-xs font-mono w-6">{index + 1}.</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">{initiative.title}</span>
                </div>
                
                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                
                {initiative.target_date && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(initiative.target_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          {t('pmo.reorder.hint', 'Utilisez les flèches pour réorganiser les priorités')}
        </p>
      </CardContent>
    </Card>
  );
}
