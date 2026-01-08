import { useState, useEffect, useCallback } from 'react';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { EXIT_KEYS, ExitKey, ExitKeyStep } from '@/lib/exit-keys-engine';
import { LIFE_MOTOR_PROFILES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { ProgressStats } from '@/components/dashboard/ProgressStats';
import { DeadlineCalendar } from '@/components/dashboard/DeadlineCalendar';
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
  Trophy,
  Bell,
  BellOff,
  MessageSquare,
  ChevronDown,
  Calendar,
  Save,
  X,
  BarChart3,
  CalendarDays,
  ListChecks
} from 'lucide-react';
import { toast } from 'sonner';

interface StepProgress {
  phaseIndex: number;
  actionIndex: number;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  reminderEnabled?: boolean;
}

interface PhaseNote {
  phaseIndex: number;
  note: string;
  updatedAt: string;
}

interface PlanProgress {
  exitKeyId: string;
  startedAt: string;
  stepsProgress: StepProgress[];
  phaseNotes: PhaseNote[];
}

const DASHBOARD_STORAGE_KEY = 'exit_keys_dashboard';
const REMINDERS_KEY = 'exit_keys_reminders';

// Calculate suggested deadline based on phase duration
function parseDuration(duration: string): number {
  // Parse durations like "6-12 mois", "2-3 ans", "1-2 ans"
  const match = duration.match(/(\d+)-?(\d+)?\s*(mois|ans|months|years)/i);
  if (!match) return 180; // Default 6 months in days
  
  const minVal = parseInt(match[1]);
  const unit = match[3].toLowerCase();
  
  if (unit === 'mois' || unit === 'months') {
    return minVal * 30; // days
  } else {
    return minVal * 365; // days
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { profile, loading: profileLoading } = useExitKeysProfile();
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({});

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) as PlanProgress;
        // Ensure phaseNotes exists for backward compatibility
        if (!parsed.phaseNotes) {
          parsed.phaseNotes = [];
        }
        setProgress(parsed);
        setSelectedKeyId(parsed.exitKeyId);
      } catch (e) {
        console.error('Error parsing dashboard progress:', e);
      }
    }
    setLoading(false);
  }, []);

  // Check for upcoming deadlines and show notifications
  useEffect(() => {
    if (!progress) return;

    const upcomingDeadlines = progress.stepsProgress.filter(step => {
      if (!step.deadline || step.completed || !step.reminderEnabled) return false;
      const daysRemaining = getDaysRemaining(step.deadline);
      return daysRemaining <= 7 && daysRemaining >= 0;
    });

    if (upcomingDeadlines.length > 0) {
      const selectedKey = EXIT_KEYS.find(k => k.id === progress.exitKeyId);
      if (selectedKey) {
        upcomingDeadlines.forEach(step => {
          const phase = selectedKey.steps[step.phaseIndex];
          const action = phase?.actions[step.actionIndex];
          const daysRemaining = getDaysRemaining(step.deadline!);
          
          if (daysRemaining === 0) {
            toast.warning(`Échéance aujourd'hui: ${action?.substring(0, 50)}...`, {
              duration: 10000,
            });
          } else if (daysRemaining <= 3) {
            toast.info(`Échéance dans ${daysRemaining} jour(s): ${action?.substring(0, 40)}...`, {
              duration: 8000,
            });
          }
        });
      }
    }
  }, [progress]);

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

  // Get action step data
  const getActionStep = (phaseIndex: number, actionIndex: number): StepProgress | undefined => {
    if (!progress) return undefined;
    return progress.stepsProgress.find(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
    );
  };

  // Get phase note
  const getPhaseNote = (phaseIndex: number): string => {
    if (!progress) return '';
    const note = progress.phaseNotes.find(n => n.phaseIndex === phaseIndex);
    return note?.note || '';
  };

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: PlanProgress) => {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newProgress));
  }, []);

  // Toggle action completion
  const toggleAction = (phaseIndex: number, actionIndex: number) => {
    if (!selectedKey) return;

    setProgress(prev => {
      const now = new Date().toISOString();
      
      if (!prev) {
        const newProgress: PlanProgress = {
          exitKeyId: selectedKey.id,
          startedAt: now,
          stepsProgress: [{
            phaseIndex,
            actionIndex,
            completed: true,
            completedAt: now
          }],
          phaseNotes: []
        };
        saveProgress(newProgress);
        return newProgress;
      }

      const existingIndex = prev.stepsProgress.findIndex(
        s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
      );

      let newStepsProgress: StepProgress[];
      
      if (existingIndex >= 0) {
        newStepsProgress = prev.stepsProgress.map((s, i) => 
          i === existingIndex 
            ? { ...s, completed: !s.completed, completedAt: !s.completed ? now : undefined }
            : s
        );
      } else {
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
      
      saveProgress(newProgress);
      return newProgress;
    });

    toast.success('Progression mise à jour');
  };

  // Set deadline for an action
  const setDeadline = (phaseIndex: number, actionIndex: number, deadline: string) => {
    if (!selectedKey || !progress) return;

    setProgress(prev => {
      if (!prev) return prev;

      const existingIndex = prev.stepsProgress.findIndex(
        s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
      );

      let newStepsProgress: StepProgress[];
      
      if (existingIndex >= 0) {
        newStepsProgress = prev.stepsProgress.map((s, i) => 
          i === existingIndex 
            ? { ...s, deadline, reminderEnabled: true }
            : s
        );
      } else {
        newStepsProgress = [...prev.stepsProgress, {
          phaseIndex,
          actionIndex,
          completed: false,
          deadline,
          reminderEnabled: true
        }];
      }

      const newProgress: PlanProgress = {
        ...prev,
        stepsProgress: newStepsProgress
      };
      
      saveProgress(newProgress);
      return newProgress;
    });

    toast.success('Échéance définie');
  };

  // Toggle reminder for an action
  const toggleReminder = (phaseIndex: number, actionIndex: number) => {
    if (!progress) return;

    setProgress(prev => {
      if (!prev) return prev;

      const existingIndex = prev.stepsProgress.findIndex(
        s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
      );

      if (existingIndex < 0) return prev;

      const newStepsProgress = prev.stepsProgress.map((s, i) => 
        i === existingIndex 
          ? { ...s, reminderEnabled: !s.reminderEnabled }
          : s
      );

      const newProgress: PlanProgress = {
        ...prev,
        stepsProgress: newStepsProgress
      };
      
      saveProgress(newProgress);
      return newProgress;
    });

    toast.success('Rappel mis à jour');
  };

  // Save phase note
  const savePhaseNote = (phaseIndex: number) => {
    if (!progress) return;

    setProgress(prev => {
      if (!prev) return prev;

      const existingIndex = prev.phaseNotes.findIndex(n => n.phaseIndex === phaseIndex);
      let newPhaseNotes: PhaseNote[];

      if (existingIndex >= 0) {
        newPhaseNotes = prev.phaseNotes.map((n, i) => 
          i === existingIndex 
            ? { ...n, note: noteText, updatedAt: new Date().toISOString() }
            : n
        );
      } else {
        newPhaseNotes = [...prev.phaseNotes, {
          phaseIndex,
          note: noteText,
          updatedAt: new Date().toISOString()
        }];
      }

      const newProgress: PlanProgress = {
        ...prev,
        phaseNotes: newPhaseNotes
      };
      
      saveProgress(newProgress);
      return newProgress;
    });

    setEditingNote(null);
    setNoteText('');
    toast.success('Note sauvegardée');
  };

  // Start editing a note
  const startEditingNote = (phaseIndex: number) => {
    setNoteText(getPhaseNote(phaseIndex));
    setEditingNote(phaseIndex);
  };

  // Get suggested deadline for a phase
  const getSuggestedDeadline = (phaseIndex: number): string => {
    if (!selectedKey || !progress) return formatDate(new Date());

    // Calculate cumulative duration from start
    let totalDays = 0;
    for (let i = 0; i <= phaseIndex; i++) {
      totalDays += parseDuration(selectedKey.steps[i].duration);
    }

    const startDate = new Date(progress.startedAt);
    const suggestedDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return formatDate(suggestedDate);
  };

  // Start a new plan
  const startPlan = (keyId: string) => {
    const key = EXIT_KEYS.find(k => k.id === keyId);
    if (!key) return;

    const newProgress: PlanProgress = {
      exitKeyId: keyId,
      startedAt: new Date().toISOString(),
      stepsProgress: [],
      phaseNotes: []
    };

    setProgress(newProgress);
    setSelectedKeyId(keyId);
    saveProgress(newProgress);
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
                        {progress && (
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            Démarré le {formatDisplayDate(progress.startedAt)}
                          </Badge>
                        )}
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

            {/* Tabs for different views */}
            <Tabs defaultValue="plan" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="plan" className="gap-2">
                  <ListChecks className="w-4 h-4" />
                  <span className="hidden sm:inline">Plan</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendrier</span>
                </TabsTrigger>
              </TabsList>

              {/* Stats Tab */}
              <TabsContent value="stats">
                {progress && (
                  <ProgressStats progress={progress} exitKey={selectedKey} />
                )}
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar">
                {progress && (
                  <DeadlineCalendar progress={progress} exitKey={selectedKey} />
                )}
              </TabsContent>

              {/* Plan Tab */}
              <TabsContent value="plan">
                {/* Phases */}
                <div className="space-y-6">
              {selectedKey.steps.map((phase, phaseIndex) => {
                const phaseProgress = getPhaseProgress(phaseIndex);
                const phaseComplete = phaseProgress.completed === phaseProgress.total && phaseProgress.total > 0;
                const phasePercent = phaseProgress.total > 0 
                  ? Math.round((phaseProgress.completed / phaseProgress.total) * 100) 
                  : 0;
                const phaseNote = getPhaseNote(phaseIndex);
                const suggestedDeadline = getSuggestedDeadline(phaseIndex);

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
                            <CardDescription className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Durée: {phase.duration}
                              </span>
                              <span className="flex items-center gap-1 text-primary">
                                <Target className="w-4 h-4" />
                                Échéance suggérée: {formatDisplayDate(suggestedDeadline)}
                              </span>
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

                      {/* Phase Notes */}
                      <Collapsible 
                        open={openPhases[phaseIndex] || editingNote === phaseIndex}
                        onOpenChange={(open) => setOpenPhases(prev => ({ ...prev, [phaseIndex]: open }))}
                        className="mb-4"
                      >
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Notes personnelles
                              {phaseNote && <Badge variant="secondary" className="ml-1">1</Badge>}
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </CollapsibleTrigger>
                          {!editingNote && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => startEditingNote(phaseIndex)}
                            >
                              {phaseNote ? 'Modifier' : 'Ajouter une note'}
                            </Button>
                          )}
                        </div>
                        <CollapsibleContent className="mt-3">
                          {editingNote === phaseIndex ? (
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Écrivez vos notes, observations, idées pour cette phase..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={4}
                                className="resize-none"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => savePhaseNote(phaseIndex)}>
                                  <Save className="w-4 h-4 mr-1" />
                                  Sauvegarder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingNote(null);
                                    setNoteText('');
                                  }}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : phaseNote ? (
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm whitespace-pre-wrap">{phaseNote}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Dernière modification: {formatDisplayDate(
                                  progress?.phaseNotes.find(n => n.phaseIndex === phaseIndex)?.updatedAt || ''
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Aucune note pour cette phase. Cliquez sur "Ajouter une note" pour commencer.
                            </p>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Actions */}
                      <div className="space-y-3">
                        {phase.actions.map((action, actionIndex) => {
                          const completed = isActionCompleted(phaseIndex, actionIndex);
                          const stepData = getActionStep(phaseIndex, actionIndex);
                          const daysRemaining = stepData?.deadline ? getDaysRemaining(stepData.deadline) : null;
                          
                          return (
                            <div 
                              key={actionIndex}
                              className={`p-3 rounded-lg border transition-all ${
                                completed ? 'bg-green-500/5 border-green-500/20' : 'border-border'
                              }`}
                            >
                              <div 
                                className="flex items-start gap-3 cursor-pointer hover:bg-muted/30 rounded -m-1 p-1"
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
                              
                              {/* Deadline & Reminder */}
                              <div className="flex items-center gap-3 mt-2 ml-7">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {stepData?.deadline 
                                        ? formatDisplayDate(stepData.deadline)
                                        : 'Définir échéance'
                                      }
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Définir l'échéance</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p className="text-sm text-muted-foreground">{action}</p>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Date d'échéance</label>
                                        <input
                                          type="date"
                                          className="w-full px-3 py-2 border rounded-md bg-background"
                                          defaultValue={stepData?.deadline || suggestedDeadline}
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              setDeadline(phaseIndex, actionIndex, e.target.value);
                                            }
                                          }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Échéance suggérée basée sur la durée de la phase: {formatDisplayDate(suggestedDeadline)}
                                        </p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {stepData?.deadline && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReminder(phaseIndex, actionIndex);
                                      }}
                                    >
                                      {stepData.reminderEnabled ? (
                                        <>
                                          <Bell className="w-3 h-3 text-primary" />
                                          Rappel actif
                                        </>
                                      ) : (
                                        <>
                                          <BellOff className="w-3 h-3" />
                                          Rappel désactivé
                                        </>
                                      )}
                                    </Button>

                                    {!completed && daysRemaining !== null && (
                                      <Badge 
                                        variant={
                                          daysRemaining < 0 ? 'destructive' :
                                          daysRemaining <= 3 ? 'destructive' :
                                          daysRemaining <= 7 ? 'secondary' : 'outline'
                                        }
                                        className="text-xs"
                                      >
                                        {daysRemaining < 0 
                                          ? `En retard de ${Math.abs(daysRemaining)} j`
                                          : daysRemaining === 0
                                          ? "Aujourd'hui"
                                          : `${daysRemaining} j restants`
                                        }
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
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
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
