/**
 * Decision Analytics Dashboard - TraceOS decision insights and patterns
 * Computes metrics dynamically from real decision data via useTraceOSDecisions
 */
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Calendar,
  PieChart,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTraceOSDecisions } from '@/hooks/useTraceOSDecisions';
import type { DecisionNodeData } from '@/components/institutions/DecisionNode';

interface DecisionMetrics {
  totalDecisions: number;
  thisMonth: number;
  avgResponseTime: number; // days
  successRate: number;
  pendingReview: number;
  byCategory: Record<string, number>;
  byOutcome: { positive: number; neutral: number; negative: number };
  trend: number; // percentage change
}

interface PatternInsight {
  id: string;
  pattern: string;
  insight: string;
  type: 'warning' | 'success';
}

// Flatten a decision tree into a flat array
function flattenDecisions(decisions: DecisionNodeData[]): DecisionNodeData[] {
  const result: DecisionNodeData[] = [];
  for (const d of decisions) {
    result.push(d);
    if (d.children && d.children.length > 0) {
      result.push(...flattenDecisions(d.children));
    }
  }
  return result;
}

// Compute metrics from real decision data
function computeMetrics(decisions: DecisionNodeData[]): DecisionMetrics {
  const all = flattenDecisions(decisions);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthDecisions = all.filter(d => new Date(d.date) >= thisMonthStart);
  const lastMonthDecisions = all.filter(d => {
    const date = new Date(d.date);
    return date >= lastMonthStart && date < thisMonthStart;
  });

  const validated = all.filter(d => d.status === 'validated').length;
  const abandoned = all.filter(d => d.status === 'abandoned').length;
  const pending = all.filter(d => d.status === 'pending').length;
  const decided = validated + abandoned;

  // Avg response time: estimate from decision dates
  let avgDays = 0;
  const decisionsWithDates = all.filter(d => d.date && d.status !== 'pending');
  if (decisionsWithDates.length > 0) {
    const totalDays = decisionsWithDates.reduce((sum, d) => {
      const created = new Date(d.date);
      const diff = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + Math.min(diff, 30);
    }, 0);
    avgDays = Math.round((totalDays / decisionsWithDates.length) * 10) / 10;
  }

  // Category breakdown by scope
  const byCategory: Record<string, number> = {};
  all.forEach(d => {
    const scope = d.scope || 'Non classé';
    const label = scope.charAt(0).toUpperCase() + scope.slice(1);
    byCategory[label] = (byCategory[label] || 0) + 1;
  });

  // Trend: % change this month vs last month
  const lastMonthCount = lastMonthDecisions.length;
  const thisMonthCount = thisMonthDecisions.length;
  const trend = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : thisMonthCount > 0 ? 100 : 0;

  return {
    totalDecisions: all.length,
    thisMonth: thisMonthCount,
    avgResponseTime: avgDays,
    successRate: decided > 0 ? Math.round((validated / decided) * 100) : 0,
    pendingReview: pending,
    byCategory,
    byOutcome: { positive: validated, neutral: pending, negative: abandoned },
    trend,
  };
}

