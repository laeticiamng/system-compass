import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3,
  Brain,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  FileText,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DecisionNodeData } from './DecisionNode';

interface DecisionQualityScoreProps {
  decision: DecisionNodeData;
}

interface QualityDimension {
  id: string;
  label: string;
  icon: typeof Brain;
  score: number; // 0-100
  weight: number; // importance 1-5
  factors: string[];
  improvement?: string;
}

interface CognitiveBias {
  id: string;
  name: string;
  description: string;
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export function DecisionQualityScore({ decision }: DecisionQualityScoreProps) {
  const { t } = useTranslation();

  // Calculate quality dimensions
  const dimensions = useMemo<QualityDimension[]>(() => {
    const result: QualityDimension[] = [];

    // Dimension 1: Hypothesis clarity
    const hasMainHypothesis = !!decision.mainHypothesis && decision.mainHypothesis.length > 20;
    const hasAlternatives = (decision.alternativeHypotheses || []).length >= 2;
    const hypothesisScore = (hasMainHypothesis ? 50 : 0) + (hasAlternatives ? 50 : 25);
    result.push({
      id: 'hypothesis',
      label: t('traceOS.quality.hypothesis', 'Clarté des hypothèses'),
      icon: Lightbulb,
      score: hypothesisScore,
      weight: 5,
      factors: [
        hasMainHypothesis ? t('traceOS.quality.hasMainHypothesis', '✓ Hypothèse principale définie') : t('traceOS.quality.noMainHypothesis', '✗ Hypothèse principale manquante'),
        hasAlternatives ? t('traceOS.quality.hasAlternatives', '✓ Alternatives documentées') : t('traceOS.quality.noAlternatives', '✗ Alternatives insuffisantes'),
      ],
      improvement: hypothesisScore < 100 ? t('traceOS.quality.improveHypothesis', 'Documenter au moins 2 alternatives') : undefined,
    });

    // Dimension 2: Context depth
    const hasContext = !!decision.context && decision.context.length > 50;
    const hasConstraints = (decision.constraints || []).length >= 2;
    const contextScore = (hasContext ? 60 : 20) + (hasConstraints ? 40 : 0);
    result.push({
      id: 'context',
      label: t('traceOS.quality.context', 'Profondeur du contexte'),
      icon: FileText,
      score: contextScore,
      weight: 4,
      factors: [
        hasContext ? t('traceOS.quality.hasContext', '✓ Contexte détaillé') : t('traceOS.quality.noContext', '✗ Contexte insuffisant'),
        hasConstraints ? t('traceOS.quality.hasConstraints', '✓ Contraintes listées') : t('traceOS.quality.noConstraints', '✗ Contraintes non documentées'),
      ],
      improvement: contextScore < 100 ? t('traceOS.quality.improveContext', 'Enrichir le contexte et les contraintes') : undefined,
    });

    // Dimension 3: Abandoned branches (learning from alternatives)
    const abandonedCount = (decision.abandonedBranches || []).length;
    const hasReasons = (decision.abandonedBranches || []).every(b => b.reason && b.reason.length > 10);
    const branchesScore = abandonedCount >= 2 ? (hasReasons ? 100 : 70) : abandonedCount === 1 ? 50 : 20;
    result.push({
      id: 'branches',
      label: t('traceOS.quality.branches', 'Branches abandonnées'),
      icon: Eye,
      score: branchesScore,
      weight: 4,
      factors: [
        abandonedCount >= 2 
          ? t('traceOS.quality.goodBranches', '✓ Plusieurs alternatives écartées documentées')
          : t('traceOS.quality.fewBranches', '✗ Peu d\'alternatives documentées'),
        hasReasons 
          ? t('traceOS.quality.branchReasons', '✓ Raisons d\'abandon expliquées')
          : t('traceOS.quality.noBranchReasons', '✗ Raisons manquantes'),
      ],
      improvement: branchesScore < 100 ? t('traceOS.quality.improveBranches', 'Documenter pourquoi les alternatives ont été écartées') : undefined,
    });

    // Dimension 4: Stakeholder involvement
    const hasAuthor = !!decision.author && decision.author.length > 2;
    const hasScope = !!decision.scope;
    const stakeholderScore = hasAuthor ? (hasScope ? 100 : 70) : 30;
    result.push({
      id: 'stakeholders',
      label: t('traceOS.quality.stakeholders', 'Implication parties prenantes'),
      icon: Users,
      score: stakeholderScore,
      weight: 3,
      factors: [
        hasAuthor ? t('traceOS.quality.hasAuthor', '✓ Auteur/décideur identifié') : t('traceOS.quality.noAuthor', '✗ Auteur non identifié'),
        hasScope ? t('traceOS.quality.hasScope', '✓ Portée définie') : t('traceOS.quality.noScope', '✗ Portée non définie'),
      ],
    });

    // Dimension 5: Timeliness
    const hasDate = !!decision.date;
    const isValidated = decision.status === 'validated';
    const timeScore = hasDate ? (isValidated ? 100 : 70) : 30;
    result.push({
      id: 'time',
      label: t('traceOS.quality.time', 'Temporalité'),
      icon: Clock,
      score: timeScore,
      weight: 2,
      factors: [
        hasDate ? t('traceOS.quality.hasDate', '✓ Date de décision') : t('traceOS.quality.noDate', '✗ Date manquante'),
        isValidated ? t('traceOS.quality.validated', '✓ Décision validée') : t('traceOS.quality.pending', '○ En attente de validation'),
      ],
    });

    return result;
  }, [decision, t]);

  // Detect cognitive biases
  const biases = useMemo<CognitiveBias[]>(() => {
    const detected: CognitiveBias[] = [];

    // Confirmation bias: if no alternatives or all alternatives weak
    const alternativeCount = (decision.alternativeHypotheses || []).length;
    if (alternativeCount < 2) {
      detected.push({
        id: 'confirmation',
        name: t('traceOS.bias.confirmation.name', 'Biais de confirmation'),
        description: t('traceOS.bias.confirmation.desc', 'Tendance à chercher des informations confirmant nos croyances'),
        detected: true,
        severity: alternativeCount === 0 ? 'high' : 'medium',
        mitigation: t('traceOS.bias.confirmation.fix', 'Documenter au moins 2 alternatives sérieusement considérées'),
      });
    }

    // Anchoring: if main hypothesis appears without context
    if (decision.mainHypothesis && (!decision.context || decision.context.length < 30)) {
      detected.push({
        id: 'anchoring',
        name: t('traceOS.bias.anchoring.name', 'Biais d\'ancrage'),
        description: t('traceOS.bias.anchoring.desc', 'Fixation sur la première information reçue'),
        detected: true,
        severity: 'medium',
        mitigation: t('traceOS.bias.anchoring.fix', 'Enrichir le contexte pour montrer d\'où vient l\'hypothèse'),
      });
    }

    // Sunk cost: if no abandoned branches despite constraints
    const hasConstraints = (decision.constraints || []).length > 0;
    const hasAbandonedBranches = (decision.abandonedBranches || []).length > 0;
    if (hasConstraints && !hasAbandonedBranches) {
      detected.push({
        id: 'sunkcost',
        name: t('traceOS.bias.sunkcost.name', 'Biais des coûts irrécupérables'),
        description: t('traceOS.bias.sunkcost.desc', 'Continuer car on a déjà investi, malgré de meilleures options'),
        detected: true,
        severity: 'low',
        mitigation: t('traceOS.bias.sunkcost.fix', 'Documenter les alternatives écartées et leurs raisons'),
      });
    }

    // Authority bias: if author is a single person for strategic decision
    if (decision.scope === 'Stratégique' && decision.author && !decision.author.includes(',') && !decision.author.toLowerCase().includes('comité')) {
      detected.push({
        id: 'authority',
        name: t('traceOS.bias.authority.name', 'Biais d\'autorité'),
        description: t('traceOS.bias.authority.desc', 'Suivre une décision car elle vient d\'une figure d\'autorité'),
        detected: true,
        severity: 'medium',
        mitigation: t('traceOS.bias.authority.fix', 'Impliquer plusieurs décideurs ou un comité pour les décisions stratégiques'),
      });
    }

    return detected;
  }, [decision, t]);

  // Calculate weighted total score
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const weightedScore = Math.round(
    dimensions.reduce((sum, d) => sum + (d.score * d.weight), 0) / totalWeight
  );

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-500/20', label: t('traceOS.quality.excellent', 'Excellente') };
    if (score >= 60) return { color: 'text-blue-600', bg: 'bg-blue-500/20', label: t('traceOS.quality.good', 'Bonne') };
    if (score >= 40) return { color: 'text-amber-600', bg: 'bg-amber-500/20', label: t('traceOS.quality.moderate', 'À améliorer') };
    return { color: 'text-red-600', bg: 'bg-red-500/20', label: t('traceOS.quality.poor', 'Insuffisante') };
  };

