import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePmoObjectives } from '@/hooks/usePmoObjectives';
import { usePmoInitiatives } from '@/hooks/usePmoInitiatives';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Target, 
  ChevronRight, Loader2, Trash2, CheckCircle2
} from 'lucide-react';
import type { 
  CreateObjectiveForm, 
  CreateInitiativeForm,
  ObjectivePriority,
  ObjectiveHorizon,
} from '@/lib/pmo-types';
import { 
  PRIORITY_LABELS as PriorityLabels,
  OBJECTIVE_STATUS_LABELS as ObjectiveStatusLabels,
  INITIATIVE_STATUS_LABELS as InitiativeStatusLabels
} from '@/lib/pmo-types';

interface RoadmapOSProps {
  caseId: string;
  isAdvancedMode?: boolean;
}

export function RoadmapOS({ caseId, isAdvancedMode = false }: RoadmapOSProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  
  const { 
    objectives, 
    isLoading: objectivesLoading, 
    isCreating: objectiveCreating,
    createObjective,
    updateObjective,
    deleteObjective
  } = usePmoObjectives(caseId);
  
  const {
    initiatives,
    isLoading: initiativesLoading,
    isCreating: initiativeCreating,
    createInitiative,
    updateInitiative,
    deleteInitiative
  } = usePmoInitiatives(caseId);

  const [showObjectiveDialog, setShowObjectiveDialog] = useState(false);
  const [showInitiativeDialog, setShowInitiativeDialog] = useState(false);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  
  const [objectiveForm, setObjectiveForm] = useState<CreateObjectiveForm>({
    title: '',
    description: '',
    priority: 'medium',
    horizon_days: 90,
  });
  
  const [initiativeForm, setInitiativeForm] = useState<CreateInitiativeForm>({
    title: '',
    description: '',
    objective_id: undefined,
  });

  const handleCreateObjective = () => {
    createObjective(objectiveForm);
    setObjectiveForm({ title: '', description: '', priority: 'medium', horizon_days: 90 });
    setShowObjectiveDialog(false);
  };

  const handleCreateInitiative = () => {
    createInitiative({
      ...initiativeForm,
      objective_id: selectedObjectiveId || undefined,
    });
    setInitiativeForm({ title: '', description: '' });
    setShowInitiativeDialog(false);
  };

  const activeObjectives = objectives.filter(o => o.status === 'active');
  const draftObjectives = objectives.filter(o => o.status === 'draft');

  const getInitiativesForObjective = (objectiveId: string) => 
    initiatives.filter(i => i.objective_id === objectiveId);

  const unlinkedInitiatives = initiatives.filter(i => !i.objective_id);

  const calculateObjectiveProgress = (objectiveId: string) => {
    const objInitiatives = getInitiativesForObjective(objectiveId);
    if (objInitiatives.length === 0) return 0;
    const done = objInitiatives.filter(i => i.status === 'done').length;
    return Math.round((done / objInitiatives.length) * 100);
  };

  if (objectivesLoading || initiativesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            {isAdvancedMode 
              ? t('pmo.roadmap.title', 'Roadmap OS')
              : t('pmo.roadmap.titleSimple', 'Plan d\'action')
            }
          </h2>
          <p className="text-muted-foreground">
            {isAdvancedMode
              ? t('pmo.roadmap.subtitle', 'Objectifs, initiatives et jalons')
              : t('pmo.roadmap.subtitleSimple', 'Vos étapes vers l\'objectif')
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showObjectiveDialog} onOpenChange={setShowObjectiveDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {isAdvancedMode 
                  ? t('pmo.roadmap.addObjective', 'Objectif')
                  : t('pmo.roadmap.addGoal', 'But')
                }
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isAdvancedMode 
                    ? t('pmo.roadmap.newObjective', 'Nouvel objectif')
                    : t('pmo.roadmap.newGoal', 'Nouveau but')
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t('pmo.form.title', 'Titre')}</Label>
                  <Input
                    value={objectiveForm.title}
                    onChange={(e) => setObjectiveForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={t('pmo.form.titlePlaceholder', 'Ex: Obtenir le visa de travail')}
                  />
                </div>
                <div>
                  <Label>{t('pmo.form.description', 'Description')}</Label>
                  <Textarea
                    value={objectiveForm.description || ''}
                    onChange={(e) => setObjectiveForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t('pmo.form.descriptionPlaceholder', 'Décrivez l\'objectif...')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('pmo.form.priority', 'Priorité')}</Label>
                    <Select
                      value={objectiveForm.priority}
                      onValueChange={(v) => setObjectiveForm(f => ({ ...f, priority: v as ObjectivePriority }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PriorityLabels) as ObjectivePriority[]).map(p => (
                          <SelectItem key={p} value={p}>
                            {PriorityLabels[p][lang]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('pmo.form.horizon', 'Horizon')}</Label>
                    <Select
                      value={String(objectiveForm.horizon_days)}
                      onValueChange={(v) => setObjectiveForm(f => ({ ...f, horizon_days: Number(v) as ObjectiveHorizon }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 {t('pmo.days', 'jours')}</SelectItem>
                        <SelectItem value="90">90 {t('pmo.days', 'jours')}</SelectItem>
                        <SelectItem value="180">180 {t('pmo.days', 'jours')}</SelectItem>
                        <SelectItem value="365">365 {t('pmo.days', 'jours')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateObjective} 
                  disabled={!objectiveForm.title || objectiveCreating}
                  className="w-full"
                >
                  {objectiveCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('pmo.form.create', 'Créer')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showInitiativeDialog} onOpenChange={setShowInitiativeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                {isAdvancedMode 
                  ? t('pmo.roadmap.addInitiative', 'Initiative')
                  : t('pmo.roadmap.addStep', 'Étape')
                }
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isAdvancedMode 
                    ? t('pmo.roadmap.newInitiative', 'Nouvelle initiative')
                    : t('pmo.roadmap.newStep', 'Nouvelle étape')
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t('pmo.form.title', 'Titre')}</Label>
                  <Input
                    value={initiativeForm.title}
                    onChange={(e) => setInitiativeForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={t('pmo.form.initiativePlaceholder', 'Ex: Préparer les documents')}
                  />
                </div>
                <div>
                  <Label>{t('pmo.form.description', 'Description')}</Label>
                  <Textarea
                    value={initiativeForm.description || ''}
                    onChange={(e) => setInitiativeForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                {objectives.length > 0 && (
                  <div>
                    <Label>{t('pmo.form.linkedObjective', 'Lié à l\'objectif')}</Label>
                    <Select
                      value={selectedObjectiveId || 'none'}
                      onValueChange={(v) => setSelectedObjectiveId(v === 'none' ? null : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('pmo.form.selectObjective', 'Sélectionner...')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('pmo.form.noLink', 'Aucun')}</SelectItem>
                        {objectives.map(o => (
                          <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button 
                  onClick={handleCreateInitiative} 
                  disabled={!initiativeForm.title || initiativeCreating}
                  className="w-full"
                >
                  {initiativeCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('pmo.form.create', 'Créer')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{objectives.length}</div>
            <p className="text-sm text-muted-foreground">
              {isAdvancedMode ? t('pmo.stats.objectives', 'Objectifs') : t('pmo.stats.goals', 'Buts')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{initiatives.length}</div>
            <p className="text-sm text-muted-foreground">
              {isAdvancedMode ? t('pmo.stats.initiatives', 'Initiatives') : t('pmo.stats.steps', 'Étapes')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {initiatives.filter(i => i.status === 'done').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('pmo.stats.completed', 'Terminées')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">
              {initiatives.filter(i => i.status === 'blocked').length}
            </div>
            <p className="text-sm text-muted-foreground">{t('pmo.stats.blocked', 'Bloquées')}</p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">{t('pmo.view.kanban', 'Kanban')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('pmo.view.timeline', 'Timeline')}</TabsTrigger>
          <TabsTrigger value="list">{t('pmo.view.list', 'Liste')}</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          {/* Kanban by Objective */}
          <div className="space-y-6">
            {/* Active Objectives */}
            {activeObjectives.map(objective => (
              <Card key={objective.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        {objective.title}
                      </CardTitle>
                      {objective.description && (
                        <CardDescription className="mt-1">{objective.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={PriorityLabels[objective.priority as ObjectivePriority]?.color}>
                        {PriorityLabels[objective.priority as ObjectivePriority]?.[lang]}
                      </Badge>
                      <Badge variant="outline">{objective.horizon_days}j</Badge>
                    </div>
                  </div>
                  <Progress value={calculateObjectiveProgress(objective.id)} className="h-1 mt-2" />
                </CardHeader>
                <CardContent>
                  {/* Initiatives Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t('pmo.status.todo', 'À faire')}
                      </div>
                      {getInitiativesForObjective(objective.id)
                        .filter(i => i.status === 'todo')
                        .map(initiative => (
                          <InitiativeCard 
                            key={initiative.id} 
                            initiative={initiative}
                            onStatusChange={(status) => updateInitiative({ id: initiative.id, updates: { status } })}
                            onDelete={() => deleteInitiative(initiative.id)}
                          />
                        ))}
                    </div>
                    {/* IN PROGRESS */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t('pmo.status.inProgress', 'En cours')}
                      </div>
                      {getInitiativesForObjective(objective.id)
                        .filter(i => i.status === 'in_progress')
                        .map(initiative => (
                          <InitiativeCard 
                            key={initiative.id} 
                            initiative={initiative}
                            onStatusChange={(status) => updateInitiative({ id: initiative.id, updates: { status } })}
                            onDelete={() => deleteInitiative(initiative.id)}
                          />
                        ))}
                    </div>
                    {/* BLOCKED */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-destructive uppercase tracking-wide">
                        {t('pmo.status.blocked', 'Bloqué')}
                      </div>
                      {getInitiativesForObjective(objective.id)
                        .filter(i => i.status === 'blocked')
                        .map(initiative => (
                          <InitiativeCard 
                            key={initiative.id} 
                            initiative={initiative}
                            onStatusChange={(status) => updateInitiative({ id: initiative.id, updates: { status } })}
                            onDelete={() => deleteInitiative(initiative.id)}
                          />
                        ))}
                    </div>
                    {/* DONE */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                        {t('pmo.status.done', 'Fait')}
                      </div>
                      {getInitiativesForObjective(objective.id)
                        .filter(i => i.status === 'done')
                        .map(initiative => (
                          <InitiativeCard 
                            key={initiative.id} 
                            initiative={initiative}
                            onStatusChange={(status) => updateInitiative({ id: initiative.id, updates: { status } })}
                            onDelete={() => deleteInitiative(initiative.id)}
                          />
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Draft Objectives */}
            {draftObjectives.length > 0 && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">
                    {t('pmo.roadmap.drafts', 'Brouillons')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {draftObjectives.map(obj => (
                      <div key={obj.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>{obj.title}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateObjective({ id: obj.id, updates: { status: 'active' } })}
                          >
                            {t('pmo.action.activate', 'Activer')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => deleteObjective(obj.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unlinked Initiatives */}
            {unlinkedInitiatives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isAdvancedMode 
                      ? t('pmo.roadmap.unlinked', 'Initiatives non liées')
                      : t('pmo.roadmap.standalone', 'Étapes indépendantes')
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {unlinkedInitiatives.map(initiative => (
                      <InitiativeCard 
                        key={initiative.id} 
                        initiative={initiative}
                        onStatusChange={(status) => updateInitiative({ id: initiative.id, updates: { status } })}
                        onDelete={() => deleteInitiative(initiative.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {objectives.length === 0 && initiatives.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {isAdvancedMode 
                      ? t('pmo.roadmap.empty', 'Aucun objectif défini')
                      : t('pmo.roadmap.emptySimple', 'Commencez par définir un but')
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('pmo.roadmap.emptyHint', 'Créez votre premier objectif pour structurer votre plan')}
                  </p>
                  <Button onClick={() => setShowObjectiveDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isAdvancedMode 
                      ? t('pmo.roadmap.createFirst', 'Créer un objectif')
                      : t('pmo.roadmap.createFirstSimple', 'Définir un but')
                    }
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-6">
                  {objectives
                    .filter(o => o.status === 'active')
                    .sort((a, b) => (a.horizon_days || 90) - (b.horizon_days || 90))
                    .map((objective) => {
                      const objInitiatives = getInitiativesForObjective(objective.id);
                      const completedCount = objInitiatives.filter(i => i.status === 'done').length;
                      const progress = objInitiatives.length > 0 
                        ? Math.round((completedCount / objInitiatives.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={objective.id} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
                            progress === 100 ? 'bg-green-500' : 
                            progress > 0 ? 'bg-blue-500' : 'bg-muted'
                          }`} />
                          
                          <div className="border rounded-lg p-4 bg-card">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                <h4 className="font-medium">{objective.title}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{objective.horizon_days}j</Badge>
                                <Badge className={PriorityLabels[objective.priority as ObjectivePriority]?.color}>
                                  {PriorityLabels[objective.priority as ObjectivePriority]?.[lang]}
                                </Badge>
                              </div>
                            </div>
                            
                            <Progress value={progress} className="h-1.5 mb-3" />
                            
                            <div className="text-xs text-muted-foreground mb-2">
                              {completedCount}/{objInitiatives.length} {t('pmo.timeline.initiatives', 'initiatives terminées')}
                            </div>
                            
                            {/* Initiative timeline */}
                            <div className="flex gap-1 flex-wrap">
                              {objInitiatives.map(init => (
                                <Badge 
                                  key={init.id}
                                  variant={init.status === 'done' ? 'default' : 'outline'}
                                  className={`text-xs ${
                                    init.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    init.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    init.status === 'blocked' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    ''
                                  }`}
                                >
                                  {init.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {objectives.filter(o => o.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('pmo.timeline.noActiveObjectives', 'Aucun objectif actif à afficher')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {objectives.map(obj => (
                  <div key={obj.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{obj.title}</h4>
                      <Badge>{ObjectiveStatusLabels[obj.status as keyof typeof ObjectiveStatusLabels]?.[lang]}</Badge>
                    </div>
                    {getInitiativesForObjective(obj.id).map(init => (
                      <div key={init.id} className="ml-4 pl-4 border-l py-2 flex items-center justify-between">
                        <span className="text-sm">{init.title}</span>
                        <Badge variant="outline">
                          {InitiativeStatusLabels[init.status as keyof typeof InitiativeStatusLabels]?.[lang]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Initiative Card Component
interface InitiativeCardProps {
  initiative: any;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}

function InitiativeCard({ initiative, onStatusChange, onDelete }: InitiativeCardProps) {
  const statusColors: Record<string, string> = {
    todo: 'bg-muted',
    in_progress: 'bg-blue-50 dark:bg-blue-950 border-blue-200',
    blocked: 'bg-orange-50 dark:bg-orange-950 border-orange-200',
    done: 'bg-green-50 dark:bg-green-950 border-green-200',
  };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[initiative.status] || 'bg-background'}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">{initiative.title}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      {initiative.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{initiative.description}</p>
      )}
      <div className="flex gap-1 mt-2">
        {initiative.status !== 'done' && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-2 text-xs"
            onClick={() => onStatusChange(
              initiative.status === 'todo' ? 'in_progress' : 
              initiative.status === 'in_progress' ? 'done' : 'in_progress'
            )}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
        {initiative.status === 'done' && (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        )}
      </div>
    </div>
  );
}
