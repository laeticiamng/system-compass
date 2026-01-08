import { useTranslation } from 'react-i18next';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  scores: Record<PyramidType, number>;
  showDetails?: boolean;
  title?: string;
  compact?: boolean;
}

const PYRAMID_COLORS: Record<PyramidType, string> = {
  PROBLEM_RENT: 'bg-red-500',
  STABILITY_REDIS: 'bg-blue-500',
  COMPETENCE_TRUST: 'bg-green-500',
  GROWTH_RISK: 'bg-yellow-500',
  HYBRID_TRANSITION: 'bg-purple-500',
  RESOURCE_EXTRACTION: 'bg-orange-500',
};

export function ScoreDisplay({ 
  scores, 
  showDetails = true, 
  title,
  compact = false 
}: ScoreDisplayProps) {
  const { t } = useTranslation();

  const maxScore = Math.max(...Object.values(scores), 1);
  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {sortedScores.slice(0, 3).map(([type, score]) => (
          <div 
            key={type}
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium text-white",
              PYRAMID_COLORS[type as PyramidType]
            )}
          >
            {score}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      )}
      
      {sortedScores.map(([type, score]) => {
        const pyramidType = type as PyramidType;
        const info = PYRAMID_TYPE_INFO[pyramidType];
        const percentage = (score / maxScore) * 100;

        return (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{info?.label || type}</span>
              <span className="text-muted-foreground">{score}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  PYRAMID_COLORS[pyramidType]
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {showDetails && info?.description && (
              <p className="text-xs text-muted-foreground">{info.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CooperativePoolDisplayProps {
  pool: Record<PyramidType, number>;
  threshold?: number;
}

export function CooperativePoolDisplay({ 
  pool, 
  threshold = 50 
}: CooperativePoolDisplayProps) {
  const { t } = useTranslation();
  const total = Object.values(pool).reduce((sum, v) => sum + v, 0);
  const progress = Math.min((total / threshold) * 100, 100);

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">
          {t('pyramidQuiz.cooperative.sharedPool', 'Shared Pool')}
        </h4>
        <span className="text-primary font-bold">{total}/{threshold}</span>
      </div>
      
      <Progress value={progress} className="h-3" />
      
      <div className="flex flex-wrap gap-1">
        {Object.entries(pool)
          .filter(([, score]) => score > 0)
          .map(([type, score]) => (
            <div 
              key={type}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium text-white",
                PYRAMID_COLORS[type as PyramidType]
              )}
            >
              {score}
            </div>
          ))}
      </div>
    </div>
  );
}
