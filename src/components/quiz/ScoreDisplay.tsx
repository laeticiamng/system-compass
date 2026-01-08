import { useTranslation } from 'react-i18next';
import { type PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  scores: Record<PyramidType, number>;
  showLabels?: boolean;
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

export function ScoreDisplay({ scores, showLabels = true, compact = false }: ScoreDisplayProps) {
  const { t } = useTranslation();
  const maxScore = Math.max(...Object.values(scores), 1);

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {Object.entries(scores).map(([type, score]) => {
        const pyramidType = type as PyramidType;
        const percentage = (score / maxScore) * 100;
        
        return (
          <div key={type} className="space-y-1">
            {showLabels && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {t(`pyramids.${type.toLowerCase().replace('_', '')}.label`, PYRAMID_TYPE_INFO[pyramidType].label)}
                </span>
                <span className="font-medium">{score}</span>
              </div>
            )}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", PYRAMID_COLORS[pyramidType])}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CooperativePoolDisplayProps {
  pool: Record<PyramidType, number>;
  targetScore?: number;
}

export function CooperativePoolDisplay({ pool, targetScore = 50 }: CooperativePoolDisplayProps) {
  const { t } = useTranslation();
  const totalScore = Object.values(pool).reduce((sum, score) => sum + score, 0);
  const progress = Math.min((totalScore / targetScore) * 100, 100);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{t('pyramidQuiz.cooperative.pool', 'Pool Coopératif')}</h3>
        <span className="text-sm font-bold text-primary">
          {totalScore} / {targetScore}
        </span>
      </div>
      
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ScoreDisplay scores={pool} showLabels compact />
    </div>
  );
}