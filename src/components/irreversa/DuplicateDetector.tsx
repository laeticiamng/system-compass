import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IrreversaThreshold } from '@/hooks/useIrreversa';
import { cn } from '@/lib/utils';

interface DuplicateDetectorProps {
  newTitle: string;
  existingThresholds: IrreversaThreshold[];
  className?: string;
}

interface SimilarityMatch {
  threshold: IrreversaThreshold;
  score: number; // 0-100
  matchType: 'exact' | 'similar' | 'partial';
}

// Simple similarity function based on Jaccard index
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase().trim();
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 100;

  // Tokenize into words
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  // Calculate Jaccard index
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return Math.round((intersection.size / union.size) * 100);
}

export function DuplicateDetector({ 
  newTitle, 
  existingThresholds,
  className 
}: DuplicateDetectorProps) {
  const { t } = useTranslation();

  const matches = useMemo<SimilarityMatch[]>(() => {
    if (!newTitle.trim() || newTitle.length < 5) return [];

    return existingThresholds
      .map(threshold => {
        const score = calculateSimilarity(newTitle, threshold.title);
        let matchType: SimilarityMatch['matchType'] = 'partial';
        
        if (score === 100) matchType = 'exact';
        else if (score >= 60) matchType = 'similar';
        
        return { threshold, score, matchType };
      })
      .filter(m => m.score >= 40) // Only show matches with 40%+ similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Max 3 suggestions
  }, [newTitle, existingThresholds]);

  if (matches.length === 0) {
    return null;
  }

  const hasExact = matches.some(m => m.matchType === 'exact');
  const hasSimilar = matches.some(m => m.matchType === 'similar');

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'flex items-start gap-2 p-3 rounded-lg border',
        hasExact 
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' 
          : hasSimilar
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
      )}>
        {hasExact ? (
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        ) : hasSimilar ? (
          <Copy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            hasExact ? 'text-red-700 dark:text-red-300' :
            hasSimilar ? 'text-amber-700 dark:text-amber-300' :
            'text-blue-700 dark:text-blue-300'
          )}>
            {hasExact 
              ? t('irreversa.duplicate.exact', 'Doublon détecté')
              : hasSimilar 
              ? t('irreversa.duplicate.similar', 'Seuils similaires trouvés')
              : t('irreversa.duplicate.partial', 'Seuils potentiellement liés')
            }
          </p>
          
          <div className="mt-2 space-y-1">
            {matches.map(match => (
              <div 
                key={match.threshold.id}
                className="flex items-center gap-2 text-xs"
              >
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs px-1.5 py-0',
                    match.matchType === 'exact' ? 'border-red-300 text-red-600' :
                    match.matchType === 'similar' ? 'border-amber-300 text-amber-600' :
                    'border-blue-300 text-blue-600'
                  )}
                >
                  {match.score}%
                </Badge>
                <span className="text-muted-foreground truncate">
                  {match.threshold.title}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {t(`irreversa.status.${match.threshold.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
