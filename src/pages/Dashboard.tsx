import { useState, useEffect } from 'react';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { EXIT_KEYS, ExitKey, ExitKeyStep } from '@/lib/exit-keys-engine';
import { LIFE_MOTOR_PROFILES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Key,
  ArrowRight,
  Bookmark,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

interface StepProgress {
  phaseIndex: number;
  actionIndex: number;
  completed: boolean;
  completedAt?: string;
}

interface PlanProgress {
  exitKeyId: string;
  startedAt: string;
  stepsProgress: StepProgress[];
  notes?: string;
}

const DASHBOARD_STORAGE_KEY = 'exit_keys_dashboard';

export default function Dashboard() {
  const { profile, loading: profileLoading } = useExitKeysProfile();
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) as PlanProgress;
        setProgress(parsed);
        setSelectedKeyId(parsed.exitKeyId);
      } catch (e) {
        console.error('Error parsing dashboard progress:', e);
      }
    }
    setLoading(false);
  }, []);

  const selectedKey = selectedKeyId 
    ? EXIT_KEYS.find(k => k.id === selectedKeyId) 
    : null;

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (!progress || !selectedKey) return 0;
    
    const totalActions = selectedKey.steps.reduce((acc, step) => acc + step.actions.length, 0);
    const completedActions = progress.stepsProgress.filter(s => s.completed).length;
    
    return totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  };

  // Get phase progress
  const getPhaseProgress = (phaseIndex: number): { completed: number; total: number } => {
    if (!progress || !selectedKey) return { completed: 0, total: 0 };
    
    const phase = selectedKey.steps[phaseIndex];
    if (!phase) return { completed: 0, total: 0 };
    
    const phaseActions = progress.stepsProgress.filter(s => s.phaseIndex === phaseIndex);
    const completed = phaseActions.filter(s => s.completed).length;
    
    return { completed, total: phase.actions.length };
  };

  // Check if action is completed
  const isActionCompleted = (phaseIndex: number, actionIndex: number): boolean => {
    if (!progress) return false;
    return progress.stepsProgress.some(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex && s.completed
    );
  };

  // Toggle action completion
  const toggleAction = (phaseIndex: number, actionIndex: number) => {
    if (!selectedKey) return;

    setProgress(prev => {
      const now = new Date().toISOString();
      
      if (!prev) {
        // Initialize progress
        const newProgress: PlanProgress = {
          exitKeyId: selectedKey.id,
          startedAt: now,
          stepsProgress: [{
            phaseIndex,
            actionIndex,
            completed: true,
            completedAt: now
          }]
        };
        localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newProgress));
        return newProgress;
      }

      const existingIndex = prev.stepsProgress.findIndex(
        s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
      );

      let newStepsProgress: StepProgress[];
      
      if (existingIndex >= 0) {
        // Toggle existing
        newStepsProgress = prev.stepsProgress.map((s, i) => 
          i === existingIndex 
            ? { ...s, completed: !s.completed, completedAt: !s.completed ? now : undefined }
            : s
        );
      } else {
        // Add new
        newStepsProgress = [...prev.stepsProgress, {
          phaseIndex,
          actionIndex,
          completed: true,
          completedAt: now
        }];
      }

      const newProgress: PlanProgress = {
        ...prev,
        stepsProgress: newStepsProgress
      };
      
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });

    toast.success('Progression mise à jour');
  };

  // Start a new plan
  const startPlan = (keyId: string) => {
    const key = EXIT_KEYS.find(k => k.id === keyId);
    if (!key) return;

    const newProgress: PlanProgress = {
      exitKeyId: keyId,
      startedAt: new Date().toISOString(),
      stepsProgress: []
    };

    setProgress(newProgress);
    setSelectedKeyId(keyId);
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newProgress));
    toast.success(`Plan "${key.name}" démarré !`);
  };

  // Reset progress
  const resetProgress = () => {
    setProgress(null);
    setSelectedKeyId(null);
    localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    toast.success('Progression réinitialisée');
  };

  const overallProgress = calculateOverallProgress();
  const motorProfile = profile?.motorProfile ? LIFE_MOTOR_PROFILES[profile.motorProfile] : null;

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mon Tableau de Bord
          </h1>
          <p className="text-muted-foreground">
            Suivez votre progression vers votre nouvelle vie
          </p>
        </div>

        {/* Profile Summary */}
        {profile && motorProfile && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{motorProfile.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Profil: {motorProfile.label}</h3>
                  <p className="text-sm text-muted-foreground">{motorProfile.description}</p>
                </div>
                <Link to="/exit-keys">
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Voir mes clés
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!profile && (
          <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">Profil non configuré</h3>
                  <p className="text-sm text-muted-foreground">
                    Créez votre profil pour obtenir des recommandations personnalisées
                  </p>
                </div>
                <Link to="/exit-keys">
                  <Button>Créer mon profil</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Selection or Current Plan */}
        {!selectedKeyId ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Choisir un plan à suivre
              </CardTitle>
              <CardDescription>
                Sélectionnez une clé de sortie pour commencer à suivre votre progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={startPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une clé de sortie..." />
                </SelectTrigger>
                <SelectContent>
                  {EXIT_KEYS.map(key => (
                    <SelectItem key={key.id} value={key.id}>
                      <span className="flex items-center gap-2">
                        <span>{key.icon}</span>
                        <span>{key.name}</span>
                        <Badge variant="outline" className="ml-2">{key.difficulty}</Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ) : selectedKey && (
          <>
            {/* Current Plan Header */}
            <Card className="mb-6 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedKey.icon}</div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedKey.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedKey.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {selectedKey.timeframe}
                        </Badge>
                        <Badge variant={
                          selectedKey.difficulty === 'easy' ? 'default' :
                          selectedKey.difficulty === 'moderate' ? 'secondary' :
                          selectedKey.difficulty === 'hard' ? 'destructive' : 'destructive'
                        }>
                          {selectedKey.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedKeyId} onValueChange={startPlan}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXIT_KEYS.map(key => (
                          <SelectItem key={key.id} value={key.id}>
                            {key.icon} {key.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={resetProgress}>
                      Réinitialiser
                    </Button>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progression globale</span>
                    <span className="text-primary font-bold">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  {overallProgress === 100 && (
                    <div className="flex items-center gap-2 text-green-500 mt-2">
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Plan complété ! Félicitations !</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Phases */}
            <div className="space-y-6">
              {selectedKey.steps.map((phase, phaseIndex) => {
                const phaseProgress = getPhaseProgress(phaseIndex);
                const phaseComplete = phaseProgress.completed === phaseProgress.total && phaseProgress.total > 0;
                const phasePercent = phaseProgress.total > 0 
                  ? Math.round((phaseProgress.completed / phaseProgress.total) * 100) 
                  : 0;

                return (
                  <Card 
                    key={phaseIndex} 
                    className={`transition-all ${phaseComplete ? 'border-green-500/30 bg-green-500/5' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {phaseComplete ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              Phase {phase.phase}: {phase.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4" />
                              Durée estimée: {phase.duration}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{phasePercent}%</div>
                          <div className="text-xs text-muted-foreground">
                            {phaseProgress.completed}/{phaseProgress.total} actions
                          </div>
                        </div>
                      </div>
                      <Progress value={phasePercent} className="h-2 mt-3" />
                    </CardHeader>
                    <CardContent>
                      {/* Milestone */}
                      <div className="bg-primary/10 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Target className="w-4 h-4" />
                          Objectif: {phase.milestone}
                        </div>
                      </div>

                      {/* Critical Rule */}
                      {phase.criticalRule && (
                        <div className="bg-amber-500/10 rounded-lg p-3 mb-4 border border-amber-500/20">
                          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Règle critique:</span> {phase.criticalRule}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-3">
                        {phase.actions.map((action, actionIndex) => {
                          const completed = isActionCompleted(phaseIndex, actionIndex);
                          return (
                            <div 
                              key={actionIndex}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                                completed ? 'bg-green-500/5 border-green-500/20' : 'border-border'
                              }`}
                              onClick={() => toggleAction(phaseIndex, actionIndex)}
                            >
                              <Checkbox 
                                checked={completed}
                                className="mt-0.5"
                              />
                              <span className={`flex-1 text-sm ${completed ? 'line-through text-muted-foreground' : ''}`}>
                                {action}
                              </span>
                              {completed && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Risks & Requirements */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Prérequis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedKey.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Risques à surveiller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedKey.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
