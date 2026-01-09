import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Filter, 
  X, 
  Calendar, 
  User, 
  Target, 
  Clock,
  CheckCircle2,
  GitBranch,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TraceOSFilters {
  status: ('pending' | 'validated' | 'abandoned')[];
  scope: string[];
  author: string;
  dateFrom: string;
  dateTo: string;
}

interface TraceOSFiltersProps {
  filters: TraceOSFilters;
  onFiltersChange: (filters: TraceOSFilters) => void;
  availableScopes: string[];
  availableAuthors: string[];
}

const DEFAULT_FILTERS: TraceOSFilters = {
  status: [],
  scope: [],
  author: '',
  dateFrom: '',
  dateTo: ''
};

export function TraceOSFiltersPanel({ 
  filters, 
  onFiltersChange, 
  availableScopes,
  availableAuthors 
}: TraceOSFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.status.length > 0,
    filters.scope.length > 0,
    filters.author !== '',
    filters.dateFrom !== '',
    filters.dateTo !== ''
  ].filter(Boolean).length;

  const handleStatusToggle = (status: 'pending' | 'validated' | 'abandoned') => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleScopeToggle = (scope: string) => {
    const newScope = filters.scope.includes(scope)
      ? filters.scope.filter(s => s !== scope)
      : [...filters.scope, scope];
    onFiltersChange({ ...filters, scope: newScope });
  };

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const statusConfig = {
    pending: { 
      label: t('traceOS.status.pending', 'En attente'),
      icon: Clock,
      color: 'bg-amber-500/20 text-amber-700 border-amber-500/40'
    },
    validated: { 
      label: t('traceOS.status.validated', 'Validée'),
      icon: CheckCircle2,
      color: 'bg-green-500/20 text-green-700 border-green-500/40'
    },
    abandoned: { 
      label: t('traceOS.status.abandoned', 'Abandonnée'),
      icon: GitBranch,
      color: 'bg-muted text-muted-foreground border-muted'
    }
  };

  const scopeLabels: Record<string, string> = {
    strategic: t('traceOS.form.scopeStrategic', 'Stratégique'),
    operational: t('traceOS.form.scopeOperational', 'Opérationnel'),
    tactical: t('traceOS.form.scopeTactical', 'Tactique'),
    project: t('traceOS.form.scopeProject', 'Projet'),
    Stratégique: 'Stratégique',
    Opérationnel: 'Opérationnel',
    Tactique: 'Tactique',
    Projet: 'Projet'
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('traceOS.filters.title', 'Filtres')}
            </h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 h-7 text-xs">
                <RotateCcw className="w-3 h-3" />
                {t('traceOS.filters.reset', 'Réinitialiser')}
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {t('traceOS.filters.status', 'Statut')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
                const config = statusConfig[status];
                const isSelected = filters.status.includes(status);
                return (
                  <Badge
                    key={status}
                    variant="outline"
                    className={`cursor-pointer transition-all ${isSelected ? config.color : 'opacity-50'}`}
                    onClick={() => handleStatusToggle(status)}
                  >
                    <config.icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Scope Filter */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              {t('traceOS.filters.scope', 'Périmètre')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableScopes.map((scope) => {
                const isSelected = filters.scope.includes(scope);
                return (
                  <Badge
                    key={scope}
                    variant="outline"
                    className={`cursor-pointer transition-all ${isSelected ? 'bg-primary/20 text-primary border-primary/40' : 'opacity-50'}`}
                    onClick={() => handleScopeToggle(scope)}
                  >
                    {scopeLabels[scope] || scope}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Author Filter */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              {t('traceOS.filters.author', 'Auteur')}
            </Label>
            <Select 
              value={filters.author} 
              onValueChange={(value) => onFiltersChange({ ...filters, author: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={t('traceOS.filters.allAuthors', 'Tous les auteurs')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('traceOS.filters.allAuthors', 'Tous les auteurs')}</SelectItem>
                {availableAuthors.map((author) => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {t('traceOS.filters.dateRange', 'Période')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">{t('traceOS.filters.from', 'Du')}</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t('traceOS.filters.to', 'Au')}</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Filter function to apply to decisions
export function filterDecisions(
  decisions: any[],
  filters: TraceOSFilters,
  searchQuery: string
): any[] {
  return decisions.filter(decision => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        decision.title.toLowerCase().includes(query) ||
        decision.context.toLowerCase().includes(query) ||
        decision.decision.toLowerCase().includes(query) ||
        decision.author.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(decision.status)) {
      return false;
    }

    // Scope filter
    if (filters.scope.length > 0 && !filters.scope.includes(decision.scope)) {
      return false;
    }

    // Author filter
    if (filters.author && decision.author !== filters.author) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const decisionDate = new Date(decision.date);
      const fromDate = new Date(filters.dateFrom);
      if (decisionDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const decisionDate = new Date(decision.date);
      const toDate = new Date(filters.dateTo);
      if (decisionDate > toDate) return false;
    }

    return true;
  });
}

// Extract unique values for filter options
export function extractFilterOptions(decisions: any[]): { scopes: string[]; authors: string[] } {
  const scopes = new Set<string>();
  const authors = new Set<string>();

  const processDecision = (decision: any) => {
    if (decision.scope) scopes.add(decision.scope);
    if (decision.author) authors.add(decision.author);
    if (decision.children) {
      decision.children.forEach(processDecision);
    }
  };

  decisions.forEach(processDecision);

  return {
    scopes: Array.from(scopes),
    authors: Array.from(authors)
  };
}
