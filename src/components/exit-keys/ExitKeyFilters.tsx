import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExitKeyFiltersProps {
  difficultyFilter: string;
  durationFilter: string;
  onDifficultyChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  resultCount: number;
  filteredCount: number;
}

export function ExitKeyFilters({
  difficultyFilter,
  durationFilter,
  onDifficultyChange,
  onDurationChange,
  resultCount,
  filteredCount,
}: ExitKeyFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="glass-card rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{t('exitKeys.filters.label', 'Filtres')}</span>
        </div>

        <Select value={difficultyFilter} onValueChange={onDifficultyChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('exitKeys.filters.difficulty', 'Difficulté')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('exitKeys.filters.allDifficulties', 'Toutes')}</SelectItem>
            <SelectItem value="easy">{t('exitKeys.filters.easy', 'Facile')}</SelectItem>
            <SelectItem value="moderate">{t('exitKeys.filters.moderate', 'Modéré')}</SelectItem>
            <SelectItem value="hard">{t('exitKeys.filters.hard', 'Difficile')}</SelectItem>
            <SelectItem value="expert">{t('exitKeys.filters.expert', 'Expert')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={durationFilter} onValueChange={onDurationChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('exitKeys.filters.duration', 'Durée')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('exitKeys.filters.allDurations', 'Toutes')}</SelectItem>
            <SelectItem value="short">{t('exitKeys.filters.shortTerm', '1-3 ans')}</SelectItem>
            <SelectItem value="medium">{t('exitKeys.filters.mediumTerm', '3-7 ans')}</SelectItem>
            <SelectItem value="long">{t('exitKeys.filters.longTerm', '7+ ans')}</SelectItem>
          </SelectContent>
        </Select>

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