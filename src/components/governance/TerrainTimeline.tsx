import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Shield
} from 'lucide-react';

interface TimelineScenario {
  type: 'optimistic' | 'realistic' | 'pessimistic';
  label: string;
  color: string;
  multiplier: number;
}

interface TimelinePhase {
  id: string;
  label: string;
  baseWeeks: number;
  risks: string[];
}

interface TerrainTimelineProps {
  countryId: string;
  countryName: string;
  projectType?: string;
}

const SCENARIOS: TimelineScenario[] = [
  { type: 'optimistic', label: 'Optimiste', color: 'bg-green-500', multiplier: 1 },
  { type: 'realistic', label: 'Réaliste', color: 'bg-amber-500', multiplier: 1.5 },
  { type: 'pessimistic', label: 'Pessimiste', color: 'bg-red-500', multiplier: 2.5 },
];

const DEFAULT_PHASES: TimelinePhase[] = [
  { 
    id: 'preparation', 
    label: 'Préparation', 
    baseWeeks: 4,
    risks: ['Collecte documents plus longue', 'Validation légale retardée']
  },
  { 
    id: 'admin', 
    label: 'Administratif', 
    baseWeeks: 8,
    risks: ['Délais administration imprévisibles', 'Pièces manquantes demandées']
  },
  { 
    id: 'installation', 
    label: 'Installation', 
    baseWeeks: 6,
    risks: ['Logistique retardée', 'Recrutement difficile']
  },
  { 
    id: 'launch', 
    label: 'Lancement', 
    baseWeeks: 4,
    risks: ['Ajustements produit', 'Retard premiers revenus']
  },
  { 
    id: 'stabilization', 
    label: 'Stabilisation', 
    baseWeeks: 12,
    risks: ['Paiements longs', 'Turnover équipe']
  },
];

export function TerrainTimeline({ countryId, countryName, projectType }: TerrainTimelineProps) {
  const { t } = useTranslation();
  const [selectedScenario, setSelectedScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic');
  const [timeBuffer, setTimeBuffer] = useState(25); // Percentage buffer

  const currentScenario = SCENARIOS.find(s => s.type === selectedScenario)!;

  const calculateWeeks = (baseWeeks: number) => {
    const scenarioWeeks = Math.round(baseWeeks * currentScenario.multiplier);
    const bufferWeeks = Math.round(scenarioWeeks * (timeBuffer / 100));
    return { base: scenarioWeeks, buffer: bufferWeeks, total: scenarioWeeks + bufferWeeks };
  };

  const totalTimeline = DEFAULT_PHASES.reduce((acc, phase) => {
    const calc = calculateWeeks(phase.baseWeeks);
    return acc + calc.total;
  }, 0);

  const formatDuration = (weeks: number): string => {
    if (weeks < 4) return `${weeks} sem.`;
    const months = Math.round(weeks / 4);
    return months === 1 ? '1 mois' : `${months} mois`;
  };

  return (
    <Card className="border-indigo-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-indigo-600" />
          {t('governance.timeline.title', 'Délais réels')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('governance.timeline.description', 'Scénarios temporels pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selector */}
        <div className="flex gap-2">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.type}
              onClick={() => setSelectedScenario(scenario.type)}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                selectedScenario === scenario.type
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${scenario.color} mx-auto mb-2`} />
              <div className="text-sm font-medium">{scenario.label}</div>
              <div className="text-xs text-muted-foreground">x{scenario.multiplier}</div>
            </button>
          ))}
        </div>

        {/* Buffer Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              {t('governance.timeline.buffer', 'Tampon de sécurité')}
            </label>
            <Badge variant="outline">+{timeBuffer}%</Badge>
          </div>
          <Slider
            value={[timeBuffer]}
            onValueChange={(v) => setTimeBuffer(v[0])}
            min={0}
            max={50}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {t('governance.timeline.bufferTip', 'Recommandé : minimum +25% pour les imprévus')}
          </p>
        </div>

        {/* Timeline Phases */}
        <div className="space-y-4">
          {DEFAULT_PHASES.map((phase, index) => {
            const calc = calculateWeeks(phase.baseWeeks);
            const phaseProgress = ((index + 1) / DEFAULT_PHASES.length) * 100;
            
            return (
              <div key={phase.id} className="relative">
                {/* Connection Line */}
                {index < DEFAULT_PHASES.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-8 bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Timeline Node */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentScenario.color} text-white`}>
                    {index + 1}
                  </div>
                  
                  {/* Phase Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{phase.label}</h4>
                      <div className="text-right">
                        <div className="font-bold">{formatDuration(calc.total)}</div>
                        <div className="text-xs text-muted-foreground">
                          ({formatDuration(calc.base)} + {formatDuration(calc.buffer)} tampon)
                        </div>
                      </div>
                    </div>
                    
                    {/* Risks */}
                    <div className="flex flex-wrap gap-1">
                      {phase.risks.map((risk, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="p-4 bg-indigo-500/10 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('governance.timeline.totalDuration', 'Durée totale estimée')}
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatDuration(totalTimeline)}</div>
              <Badge className={currentScenario.color + '/20 text-' + currentScenario.color.replace('bg-', '')}>
                Scénario {currentScenario.label.toLowerCase()}
              </Badge>
            </div>
          </div>
          
          {/* Cashflow Warning */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-background rounded border">
            <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">
                {t('governance.timeline.cashflowWarning', 'Impact cashflow')}
              </p>
              <p>
                {t('governance.timeline.cashflowText', 'Prévoir financement pour couvrir cette période sans revenus. Les premiers paiements peuvent arriver 30-90 jours après les premières ventes.')}
              </p>
            </div>
          </div>
        </div>

        {/* Key Risks */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {t('governance.timeline.keyRisks', 'Risques temporels clés')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Signature de contrats longue (négociation, approbations)</li>
            <li>Délais de paiement étendus (60-90 jours standard)</li>
            <li>Blocages tardifs après investissement partiel</li>
            <li>Changements de règles en cours de processus</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
