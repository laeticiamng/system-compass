/**
 * DecisionComparator - Compare multiple decisions side by side
 * Helps identify patterns and learn from past decisions
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitCompare, 
  Check, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Tag
} from 'lucide-react';

interface Decision {
  id: string;
  title: string;
  domain: string;
  outcome: 'success' | 'partial' | 'failure' | 'pending';
  date: string;
  confidence: number;
  factors: string[];
  lessons?: string;
}

interface DecisionComparatorProps {
  decisions: Decision[];
  onCompare?: (selectedIds: string[]) => void;
}

export function DecisionComparator({ decisions, onCompare }: DecisionComparatorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const selectedDecisions = decisions.filter(d => selectedIds.includes(d.id));

  const getOutcomeIcon = (outcome: Decision['outcome']) => {
    switch (outcome) {
      case 'success': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'partial': return <Check className="h-4 w-4 text-yellow-500" />;
      case 'failure': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getOutcomeBadge = (outcome: Decision['outcome']) => {
    const variants: Record<Decision['outcome'], string> = {
      success: 'bg-green-500/10 text-green-600',
      partial: 'bg-yellow-500/10 text-yellow-600',
      failure: 'bg-red-500/10 text-red-600',
      pending: 'bg-muted text-muted-foreground'
    };
    return variants[outcome];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" />
              Comparateur de décisions
            </CardTitle>
            <Badge variant="outline">
              {selectedIds.length}/4 sélectionnées
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {decisions.map(decision => (
                <div
                  key={decision.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedIds.includes(decision.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleSelection(decision.id)}
                >
                  <Checkbox 
                    checked={selectedIds.includes(decision.id)}
                    onCheckedChange={() => toggleSelection(decision.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{decision.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {decision.domain}
                    </div>
                  </div>
                  {getOutcomeIcon(decision.outcome)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedDecisions.length >= 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Comparaison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4" style={{ 
              gridTemplateColumns: `repeat(${selectedDecisions.length}, 1fr)` 
            }}>
              {selectedDecisions.map(decision => (
                <div key={decision.id} className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm truncate">{decision.title}</h4>
                    <p className="text-xs text-muted-foreground">{decision.date}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Résultat</span>
                      <Badge className={getOutcomeBadge(decision.outcome)}>
                        {decision.outcome}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Confiance</span>
                      <span className="text-sm font-medium">{decision.confidence}%</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Facteurs clés</span>
                      <div className="flex flex-wrap gap-1">
                        {decision.factors.slice(0, 3).map((factor, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {onCompare && (
              <Button 
                className="w-full mt-4"
                onClick={() => onCompare(selectedIds)}
              >
                Analyser les patterns communs
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
