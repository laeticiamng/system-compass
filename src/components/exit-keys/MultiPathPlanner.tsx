import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Route, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface PathStep {
  id: string;
  title: string;
  duration: string;
  notes: string;
  status: 'pending' | 'active' | 'completed';
}

interface ExitPath {
  id: string;
  name: string;
  priority: 'A' | 'B' | 'C';
  country: string;
  riskLevel: 'low' | 'medium' | 'high';
  steps: PathStep[];
}

export function MultiPathPlanner() {
  const { t } = useTranslation();
  const [paths, setPaths] = useState<ExitPath[]>([
    {
      id: 'path-a',
      name: t('exitKeys.multiPath.planA', 'Plan A - Prioritaire'),
      priority: 'A',
      country: 'Allemagne',
      riskLevel: 'low',
      steps: [
        { id: 's1', title: 'Reconnaissance diplôme', duration: '3 mois', notes: '', status: 'pending' },
        { id: 's2', title: 'Recherche emploi', duration: '2 mois', notes: '', status: 'pending' },
        { id: 's3', title: 'Visa travail', duration: '1 mois', notes: '', status: 'pending' },
      ],
    },
    {
      id: 'path-b',
      name: t('exitKeys.multiPath.planB', 'Plan B - Alternatif'),
      priority: 'B',
      country: 'Pays-Bas',
      riskLevel: 'medium',
      steps: [
        { id: 's1', title: 'Visa recherche emploi', duration: '1 mois', notes: '', status: 'pending' },
        { id: 's2', title: 'Networking sur place', duration: '3 mois', notes: '', status: 'pending' },
      ],
    },
  ]);

  const [activePath, setActivePath] = useState('path-a');

  const addPath = () => {
    const newPriority = paths.length === 0 ? 'A' : paths.length === 1 ? 'B' : 'C';
    const newPath: ExitPath = {
      id: `path-${Date.now()}`,
      name: `Plan ${newPriority}`,
      priority: newPriority as 'A' | 'B' | 'C',
      country: '',
      riskLevel: 'medium',
      steps: [],
    };
    setPaths([...paths, newPath]);
    setActivePath(newPath.id);
  };

  const removePath = (pathId: string) => {
    setPaths(paths.filter(p => p.id !== pathId));
    if (activePath === pathId && paths.length > 1) {
      setActivePath(paths[0].id);
    }
  };

  const addStep = (pathId: string) => {
    setPaths(paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          steps: [
            ...p.steps,
            {
              id: `step-${Date.now()}`,
              title: '',
              duration: '',
              notes: '',
              status: 'pending' as const,
            },
          ],
        };
      }
      return p;
    }));
  };

  const updateStep = (pathId: string, stepId: string, field: keyof PathStep, value: string) => {
    setPaths(paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          steps: p.steps.map(s => 
            s.id === stepId ? { ...s, [field]: value } : s
          ),
        };
      }
      return p;
    }));
  };

  const toggleStepStatus = (pathId: string, stepId: string) => {
    setPaths(paths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          steps: p.steps.map(s => {
            if (s.id === stepId) {
              const nextStatus = s.status === 'pending' ? 'active' : 
                                 s.status === 'active' ? 'completed' : 'pending';
              return { ...s, status: nextStatus };
            }
            return s;
          }),
        };
      }
      return p;
    }));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'high': return 'bg-red-500/10 text-red-700 border-red-500/30';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'A': return 'bg-blue-500';
      case 'B': return 'bg-purple-500';
      case 'C': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            {t('exitKeys.multiPath.title', 'Itinéraires multi-étapes')}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addPath} disabled={paths.length >= 3}>
            <Plus className="w-4 h-4 mr-1" />
            {t('exitKeys.multiPath.addPath', 'Ajouter un plan')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paths.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('exitKeys.multiPath.empty', 'Aucun itinéraire configuré')}</p>
            <Button variant="outline" className="mt-4" onClick={addPath}>
              <Plus className="w-4 h-4 mr-2" />
              {t('exitKeys.multiPath.createFirst', 'Créer votre premier plan')}
            </Button>
          </div>
        ) : (
          <Tabs value={activePath} onValueChange={setActivePath}>
            <TabsList className="mb-4">
              {paths.map((path) => (
                <TabsTrigger key={path.id} value={path.id} className="gap-2">
                  <span className={`w-2 h-2 rounded-full ${getPriorityColor(path.priority)}`} />
                  {path.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {paths.map((path) => (
              <TabsContent key={path.id} value={path.id} className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Input
                      value={path.country}
                      onChange={(e) => setPaths(paths.map(p => 
                        p.id === path.id ? { ...p, country: e.target.value } : p
                      ))}
                      placeholder={t('exitKeys.multiPath.countryPlaceholder', 'Pays cible')}
                      className="w-40"
                    />
                    <Badge variant="outline" className={getRiskColor(path.riskLevel)}>
                      {path.riskLevel === 'low' && t('exitKeys.multiPath.lowRisk', 'Risque faible')}
                      {path.riskLevel === 'medium' && t('exitKeys.multiPath.mediumRisk', 'Risque moyen')}
                      {path.riskLevel === 'high' && t('exitKeys.multiPath.highRisk', 'Risque élevé')}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removePath(path.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {path.steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <button
                        onClick={() => toggleStepStatus(path.id, step.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {step.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {step.status === 'active' && (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                        {step.status === 'pending' && (
                          <Target className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            {t('exitKeys.multiPath.step', 'Étape')} {index + 1}
                          </span>
                          {index < path.steps.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          value={step.title}
                          onChange={(e) => updateStep(path.id, step.id, 'title', e.target.value)}
                          placeholder={t('exitKeys.multiPath.stepTitle', 'Titre de l\'étape')}
                          className="font-medium"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={step.duration}
                            onChange={(e) => updateStep(path.id, step.id, 'duration', e.target.value)}
                            placeholder={t('exitKeys.multiPath.duration', 'Durée')}
                            className="w-32"
                          />
                          <Textarea
                            value={step.notes}
                            onChange={(e) => updateStep(path.id, step.id, 'notes', e.target.value)}
                            placeholder={t('exitKeys.multiPath.notes', 'Notes...')}
                            className="flex-1 min-h-[60px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" onClick={() => addStep(path.id)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('exitKeys.multiPath.addStep', 'Ajouter une étape')}
                </Button>

                {path.steps.length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('exitKeys.multiPath.progress', 'Progression')}
                      </span>
                      <span className="font-medium">
                        {path.steps.filter(s => s.status === 'completed').length} / {path.steps.length}
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
