import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, Clock, Target, Zap, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExitKey } from '@/lib/exit-keys-engine';

interface StepProgress {
  phaseIndex: number;
  actionIndex: number;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  reminderEnabled?: boolean;
}

interface PlanProgress {
  exitKeyId: string;
  startedAt: string;
  stepsProgress: StepProgress[];
  phaseNotes: { phaseIndex: number; note: string; updatedAt: string }[];
}

interface ProgressStatsProps {
  progress: PlanProgress;
  exitKey: ExitKey;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export function ProgressStats({ progress, exitKey }: ProgressStatsProps) {
  const { t } = useTranslation();
  
  // Calculate stats per phase
  const phaseStats = useMemo(() => {
    return exitKey.steps.map((phase, phaseIndex) => {
      const phaseSteps = progress.stepsProgress.filter(s => s.phaseIndex === phaseIndex);
      const completed = phaseSteps.filter(s => s.completed).length;
      const total = phase.actions.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Calculate time spent (from first to last completion in phase)
      const completedDates = phaseSteps
        .filter(s => s.completed && s.completedAt)
        .map(s => new Date(s.completedAt!).getTime())
        .sort((a, b) => a - b);

      let daysSpent = 0;
      if (completedDates.length >= 2) {
        daysSpent = Math.ceil((completedDates[completedDates.length - 1] - completedDates[0]) / (1000 * 60 * 60 * 24));
      } else if (completedDates.length === 1) {
        daysSpent = Math.ceil((Date.now() - completedDates[0]) / (1000 * 60 * 60 * 24));
      }

      return {
        name: `Phase ${phase.phase}`,
        fullName: phase.name,
        completed,
        total,
        percent,
        remaining: total - completed,
        daysSpent,
        duration: phase.duration
      };
    });
  }, [progress, exitKey]);

  // Overall completion data for pie chart
  const completionData = useMemo(() => {
    const totalCompleted = progress.stepsProgress.filter(s => s.completed).length;
    const totalActions = exitKey.steps.reduce((acc, step) => acc + step.actions.length, 0);
    const remaining = totalActions - totalCompleted;

    return [
      { name: 'Complété', value: totalCompleted, color: 'hsl(142, 76%, 36%)' },
      { name: 'Restant', value: remaining, color: 'hsl(var(--muted))' }
    ];
  }, [progress, exitKey]);

  // Velocity data (completions over time)
  const velocityData = useMemo(() => {
    const completedSteps = progress.stepsProgress
      .filter(s => s.completed && s.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    if (completedSteps.length === 0) return [];

    // Group by week
    const weeklyData: Record<string, number> = {};
    const startDate = new Date(progress.startedAt);
    
    completedSteps.forEach(step => {
      const completedDate = new Date(step.completedAt!);
      const weekNumber = Math.floor((completedDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekKey = `S${weekNumber + 1}`;
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    // Fill in missing weeks
    const weeks = Object.keys(weeklyData);
    if (weeks.length === 0) return [];

    const maxWeek = Math.max(...weeks.map(w => parseInt(w.substring(1))));
    const result = [];
    let cumulative = 0;

    for (let i = 1; i <= maxWeek; i++) {
      const weekKey = `S${i}`;
      const completed = weeklyData[weekKey] || 0;
      cumulative += completed;
      result.push({
        week: weekKey,
        completed,
        cumulative
      });
    }

    return result;
  }, [progress]);

  // Calculate average velocity
  const avgVelocity = useMemo(() => {
    if (velocityData.length === 0) return 0;
    const totalCompleted = velocityData.reduce((acc, d) => acc + d.completed, 0);
    return (totalCompleted / velocityData.length).toFixed(1);
  }, [velocityData]);

  // Days since start
  const daysSinceStart = useMemo(() => {
    return Math.ceil((Date.now() - new Date(progress.startedAt).getTime()) / (1000 * 60 * 60 * 24));
  }, [progress]);

  // Estimated completion
  const estimatedCompletion = useMemo(() => {
    const totalActions = exitKey.steps.reduce((acc, step) => acc + step.actions.length, 0);
    const completed = progress.stepsProgress.filter(s => s.completed).length;
    const remaining = totalActions - completed;

    if (completed === 0 || remaining === 0) return null;

    const daysPerAction = daysSinceStart / completed;
    const estimatedDays = Math.ceil(remaining * daysPerAction);
    const estimatedDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

    return {
      days: estimatedDays,
      date: estimatedDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    };
  }, [progress, exitKey, daysSinceStart]);

  const totalActions = exitKey.steps.reduce((acc, step) => acc + step.actions.length, 0);
  const completedActions = progress.stepsProgress.filter(s => s.completed).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Target className="w-4 h-4" />
              {t('dashboard.progress.actionsCompleted', 'Actions completed')}
            </div>
            <div className="text-2xl font-bold">
              {completedActions}/{totalActions}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((completedActions / totalActions) * 100)}% {t('dashboard.progress.ofPlan', 'of plan')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="w-4 h-4" />
              {t('dashboard.progress.daysElapsed', 'Days elapsed')}
            </div>
            <div className="text-2xl font-bold">{daysSinceStart}</div>
            <div className="text-xs text-muted-foreground">
              {t('dashboard.progress.sinceStart', 'Since start')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="w-4 h-4" />
              {t('dashboard.progress.avgVelocity', 'Average velocity')}
            </div>
            <div className="text-2xl font-bold">{avgVelocity}</div>
            <div className="text-xs text-muted-foreground">
              {t('dashboard.progress.actionsPerWeek', 'Actions/week')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.progress.estimatedEnd', 'Estimated end')}
            </div>
            <div className="text-2xl font-bold">
              {estimatedCompletion ? estimatedCompletion.date : '—'}
            </div>
            <div className="text-xs text-muted-foreground">
              {estimatedCompletion 
                ? t('dashboard.progress.inDays', 'In ~{{days}} days', { days: estimatedCompletion.days }) 
                : t('dashboard.progress.notEnoughData', 'Not enough data')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Completion Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.progress.overallProgress', 'Overall progress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {completionData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phase Progress Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.progress.progressByPhase', 'Progress by phase')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={phaseStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" width={70} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Progression']}
                  labelFormatter={(label) => {
                    const phase = phaseStats.find(p => p.name === label);
                    return phase ? phase.fullName : label;
                  }}
                />
                <Bar dataKey="percent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Chart */}
      {velocityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.progress.completionVelocity', 'Completion velocity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="hsl(var(--primary))" 
                  name="Actions/semaine"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="hsl(142, 76%, 36%)" 
                  name="Total cumulé"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Time per Phase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.progress.timePerPhase', 'Time per phase')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phaseStats.map((phase, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{phase.name}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{phase.fullName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {phase.daysSpent > 0 ? `${phase.daysSpent}j` : '—'}
                      </Badge>
                      <Badge 
                        variant={phase.percent === 100 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {phase.completed}/{phase.total}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${phase.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
