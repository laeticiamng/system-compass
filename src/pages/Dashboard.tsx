import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { useDashboardProgress } from '@/hooks/useDashboardProgress';
import { useSavedComparisons } from '@/hooks/useSavedComparisons';
import { useSavedGames } from '@/hooks/useSavedGames';
import { useGameStatistics } from '@/hooks/useGameStatistics';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserCases } from '@/hooks/useUserCases';
import { useLatentZones } from '@/hooks/useLatentZones';
import { useTestResults } from '@/hooks/useTestResults';
import { useIrreversa } from '@/hooks/useIrreversa';
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
import { Link, useNavigate } from 'react-router-dom';
import { ProgressStats } from '@/components/dashboard/ProgressStats';
import { DeadlineCalendar } from '@/components/dashboard/DeadlineCalendar';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { AchievementsPanel } from '@/components/game/AchievementsPanel';
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
  Loader2,
  Map,
  Gamepad2,
  Play,
  Trash2,
  Zap,
  Eye,
  Lock,
  Building2,
  Layers,
  Briefcase,
  FileText,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { AiHelpButton } from '@/components/ai/AiHelpButton';
import { AiAction, AiContext } from '@/components/ai/AiSidePanel';
import { AiUsageStats } from '@/components/dashboard/AiUsageStats';
import { EmptyDashboardState } from '@/components/dashboard/EmptyDashboardState';
import { DashboardExitKeysWidget } from '@/components/dashboard/DashboardExitKeysWidget';
import { UserProfileWidget } from '@/components/dashboard/UserProfileWidget';
import { GameStatisticsWidget } from '@/components/dashboard/GameStatisticsWidget';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const { comparisons, loading: comparisonsLoading, deleteComparison } = useSavedComparisons();
  const { savedGames, loading: gamesLoading, fetchSavedGames, deleteGame } = useSavedGames();
  const { stats, loading: statsLoading, riskSuccessRate, topActions } = useGameStatistics();
  const { tier } = useSubscription();
  const { cases, isLoading: casesLoading } = useUserCases();
  const { zones, loading: zonesLoading } = useLatentZones();
  const { results: testResults, loading: testsLoading } = useTestResults();
  const { thresholds, loading: irreversaLoading } = useIrreversa();

  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({});

  // Fetch saved games when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedGames();
    }
  }, [isLoggedIn, fetchSavedGames]);

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
          toast.warning(`${t('dashboard.deadlineToday')}: ${action?.substring(0, 50)}...`, {
            duration: 10000,
          });
        } else if (daysRemaining <= 3) {
          toast.info(`${t('dashboard.deadlineIn', { days: daysRemaining })}: ${action?.substring(0, 40)}...`, {
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
    toast.success(t('dashboard.planStarted'));
  };

  // Handle reset
  const handleResetProgress = async () => {
    await resetProgress();
    toast.success(t('dashboard.progressReset'));
  };

  // Handle toggle action
  const handleToggleAction = async (phaseIndex: number, actionIndex: number) => {
    await toggleAction(phaseIndex, actionIndex);
    toast.success(t('dashboard.progressUpdated'));
  };

  // Handle set deadline
  const handleSetDeadline = async (phaseIndex: number, actionIndex: number, deadline: string) => {
    await setDeadline(phaseIndex, actionIndex, deadline);
    toast.success(t('dashboard.deadlineSet'));
  };

  // Handle toggle reminder
  const handleToggleReminder = async (phaseIndex: number, actionIndex: number) => {
    await toggleReminder(phaseIndex, actionIndex);
    toast.success(t('dashboard.reminderUpdated'));
  };

  // Handle save phase note
  const handleSavePhaseNote = async (phaseIndex: number) => {
    await savePhaseNote(phaseIndex, noteText);
    setEditingNote(null);
    setNoteText('');
    toast.success(t('dashboard.noteSaved'));
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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* AI Help Button */}
            {selectedKey && (
              <AiHelpButton
                title={t('ai.dashboardAssistant', 'Assistant Tableau de Bord')}
                actions={[
                  { id: 'next_logical_step', label: t('ai.actions.nextLogicalStep', 'Prochain pas logique'), description: t('ai.actions.nextLogicalStepDesc', 'Proposition du prochain pas le plus cohérent') },
                  { id: 'plan_30_90', label: t('ai.actions.plan3090', 'Planifier 30/90 jours'), description: t('ai.actions.plan3090Desc', 'Proposition de plan par phases et jalons') },
                  { id: 'soft_reminders', label: t('ai.actions.softReminders', 'Rappels suggérés'), description: t('ai.actions.softRemindersDesc', 'Recommandations de rappels basées sur l\'avancement') },
                ]}
                context={{
                  module: 'dashboard',
                  progress: progress,
                  trajectory: selectedKey ? { id: selectedKey.id, name: selectedKey.name } : undefined,
                  profile: profile || undefined,
                }}
                variant="secondary"
                size="sm"
              />
            )}
            
            {/* Sync Status */}
            {syncing && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">{t('dashboard.syncing')}</span>
              </Badge>
            )}
            {isLoggedIn ? (
              <Badge variant="outline" className="gap-1 text-xs text-green-600 border-green-600/30">
                <Cloud className="w-3 h-3" />
                <span className="hidden sm:inline">{t('dashboard.synced')}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                <CloudOff className="w-3 h-3" />
                <span className="hidden sm:inline">{t('dashboard.localOnly')}</span>
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
                  <p className="text-sm font-medium">{t('dashboard.connectToSync')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.localDataInfo')}
                  </p>
                </div>
                <Link to="/auth">
                  <Button size="sm">{t('dashboard.signIn')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for New Users - show only when no profile AND no exit key started */}
        {!profile && !selectedKeyId && !loading && !profileLoading && (
          <div className="mb-6">
            <EmptyDashboardState hasProfile={!!profile} hasExitKey={!!selectedKeyId} />
          </div>
        )}

        {/* Profile Summary */}
        {profile && motorProfile && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{motorProfile.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{t('dashboard.profileLabel')}: {t(motorProfile.label)}</h3>
                  <p className="text-sm text-muted-foreground">{t(motorProfile.description)}</p>
                </div>
                <Link to="/exit-keys">
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    {t('dashboard.viewKeys')}
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
                  <h3 className="font-semibold">{t('dashboard.profileNotConfigured')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.profileNotConfiguredDesc')}
                  </p>
                </div>
                <Link to="/exit-keys">
                  <Button>{t('dashboard.createProfile')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Management */}
        <SubscriptionStatus isLoggedIn={isLoggedIn} />

        {/* User Profile and Game Stats Widgets */}
        {isLoggedIn && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <UserProfileWidget />
            <GameStatisticsWidget />
          </div>
        )}

        {/* Exit Keys Widget */}
        {isLoggedIn && (
          <div className="mb-6">
            <DashboardExitKeysWidget />
          </div>
        )}

        {/* AI Usage Stats - Show for subscribed users */}
        {isLoggedIn && (tier === 'premium' || tier === 'pro') && (
          <div className="mb-6">
            <AiUsageStats compact={false} showActivity={false} />
          </div>
        )}

        {/* Active Cases Section */}
        {isLoggedIn && cases.filter(c => c.status === 'active').length > 0 && (
          <Card className="mb-6 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                {t('dashboard.activeCases', 'Dossiers actifs')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.activeCasesDesc', 'Vos projets de relocalisation ou entrepreneuriat en cours')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cases.filter(c => c.status === 'active').slice(0, 6).map(caseItem => (
                  <Link key={caseItem.id} to={`/cases/${caseItem.id}`}>
                    <div className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{caseItem.title}</p>
                        <Badge variant="outline" className={caseItem.intention === 'entrepreneurship' ? 'border-amber-500/40 text-amber-600' : 'border-blue-500/40 text-blue-600'}>
                          {caseItem.intention === 'entrepreneurship' ? t('cases.deep', 'Deep') : t('cases.light', 'Light')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{caseItem.milestones?.filter(m => m.completed).length || 0}/{caseItem.milestones?.length || 0} {t('dashboard.milestonesComplete', 'jalons')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latent Zones Section */}
        {isLoggedIn && zones.filter(z => z.status === 'emergent' || z.status === 'fragile').length > 0 && (
          <Card className="mb-6 border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                {t('dashboard.latentZones', 'Zones en tension')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.latentZonesDesc', 'Zones latentes nécessitant une attention')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {zones.filter(z => z.status === 'emergent' || z.status === 'fragile').slice(0, 4).map(zone => (
                  <Link key={zone.id} to="/latent">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{zone.title}</p>
                        {zone.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{zone.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={zone.status === 'fragile' ? 'border-amber-500/40 text-amber-600' : 'border-blue-500/40 text-blue-600'}>
                        {zone.status === 'fragile' ? '⚠️' : '👁️'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/latent" className="block mt-3">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Eye className="w-4 h-4" />
                  {t('dashboard.viewAllZones', 'Voir toutes les zones')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Test Results Section */}
        {isLoggedIn && testResults.length > 0 && (
          <Card className="mb-6 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-500" />
                {t('dashboard.testResults', 'Résultats de tests')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.testResultsDesc', 'Vos derniers profils et analyses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testResults.slice(0, 4).map(result => (
                  <div key={result.id} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {result.test_type === 'quick_test' ? t('nav.quickTest', 'Test Rapide') : t('nav.profileTest', 'Test Complet')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {result.result_pyramid.replace(/_/g, ' ')}
                    </p>
                    {result.result_archetype && (
                      <p className="text-xs text-muted-foreground">{result.result_archetype}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Irreversa Thresholds Section */}
        {isLoggedIn && thresholds.filter(t => t.status !== 'sealed').length > 0 && (
          <Card className="mb-6 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                {t('dashboard.irreversaThresholds', 'Seuils Irreversa')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.irreversaThresholdsDesc', 'Décisions irréversibles en attente de scellement')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {thresholds.filter(t => t.status !== 'sealed').slice(0, 4).map(threshold => (
                  <Link key={threshold.id} to="/irreversa">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{threshold.title}</p>
                        <p className="text-xs text-muted-foreground">{threshold.domain} • {threshold.threshold_nature}</p>
                      </div>
                      <Badge variant="outline" className={
                        threshold.status === 'detected' ? 'border-blue-500/40 text-blue-600' :
                        threshold.status === 'marked' ? 'border-amber-500/40 text-amber-600' :
                        'border-green-500/40 text-green-600'
                      }>
                        {threshold.status === 'detected' ? '🔍' : threshold.status === 'marked' ? '📌' : '✅'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/irreversa" className="block mt-3">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('dashboard.viewAllThresholds', 'Voir tous les seuils')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isLoggedIn && comparisons.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                {t('dashboard.savedComparisons')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.savedComparisonsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisons.slice(0, 6).map(comp => (
                  <div key={comp.id} className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
                    <Link to={`/compare?mode=multi&countries=${comp.country_ids.join(',')}`} className="flex-1">
                      <p className="font-medium hover:text-primary transition-colors">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">{comp.country_ids.length} {t('dashboard.countries')}</p>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteComparison(comp.id);
                        toast.success(t('common.delete'));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {comparisons.length > 6 && (
                <Link to="/compare?mode=multi" className="block mt-4 text-center">
                  <Button variant="outline" size="sm">
                    {t('dashboard.viewAll')} ({comparisons.length})
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Saved Games Section */}
        {isLoggedIn && savedGames.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                {t('dashboard.savedGames', 'Parties sauvegardées')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.savedGamesDesc', 'Reprenez vos parties en cours')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedGames.slice(0, 6).map(game => (
                  <div key={game.id} className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{game.game_name}</p>
                      <Badge variant="outline">{game.game_mode}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {game.player_count} {t('dashboard.players', 'joueur(s)')} • 
                      {game.is_finished ? t('dashboard.finished', ' Terminée') : t('dashboard.inProgress', ' En cours')}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => navigate(`/pyramid-quiz?loadGame=${game.id}`)}
                      >
                        <Play className="w-3 h-3" />
                        {game.is_finished ? t('dashboard.replay', 'Rejouer') : t('dashboard.resume', 'Reprendre')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          deleteGame(game.id);
                          toast.success(t('common.delete'));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {savedGames.length > 6 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" onClick={() => navigate('/pyramid-quiz')}>
                    {t('dashboard.viewAll')} ({savedGames.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Statistics Section */}
        {stats.totalGamesPlayed > 0 && (
          <Card className="mb-6 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                {t('dashboard.gameStats', 'Statistiques de jeu')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.totalGamesPlayed}</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.gamesPlayed', 'Parties jouées')}</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{stats.totalTurnsPlayed}</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.turnsPlayed', 'Tours joués')}</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-500">{riskSuccessRate}%</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.riskSuccess', 'Risques réussis')}</div>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-500">{stats.archetypesUsed.length}</div>
                  <div className="text-xs text-muted-foreground">{t('dashboard.archetypesUsed', 'Archétypes testés')}</div>
                </div>
              </div>
              {stats.bestScoreSolo > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-sm">
                    {t('dashboard.bestScore', 'Meilleur score solo')}: <strong>{stats.bestScoreSolo}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements Section */}
        {stats.totalGamesPlayed > 0 && (
          <div className="mb-6">
            <AchievementsPanel />
          </div>
        )}

        {/* Advanced Modules Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              {t('dashboard.advancedModules', 'Modules avancés')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.advancedModulesDesc', 'Outils de réflexion et de documentation avancés')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/latent">
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t('latent.title', 'Zones Latentes')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.latentDesc', 'Identifiez les zones de tension non encore critiques')}
                  </p>
                </div>
              </Link>
              <Link to="/irreversa">
                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-destructive" />
                    <span className="font-medium">{t('irreversa.title', 'Irreversa')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.irreversaDesc', 'Documentez les seuils irréversibles franchis')}
                  </p>
                </div>
              </Link>
              <Link to="/institutions">
                <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">{t('institutions.badge', 'Institutions')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.institutionsDesc', 'Aide à la décision collective et traçabilité')}
                  </p>
                </div>
              </Link>
              <Link to="/usage">
                <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">{t('usage.title', 'Consommation')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.usageDesc', 'Suivez votre utilisation IA et vos ressources')}
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection or Current Plan */}
        {!selectedKeyId ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                {t('dashboard.choosePlan')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.choosePlanDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleStartPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('dashboard.selectExitKey')} />
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
                      <p className="text-sm text-muted-foreground">{selectedKey.unlocks}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {selectedKey.timeframe}
                        </Badge>
                        <Badge variant={
                          selectedKey.difficulty === 'accessible' ? 'default' :
                          selectedKey.difficulty === 'exigeant' ? 'secondary' :
                          'destructive'
                        }>
                          {selectedKey.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {t('dashboard.startedOn')} {formatDisplayDate(progress.startedAt)}
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
                      {t('dashboard.reset')}
                    </Button>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t('dashboard.overallProgress')}</span>
                    <span className="text-primary font-bold">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  {overallProgress === 100 && (
                    <div className="flex items-center gap-2 text-green-500 mt-2">
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">{t('dashboard.planCompleted')}</span>
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
                  <span className="hidden sm:inline">{t('dashboard.tabs.plan', 'Plan')}</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.stats', 'Statistiques')}</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.calendar', 'Calendrier')}</span>
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
                                  {t('dashboard.phase', 'Phase')} {phase.phase}: {phase.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {t('dashboard.duration', 'Durée')}: {phase.duration}
                                  </span>
                                  <span className="flex items-center gap-1 text-primary">
                                    <Target className="w-4 h-4" />
                                    {t('dashboard.suggestedDeadline', 'Échéance suggérée')}: {formatDisplayDate(suggestedDeadline)}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{phasePercent}%</div>
                              <div className="text-xs text-muted-foreground">
                                {phaseProgress.completed}/{phaseProgress.total} {t('dashboard.actions', 'actions')}
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
                              {t('dashboard.objective', 'Objectif')}: {phase.milestone}
                            </div>
                          </div>

                          {/* Critical Rule */}
                          {phase.criticalRule && (
                            <div className="bg-amber-500/10 rounded-lg p-3 mb-4 border border-amber-500/20">
                              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-medium">{t('dashboard.criticalRule', 'Règle critique')}:</span> {phase.criticalRule}
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
                                  {t('dashboard.personalNotes', 'Notes personnelles')}
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
                                  {currentPhaseNote ? t('common.edit') : t('dashboard.addNote', 'Ajouter une note')}
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
                        Risque principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        {selectedKey.mainRisk}
                      </p>
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
