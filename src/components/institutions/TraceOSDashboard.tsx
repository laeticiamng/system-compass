import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  GitBranch,
  Users,
  Target,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DecisionNodeData } from './DecisionNode';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths, startOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface TraceOSDashboardProps {
  decisions: DecisionNodeData[];
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean } | null;
  color?: string;
}

function StatsCard({ title, value, subtitle, icon, trend, color }: StatsCardProps) {
  return (
    <Card className="bg-muted/30 hover:bg-muted/50 transition-colors">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              {trend && (
                <span className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: color ? `${color}20` : 'hsl(var(--muted))' }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function flattenDecisions(decisions: DecisionNodeData[]): DecisionNodeData[] {
  const result: DecisionNodeData[] = [];
  
  const traverse = (items: DecisionNodeData[]) => {
    items.forEach(item => {
      result.push(item);
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };
  
  traverse(decisions);
  return result;
}

const COLORS = {
  validated: '#22c55e',
  pending: '#f59e0b',
  abandoned: '#ef4444',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  info: '#3b82f6',
  teal: '#14b8a6'
};

const SCOPE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6', '#3b82f6'];

export function TraceOSDashboard({ decisions }: TraceOSDashboardProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const allDecisions = flattenDecisions(decisions);
    const now = new Date();
    
    // Status counts
    const statusCounts = {
      validated: allDecisions.filter(d => d.status === 'validated').length,
      pending: allDecisions.filter(d => d.status === 'pending').length,
      abandoned: allDecisions.filter(d => d.status === 'abandoned').length
    };

    // Calculate trends (compare last 30 days vs previous 30 days)
    const thirtyDaysAgo = subMonths(now, 1);
    const sixtyDaysAgo = subMonths(now, 2);
    
    const recentDecisions = allDecisions.filter(d => parseISO(d.date) >= thirtyDaysAgo);
    const previousDecisions = allDecisions.filter(d => {
      const date = parseISO(d.date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const calculateTrend = (recent: number, previous: number) => {
      if (previous === 0) return recent > 0 ? { value: 100, isPositive: true } : null;
      const change = ((recent - previous) / previous) * 100;
      return { value: Math.round(Math.abs(change)), isPositive: change >= 0 };
    };

    const trends = {
      total: calculateTrend(recentDecisions.length, previousDecisions.length),
      validated: calculateTrend(
        recentDecisions.filter(d => d.status === 'validated').length,
        previousDecisions.filter(d => d.status === 'validated').length
      )
    };

    // Scope distribution
    const scopeCounts: Record<string, number> = {};
    allDecisions.forEach(d => {
      scopeCounts[d.scope] = (scopeCounts[d.scope] || 0) + 1;
    });

    // Author distribution
    const authorCounts: Record<string, number> = {};
    allDecisions.forEach(d => {
      authorCounts[d.author] = (authorCounts[d.author] || 0) + 1;
    });

    // Monthly timeline data (last 6 months)
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: now });
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthDecisions = allDecisions.filter(d => {
        const decisionDate = parseISO(d.date);
        return startOfMonth(decisionDate).getTime() === monthStart.getTime();
      });
      
      return {
        name: format(month, 'MMM', { locale: fr }),
        fullDate: format(month, 'MMMM yyyy', { locale: fr }),
        total: monthDecisions.length,
        validated: monthDecisions.filter(d => d.status === 'validated').length,
        pending: monthDecisions.filter(d => d.status === 'pending').length,
        abandoned: monthDecisions.filter(d => d.status === 'abandoned').length
      };
    });

    // Weekly trend data (last 8 weeks)
    const eightWeeksAgo = subWeeks(now, 7);
    const weeks = eachWeekOfInterval({ start: startOfWeek(eightWeeksAgo), end: now }, { weekStartsOn: 1 });
    
    const weeklyData = weeks.map(week => {
      const weekStart = startOfWeek(week, { weekStartsOn: 1 });
      const weekDecisions = allDecisions.filter(d => {
        const decisionDate = parseISO(d.date);
        return startOfWeek(decisionDate, { weekStartsOn: 1 }).getTime() === weekStart.getTime();
      });
      
      return {
        name: format(week, 'dd/MM', { locale: fr }),
        decisions: weekDecisions.length,
        validated: weekDecisions.filter(d => d.status === 'validated').length
      };
    });

    // Status distribution for pie chart
    const statusData = [
      { name: 'Validées', value: statusCounts.validated, color: COLORS.validated },
      { name: 'En attente', value: statusCounts.pending, color: COLORS.pending },
      { name: 'Abandonnées', value: statusCounts.abandoned, color: COLORS.abandoned }
    ].filter(d => d.value > 0);

    // Scope data for pie chart
    const scopeData = Object.entries(scopeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], idx) => ({
        name,
        value,
        color: SCOPE_COLORS[idx % SCOPE_COLORS.length]
      }));

    // Abandoned branches count
    const totalAbandonedBranches = allDecisions.reduce(
      (sum, d) => sum + (d.abandonedBranches?.length || 0), 
      0
    );

    // Max depth
    const getMaxDepth = (items: DecisionNodeData[], depth = 0): number => {
      if (!items.length) return depth;
      return Math.max(...items.map(item => 
        item.children?.length ? getMaxDepth(item.children, depth + 1) : depth + 1
      ));
    };
    const maxDepth = getMaxDepth(decisions);

    // Average decisions per author
    const avgPerAuthor = Object.keys(authorCounts).length > 0 
      ? Math.round(allDecisions.length / Object.keys(authorCounts).length * 10) / 10
      : 0;

    // Velocity (decisions per week in last 4 weeks)
    const fourWeeksAgo = subWeeks(now, 4);
    const recentCount = allDecisions.filter(d => parseISO(d.date) >= fourWeeksAgo).length;
    const velocity = Math.round(recentCount / 4 * 10) / 10;

    // Validation rate
    const validationRate = allDecisions.length > 0 
      ? Math.round((statusCounts.validated / allDecisions.length) * 100)
      : 0;

    // Radar data for activity metrics
    const radarData = [
      { subject: 'Volume', value: Math.min(allDecisions.length / 10, 100), fullMark: 100 },
      { subject: 'Validation', value: validationRate, fullMark: 100 },
      { subject: 'Vélocité', value: Math.min(velocity * 10, 100), fullMark: 100 },
      { subject: 'Profondeur', value: Math.min(maxDepth * 20, 100), fullMark: 100 },
      { subject: 'Équipe', value: Math.min(Object.keys(authorCounts).length * 15, 100), fullMark: 100 },
      { subject: 'Diversité', value: Math.min(Object.keys(scopeCounts).length * 15, 100), fullMark: 100 }
    ];

    return {
      total: allDecisions.length,
      statusCounts,
      scopeCounts,
      authorCounts,
      monthlyData,
      weeklyData,
      statusData,
      scopeData,
      radarData,
      totalAbandonedBranches,
      maxDepth,
      avgPerAuthor,
      velocity,
      validationRate,
      trends,
      topAuthors: Object.entries(authorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topScopes: Object.entries(scopeCounts)
        .sort((a, b) => b[1] - a[1])
    };
  }, [decisions]);

  const chartConfig = {
    validated: { label: 'Validées', color: COLORS.validated },
    pending: { label: 'En attente', color: COLORS.pending },
    abandoned: { label: 'Abandonnées', color: COLORS.abandoned },
    total: { label: 'Total', color: COLORS.primary },
    decisions: { label: 'Décisions', color: COLORS.primary }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('traceos.dashboard.title', 'Tableau de bord analytique')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('traceos.dashboard.subtitle', 'Vue d\'ensemble complète de vos décisions')}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          {stats.velocity} {t('traceos.dashboard.perWeek', '/semaine')}
        </Badge>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('traceos.dashboard.totalDecisions', 'Total décisions')}
          value={stats.total}
          trend={stats.trends.total}
          icon={<GitBranch className="h-5 w-5 text-primary" />}
          color="hsl(var(--primary))"
        />
        <StatsCard
          title={t('traceos.dashboard.validated', 'Validées')}
          value={stats.statusCounts.validated}
          subtitle={`${stats.validationRate}% ${t('traceos.dashboard.validationRate', 'taux de validation')}`}
          trend={stats.trends.validated}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          color={COLORS.validated}
        />
        <StatsCard
          title={t('traceos.dashboard.pending', 'En attente')}
          value={stats.statusCounts.pending}
          subtitle={`${stats.total > 0 ? Math.round((stats.statusCounts.pending / stats.total) * 100) : 0}%`}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          color={COLORS.pending}
        />
        <StatsCard
          title={t('traceos.dashboard.abandoned', 'Abandonnées')}
          value={stats.statusCounts.abandoned}
          subtitle={`${stats.total > 0 ? Math.round((stats.statusCounts.abandoned / stats.total) * 100) : 0}%`}
          icon={<XCircle className="h-5 w-5 text-rose-600" />}
          color={COLORS.abandoned}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('traceos.dashboard.velocity', 'Vélocité')}
          value={`${stats.velocity}`}
          subtitle={t('traceos.dashboard.decisionsPerWeek', 'décisions/semaine')}
          icon={<Zap className="h-5 w-5 text-violet-600" />}
          color="#8b5cf6"
        />
        <StatsCard
          title={t('traceos.dashboard.maxDepth', 'Profondeur max')}
          value={stats.maxDepth}
          subtitle={t('traceos.dashboard.decisionLevels', 'niveaux de décision')}
          icon={<Target className="h-5 w-5 text-blue-600" />}
          color={COLORS.info}
        />
        <StatsCard
          title={t('traceos.dashboard.authors', 'Contributeurs')}
          value={Object.keys(stats.authorCounts).length}
          subtitle={`${stats.avgPerAuthor} ${t('traceos.dashboard.avgPerAuthor', 'moy./auteur')}`}
          icon={<Users className="h-5 w-5 text-teal-600" />}
          color={COLORS.teal}
        />
        <StatsCard
          title={t('traceos.dashboard.abandonedBranches', 'Branches abandonnées')}
          value={stats.totalAbandonedBranches}
          subtitle={t('traceos.dashboard.documentedAlternatives', 'alternatives documentées')}
          icon={<TrendingUp className="h-5 w-5 text-rose-600" />}
          color={COLORS.accent}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('traceos.dashboard.monthlyTrend', 'Évolution mensuelle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValidated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.validated} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.validated} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.pending} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.pending} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAbandoned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.abandoned} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.abandoned} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="validated" 
                    stackId="1"
                    stroke={COLORS.validated} 
                    fill="url(#colorValidated)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1"
                    stroke={COLORS.pending} 
                    fill="url(#colorPending)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="abandoned" 
                    stackId="1"
                    stroke={COLORS.abandoned} 
                    fill="url(#colorAbandoned)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.validated }} />
                <span className="text-xs text-muted-foreground">Validées</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.pending }} />
                <span className="text-xs text-muted-foreground">En attente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.abandoned }} />
                <span className="text-xs text-muted-foreground">Abandonnées</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Velocity Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('traceos.dashboard.weeklyVelocity', 'Vélocité hebdomadaire')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="decisions" 
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="validated" 
                    stroke={COLORS.validated}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: COLORS.validated, strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5" style={{ backgroundColor: COLORS.primary }} />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: COLORS.validated }} />
                <span className="text-xs text-muted-foreground">Validées</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {t('traceos.dashboard.statusDistribution', 'Répartition par statut')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {stats.statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, 'Décisions']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-4">
              {stats.statusData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scope Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {t('traceos.dashboard.byScope', 'Par périmètre')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {stats.scopeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.scopeData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80} 
                      tick={{ fontSize: 11 }} 
                      className="text-muted-foreground"
                      tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Décisions']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {stats.scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Radar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('traceos.dashboard.activityRadar', 'Profil d\'activité')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Activité"
                    dataKey="value"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Authors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('traceos.dashboard.topContributors', 'Principaux contributeurs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topAuthors.map(([author, count], idx) => (
              <Badge 
                key={author} 
                variant="secondary" 
                className="px-3 py-1.5 hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: `${SCOPE_COLORS[idx % SCOPE_COLORS.length]}20`,
                  borderColor: SCOPE_COLORS[idx % SCOPE_COLORS.length]
                }}
              >
                {author}
                <span className="ml-2 font-bold">{count}</span>
              </Badge>
            ))}
            {stats.topAuthors.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('traceos.dashboard.noContributors', 'Aucun contributeur')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
