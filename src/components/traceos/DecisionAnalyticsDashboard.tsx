/**
 * Decision Analytics Dashboard - TraceOS decision insights and patterns
 */
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionMetrics {
  totalDecisions: number;
  thisMonth: number;
  avgResponseTime: number; // hours
  successRate: number;
  pendingReview: number;
  byCategory: Record<string, number>;
  byOutcome: { positive: number; neutral: number; negative: number };
  trend: number; // percentage change
}

// Mock data - in production would come from useTraceOSDecisions
const MOCK_METRICS: DecisionMetrics = {
  totalDecisions: 47,
  thisMonth: 8,
  avgResponseTime: 4.2,
  successRate: 78,
  pendingReview: 3,
  byCategory: {
    'Stratégique': 12,
    'Opérationnel': 18,
    'Financier': 9,
    'RH': 5,
    'Technique': 3,
  },
  byOutcome: { positive: 32, neutral: 10, negative: 5 },
  trend: 15,
};

const RECENT_PATTERNS = [
  {
    id: '1',
    pattern: 'Décisions rapides souvent révisées',
    insight: 'Les décisions prises en moins de 24h ont un taux de révision 40% plus élevé',
    type: 'warning',
  },
  {
    id: '2',
    pattern: 'Meilleur timing : mardi-mercredi',
    insight: 'Vos décisions prises en milieu de semaine montrent de meilleurs résultats',
    type: 'success',
  },
  {
    id: '3',
    pattern: 'Biais de confirmation détecté',
    insight: '3 décisions récentes montrent une recherche sélective d\'informations',
    type: 'warning',
  },
];

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
            <span>Positif ({outcomes.positive})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Neutre ({outcomes.neutral})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Négatif ({outcomes.negative})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatternInsights() {
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
        {RECENT_PATTERNS.map(pattern => (
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

export function DecisionAnalyticsDashboard() {
  const metrics = useMemo(() => MOCK_METRICS, []);

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
          value={`${metrics.avgResponseTime}h`}
          subtitle="Délai de décision"
          icon={Clock}
        />
        <MetricCard
          title="Taux de succès"
          value={`${metrics.successRate}%`}
          subtitle="Résultats positifs"
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
      <PatternInsights />
    </div>
  );
}
