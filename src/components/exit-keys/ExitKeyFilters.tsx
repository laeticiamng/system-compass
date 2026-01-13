import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PyramidType } from '@/lib/types';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';

const ALL_PYRAMIDS: PyramidType[] = [
  'PROBLEM_RENT',
  'STABILITY_REDIS',
  'COMPETENCE_TRUST',
  'GROWTH_RISK',
  'HYBRID_TRANSITION',
  'RESOURCE_EXTRACTION',
];

interface ExitKeyFiltersProps {
  difficultyFilter: string;
  durationFilter: string;
  targetPyramidFilter?: string;
  onDifficultyChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onTargetPyramidChange?: (value: string) => void;
  resultCount: number;
  filteredCount: number;
  showTargetPyramid?: boolean;
}

export function ExitKeyFilters({
  difficultyFilter,
  durationFilter,
  targetPyramidFilter = 'all',
  onDifficultyChange,
  onDurationChange,
  onTargetPyramidChange,
  resultCount,
  filteredCount,
  showTargetPyramid = false,
}: ExitKeyFiltersProps) {
  const { t } = useTranslation();
  const { getPyramidLabel } = usePyramidTranslations();

  const hasActiveFilters = difficultyFilter !== 'all' || durationFilter !== 'all' || targetPyramidFilter !== 'all';

  const handleReset = () => {
    onDifficultyChange('all');
    onDurationChange('all');
    if (onTargetPyramidChange) {
      onTargetPyramidChange('all');
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{t('exitKeys.filters.label', 'Filtres')}</span>
        </div>

        <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t('exitKeys.filters.difficulty', 'Difficulté')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('exitKeys.filters.allDifficulties', 'Toutes')}</SelectItem>
            <SelectItem value="accessible">{t('exitKeys.filters.accessible', 'Accessible')}</SelectItem>
            <SelectItem value="exigeant">{t('exitKeys.filters.demanding', 'Exigeant')}</SelectItem>
            <SelectItem value="expert">{t('exitKeys.filters.expert', 'Expert')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={durationFilter} onValueChange={onDurationChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t('exitKeys.filters.duration', 'Durée')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('exitKeys.filters.allDurations', 'Toutes')}</SelectItem>
            <SelectItem value="short">{t('exitKeys.filters.shortTerm', '1-3 ans')}</SelectItem>
            <SelectItem value="medium">{t('exitKeys.filters.mediumTerm', '3-7 ans')}</SelectItem>
            <SelectItem value="long">{t('exitKeys.filters.longTerm', '7+ ans')}</SelectItem>
          </SelectContent>
        </Select>

        {showTargetPyramid && onTargetPyramidChange && (
          <Select value={targetPyramidFilter} onValueChange={onTargetPyramidChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t('exitKeys.filters.targetSystem', 'Système cible')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('exitKeys.filters.allSystems', 'Tous')}</SelectItem>
              {ALL_PYRAMIDS.map(pyramid => (
                <SelectItem key={pyramid} value={pyramid}>
                  {getPyramidLabel(pyramid)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <X className="w-3 h-3" />
            {t('exitKeys.filters.reset', 'Réinitialiser')}
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredCount !== resultCount ? (
            <span>
              {filteredCount} / {resultCount} {t('exitKeys.filters.strategies', 'stratégies')}
            </span>
          ) : (
            <span>
              {resultCount} {t('exitKeys.filters.strategies', 'stratégies')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}