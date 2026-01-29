/**
 * OVIProgressTracker - Track user's progress in OVI methodology
 * Monitors completed readings, frameworks used, and reflection depth
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Award,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface OVIProgress {
  articlesRead: number;
  totalArticles: number;
  frameworksApplied: number;
  totalFrameworks: number;
  reflectionsLogged: number;
  evidenceCollected: number;
  currentStreak: number;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
}

interface OVIProgressTrackerProps {
  progress: OVIProgress;
}

export function OVIProgressTracker({ progress }: OVIProgressTrackerProps) {
  const readingProgress = (progress.articlesRead / progress.totalArticles) * 100;
  const frameworkProgress = (progress.frameworksApplied / progress.totalFrameworks) * 100;
  
  const getLevelColor = (level: OVIProgress['level']) => {
    switch (level) {
      case 'débutant': return 'bg-green-500/10 text-green-600';
      case 'intermédiaire': return 'bg-blue-500/10 text-blue-600';
      case 'avancé': return 'bg-purple-500/10 text-purple-600';
      case 'expert': return 'bg-amber-500/10 text-amber-600';
    }
  };

  const milestones = [
    { 
      icon: BookOpen, 
      label: 'Lectures', 
      value: progress.articlesRead, 
      target: 10, 
      achieved: progress.articlesRead >= 10 
    },
    { 
      icon: Brain, 
      label: 'Réflexions', 
      value: progress.reflectionsLogged, 
      target: 5, 
      achieved: progress.reflectionsLogged >= 5 
    },
    { 
      icon: Target, 
      label: 'Preuves', 
      value: progress.evidenceCollected, 
      target: 3, 
      achieved: progress.evidenceCollected >= 3 
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progression OVI
          </CardTitle>
          <Badge className={getLevelColor(progress.level)}>
            {progress.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reading Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Articles lus
            </span>
            <span className="font-medium">
              {progress.articlesRead}/{progress.totalArticles}
            </span>
          </div>
          <Progress value={readingProgress} className="h-2" />
        </div>

        {/* Framework Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              Cadres appliqués
            </span>
            <span className="font-medium">
              {progress.frameworksApplied}/{progress.totalFrameworks}
            </span>
          </div>
          <Progress value={frameworkProgress} className="h-2" />
        </div>

        {/* Streak */}
        {progress.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {progress.currentStreak} jours de suite
            </span>
          </div>
        )}

        {/* Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Jalons</h4>
          <div className="grid grid-cols-3 gap-2">
            {milestones.map((milestone, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg text-center transition-colors ${
                  milestone.achieved 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {milestone.achieved ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <milestone.icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs font-medium">{milestone.label}</p>
                <p className="text-xs text-muted-foreground">
                  {milestone.value}/{milestone.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
