// Terrain Friction Score Card Component
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, Clock, Users, FileText, Building2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrictionDimension {
  id: string;
  label: string;
  score: number; // 0-100, higher = more friction
  description: string;
  icon: typeof AlertTriangle;
}

interface FrictionScoreCardProps {
  countryId: string;
  countryName: string;
  sector?: string;
  governanceData?: {
    friction_score?: number;
    operational_score?: number;
    stability_score?: number;
    capture_risk_score?: number;
  };
}

export function FrictionScoreCard({ countryName, sector, governanceData }: FrictionScoreCardProps) {
  const { t } = useTranslation();

  // Calculate friction dimensions from governance data
  const calculateDimensions = (): FrictionDimension[] => {
    const frictionScore = governanceData?.friction_score ?? 50;
    const operationalScore = governanceData?.operational_score ?? 50;
    const stabilityScore = governanceData?.stability_score ?? 50;
    const captureRisk = governanceData?.capture_risk_score ?? 50;

    return [
      {
        id: 'administrative',
        label: t('terrain.friction.administrative', 'Administrative Friction'),
        score: Math.round((100 - operationalScore) * 0.8 + frictionScore * 0.2),
        description: t('terrain.friction.administrativeDesc', 'Bureaucratic delays, paperwork complexity'),
        icon: FileText,
      },
      {
        id: 'regulatory',
        label: t('terrain.friction.regulatory', 'Regulatory Friction'),
        score: Math.round(frictionScore * 0.7 + captureRisk * 0.3),
        description: t('terrain.friction.regulatoryDesc', 'Compliance requirements, legal complexity'),
        icon: Building2,
      },
      {
        id: 'network',
        label: t('terrain.friction.network', 'Network Dependency'),
        score: Math.round(captureRisk * 0.6 + (100 - stabilityScore) * 0.4),
        description: t('terrain.friction.networkDesc', 'Need for local connections, informal processes'),
        icon: Users,
      },
      {
        id: 'timing',
        label: t('terrain.friction.timing', 'Time Friction'),
        score: Math.round((100 - operationalScore) * 0.5 + (100 - stabilityScore) * 0.5),
        description: t('terrain.friction.timingDesc', 'Process duration, uncertainty in timelines'),
        icon: Clock,
      },
    ];
  };

  const dimensions = calculateDimensions();
  const overallScore = Math.round(dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length);

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 30) return t('terrain.friction.low', 'Low');
    if (score <= 60) return t('terrain.friction.medium', 'Medium');
    return t('terrain.friction.high', 'High');
  };

  const getScoreBg = (score: number) => {
    if (score <= 30) return 'bg-green-500/20';
    if (score <= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('terrain.friction.title', 'Friction Score')}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                {t('terrain.friction.tooltip', 'Measures operational resistance when entering or operating in this market. Lower is better.')}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          {countryName} {sector && `• ${sector}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium">{t('terrain.friction.overall', 'Overall Friction')}</p>
            <p className="text-xs text-muted-foreground">
              {t('terrain.friction.overallDesc', 'Composite market entry difficulty')}
            </p>
          </div>
          <div className="text-right">
            <span className={cn("text-2xl font-bold", getScoreColor(overallScore))}>
              {overallScore}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
            <Badge className={cn("ml-2", getScoreBg(overallScore), getScoreColor(overallScore), "border-0")}>
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-3">
          {dimensions.map((dim) => (
            <div key={dim.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <dim.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{dim.label}</span>
                </div>
                <span className={cn("font-medium", getScoreColor(dim.score))}>
                  {dim.score}%
                </span>
              </div>
              <Progress 
                value={dim.score} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">{dim.description}</p>
            </div>
          ))}
        </div>

        {/* Interpretation */}
        <div className={cn("p-3 rounded-lg border", getScoreBg(overallScore))}>
          <div className="flex items-start gap-2">
            {overallScore <= 30 ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className={cn("w-4 h-4 mt-0.5", getScoreColor(overallScore))} />
            )}
            <div>
              <p className="text-sm font-medium">
                {overallScore <= 30 
                  ? t('terrain.friction.lowInterpretation', 'Favorable Environment')
                  : overallScore <= 60 
                    ? t('terrain.friction.mediumInterpretation', 'Moderate Challenges')
                    : t('terrain.friction.highInterpretation', 'Significant Barriers')
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {overallScore <= 30 
                  ? t('terrain.friction.lowAdvice', 'Standard processes should work well. Focus on quality of execution.')
                  : overallScore <= 60 
                    ? t('terrain.friction.mediumAdvice', 'Plan extra time and budget. Local expertise recommended.')
                    : t('terrain.friction.highAdvice', 'Strongly consider local partnerships. Expect delays and additional costs.')
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
