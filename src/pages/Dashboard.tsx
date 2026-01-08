import { useState, useEffect, useMemo } from 'react';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { useDashboardProgress } from '@/hooks/useDashboardProgress';
import { EXIT_KEYS } from '@/lib/exit-keys-engine';
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
  ListChecks,
  Cloud,
  CloudOff,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Helper functions
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)-?(\d+)?\s*(mois|ans|months|years)/i);
  if (!match) return 180;
  const minVal = parseInt(match[1]);
  const unit = match[3].toLowerCase();
  if (unit === 'mois' || unit === 'months') {
    return minVal * 30;
  }
  return minVal * 365;
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
  const {
    progress,
    loading,
    syncing,
    isLoggedIn,
    startPlan,
    toggleAction,
    setDeadline,
    toggleReminder,
    savePhaseNote,
    resetProgress,
    isActionCompleted,
    getActionStep,
    getPhaseNote,
    getPhaseNoteUpdatedAt,
  } = useDashboardProgress();

  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({});

  const selectedKeyId = progress?.exitKeyId || null;
  const selectedKey = selectedKeyId ? EXIT_KEYS.find(k => k.id === selectedKeyId) : null;

  // Check for upcoming deadlines and show notifications
  useEffect(() => {
    if (!progress || !selectedKey) return;

    const upcomingDeadlines = progress.stepsProgress.filter(step => {
      if (!step.deadline || step.completed || !step.reminderEnabled) return false;
      const daysRemaining = getDaysRemaining(step.deadline);
      return daysRemaining <= 7 && daysRemaining >= 0;
    });

    if (upcomingDeadlines.length > 0) {
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
  }, [progress, selectedKey]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!progress || !selectedKey) return 0;
    const totalActions = selectedKey.steps.reduce((acc, step) => acc + step.actions.length, 0);
    const completedActions = progress.stepsProgress.filter(s => s.completed).length;
    return totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  }, [progress, selectedKey]);

  // Get phase progress
  const getPhaseProgress = (phaseIndex: number): { completed: number; total: number } => {
    if (!progress || !selectedKey) return { completed: 0, total: 0 };
    const phase = selectedKey.steps[phaseIndex];
    if (!phase) return { completed: 0, total: 0 };
    const phaseActions = progress.stepsProgress.filter(s => s.phaseIndex === phaseIndex);
    const completed = phaseActions.filter(s => s.completed).length;
    return { completed, total: phase.actions.length };
  };

  // Get suggested deadline for a phase
  const getSuggestedDeadline = (phaseIndex: number): string => {
    if (!selectedKey || !progress) return formatDate(new Date());
    let totalDays = 0;
    for (let i = 0; i <= phaseIndex; i++) {
      totalDays += parseDuration(selectedKey.steps[i].duration);
    }
    const startDate = new Date(progress.startedAt);
    const suggestedDate = new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return formatDate(suggestedDate);
  };

  // Handle starting a new plan
  const handleStartPlan = async (keyId: string) => {
    await startPlan(keyId);
    toast.success(`Plan démarré !`);
  };

  // Handle reset
  const handleResetProgress = async () => {
    await resetProgress();
    toast.success('Progression réinitialisée');
  };

  // Handle toggle action
  const handleToggleAction = async (phaseIndex: number, actionIndex: number) => {
    await toggleAction(phaseIndex, actionIndex);
    toast.success('Progression mise à jour');
  };

  // Handle set deadline
  const handleSetDeadline = async (phaseIndex: number, actionIndex: number, deadline: string) => {
    await setDeadline(phaseIndex, actionIndex, deadline);
    toast.success('Échéance définie');
  };

  // Handle toggle reminder
  const handleToggleReminder = async (phaseIndex: number, actionIndex: number) => {
    await toggleReminder(phaseIndex, actionIndex);
    toast.success('Rappel mis à jour');
  };

  // Handle save phase note
  const handleSavePhaseNote = async (phaseIndex: number) => {
    await savePhaseNote(phaseIndex, noteText);
    setEditingNote(null);
    setNoteText('');
    toast.success('Note sauvegardée');
  };

  // Start editing a note
  const startEditingNote = (phaseIndex: number) => {
    setNoteText(getPhaseNote(phaseIndex));
    setEditingNote(phaseIndex);
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mon Tableau de Bord
            </h1>
            <p className="text-muted-foreground">
              Suivez votre progression vers votre nouvelle vie
            </p>
          </div>
          
          {/* Sync Status */}
          <div className="flex items-center gap-2">
            {syncing && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Synchronisation...
              </Badge>
            )}
            {isLoggedIn ? (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600/30">
                <Cloud className="w-3 h-3" />
                Synchronisé
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <CloudOff className="w-3 h-3" />
                Local uniquement
              </Badge>
            )}
          </div>
        </div>

        {/* Login prompt for guests */}
        {!isLoggedIn && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Cloud className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Connectez-vous pour synchroniser</p>
                  <p className="text-xs text-muted-foreground">
                    Vos données sont sauvegardées localement. Connectez-vous pour les synchroniser dans le cloud.
                  </p>
                </div>
                <Link to="/auth">
                  <Button size="sm">Se connecter</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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
              <Select onValueChange={handleStartPlan}>
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
        ) : selectedKey && progress && (
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
                          'destructive'
                        }>
                          {selectedKey.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          Démarré le {formatDisplayDate(progress.startedAt)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedKeyId} onValueChange={handleStartPlan}>
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
                    <Button variant="outline" size="sm" onClick={handleResetProgress}>
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
                <ProgressStats progress={progress} exitKey={selectedKey} />
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar">
                <DeadlineCalendar progress={progress} exitKey={selectedKey} />
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
                    const currentPhaseNote = getPhaseNote(phaseIndex);
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
                                  {currentPhaseNote && <Badge variant="secondary" className="ml-1">1</Badge>}
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </CollapsibleTrigger>
                              {editingNote !== phaseIndex && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => startEditingNote(phaseIndex)}
                                >
                                  {currentPhaseNote ? 'Modifier' : 'Ajouter une note'}
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
                                    <Button size="sm" onClick={() => handleSavePhaseNote(phaseIndex)}>
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
                              ) : currentPhaseNote ? (
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm whitespace-pre-wrap">{currentPhaseNote}</p>
                                  {getPhaseNoteUpdatedAt(phaseIndex) && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Dernière modification: {formatDisplayDate(getPhaseNoteUpdatedAt(phaseIndex)!)}
                                    </p>
                                  )}
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
                                    onClick={() => handleToggleAction(phaseIndex, actionIndex)}
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
                                                  handleSetDeadline(phaseIndex, actionIndex, e.target.value);
                                                }
                                              }}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                              Échéance suggérée: {formatDisplayDate(suggestedDeadline)}
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
                                            handleToggleReminder(phaseIndex, actionIndex);
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
