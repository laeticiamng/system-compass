/**
 * StrategyComparisonMode - Side-by-side comparison of exit key strategies
 * Allows users to compare 2-4 strategies across multiple dimensions
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Scale,
  Plus,
  X,
  Check,
  AlertTriangle,
  Clock,
  FileText,
  Star,
  Trophy,
} from 'lucide-react';
import { EXIT_KEYS, type ExitKey } from '@/lib/exit-keys-engine';
import { cn } from '@/lib/utils';

interface ComparisonDimension {
  id: string;
  label: string;
  icon: React.ReactNode;
  getValue: (key: ExitKey) => number | string;
  format?: 'score' | 'text' | 'duration' | 'cost';
  higherIsBetter?: boolean;
}

const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  {
    id: 'difficulty',
    label: 'Difficulté',
    icon: <AlertTriangle className="w-4 h-4" />,
    getValue: (key) => key.difficulty,
    format: 'text',
  },
  {
    id: 'duration',
    label: 'Durée estimée',
    icon: <Clock className="w-4 h-4" />,
    getValue: (key) => key.steps.reduce((acc, s) => acc + s.duration, ''),
    format: 'duration',
  },
  {
    id: 'steps_count',
    label: 'Nombre d\'étapes',
    icon: <FileText className="w-4 h-4" />,
    getValue: (key) => key.steps.length,
    format: 'score',
    higherIsBetter: false,
  },
  {
    id: 'actions_count',
    label: 'Actions totales',
    icon: <Check className="w-4 h-4" />,
    getValue: (key) => key.steps.reduce((acc, s) => acc + s.actions.length, 0),
    format: 'score',
    higherIsBetter: false,
  },
];

interface StrategyComparisonModeProps {
  selectedStrategies?: string[];
  onSelect?: (strategyId: string) => void;
  className?: string;
}

export function StrategyComparisonMode({
  selectedStrategies: controlledSelected,
  onSelect,
  className,
}: StrategyComparisonModeProps) {
  const { t } = useTranslation();
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedIds = controlledSelected ?? internalSelected;
  const setSelectedIds = onSelect
    ? (id: string) => onSelect(id)
    : (id: string) => {
        setInternalSelected((prev) =>
          prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id].slice(0, 4)
        );
      };

  const selectedKeys = useMemo(
    () => EXIT_KEYS.filter((k) => selectedIds.includes(k.id)),
    [selectedIds]
  );

  const getDifficultyScore = (difficulty: string): number => {
    const map: Record<string, number> = {
      facile: 90,
      modérée: 70,
      élevée: 40,
      'très élevée': 20,
    };
    return map[difficulty.toLowerCase()] || 50;
  };

  const getBestForDimension = (dimension: ComparisonDimension): string | null => {
    if (selectedKeys.length < 2) return null;

    const values = selectedKeys.map((key) => ({
      id: key.id,
      value: dimension.getValue(key),
    }));

    if (dimension.format === 'score') {
      const sorted = [...values].sort((a, b) => {
        const aNum = typeof a.value === 'number' ? a.value : 0;
        const bNum = typeof b.value === 'number' ? b.value : 0;
        return dimension.higherIsBetter ? bNum - aNum : aNum - bNum;
      });
      return sorted[0]?.id || null;
    }

    return null;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{t('exitKeys.comparison.title', 'Mode Comparaison')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('exitKeys.comparison.subtitle', 'Comparez jusqu\'à 4 stratégies côte à côte')}
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter ({selectedIds.length}/4)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Sélectionner des stratégies à comparer</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid gap-2">
                {EXIT_KEYS.map((key) => {
                  const isSelected = selectedIds.includes(key.id);
                  return (
                    <button
                      key={key.id}
                      onClick={() => setSelectedIds(key.id)}
                      disabled={!isSelected && selectedIds.length >= 4}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50',
                        !isSelected && selectedIds.length >= 4 && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{key.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{key.unlocks}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {key.difficulty}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Strategies */}
      {selectedKeys.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedKeys.map((key) => (
            <Badge
              key={key.id}
              variant="default"
              className="gap-1 pr-1"
            >
              {key.name}
              <button
                onClick={() => setSelectedIds(key.id)}
                className="ml-1 p-0.5 rounded-full hover:bg-primary-foreground/20"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {selectedKeys.length >= 2 ? (
        <Card className="overflow-hidden">
          <ScrollArea className="w-full">
            <div className="min-w-[600px]">
              {/* Header Row */}
              <div className="grid border-b bg-muted/50" style={{ gridTemplateColumns: `200px repeat(${selectedKeys.length}, 1fr)` }}>
                <div className="p-4 font-medium">Critère</div>
                {selectedKeys.map((key) => (
                  <div key={key.id} className="p-4 text-center border-l">
                    <p className="font-semibold text-sm">{key.name}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {key.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Dimension Rows */}
              {COMPARISON_DIMENSIONS.map((dimension) => {
                const bestId = getBestForDimension(dimension);
                return (
                  <div
                    key={dimension.id}
                    className="grid border-b last:border-b-0"
                    style={{ gridTemplateColumns: `200px repeat(${selectedKeys.length}, 1fr)` }}
                  >
                    <div className="p-4 flex items-center gap-2 bg-muted/30">
                      {dimension.icon}
                      <span className="text-sm font-medium">{dimension.label}</span>
                    </div>
                    {selectedKeys.map((key) => {
                      const value = dimension.getValue(key);
                      const isBest = bestId === key.id;
                      return (
                        <div
                          key={key.id}
                          className={cn(
                            'p-4 text-center border-l flex items-center justify-center',
                            isBest && 'bg-green-500/5'
                          )}
                        >
                          {dimension.format === 'score' ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{value}</span>
                              {isBest && <Trophy className="w-4 h-4 text-amber-500" />}
                            </div>
                          ) : (
                            <span className="text-sm">{value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Difficulty Score Row */}
              <div
                className="grid border-b"
                style={{ gridTemplateColumns: `200px repeat(${selectedKeys.length}, 1fr)` }}
              >
                <div className="p-4 flex items-center gap-2 bg-muted/30">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Score global</span>
                </div>
                {selectedKeys.map((key) => {
                  const score = getDifficultyScore(key.difficulty);
                  return (
                    <div key={key.id} className="p-4 border-l">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold text-lg">{score}</span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Scale className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <p className="font-medium">Sélectionnez au moins 2 stratégies</p>
              <p className="text-sm text-muted-foreground">
                Cliquez sur "Ajouter" pour commencer la comparaison
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendation */}
      {selectedKeys.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Recommandation</p>
              <p className="text-sm text-muted-foreground">
                Basé sur votre comparaison, <strong>{selectedKeys[0].name}</strong> semble être
                l'option la plus équilibrée avec une difficulté {selectedKeys[0].difficulty}.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
