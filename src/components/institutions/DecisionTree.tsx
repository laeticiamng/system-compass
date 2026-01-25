import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DecisionNode, DecisionNodeData } from './DecisionNode';
import { cn } from '@/lib/utils';

interface DecisionTreeProps {
  decisions: DecisionNodeData[];
  onSelectDecision?: (decision: DecisionNodeData) => void;
  selectedDecisionId?: string;
}

export function DecisionTree({ decisions, onSelectDecision, selectedDecisionId }: DecisionTreeProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'tree' | 'timeline'>('tree');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Count decisions recursively
  const countDecisions = (nodes: DecisionNodeData[]): { total: number; validated: number; pending: number; abandoned: number } => {
    let counts = { total: 0, validated: 0, pending: 0, abandoned: 0 };
    
    nodes.forEach(node => {
      counts.total++;
      counts[node.status]++;
      
      if (node.children) {
        const childCounts = countDecisions(node.children);
        counts.total += childCounts.total;
        counts.validated += childCounts.validated;
        counts.pending += childCounts.pending;
        counts.abandoned += childCounts.abandoned;
      }
    });
    
    return counts;
  };

  const stats = countDecisions(decisions);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
            className="gap-2"
          >
            <GitBranch className="w-4 h-4" />
            {t('traceOS.tree.viewTree', 'Arbre')}
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            {t('traceOS.tree.viewTimeline', 'Timeline')}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-muted">
              {stats.total} {t('traceOS.tree.decisions', 'décisions')}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
              {stats.validated} {t('traceOS.tree.validated', 'validées')}
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
              {stats.pending} {t('traceOS.tree.pending', 'en attente')}
            </Badge>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              disabled={zoomLevel <= 50}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs w-10 text-center">{zoomLevel}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              disabled={zoomLevel >= 150}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomLevel(100)}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decision Tree / Timeline */}
      <ScrollArea className="h-[600px] rounded-lg border bg-muted/20 p-4">
        <div 
          className="transition-transform origin-top-left"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {viewMode === 'tree' ? (
            <div className="space-y-4">
              {decisions.map((decision) => (
                <DecisionNode
                  key={decision.id}
                  node={decision}
                  onSelect={onSelectDecision}
                  isSelected={selectedDecisionId === decision.id}
                />
              ))}
            </div>
          ) : (
            <DecisionTimeline 
              decisions={decisions}
              onSelect={onSelectDecision}
              selectedId={selectedDecisionId}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Timeline view component
function DecisionTimeline({ 
  decisions, 
  onSelect, 
  selectedId 
}: { 
  decisions: DecisionNodeData[];
  onSelect?: (decision: DecisionNodeData) => void;
  selectedId?: string;
}) {
  const { t } = useTranslation();

  // Flatten decisions for timeline
  const flattenDecisions = (nodes: DecisionNodeData[], depth = 0): (DecisionNodeData & { depth: number })[] => {
    let result: (DecisionNodeData & { depth: number })[] = [];
    
    nodes.forEach(node => {
      result.push({ ...node, depth });
      if (node.children) {
        result = [...result, ...flattenDecisions(node.children, depth + 1)];
      }
    });
    
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineItems = flattenDecisions(decisions);

  const statusColors = {
    pending: 'bg-amber-500',
    validated: 'bg-green-500',
    abandoned: 'bg-muted-foreground'
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {timelineItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "relative flex gap-4 pl-10 cursor-pointer group",
              selectedId === item.id && "bg-primary/5 -mx-4 px-4 py-2 rounded-lg"
            )}
            onClick={() => onSelect?.(item)}
          >
            {/* Timeline dot */}
            <div 
              className={cn(
                "absolute left-2.5 w-3 h-3 rounded-full ring-4 ring-background transition-transform group-hover:scale-125",
                statusColors[item.status]
              )}
            />

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                {item.depth > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3" />
                    {t('traceOS.timeline.subDecision', 'sous-décision')}
                  </div>
                )}
              </div>
              <h4 className="font-medium group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.decision}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{item.author}</span>
                <span>•</span>
                <span>{item.scope}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
