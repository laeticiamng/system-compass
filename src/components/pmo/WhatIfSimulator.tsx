// What-If Scenario Simulator for PMO
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Beaker, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Target,
  RotateCcw,
  Save
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScenarioVariable {
  id: string;
  name: string;
  unit: string;
  baseValue: number;
  currentValue: number;
  min: number;
  max: number;
  step: number;
  category: 'budget' | 'timeline' | 'resources' | 'scope';
}

interface ScenarioImpact {
  metric: string;
  baseValue: number;
  projectedValue: number;
  change: number;
  changePercent: number;
  severity: 'positive' | 'neutral' | 'warning' | 'critical';
}

interface WhatIfSimulatorProps {
  projectName?: string;
  onSaveScenario?: (variables: ScenarioVariable[], impacts: ScenarioImpact[]) => void;
}

export function WhatIfSimulator({
  projectId,
  projectName = 'Projet actuel',
  onSaveScenario
}: WhatIfSimulatorProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('budget');

  const [variables, setVariables] = useState<ScenarioVariable[]>([
    {
      id: 'budget',
      name: t('pmo.whatif.budget', 'Budget total'),
      unit: '€',
      baseValue: 100000,
      currentValue: 100000,
      min: 50000,
      max: 200000,
      step: 5000,
      category: 'budget',
    },
    {
      id: 'contingency',
      name: t('pmo.whatif.contingency', 'Réserve de contingence'),
      unit: '%',
      baseValue: 15,
      currentValue: 15,
      min: 0,
      max: 30,
      step: 1,
      category: 'budget',
    },
    {
      id: 'duration',
      name: t('pmo.whatif.duration', 'Durée projet'),
      unit: 'mois',
      baseValue: 12,
      currentValue: 12,
      min: 6,
      max: 24,
      step: 1,
      category: 'timeline',
    },
    {
      id: 'teamSize',
      name: t('pmo.whatif.teamSize', 'Taille équipe'),
      unit: 'ETP',
      baseValue: 5,
      currentValue: 5,
      min: 2,
      max: 15,
      step: 1,
      category: 'resources',
    },
    {
      id: 'scope',
      name: t('pmo.whatif.scope', 'Périmètre fonctionnel'),
      unit: '%',
      baseValue: 100,
      currentValue: 100,
      min: 60,
      max: 120,
      step: 5,
      category: 'scope',
    },
    {
      id: 'qualityLevel',
      name: t('pmo.whatif.quality', 'Niveau de qualité'),
      unit: '%',
      baseValue: 85,
      currentValue: 85,
      min: 60,
      max: 100,
      step: 5,
      category: 'scope',
    },
  ]);

  // Calculate impacts based on variable changes
  const impacts: ScenarioImpact[] = useMemo(() => {
    const budgetVar = variables.find(v => v.id === 'budget')!;
    const contingencyVar = variables.find(v => v.id === 'contingency')!;
    const durationVar = variables.find(v => v.id === 'duration')!;
    const teamVar = variables.find(v => v.id === 'teamSize')!;
    const scopeVar = variables.find(v => v.id === 'scope')!;
    const qualityVar = variables.find(v => v.id === 'qualityLevel')!;

    const budgetRatio = budgetVar.currentValue / budgetVar.baseValue;
    const durationRatio = durationVar.currentValue / durationVar.baseValue;
    const teamRatio = teamVar.currentValue / teamVar.baseValue;
    const scopeRatio = scopeVar.currentValue / scopeVar.baseValue;

    // Project success probability
    const baseSuccess = 70;
    const successModifier = 
      (budgetRatio > 1 ? 5 : budgetRatio < 1 ? -10 : 0) +
      (durationRatio > 1 ? 3 : durationRatio < 0.8 ? -15 : 0) +
      (teamRatio > 1 ? 2 : teamRatio < 0.8 ? -8 : 0) +
      (scopeRatio > 1.1 ? -10 : scopeRatio < 0.8 ? 5 : 0) +
      (qualityVar.currentValue - qualityVar.baseValue) * 0.3;
    
    const projectedSuccess = Math.min(95, Math.max(20, baseSuccess + successModifier));

    // ROI calculation
    const baseROI = 25;
    const roiModifier = 
      (budgetRatio < 1 ? 5 : budgetRatio > 1.2 ? -10 : 0) +
      (scopeRatio * 5 - 5);
    const projectedROI = Math.max(-20, baseROI + roiModifier);

    // Team burnout risk
    const baseBurnout = 30;
    const burnoutModifier = 
      (durationRatio < 0.8 ? 25 : durationRatio > 1.2 ? -10 : 0) +
      (scopeRatio > 1.1 ? 20 : 0) +
      (teamRatio < 0.8 ? 30 : teamRatio > 1.2 ? -15 : 0);
    const projectedBurnout = Math.min(95, Math.max(5, baseBurnout + burnoutModifier));

    // Delivery date
    const baseDeliveryDays = durationVar.baseValue * 30;
    const projectedDeliveryDays = Math.round(
      durationVar.currentValue * 30 * (scopeRatio / teamRatio)
    );

    // Cost overrun risk
    const baseCostRisk = 25;
    const costRiskModifier = 
      (contingencyVar.currentValue < 10 ? 20 : contingencyVar.currentValue > 20 ? -10 : 0) +
      (scopeRatio > 1 ? 15 * (scopeRatio - 1) * 10 : 0);
    const projectedCostRisk = Math.min(90, Math.max(5, baseCostRisk + costRiskModifier));

    return [
      {
        metric: t('pmo.whatif.successProb', 'Probabilité de succès'),
        baseValue: baseSuccess,
        projectedValue: projectedSuccess,
        change: projectedSuccess - baseSuccess,
        changePercent: ((projectedSuccess - baseSuccess) / baseSuccess) * 100,
        severity: projectedSuccess >= 70 ? 'positive' : projectedSuccess >= 50 ? 'warning' : 'critical',
      },
      {
        metric: t('pmo.whatif.roi', 'ROI attendu'),
        baseValue: baseROI,
        projectedValue: projectedROI,
        change: projectedROI - baseROI,
        changePercent: ((projectedROI - baseROI) / Math.abs(baseROI)) * 100,
        severity: projectedROI >= 20 ? 'positive' : projectedROI >= 0 ? 'neutral' : 'critical',
      },
      {
        metric: t('pmo.whatif.burnoutRisk', 'Risque burnout équipe'),
        baseValue: baseBurnout,
        projectedValue: projectedBurnout,
        change: projectedBurnout - baseBurnout,
        changePercent: ((projectedBurnout - baseBurnout) / baseBurnout) * 100,
        severity: projectedBurnout <= 30 ? 'positive' : projectedBurnout <= 50 ? 'warning' : 'critical',
      },
      {
        metric: t('pmo.whatif.delivery', 'Délai livraison (jours)'),
        baseValue: baseDeliveryDays,
        projectedValue: projectedDeliveryDays,
        change: projectedDeliveryDays - baseDeliveryDays,
        changePercent: ((projectedDeliveryDays - baseDeliveryDays) / baseDeliveryDays) * 100,
        severity: projectedDeliveryDays <= baseDeliveryDays ? 'positive' : projectedDeliveryDays <= baseDeliveryDays * 1.2 ? 'warning' : 'critical',
      },
      {
        metric: t('pmo.whatif.costOverrun', 'Risque dépassement coût'),
        baseValue: baseCostRisk,
        projectedValue: projectedCostRisk,
        change: projectedCostRisk - baseCostRisk,
        changePercent: ((projectedCostRisk - baseCostRisk) / baseCostRisk) * 100,
        severity: projectedCostRisk <= 25 ? 'positive' : projectedCostRisk <= 50 ? 'warning' : 'critical',
      },
    ];
  }, [variables, t]);

  const updateVariable = useCallback((id: string, value: number) => {
    setVariables(prev => 
      prev.map(v => v.id === id ? { ...v, currentValue: value } : v)
    );
  }, []);

  const resetAll = useCallback(() => {
    setVariables(prev => 
      prev.map(v => ({ ...v, currentValue: v.baseValue }))
    );
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budget': return <DollarSign className="h-4 w-4" />;
      case 'timeline': return <Clock className="h-4 w-4" />;
      case 'resources': return <Users className="h-4 w-4" />;
      case 'scope': return <Target className="h-4 w-4" />;
      default: return <Beaker className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'text-green-500';
      case 'neutral': return 'text-muted-foreground';
      case 'warning': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const hasChanges = variables.some(v => v.currentValue !== v.baseValue);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            {t('pmo.whatif.title', 'Simulateur What-If')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetAll} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('common.reset', 'Réinitialiser')}
          </Button>
          <Button size="sm" onClick={() => onSaveScenario?.(variables, impacts)} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-1" />
            {t('common.save', 'Sauvegarder')}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Variables */}
          <div>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full">
                <TabsTrigger value="budget" className="flex-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Budget
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1">
                  <Clock className="h-4 w-4 mr-1" />
                  Temps
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  Équipe
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex-1">
                  <Target className="h-4 w-4 mr-1" />
                  Scope
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory} className="mt-4 space-y-6">
                {variables
                  .filter(v => v.category === activeCategory)
                  .map((variable) => (
                    <div key={variable.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">{variable.name}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={variable.currentValue}
                            onChange={(e) => updateVariable(variable.id, Number(e.target.value))}
                            className="w-24 text-right"
                            min={variable.min}
                            max={variable.max}
                            step={variable.step}
                          />
                          <span className="text-sm text-muted-foreground w-8">{variable.unit}</span>
                        </div>
                      </div>
                      <Slider
                        value={[variable.currentValue]}
                        onValueChange={([value]) => updateVariable(variable.id, value)}
                        min={variable.min}
                        max={variable.max}
                        step={variable.step}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{variable.min} {variable.unit}</span>
                        <span className={variable.currentValue !== variable.baseValue ? 'text-primary font-medium' : ''}>
                          Base: {variable.baseValue} {variable.unit}
                        </span>
                        <span>{variable.max} {variable.unit}</span>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Impacts */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('pmo.whatif.projectedImpacts', 'Impacts projetés')}
            </h4>
            
            <div className="space-y-3">
              {impacts.map((impact, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{impact.metric}</span>
                    <Badge 
                      variant={impact.severity === 'positive' ? 'default' : 
                               impact.severity === 'critical' ? 'destructive' : 'secondary'}
                    >
                      {impact.projectedValue.toFixed(0)}
                      {impact.metric.includes('%') || impact.metric.includes('Risque') || impact.metric.includes('ROI') || impact.metric.includes('Probabilité') ? '%' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Base: {impact.baseValue.toFixed(0)}
                    </span>
                    <span className={`flex items-center gap-1 ${getSeverityColor(impact.severity)}`}>
                      {impact.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : impact.change < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : null}
                      {impact.change > 0 ? '+' : ''}{impact.change.toFixed(0)} ({impact.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Alert */}
            {hasChanges && (
              <div className={`p-4 rounded-lg border ${
                impacts.filter(i => i.severity === 'critical').length > 0 
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                  : impacts.filter(i => i.severity === 'warning').length > 2
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
                  : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-5 w-5 shrink-0 ${
                    impacts.filter(i => i.severity === 'critical').length > 0 
                      ? 'text-red-500' 
                      : impacts.filter(i => i.severity === 'warning').length > 2
                      ? 'text-orange-500'
                      : 'text-green-500'
                  }`} />
                  <div className="text-sm">
                    {impacts.filter(i => i.severity === 'critical').length > 0 ? (
                      <p>{t('pmo.whatif.criticalAlert', 'Ce scénario présente des risques critiques. Révision recommandée.')}</p>
                    ) : impacts.filter(i => i.severity === 'warning').length > 2 ? (
                      <p>{t('pmo.whatif.warningAlert', 'Plusieurs indicateurs sont en alerte. Évaluez les compromis.')}</p>
                    ) : (
                      <p>{t('pmo.whatif.positiveAlert', 'Ce scénario semble viable. Les impacts sont maîtrisés.')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
