import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ListOrdered, Zap, Target, AlertTriangle, Clock, DollarSign,
  ChevronUp, ChevronDown, Settings2, Calendar
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import type { 
  PmoInitiativeRow, 
  PmoObjectiveRow, 
  PmoRiskRow 
} from '@/lib/pmo-types';
import { 
  calculateRiskScore, 
  PRIORITY_LABELS, 
  type ObjectivePriority 
} from '@/lib/pmo-types';

interface PriorityBoardProps {
  initiatives: PmoInitiativeRow[];
  objectives: PmoObjectiveRow[];
  risks: PmoRiskRow[];
  onReorder?: (orderedIds: string[]) => void;
}

interface ScoringWeights {
  businessImpact: number;
  effort: number;
  riskReduction: number;
  deadline: number;
  regulatory: number;
}

interface ScoredInitiative extends PmoInitiativeRow {
  score: number;
  breakdown: {
    businessImpact: number;
    effort: number;
    riskReduction: number;
    deadline: number;
    regulatory: number;
  };
  linkedObjective?: PmoObjectiveRow;
  linkedRisks: PmoRiskRow[];
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  businessImpact: 30,
  effort: 20,
  riskReduction: 25,
  deadline: 15,
  regulatory: 10,
};

export function PriorityBoard({ 
  initiatives, 
  objectives, 
  risks, 
  onReorder 
}: PriorityBoardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [showSettings, setShowSettings] = useState(false);
  const [investorDeadline, setInvestorDeadline] = useState<string>('');
  const [mvpMode, setMvpMode] = useState(false);

  // Calculate priority scores
  const scoredInitiatives: ScoredInitiative[] = useMemo(() => {
    return initiatives
      .filter(i => i.status !== 'done' && i.status !== 'cancelled')
      .map(initiative => {
        const linkedObjective = objectives.find(o => o.id === initiative.objective_id);
        
        // Find risks that might be linked (simple heuristic: same objective)
        const linkedRisks = risks.filter(r => 
          linkedObjective && r.case_id === initiative.case_id
        );

        // Calculate sub-scores (0-100 each)
        
        // Business Impact: Based on linked objective priority
        let businessImpactScore = 50;
        if (linkedObjective) {
          switch (linkedObjective.priority) {
            case 'critical': businessImpactScore = 100; break;
            case 'high': businessImpactScore = 75; break;
            case 'medium': businessImpactScore = 50; break;
            case 'low': businessImpactScore = 25; break;
          }
        }

        // Effort: Inverse - less effort = higher score (from effort_estimate)
        let effortScore = 50;
        if (initiative.effort_estimate) {
          const effort = initiative.effort_estimate.toLowerCase();
          if (effort.includes('low') || effort.includes('faible')) effortScore = 100;
          else if (effort.includes('medium') || effort.includes('moyen')) effortScore = 50;
          else if (effort.includes('high') || effort.includes('élevé')) effortScore = 25;
        }

        // Risk Reduction: Based on linked risks criticality
        let riskReductionScore = 0;
        if (linkedRisks.length > 0) {
          const avgRiskScore = linkedRisks.reduce((sum, r) => 
            sum + calculateRiskScore(r.impact, r.probability), 0
          ) / linkedRisks.length;
          riskReductionScore = Math.min(100, avgRiskScore * 4);
        }

        // Deadline: Based on target_date proximity
        let deadlineScore = 0;
        if (initiative.target_date) {
          const daysUntilDeadline = differenceInDays(parseISO(initiative.target_date), new Date());
          if (daysUntilDeadline < 0) deadlineScore = 100; // Overdue
          else if (daysUntilDeadline < 7) deadlineScore = 90;
          else if (daysUntilDeadline < 30) deadlineScore = 70;
          else if (daysUntilDeadline < 90) deadlineScore = 40;
          else deadlineScore = 20;
        }

        // MVP mode: boost score if initiative has high business impact and target date before investor deadline
        if (mvpMode && investorDeadline && initiative.target_date) {
          const daysUntilInvestor = differenceInDays(parseISO(investorDeadline), new Date());
          const daysUntilTarget = differenceInDays(parseISO(initiative.target_date), new Date());
          if (daysUntilTarget <= daysUntilInvestor) {
            deadlineScore = Math.min(100, deadlineScore + 30);
          }
        }

        // Regulatory: Placeholder (would need compliance data)
        const regulatoryScore = 0;

        // Weighted total
        const breakdown = {
          businessImpact: businessImpactScore,
          effort: effortScore,
          riskReduction: riskReductionScore,
          deadline: deadlineScore,
          regulatory: regulatoryScore,
        };

        const totalWeight = weights.businessImpact + weights.effort + weights.riskReduction + weights.deadline + weights.regulatory;
        const score = totalWeight > 0 ? (
          (breakdown.businessImpact * weights.businessImpact +
           breakdown.effort * weights.effort +
           breakdown.riskReduction * weights.riskReduction +
           breakdown.deadline * weights.deadline +
           breakdown.regulatory * weights.regulatory) / totalWeight
        ) : 0;

        return {
          ...initiative,
          score: Math.round(score),
          breakdown,
          linkedObjective,
          linkedRisks,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [initiatives, objectives, risks, weights, mvpMode, investorDeadline]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    if (score >= 25) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
  };

  // Mark unused for future use
  void onReorder;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-primary" />
            {t('pmo.priority.title', 'Priority Board')}
          </h2>
          <p className="text-muted-foreground">
            {t('pmo.priority.subtitle', 'Priorisation multi-critères des initiatives')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={showSettings ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            {t('pmo.priority.weights', 'Pondération')}
          </Button>
        </div>
      </div>

      {/* MVP Mode */}
      <Card className="border-dashed">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium">{t('pmo.priority.mvpMode', 'Mode MVP / Investisseur')}</div>
                <p className="text-sm text-muted-foreground">
                  {t('pmo.priority.mvpModeDesc', 'Priorise les initiatives livrables avant une deadline')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {mvpMode && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={investorDeadline}
                    onChange={(e) => setInvestorDeadline(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
              <Switch
                checked={mvpMode}
                onCheckedChange={setMvpMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weights Settings */}
      {showSettings && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('pmo.priority.weightSettings', 'Pondération des critères')}</CardTitle>
            <CardDescription>
              {t('pmo.priority.weightSettingsDesc', 'Ajustez l\'importance de chaque critère (total 100%)')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'businessImpact', label: t('pmo.priority.businessImpact', 'Impact business'), icon: Target, color: 'text-blue-600' },
              { key: 'effort', label: t('pmo.priority.effort', 'Effort (inversé)'), icon: Clock, color: 'text-green-600' },
              { key: 'riskReduction', label: t('pmo.priority.riskReduction', 'Réduction des risques'), icon: AlertTriangle, color: 'text-orange-600' },
              { key: 'deadline', label: t('pmo.priority.deadline', 'Urgence deadline'), icon: Calendar, color: 'text-red-600' },
              { key: 'regulatory', label: t('pmo.priority.regulatory', 'Criticité réglementaire'), icon: DollarSign, color: 'text-purple-600' },
            ].map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="flex items-center gap-4">
                <Icon className={`w-4 h-4 ${color}`} />
                <Label className="w-40">{label}</Label>
                <Slider
                  value={[weights[key as keyof ScoringWeights]]}
                  onValueChange={([v]) => setWeights(w => ({ ...w, [key]: v }))}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm">{weights[key as keyof ScoringWeights]}%</span>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setWeights(DEFAULT_WEIGHTS)}
            >
              {t('pmo.priority.resetWeights', 'Réinitialiser')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Prioritized List */}
      <div className="space-y-3">
        {scoredInitiatives.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ListOrdered className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('pmo.priority.empty', 'Aucune initiative à prioriser')}
              </h3>
              <p className="text-muted-foreground">
                {t('pmo.priority.emptyHint', 'Créez des initiatives dans le Roadmap OS pour les voir ici')}
              </p>
            </CardContent>
          </Card>
        ) : (
          scoredInitiatives.map((initiative, index) => (
            <Card key={initiative.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    {index < scoredInitiatives.length - 1 && (
                      <div className="w-px h-4 bg-border mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{initiative.title}</h3>
                        {initiative.linkedObjective && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Target className="w-3 h-3" />
                            {initiative.linkedObjective.title}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {PRIORITY_LABELS[initiative.linkedObjective.priority as ObjectivePriority]?.[lang]}
                            </Badge>
                          </p>
                        )}
                      </div>

                      {/* Score */}
                      <Badge className={`text-lg px-3 py-1 ${getScoreColor(initiative.score)}`}>
                        {initiative.score}
                      </Badge>
                    </div>

                    {/* Breakdown */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {initiative.breakdown.businessImpact > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="w-3 h-3 text-blue-600" />
                          <span>{initiative.breakdown.businessImpact}</span>
                        </div>
                      )}
                      {initiative.breakdown.effort > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 text-green-600" />
                          <span>{initiative.breakdown.effort}</span>
                        </div>
                      )}
                      {initiative.breakdown.riskReduction > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          <span>{initiative.breakdown.riskReduction}</span>
                        </div>
                      )}
                      {initiative.breakdown.deadline > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 text-red-600" />
                          <span>{initiative.breakdown.deadline}</span>
                        </div>
                      )}
                      {initiative.linkedRisks.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {initiative.linkedRisks.length} risque(s) lié(s)
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Move buttons (placeholder for reordering) */}
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0}>
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === scoredInitiatives.length - 1}>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
