import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, 
  Calendar, 
  AlertTriangle, 
  DollarSign,
  Shield
} from 'lucide-react';

interface TimelineScenario {
  type: 'optimistic' | 'realistic' | 'pessimistic';
  color: string;
  multiplier: number;
}

interface TimelinePhase {
  id: string;
  baseWeeks: number;
}

interface TerrainTimelineProps {
  countryId: string;
  countryName: string;
  projectType?: string;
}

const SCENARIOS: Omit<TimelineScenario, 'label'>[] = [
  { type: 'optimistic', color: 'bg-green-500', multiplier: 1 },
  { type: 'realistic', color: 'bg-amber-500', multiplier: 1.5 },
  { type: 'pessimistic', color: 'bg-red-500', multiplier: 2.5 },
];

const DEFAULT_PHASES: Omit<TimelinePhase, 'label' | 'risks'>[] = [
  { id: 'preparation', baseWeeks: 4 },
  { id: 'admin', baseWeeks: 8 },
  { id: 'installation', baseWeeks: 6 },
  { id: 'launch', baseWeeks: 4 },
  { id: 'stabilization', baseWeeks: 12 },
];

const PHASE_RISKS: Record<string, string[]> = {
  preparation: ['documentCollection', 'legalValidation'],
  admin: ['adminDelays', 'missingDocuments'],
  installation: ['logisticsDelayed', 'recruitmentDifficult'],
  launch: ['productAdjustments', 'revenueDelay'],
  stabilization: ['longPayments', 'teamTurnover'],
};

export function TerrainTimeline({ countryName }: TerrainTimelineProps) {
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
    if (weeks < 4) return `${weeks} ${t('governance.timeline.weeks', 'weeks')}`;
    const months = Math.round(weeks / 4);
    return months === 1 ? `1 ${t('governance.timeline.month', 'month')}` : `${months} ${t('governance.timeline.months', 'months')}`;
  };

  const getScenarioLabel = (type: string) => t(`governance.timeline.scenarios.${type}`, type);
  const getPhaseLabel = (id: string) => t(`governance.timeline.phases.${id}`, id);
  const getRiskLabel = (riskKey: string) => t(`governance.timeline.risks.${riskKey}`, riskKey);

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
              <div className="text-sm font-medium">{getScenarioLabel(scenario.type)}</div>
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
            const risks = PHASE_RISKS[phase.id] || [];

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
                      <h4 className="font-medium">{getPhaseLabel(phase.id)}</h4>
                      <div className="text-right">
                        <div className="font-bold">{formatDuration(calc.total)}</div>
                        <div className="text-xs text-muted-foreground">
                          ({formatDuration(calc.base)} + {formatDuration(calc.buffer)} {t('governance.timeline.bufferLabel', 'buffer')})
                        </div>
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="flex flex-wrap gap-1">
                      {risks.map((riskKey, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {getRiskLabel(riskKey)}
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
              {t('governance.timeline.totalDuration', 'Estimated total duration')}
            </h4>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatDuration(totalTimeline)}</div>
              <Badge className={
                currentScenario.type === 'optimistic'
                  ? 'bg-green-500/20 text-green-600'
                  : currentScenario.type === 'realistic'
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-red-500/20 text-red-600'
              }>
                {t('governance.timeline.scenario', 'Scenario')} {getScenarioLabel(currentScenario.type).toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* Cashflow Warning */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-background rounded border">
            <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">
                {t('governance.timeline.cashflowWarning', 'Cashflow impact')}
              </p>
              <p>
                {t('governance.timeline.cashflowText', 'Plan funding to cover this period without revenue. First payments may arrive 30-90 days after first sales.')}
              </p>
            </div>
          </div>
        </div>

        {/* Key Risks */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {t('governance.timeline.keyRisks', 'Key timeline risks')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{getRiskLabel('contractSigning')}</li>
            <li>{getRiskLabel('extendedPayment')}</li>
            <li>{getRiskLabel('lateBlockages')}</li>
            <li>{getRiskLabel('ruleChanges')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
