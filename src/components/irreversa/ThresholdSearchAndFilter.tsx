import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ThresholdStatus, ThresholdDomain, ThresholdNature } from '@/hooks/useIrreversa';

export type SortField = 'created_at' | 'detection_date' | 'title' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  status: ThresholdStatus | 'all';
  domain: ThresholdDomain | 'all';
  nature: ThresholdNature | 'all';
  sortField: SortField;
  sortOrder: SortOrder;
}

interface ThresholdSearchAndFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  counts: Record<string, number>;
}

export function ThresholdSearchAndFilter({
  filters,
  onFiltersChange,
  counts
}: ThresholdSearchAndFilterProps) {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      domain: 'all',
      nature: 'all',
      sortField: 'created_at',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.domain !== 'all',
    filters.nature !== 'all',
    filters.search !== ''
  ].filter(Boolean).length;

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-3">
      {/* Search and main controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder={t('irreversa.search.placeholder', 'Rechercher par titre ou contexte...')}
            className="pl-9"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => updateFilter('search', '')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={filters.sortField}
            onValueChange={(v) => updateFilter('sortField', v as SortField)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">{t('irreversa.sort.created', 'Date création')}</SelectItem>
              <SelectItem value="detection_date">{t('irreversa.sort.detection', 'Date détection')}</SelectItem>
              <SelectItem value="title">{t('irreversa.sort.title', 'Titre')}</SelectItem>
              <SelectItem value="status">{t('irreversa.sort.status', 'Statut')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={toggleSortOrder}>
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>

          {/* Filter popover */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {t('common.filter', 'Filtrer')}
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('irreversa.filter.title', 'Filtres avancés')}</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      {t('common.clearAll', 'Tout effacer')}
                    </Button>
                  )}
                </div>

                {/* Status filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('irreversa.fields.status', 'Statut')}</label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => updateFilter('status', v as ThresholdStatus | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'Tous')} ({counts.all || 0})</SelectItem>
                      <SelectItem value="detected">{t('irreversa.status.detected')} ({counts.detected || 0})</SelectItem>
                      <SelectItem value="marked">{t('irreversa.status.marked')} ({counts.marked || 0})</SelectItem>
                      <SelectItem value="validated">{t('irreversa.status.validated')} ({counts.validated || 0})</SelectItem>
                      <SelectItem value="sealed">{t('irreversa.status.sealed')} ({counts.sealed || 0})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Domain filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('irreversa.fields.domain', 'Domaine')}</label>
                  <Select
                    value={filters.domain}
                    onValueChange={(v) => updateFilter('domain', v as ThresholdDomain | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'Tous')}</SelectItem>
                      <SelectItem value="strategic">{t('irreversa.domain.strategic')}</SelectItem>
                      <SelectItem value="financial">{t('irreversa.domain.financial')}</SelectItem>
                      <SelectItem value="organizational">{t('irreversa.domain.organizational')}</SelectItem>
                      <SelectItem value="legal">{t('irreversa.domain.legal')}</SelectItem>
                      <SelectItem value="ethical">{t('irreversa.domain.ethical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nature filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('irreversa.fields.nature', 'Nature')}</label>
                  <Select
                    value={filters.nature}
                    onValueChange={(v) => updateFilter('nature', v as ThresholdNature | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'Tous')}</SelectItem>
                      <SelectItem value="resource_commitment">{t('irreversa.nature.resource_commitment')}</SelectItem>
                      <SelectItem value="contractual">{t('irreversa.nature.contractual')}</SelectItem>
                      <SelectItem value="reputational">{t('irreversa.nature.reputational')}</SelectItem>
                      <SelectItem value="structural">{t('irreversa.nature.structural')}</SelectItem>
                      <SelectItem value="temporal">{t('irreversa.nature.temporal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t(`irreversa.status.${filters.status}`)}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('status', 'all')} 
              />
            </Badge>
          )}
          {filters.domain !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t(`irreversa.domain.${filters.domain}`)}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('domain', 'all')} 
              />
            </Badge>
          )}
          {filters.nature !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t(`irreversa.nature.${filters.nature}`)}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter('nature', 'all')} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