// Detect patterns from decision data
function detectPatterns(decisions: DecisionNodeData[]): PatternInsight[] {
  const all = flattenDecisions(decisions);
  if (all.length === 0) return [];

  const patterns: PatternInsight[] = [];

  const pending = all.filter(d => d.status === 'pending');
  if (pending.length >= 3) {
    patterns.push({
      id: 'pending-pileup',
      pattern: `${pending.length} décisions en attente`,
      insight: 'Plusieurs décisions attendent votre validation. Prioriser les plus anciennes.',
      type: 'warning',
    });
  }

  const validated = all.filter(d => d.status === 'validated').length;
  const abandoned = all.filter(d => d.status === 'abandoned').length;
  const decided = validated + abandoned;
  if (decided >= 5) {
    const rate = (validated / decided) * 100;
    if (rate >= 75) {
      patterns.push({
        id: 'high-success',
        pattern: `Taux de succès élevé : ${Math.round(rate)}%`,
        insight: 'Vos décisions validées sont largement majoritaires. Bon indicateur de rigueur.',
        type: 'success',
      });
    } else if (rate < 50) {
      patterns.push({
        id: 'low-success',
        pattern: `Taux d'abandon élevé : ${Math.round(100 - rate)}%`,
        insight: 'Plus de la moitié de vos décisions sont abandonnées. Revoir les critères en amont.',
        type: 'warning',
      });
    }
  }

  const scopes = new Set(all.map(d => d.scope).filter(Boolean));
  if (scopes.size === 1 && all.length >= 5) {
    patterns.push({
      id: 'scope-concentration',
      pattern: 'Concentration sur un seul périmètre',
      insight: `Toutes vos décisions portent sur "${[...scopes][0]}". Diversifier les champs de décision.`,
      type: 'warning',
    });
  } else if (scopes.size >= 3) {
    patterns.push({
      id: 'scope-diversity',
      pattern: 'Diversité décisionnelle',
      insight: `Vos décisions couvrent ${scopes.size} périmètres différents. Bonne couverture stratégique.`,
      type: 'success',
    });
  }

  return patterns.slice(0, 3);
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend >= 0 ? 'text-emerald-500' : 'text-red-500'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && (
              <span className="text-muted-foreground ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryBreakdown({ categories }: { categories: Record<string, number> }) {
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            Répartition par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          Répartition par catégorie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map(([category, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{category}</span>
                <span className="font-medium">{count}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function OutcomeChart({ outcomes }: { outcomes: { positive: number; neutral: number; negative: number } }) {
  const total = outcomes.positive + outcomes.neutral + outcomes.negative;

  if (total === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Résultats des décisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Résultats des décisions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500"
            style={{ width: `${(outcomes.positive / total) * 100}%` }}
          />
          <div
            className="bg-amber-500"
            style={{ width: `${(outcomes.neutral / total) * 100}%` }}
          />
          <div
            className="bg-red-500"
            style={{ width: `${(outcomes.negative / total) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Validé ({outcomes.positive})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>En attente ({outcomes.neutral})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Abandonné ({outcomes.negative})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatternInsightsSection({ patterns }: { patterns: PatternInsight[] }) {
  if (patterns.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Patterns détectés
          </CardTitle>
          <CardDescription>
            Insights basés sur vos décisions récentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pas assez de données pour détecter des patterns. Continuez à enregistrer vos décisions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Patterns détectés
        </CardTitle>
        <CardDescription>
          Insights basés sur vos décisions récentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map(pattern => (
          <div
            key={pattern.id}
            className={cn(
              'p-3 rounded-lg border',
              pattern.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            )}
          >
            <div className="flex items-start gap-2">
              {pattern.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-sm">{pattern.pattern}</p>
                <p className="text-xs text-muted-foreground mt-1">{pattern.insight}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="glass-card">
      <CardContent className="p-8 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucune décision enregistrée</h3>
        <p className="text-sm text-muted-foreground">
          Commencez par créer votre première décision dans TraceOS pour voir apparaître vos analytiques ici.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="glass-card">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DecisionAnalyticsDashboard() {
  const { decisions, loading, isLoggedIn } = useTraceOSDecisions();

  const metrics = useMemo(() => computeMetrics(decisions), [decisions]);
  const patterns = useMemo(() => detectPatterns(decisions), [decisions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytiques des décisions
          </h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos décisions TraceOS
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isLoggedIn || metrics.totalDecisions === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytiques des décisions
          </h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos décisions TraceOS
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytiques des décisions
        </h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de vos décisions TraceOS
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total décisions"
          value={metrics.totalDecisions}
          subtitle="Depuis le début"
          icon={Target}
        />
        <MetricCard
          title="Ce mois"
          value={metrics.thisMonth}
          icon={Calendar}
          trend={metrics.trend}
          trendLabel="vs mois dernier"
        />
        <MetricCard
          title="Temps moyen"
          value={`${metrics.avgResponseTime}j`}
          subtitle="Délai de décision"
          icon={Clock}
        />
        <MetricCard
          title="Taux de succès"
          value={`${metrics.successRate}%`}
          subtitle="Décisions validées"
          icon={Zap}
        />
      </div>

      {/* Pending Review Alert */}
      {metrics.pendingReview > 0 && (
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Décisions en attente de révision</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.pendingReview} décision(s) nécessitent votre attention
                </p>
              </div>
            </div>
            <Badge variant="secondary">{metrics.pendingReview}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <CategoryBreakdown categories={metrics.byCategory} />
        <OutcomeChart outcomes={metrics.byOutcome} />
      </div>

      {/* Pattern Insights */}
      <PatternInsightsSection patterns={patterns} />
    </div>
  );
}
