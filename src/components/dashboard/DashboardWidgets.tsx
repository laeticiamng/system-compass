/**
 * Dashboard Widgets - Advanced progress tracking widgets
 */
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock,
  Zap,
  Trophy,
  Flame
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useDashboardProgress } from '@/hooks/useDashboardProgress';
import { cn } from '@/lib/utils';

interface ProgressWidgetProps {
  title: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  color?: string;
}

export function ProgressWidget({ title, value, max, icon, color = 'primary' }: ProgressWidgetProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("p-2 rounded-lg", `bg-${color}/10`)}>
            {icon}
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{value} / {max}</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakWidget() {
  const { progress } = useGamification();
  const streak = progress?.streak || 0;
  
  return (
    <Card className="glass-card bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-400">{streak}</p>
          <p className="text-xs text-muted-foreground">jours consécutifs</p>
        </div>
        {streak >= 7 && (
          <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">
            🔥 En feu !
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export function XPWidget() {
  const { progress } = useGamification();
  const xp = progress?.xp || 0;
  
  return (
    <Card className="glass-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{xp}</p>
          <p className="text-xs text-muted-foreground">points d'expérience</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickStatsWidget() {
  const { t } = useTranslation();
  const { progress } = useDashboardProgress();
  
  const stats = [
    { 
      label: 'Pays explorés', 
      value: progress ? 1 : 0, 
      icon: <Target className="w-4 h-4 text-blue-400" />,
      trend: '+2 cette semaine'
    },
    { 
      label: 'Étapes complétées', 
      value: 12, 
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      trend: '+3 ce mois'
    },
    { 
      label: 'Temps actif', 
      value: '4h', 
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      trend: 'Moyenne'
    },
    { 
      label: 'Score global', 
      value: 85, 
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      trend: '+5 pts'
    },
  ];
  
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          {t('dashboard.quickStats', 'Statistiques rapides')}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-emerald-400">{stat.trend}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function UpcomingTasksWidget() {
  const { t } = useTranslation();
  
  const tasks = [
    { id: 1, title: 'Comparer les visas Portugal/Espagne', due: 'Aujourd\'hui', priority: 'high' },
    { id: 2, title: 'Calculer impact fiscal', due: 'Demain', priority: 'medium' },
    { id: 3, title: 'Contacter avocat fiscaliste', due: 'Cette semaine', priority: 'low' },
  ];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      default: return 'text-blue-400';
    }
  };
  
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {t('dashboard.upcomingTasks', 'Prochaines étapes')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", getPriorityColor(task.priority).replace('text-', 'bg-'))} />
              <span className="text-sm">{task.title}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {task.due}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
