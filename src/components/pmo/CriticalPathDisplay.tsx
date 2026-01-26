// PMO Critical Path Calculation and Display Component
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Clock, CheckCircle2, Route, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, format, parseISO, addDays } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface PmoMilestone {
  id: string;
  title: string;
  target_date: string | null;
  achieved_at: string | null;
  initiative_id: string | null;
}

interface PmoDependency {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  dependency_type: 'blocks' | 'depends_on' | 'related_to' | 'mitigates';
}

interface CriticalPathNode {
  id: string;
  title: string;
  targetDate: Date | null;
  duration: number; // estimated days
  dependencies: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
  isCompleted: boolean;
}

interface CriticalPathDisplayProps {
  milestones: PmoMilestone[];
  dependencies: PmoDependency[];
  projectStartDate?: string;
}

export function CriticalPathDisplay({ 
  milestones, 
  dependencies, 
  projectStartDate 
}: CriticalPathDisplayProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;

  const criticalPath = useMemo(() => {
    if (milestones.length === 0) return { nodes: [], totalDuration: 0, criticalNodes: [] };

    const startDate = projectStartDate ? parseISO(projectStartDate) : new Date();

    // Build dependency graph for milestones
    const milestoneDeps: Record<string, string[]> = {};
    milestones.forEach(m => {
      milestoneDeps[m.id] = [];
    });

    dependencies
      .filter(d => d.dependency_type === 'depends_on' || d.dependency_type === 'blocks')
      .forEach(dep => {
        if (dep.target_type === 'milestone' && dep.source_type === 'milestone') {
          if (dep.dependency_type === 'depends_on') {
            milestoneDeps[dep.source_id]?.push(dep.target_id);
          } else if (dep.dependency_type === 'blocks') {
            milestoneDeps[dep.target_id]?.push(dep.source_id);
          }
        }
      });

    // Calculate durations and create nodes
    const nodes: CriticalPathNode[] = milestones.map(m => {
      const targetDate = m.target_date ? parseISO(m.target_date) : null;
      const duration = targetDate ? Math.max(1, differenceInDays(targetDate, startDate)) : 14;

      return {
        id: m.id,
        title: m.title,
        targetDate,
        duration,
        dependencies: milestoneDeps[m.id] || [],
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: Infinity,
        lateFinish: Infinity,
        slack: 0,
        isCritical: false,
        isCompleted: !!m.achieved_at,
      };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Forward pass - calculate early start and early finish
    const visited = new Set<string>();
    const calculateEarlyTimes = (nodeId: string): number => {
      const node = nodeMap.get(nodeId);
      if (!node) return 0;
      if (visited.has(nodeId)) return node.earlyFinish;

      visited.add(nodeId);

      if (node.dependencies.length === 0) {
        node.earlyStart = 0;
      } else {
        node.earlyStart = Math.max(
          ...node.dependencies.map(depId => calculateEarlyTimes(depId))
        );
      }
      node.earlyFinish = node.earlyStart + node.duration;
      return node.earlyFinish;
    };

    nodes.forEach(n => calculateEarlyTimes(n.id));

    // Find project end (max early finish)
    const projectEnd = Math.max(...nodes.map(n => n.earlyFinish));

    // Backward pass - calculate late start and late finish
    const calculateLateTimes = (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      // Find nodes that depend on this one
      const dependents = nodes.filter(n => n.dependencies.includes(nodeId));
      
      if (dependents.length === 0) {
        node.lateFinish = projectEnd;
      } else {
        node.lateFinish = Math.min(...dependents.map(d => d.lateStart));
      }
      node.lateStart = node.lateFinish - node.duration;
      node.slack = node.lateStart - node.earlyStart;
      node.isCritical = node.slack === 0;
    };

    // Process in reverse topological order
    const sortedNodes = [...nodes].sort((a, b) => b.earlyFinish - a.earlyFinish);
    sortedNodes.forEach(n => calculateLateTimes(n.id));

    const criticalNodes = nodes
      .filter(n => n.isCritical && !n.isCompleted)
      .sort((a, b) => a.earlyStart - b.earlyStart);

    return {
      nodes,
      totalDuration: projectEnd,
      criticalNodes,
    };
  }, [milestones, dependencies, projectStartDate]);

  const completedCritical = criticalPath.nodes.filter(n => n.isCritical && n.isCompleted).length;
  const totalCritical = criticalPath.nodes.filter(n => n.isCritical).length;
  const criticalProgress = totalCritical > 0 ? Math.round((completedCritical / totalCritical) * 100) : 0;

  const estimatedEndDate = projectStartDate 
    ? addDays(parseISO(projectStartDate), criticalPath.totalDuration)
    : addDays(new Date(), criticalPath.totalDuration);

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Route className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{t('pmo.criticalPath.noMilestones', 'Add milestones to calculate critical path')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="w-5 h-5" />
            {t('pmo.criticalPath.title', 'Critical Path')}
          </CardTitle>
          <Badge variant={criticalProgress === 100 ? 'default' : 'secondary'}>
            {criticalProgress}% {t('pmo.criticalPath.complete', 'complete')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              {t('pmo.criticalPath.duration', 'Total Duration')}
            </div>
            <p className="text-xl font-bold">{criticalPath.totalDuration} {t('pmo.days', 'days')}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              {t('pmo.criticalPath.estimatedEnd', 'Est. Completion')}
            </div>
            <p className="text-xl font-bold">{format(estimatedEndDate, 'dd MMM yyyy', { locale })}</p>
          </div>
        </div>

        {/* Critical Path Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{t('pmo.criticalPath.progress', 'Critical Path Progress')}</span>
            <span className="text-muted-foreground">{completedCritical}/{totalCritical}</span>
          </div>
          <Progress value={criticalProgress} className="h-2" />
        </div>

        {/* Critical Milestones List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            {t('pmo.criticalPath.criticalMilestones', 'Critical Milestones')}
          </h4>
          
          {criticalPath.criticalNodes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              {t('pmo.criticalPath.allComplete', 'All critical milestones completed!')}
            </p>
          ) : (
            <div className="space-y-2">
              {criticalPath.criticalNodes.slice(0, 5).map((node, index) => (
                <div 
                  key={node.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border",
                    index === 0 ? "border-destructive/50 bg-destructive/5" : "border-border"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-destructive text-destructive-foreground" : "bg-muted"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{node.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('pmo.criticalPath.dayRange', 'Day {{start}} - {{end}}', {
                        start: node.earlyStart,
                        end: node.earlyFinish
                      })}
                    </p>
                  </div>
                  {index === 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{t('pmo.criticalPath.nextBlocking', 'Next blocking milestone')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Non-critical with slack */}
        {criticalPath.nodes.filter(n => !n.isCritical && !n.isCompleted).length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {t('pmo.criticalPath.withSlack', 'Milestones with Flexibility')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {criticalPath.nodes
                .filter(n => !n.isCritical && !n.isCompleted)
                .slice(0, 4)
                .map(node => (
                  <Badge key={node.id} variant="outline" className="text-xs">
                    {node.title.substring(0, 20)}{node.title.length > 20 ? '...' : ''}
                    <span className="ml-1 text-green-600">+{node.slack}d</span>
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
