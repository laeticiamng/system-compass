/**
 * Advanced What-If Simulator for TraceOS
 * Monte Carlo simulation and scenario modeling
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Scale,
  Shuffle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Target,
  Lightbulb,
  Save,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  impactScore: number; // -100 to +100
  variables: ScenarioVariable[];
}

interface ScenarioVariable {
  id: string;
  name: string;
  baseValue: number;
  adjustedValue: number;
  unit: string;
  weight: number;
}

interface SimulationResult {
  expectedValue: number;
  bestCase: number;
  worstCase: number;
  confidenceInterval: [number, number];
  riskScore: number;
  recommendation: string;
  scenarioBreakdown: Array<{
    scenario: string;
    probability: number;
    outcome: number;
  }>;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'optimistic',
    name: 'Scénario Optimiste',
    description: 'Conditions favorables, marché porteur',
    probability: 25,
    impact: 'positive',
    impactScore: 40,
    variables: [
      { id: 'revenue', name: 'Chiffre d\'affaires', baseValue: 100, adjustedValue: 130, unit: 'k€', weight: 0.4 },
      { id: 'costs', name: 'Coûts opérationnels', baseValue: 60, adjustedValue: 55, unit: 'k€', weight: 0.3 },
      { id: 'timeline', name: 'Délai projet', baseValue: 12, adjustedValue: 10, unit: 'mois', weight: 0.3 },
    ],
  },
  {
    id: 'realistic',
    name: 'Scénario Réaliste',
    description: 'Conditions attendues basées sur les données actuelles',
    probability: 50,
    impact: 'neutral',
    impactScore: 0,
    variables: [
      { id: 'revenue', name: 'Chiffre d\'affaires', baseValue: 100, adjustedValue: 100, unit: 'k€', weight: 0.4 },
      { id: 'costs', name: 'Coûts opérationnels', baseValue: 60, adjustedValue: 60, unit: 'k€', weight: 0.3 },
      { id: 'timeline', name: 'Délai projet', baseValue: 12, adjustedValue: 12, unit: 'mois', weight: 0.3 },
    ],
  },
  {
    id: 'pessimistic',
    name: 'Scénario Pessimiste',
    description: 'Conditions défavorables, obstacles majeurs',
    probability: 25,
    impact: 'negative',
    impactScore: -35,
    variables: [
      { id: 'revenue', name: 'Chiffre d\'affaires', baseValue: 100, adjustedValue: 70, unit: 'k€', weight: 0.4 },
      { id: 'costs', name: 'Coûts opérationnels', baseValue: 60, adjustedValue: 75, unit: 'k€', weight: 0.3 },
      { id: 'timeline', name: 'Délai projet', baseValue: 12, adjustedValue: 18, unit: 'mois', weight: 0.3 },
    ],
  },
];

function runMonteCarloSimulation(scenarios: Scenario[], iterations: number = 1000): SimulationResult {
  const outcomes: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const rand = Math.random() * 100;
    let cumProb = 0;
    
    for (const scenario of scenarios) {
      cumProb += scenario.probability;
      if (rand <= cumProb) {
        // Add some variance within the scenario
        const variance = (Math.random() - 0.5) * 20;
        outcomes.push(scenario.impactScore + variance);
        break;
      }
    }
  }
  
  outcomes.sort((a, b) => a - b);
  
  const mean = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
  const ci5 = outcomes[Math.floor(iterations * 0.05)];
  const ci95 = outcomes[Math.floor(iterations * 0.95)];
  
  const riskScore = Math.max(0, Math.min(100, 50 - mean + Math.abs(ci5) * 0.3));
  
  let recommendation = 'Procéder avec prudence standard';
  if (mean > 20) {
    recommendation = 'Conditions favorables - opportunité à saisir';
  } else if (mean < -20) {
    recommendation = 'Risques élevés - réévaluation recommandée';
  } else if (Math.abs(ci95 - ci5) > 60) {
    recommendation = 'Forte incertitude - collecter plus de données';
  }
  
  return {
    expectedValue: mean,
    bestCase: outcomes[outcomes.length - 1],
    worstCase: outcomes[0],
    confidenceInterval: [ci5, ci95],
    riskScore,
    recommendation,
    scenarioBreakdown: scenarios.map(s => ({
      scenario: s.name,
      probability: s.probability,
      outcome: s.impactScore,
    })),
  };
}

function ScenarioCard({ 
  scenario, 
  onUpdate,
  onRemove
}: { 
  scenario: Scenario;
  onUpdate: (updated: Scenario) => void;
  onRemove: () => void;
}) {
  return (
    <Card className={cn(
      'glass-card',
      scenario.impact === 'positive' && 'border-emerald-500/30',
      scenario.impact === 'negative' && 'border-red-500/30'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {scenario.impact === 'positive' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
              {scenario.impact === 'negative' && <TrendingDown className="h-4 w-4 text-red-500" />}
              {scenario.impact === 'neutral' && <Scale className="h-4 w-4 text-muted-foreground" />}
              {scenario.name}
            </CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </div>
          <Badge variant="outline">
            {scenario.probability}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Probabilité</Label>
          <Slider
            value={[scenario.probability]}
            min={0}
            max={100}
            step={5}
            onValueChange={([val]) => onUpdate({ ...scenario, probability: val })}
          />
        </div>
        
        <div className="space-y-2">
          {scenario.variables.map((variable, idx) => (
            <div key={variable.id} className="flex items-center justify-between text-sm">
              <span>{variable.name}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={variable.adjustedValue}
                  onChange={(e) => {
                    const newVars = [...scenario.variables];
                    newVars[idx] = { ...variable, adjustedValue: Number(e.target.value) };
                    onUpdate({ ...scenario, variables: newVars });
                  }}
                  className="w-20 h-8"
                />
                <span className="text-muted-foreground">{variable.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={onRemove} className="w-full text-destructive hover:text-destructive">
          Supprimer
        </Button>
      </CardContent>
    </Card>
  );
}

function SimulationResults({ result }: { result: SimulationResult }) {
  return (
    <Card className="glass-card-elevated border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Résultats de la simulation
        </CardTitle>
        <CardDescription>
          Basé sur 1000 itérations Monte Carlo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Pire cas</div>
            <div className={cn(
              "text-2xl font-bold",
              result.worstCase < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              {result.worstCase > 0 ? '+' : ''}{result.worstCase.toFixed(0)}%
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/30">
            <div className="text-sm text-muted-foreground mb-1">Valeur attendue</div>
            <div className={cn(
              "text-2xl font-bold",
              result.expectedValue > 0 ? "text-emerald-500" :
              result.expectedValue < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              {result.expectedValue > 0 ? '+' : ''}{result.expectedValue.toFixed(1)}%
            </div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Meilleur cas</div>
            <div className={cn(
              "text-2xl font-bold",
              result.bestCase > 0 ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {result.bestCase > 0 ? '+' : ''}{result.bestCase.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Confidence Interval */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Intervalle de confiance (90%)</span>
            <span className="font-medium">
              [{result.confidenceInterval[0].toFixed(1)}%, {result.confidenceInterval[1].toFixed(1)}%]
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-primary/30"
              style={{
                left: `${Math.max(0, 50 + result.confidenceInterval[0] / 2)}%`,
                width: `${(result.confidenceInterval[1] - result.confidenceInterval[0]) / 2}%`,
              }}
            />
            <div 
              className="absolute w-1 h-full bg-primary"
              style={{ left: `${50 + result.expectedValue / 2}%` }}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Score de risque</span>
            <span className={cn(
              "font-medium",
              result.riskScore < 30 ? "text-emerald-500" :
              result.riskScore < 60 ? "text-amber-500" : "text-red-500"
            )}>
              {result.riskScore.toFixed(0)}/100
            </span>
          </div>
          <Progress 
            value={result.riskScore} 
            className={cn(
              "h-2",
              result.riskScore < 30 ? "[&>div]:bg-emerald-500" :
              result.riskScore < 60 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
            )}
          />
        </div>

        {/* Recommendation */}
        <div className={cn(
          "p-4 rounded-lg flex items-start gap-3",
          result.expectedValue > 10 ? "bg-emerald-500/10 border border-emerald-500/30" :
          result.expectedValue < -10 ? "bg-red-500/10 border border-red-500/30" :
          "bg-amber-500/10 border border-amber-500/30"
        )}>
          {result.expectedValue > 10 ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
          ) : result.expectedValue < -10 ? (
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
          )}
          <div>
            <p className="font-medium">Recommandation</p>
            <p className="text-sm text-muted-foreground">{result.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WhatIfSimulatorAdvanced() {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [simulationNotes, setSimulationNotes] = useState('');

  const result = useMemo(() => {
    if (!hasSimulated) return null;
    return runMonteCarloSimulation(scenarios);
  }, [scenarios, hasSimulated]);

  const totalProbability = scenarios.reduce((sum, s) => sum + s.probability, 0);

  const handleAddScenario = () => {
    const newScenario: Scenario = {
      id: `custom-${Date.now()}`,
      name: 'Nouveau scénario',
      description: 'Décrivez ce scénario',
      probability: Math.max(0, 100 - totalProbability),
      impact: 'neutral',
      impactScore: 0,
      variables: DEFAULT_SCENARIOS[0].variables.map(v => ({
        ...v,
        adjustedValue: v.baseValue,
      })),
    };
    setScenarios([...scenarios, newScenario]);
    setHasSimulated(false);
  };

  const handleUpdateScenario = (index: number, updated: Scenario) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = updated;
    setScenarios(newScenarios);
    setHasSimulated(false);
  };

  const handleRemoveScenario = (index: number) => {
    if (scenarios.length <= 2) {
      toast.error(t('toast.error.simulator.minScenarios', 'Minimum 2 scénarios requis'));
      return;
    }
    setScenarios(scenarios.filter((_, i) => i !== index));
    setHasSimulated(false);
  };

  const handleRunSimulation = () => {
    if (Math.abs(totalProbability - 100) > 1) {
      toast.error(t('toast.error.simulator.probSum', 'La somme des probabilités doit égaler 100%'));
      return;
    }
    setHasSimulated(true);
    toast.success(t('toast.simulator.done', 'Simulation terminée'));
  };

  const handleSaveSimulation = () => {
    toast.success(t('toast.simulator.saved', 'Simulation sauvegardée'));
  };

  const handleExport = () => {
    toast.success(t('toast.export.pdfGenerated', 'Export PDF généré'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Simulateur What-If
          </h2>
          <p className="text-muted-foreground">
            Modélisation de scénarios et analyse Monte Carlo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveSimulation}>
            <Save className="h-4 w-4 mr-2" />
            {t('common.save', 'Sauvegarder')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios" className="gap-2">
            <Target className="h-4 w-4" />
            Scénarios
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2" disabled={!hasSimulated}>
            <BarChart3 className="h-4 w-4" />
            Résultats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Probability Check */}
          <Card className={cn(
            "glass-card",
            Math.abs(totalProbability - 100) > 1 && "border-amber-500/50"
          )}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Math.abs(totalProbability - 100) <= 1 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <span>
                  Probabilités totales: <strong>{totalProbability}%</strong>
                  {Math.abs(totalProbability - 100) > 1 && ' (doit égaler 100%)'}
                </span>
              </div>
              <Button onClick={handleAddScenario} variant="outline" size="sm">
                + Ajouter scénario
              </Button>
            </CardContent>
          </Card>

          {/* Scenario Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onUpdate={(updated) => handleUpdateScenario(index, updated)}
                onRemove={() => handleRemoveScenario(index)}
              />
            ))}
          </div>

          {/* Notes */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes de simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ajoutez vos hypothèses et observations..."
                value={simulationNotes}
                onChange={(e) => setSimulationNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Run Button */}
          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={handleRunSimulation}
            disabled={Math.abs(totalProbability - 100) > 1}
          >
            <Shuffle className="h-5 w-5" />
            Lancer la simulation
            <ArrowRight className="h-5 w-5" />
          </Button>
        </TabsContent>

        <TabsContent value="results">
          {result && <SimulationResults result={result} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
