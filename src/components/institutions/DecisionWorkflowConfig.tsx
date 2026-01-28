import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings2, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'validation' | 'notification';
  assignee: string;
  deadline: number; // days
  required: boolean;
  autoEscalate: boolean;
}

interface WorkflowConfig {
  id: string;
  name: string;
  scope: string;
  steps: WorkflowStep[];
  enabled: boolean;
}

const DEFAULT_WORKFLOW: WorkflowConfig = {
  id: 'default',
  name: 'Workflow standard',
  scope: 'Stratégique',
  enabled: true,
  steps: [
    {
      id: 'step-1',
      name: 'Rédaction initiale',
      type: 'review',
      assignee: 'Auteur',
      deadline: 3,
      required: true,
      autoEscalate: false,
    },
    {
      id: 'step-2',
      name: 'Validation manager',
      type: 'approval',
      assignee: 'Manager',
      deadline: 5,
      required: true,
      autoEscalate: true,
    },
    {
      id: 'step-3',
      name: 'Approbation finale',
      type: 'validation',
      assignee: 'Direction',
      deadline: 7,
      required: true,
      autoEscalate: true,
    },
  ],
};

export function DecisionWorkflowConfig() {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([DEFAULT_WORKFLOW]);
  const [activeWorkflow, setActiveWorkflow] = useState<string>('default');

  const currentWorkflow = workflows.find(w => w.id === activeWorkflow);

  const addWorkflow = () => {
    const newWorkflow: WorkflowConfig = {
      id: `workflow-${Date.now()}`,
      name: t('traceOS.workflow.newWorkflow', 'Nouveau workflow'),
      scope: 'Opérationnel',
      enabled: false,
      steps: [],
    };
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflow(newWorkflow.id);
  };

  const updateWorkflow = (field: keyof WorkflowConfig, value: unknown) => {
    setWorkflows(workflows.map(w => 
      w.id === activeWorkflow ? { ...w, [field]: value } : w
    ));
  };

  const addStep = () => {
    if (!currentWorkflow) return;
    
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: '',
      type: 'review',
      assignee: '',
      deadline: 3,
      required: true,
      autoEscalate: false,
    };

    updateWorkflow('steps', [...currentWorkflow.steps, newStep]);
  };

  const updateStep = (stepId: string, field: keyof WorkflowStep, value: unknown) => {
    if (!currentWorkflow) return;
    
    const updatedSteps = currentWorkflow.steps.map(s =>
      s.id === stepId ? { ...s, [field]: value } : s
    );
    updateWorkflow('steps', updatedSteps);
  };

  const removeStep = (stepId: string) => {
    if (!currentWorkflow) return;
    updateWorkflow('steps', currentWorkflow.steps.filter(s => s.id !== stepId));
  };

  const saveWorkflow = () => {
    toast.success(t('traceOS.workflow.saved', 'Workflow sauvegardé'));
  };

  const getStepTypeIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'review': return <Users className="w-4 h-4" />;
      case 'approval': return <CheckCircle className="w-4 h-4" />;
      case 'validation': return <AlertTriangle className="w-4 h-4" />;
      case 'notification': return <Clock className="w-4 h-4" />;
    }
  };

  const getStepTypeColor = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'review': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'approval': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'validation': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'notification': return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
    }
  };

  if (!currentWorkflow) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              {t('traceOS.workflow.title', 'Configuration des workflows')}
            </CardTitle>
            <CardDescription>
              {t('traceOS.workflow.subtitle', 'Définissez les étapes de validation pour vos décisions.')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addWorkflow}>
            <Plus className="w-4 h-4 mr-1" />
            {t('traceOS.workflow.add', 'Nouveau')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow selector */}
        <div className="flex items-center gap-4">
          <Select value={activeWorkflow} onValueChange={setActiveWorkflow}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workflows.map(w => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              checked={currentWorkflow.enabled}
              onCheckedChange={(checked) => updateWorkflow('enabled', checked)}
            />
            <Label className="text-sm">
              {currentWorkflow.enabled 
                ? t('traceOS.workflow.enabled', 'Actif')
                : t('traceOS.workflow.disabled', 'Inactif')}
            </Label>
          </div>
        </div>

        {/* Workflow settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('traceOS.workflow.name', 'Nom du workflow')}</Label>
            <Input
              value={currentWorkflow.name}
              onChange={(e) => updateWorkflow('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('traceOS.workflow.scope', 'Périmètre')}</Label>
            <Select 
              value={currentWorkflow.scope} 
              onValueChange={(v) => updateWorkflow('scope', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stratégique">Stratégique</SelectItem>
                <SelectItem value="Opérationnel">Opérationnel</SelectItem>
                <SelectItem value="Technique">Technique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">{t('traceOS.workflow.steps', 'Étapes du workflow')}</Label>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="w-4 h-4 mr-1" />
              {t('traceOS.workflow.addStep', 'Ajouter')}
            </Button>
          </div>

          {currentWorkflow.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{t('traceOS.workflow.noSteps', 'Aucune étape configurée')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentWorkflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="flex-1 p-3 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStepTypeColor(step.type)}>
                        {getStepTypeIcon(step.type)}
                        <span className="ml-1 capitalize">{step.type}</span>
                      </Badge>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                        placeholder={t('traceOS.workflow.stepName', 'Nom de l\'étape')}
                        className="flex-1"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <Select 
                        value={step.type} 
                        onValueChange={(v) => updateStep(step.id, 'type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review">Revue</SelectItem>
                          <SelectItem value="approval">Approbation</SelectItem>
                          <SelectItem value="validation">Validation</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={step.assignee}
                        onChange={(e) => updateStep(step.id, 'assignee', e.target.value)}
                        placeholder={t('traceOS.workflow.assignee', 'Responsable')}
                      />

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={step.deadline}
                          onChange={(e) => updateStep(step.id, 'deadline', parseInt(e.target.value))}
                          className="w-16"
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground">jours</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={step.autoEscalate}
                          onCheckedChange={(c) => updateStep(step.id, 'autoEscalate', c)}
                        />
                        <Label className="text-xs">Escalade auto</Label>
                      </div>
                    </div>
                  </div>

                  {index < currentWorkflow.steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(step.id)}
                    className="text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={saveWorkflow} className="gap-2">
            <Save className="w-4 h-4" />
            {t('traceOS.workflow.save', 'Sauvegarder')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
