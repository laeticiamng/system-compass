import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  User,
  Target,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface DecisionNodeData {
  id: string;
  title: string;
  context: string;
  mainHypothesis: string;
  alternativeHypotheses: string[];
  constraints: string[];
  decision: string;
  date: string;
  author: string;
  scope: string;
  status: 'pending' | 'validated' | 'abandoned';
  children?: DecisionNodeData[];
  abandonedBranches?: {
    title: string;
    reason: string;
  }[];
}

interface DecisionNodeProps {
  node: DecisionNodeData;
  onSelect?: (node: DecisionNodeData) => void;
  isSelected?: boolean;
  depth?: number;
}

export function DecisionNode({ node, onSelect, isSelected = false, depth = 0 }: DecisionNodeProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(depth === 0);

  const statusConfig = {
    pending: { 
      color: 'bg-amber-500/20 text-amber-700 border-amber-500/40',
      icon: Clock,
      label: t('traceOS.status.pending', 'En attente')
    },
    validated: { 
      color: 'bg-green-500/20 text-green-700 border-green-500/40',
      icon: CheckCircle2,
      label: t('traceOS.status.validated', 'Validée')
    },
    abandoned: { 
      color: 'bg-muted text-muted-foreground border-muted',
      icon: GitBranch,
      label: t('traceOS.status.abandoned', 'Abandonnée')
    }
  };

  const status = statusConfig[node.status];
  const StatusIcon = status.icon;

  return (
    <div className={cn("relative", depth > 0 && "ml-8 mt-4")}>
      {/* Connection line for child nodes */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 h-full w-px bg-border" />
      )}
      
      <Card 
        className={cn(
          "transition-all cursor-pointer hover:border-primary/30",
          isSelected && "border-primary ring-1 ring-primary/20",
          node.status === 'abandoned' && "opacity-60"
        )}
        onClick={() => onSelect?.(node)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {node.scope}
                </Badge>
              </div>
              <CardTitle className="text-lg">{node.title}</CardTitle>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(node.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {node.author}
            </span>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Context */}
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                {t('traceOS.node.context', 'Contexte')}
              </h4>
              <p className="text-sm text-muted-foreground">{node.context}</p>
            </div>

            <Separator />

            {/* Main Hypothesis */}
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                {t('traceOS.node.mainHypothesis', 'Hypothèse principale')}
              </h4>
              <p className="text-sm bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                {node.mainHypothesis}
              </p>
            </div>

            {/* Alternative Hypotheses */}
            {node.alternativeHypotheses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">
                  {t('traceOS.node.alternativeHypotheses', 'Hypothèses alternatives')}
                </h4>
                <ul className="space-y-1">
                  {node.alternativeHypotheses.map((hyp, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      {hyp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Constraints */}
            {node.constraints.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                  {t('traceOS.node.constraints', 'Contraintes identifiées')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {node.constraints.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Decision Taken */}
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                {t('traceOS.node.decisionTaken', 'Décision prise')}
              </h4>
              <p className="text-sm bg-green-500/10 p-2 rounded-md border border-green-500/20 font-medium">
                {node.decision}
              </p>
            </div>

            {/* Abandoned Branches */}
            {node.abandonedBranches && node.abandonedBranches.length > 0 && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                  {t('traceOS.node.abandonedBranches', 'Branches abandonnées')}
                </h4>
                <ul className="space-y-2">
                  {node.abandonedBranches.map((branch, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-muted-foreground">{branch.title}</span>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">{branch.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Child decisions */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <DecisionNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              isSelected={isSelected}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
