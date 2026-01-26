import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings2, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertTriangle,
  Plus,
  Trash2,
  GripVertical,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'review' | 'validation' | 'notification';
  assigneeRole: string;
  required: boolean;
  autoAdvance: boolean;
  timeoutDays?: number;
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  scope: 'strategic' | 'operational' | 'tactical';
  steps: WorkflowStep[];
  requireAllApprovals: boolean;
  notifyOnCompletion: boolean;
  autoArchiveDays?: number;
}

const DEFAULT_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'default-strategic',
    name: 'Workflow Stratégique',
    description: 'Pour les décisions à fort impact nécessitant validation COMEX',
    scope: 'strategic',
    steps: [
      { id: 's1', name: 'Rédaction', type: 'review', assigneeRole: 'owner', required: true, autoAdvance: false },
      { id: 's2', name: 'Revue équipe', type: 'review', assigneeRole: 'team', required: true, autoAdvance: false },
      { id: 's3', name: 'Validation manager', type: 'approval', assigneeRole: 'manager', required: true, autoAdvance: false, timeoutDays: 5 },
      { id: 's4', name: 'Approbation COMEX', type: 'approval', assigneeRole: 'comex', required: true, autoAdvance: false, timeoutDays: 7 },
      { id: 's5', name: 'Publication', type: 'notification', assigneeRole: 'all', required: false, autoAdvance: true }
    ],
    requireAllApprovals: true,
    notifyOnCompletion: true,
    autoArchiveDays: 365
  },
  {
    id: 'default-operational',
    name: 'Workflow Opérationnel',
    description: 'Pour les décisions courantes avec validation simplifiée',
    scope: 'operational',
    steps: [
      { id: 'o1', name: 'Création', type: 'review', assigneeRole: 'owner', required: true, autoAdvance: false },
      { id: 'o2', name: 'Validation', type: 'approval', assigneeRole: 'manager', required: true, autoAdvance: false, timeoutDays: 3 },
      { id: 'o3', name: 'Publication', type: 'notification', assigneeRole: 'team', required: false, autoAdvance: true }
    ],
    requireAllApprovals: true,
    notifyOnCompletion: true,
    autoArchiveDays: 180
  }
];

export function DecisionWorkflowConfig() {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>(DEFAULT_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    setSelectedWorkflow(workflow || null);
    setIsEditing(false);
  };

  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: 'Nouvelle étape',
      type: 'review',
      assigneeRole: 'owner',
      required: true,
      autoAdvance: false
    };
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep]
    });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.filter(s => s.id !== stepId)
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map(s => 
        s.id === stepId ? { ...s, ...updates } : s
      )
    });
  };

  const handleSave = () => {
    if (!selectedWorkflow) return;
    setWorkflows(workflows.map(w => 
      w.id === selectedWorkflow.id ? selectedWorkflow : w
    ));
    setIsEditing(false);
    toast.success(t('traceOS.workflow.saved', 'Workflow sauvegardé'));
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'approval': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'review': return <Users className="w-4 h-4 text-blue-500" />;
      case 'validation': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'notification': return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          {t('traceOS.workflow.title', 'Configuration des workflows')}
        </CardTitle>
        <CardDescription>
          {t('traceOS.workflow.description', 'Définissez les étapes de validation pour vos décisions')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Selector */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label>{t('traceOS.workflow.selectWorkflow', 'Sélectionner un workflow')}</Label>
            <Select 
              value={selectedWorkflow?.id || ''} 
              onValueChange={handleSelectWorkflow}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('traceOS.workflow.selectPlaceholder', 'Choisir...')} />
              </SelectTrigger>
              <SelectContent>
                {workflows.map(workflow => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      {workflow.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {workflow.scope}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="mt-6">
            <Plus className="w-4 h-4 mr-1" />
            {t('traceOS.workflow.create', 'Créer')}
          </Button>
        </div>

        {selectedWorkflow && (
          <>
            <Separator />
            
            {/* Workflow Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{selectedWorkflow.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      {t('common.edit', 'Modifier')}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        {t('common.cancel', 'Annuler')}
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-1" />
                        {t('common.save', 'Sauvegarder')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                <Label>{t('traceOS.workflow.steps', 'Étapes du workflow')}</Label>
                <div className="space-y-2">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      {getStepIcon(step.type)}
                      
                      {isEditing ? (
                        <>
                          <Input 
                            value={step.name} 
                            onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                            className="flex-1 h-8"
                          />
                          <Select 
                            value={step.type}
                            onValueChange={(v) => handleUpdateStep(step.id, { type: v as WorkflowStep['type'] })}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="review">Revue</SelectItem>
                              <SelectItem value="approval">Approbation</SelectItem>
                              <SelectItem value="validation">Validation</SelectItem>
                              <SelectItem value="notification">Notification</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleRemoveStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{step.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.assigneeRole}
                          </Badge>
                          {step.required && (
                            <Badge variant="secondary" className="text-xs">
                              {t('traceOS.workflow.required', 'Requis')}
                            </Badge>
                          )}
                          {step.timeoutDays && (
                            <span className="text-xs text-muted-foreground">
                              {step.timeoutDays}j max
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={handleAddStep} className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    {t('traceOS.workflow.addStep', 'Ajouter une étape')}
                  </Button>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-3 pt-2">
                <Label>{t('traceOS.workflow.settings', 'Paramètres')}</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('traceOS.workflow.requireAll', 'Toutes les approbations requises')}</span>
                  <Switch 
                    checked={selectedWorkflow.requireAllApprovals}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('traceOS.workflow.notifyCompletion', 'Notifier à la complétion')}</span>
                  <Switch 
                    checked={selectedWorkflow.notifyOnCompletion}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