  const level = getScoreLevel(weightedScore);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-5 h-5 text-primary" />
          {t('traceOS.quality.title', 'Score de qualité décisionnelle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main score */}
        <div className={`p-4 rounded-xl ${level.bg} text-center`}>
          <div className={`text-4xl font-bold ${level.color}`}>
            {weightedScore}%
          </div>
          <Badge variant="outline" className={`mt-2 ${level.color}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {level.label}
          </Badge>
        </div>

        {/* Dimensions breakdown */}
        <div className="space-y-3">
          {dimensions.map(dim => {
            const Icon = dim.icon;
            return (
              <div key={dim.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {dim.label}
                  </span>
                  <span className="font-medium">{dim.score}%</span>
                </div>
                <Progress value={dim.score} className="h-1.5" />
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {dim.factors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Cognitive biases */}
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {t('traceOS.quality.biasAnalysis', 'Analyse des biais cognitifs')}
          </h4>
          
          {biases.length === 0 ? (
            <div className="p-3 rounded-lg bg-green-500/10 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t('traceOS.quality.noBiasDetected', 'Aucun biais majeur détecté')}
            </div>
          ) : (
            <div className="space-y-2">
              {biases.map(bias => (
                <div 
                  key={bias.id}
                  className={`p-3 rounded-lg ${
                    bias.severity === 'high' ? 'bg-red-500/10' :
                    bias.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      bias.severity === 'high' ? 'text-red-500' :
                      bias.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{bias.name}</p>
                      <p className="text-xs text-muted-foreground">{bias.description}</p>
                      {bias.mitigation && (
                        <p className="text-xs mt-1 italic">💡 {bias.mitigation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Improvement suggestions */}
        {dimensions.some(d => d.improvement) && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('traceOS.quality.improvements', 'Axes d\'amélioration')}
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {dimensions.filter(d => d.improvement).map(d => (
                  <li key={d.id} className="flex items-start gap-1">
                    <span>→</span>
                    {d.improvement}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
