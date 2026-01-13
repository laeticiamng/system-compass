import { useTranslation } from 'react-i18next';
import { useTraceOSDecisions } from '@/hooks/useTraceOSDecisions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  GitBranch, 
  Plus, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export function TraceOSDashboardWidget() {
  const { t } = useTranslation();
  const { decisions, loading } = useTraceOSDecisions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Flatten decisions tree to count statuses
  const flattenDecisions = (nodes: typeof decisions): typeof decisions => {
    return nodes.reduce((acc, node) => {
      acc.push(node);
      if (node.children) {
        acc.push(...flattenDecisions(node.children));
      }
      return acc;
    }, [] as typeof decisions);
  };

  const allDecisions = flattenDecisions(decisions);
  const pendingDecisions = allDecisions.filter(d => d.status === 'pending');
  const validatedDecisions = allDecisions.filter(d => d.status === 'validated');
  const abandonedDecisions = allDecisions.filter(d => d.status === 'abandoned');

  if (decisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            {t('dashboard.traceos.title', 'TraceOS')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.traceos.noDecisions', 'Créez des arbres de décision pour structurer vos choix.')}
          </p>
          <Link to="/institutions">
            <Button className="gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              {t('dashboard.traceos.explore', 'Explorer TraceOS')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          {t('dashboard.traceos.title', 'TraceOS')}
        </CardTitle>
        <Link to="/institutions">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <div className="text-lg font-bold text-amber-500">{pendingDecisions.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.traceos.pending', 'En attente')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-500">{validatedDecisions.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.traceos.validated', 'Validées')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted">
            <div className="text-lg font-bold text-muted-foreground">{abandonedDecisions.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.traceos.abandoned', 'Abandonnées')}</div>
          </div>
        </div>

        {/* Pending decisions list */}
        {pendingDecisions.length > 0 && (
          <div className="space-y-2">
            {pendingDecisions.slice(0, 2).map(decision => (
              <div 
                key={decision.id}
                className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-sm truncate">{decision.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {decision.context || t('dashboard.traceos.noContext', 'Pas de contexte')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
