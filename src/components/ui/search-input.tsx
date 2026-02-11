/**
 * Search Input - Reusable search input with clear functionality
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounce?: number;
  isLoading?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value: controlledValue,
  placeholder,
  onChange,
  onSearch,
  debounce = 300,
  isLoading = false,
  className,
  inputClassName,
  autoFocus = false,
}: SearchInputProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.search', 'Rechercher...');
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced onChange
  useEffect(() => {
    if (debounce === 0) return;

    const timer = setTimeout(() => {
      onChange(internalValue);
    }, debounce);

    return () => clearTimeout(timer);
  }, [internalValue, debounce, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (debounce === 0) {
        onChange(newValue);
      }
    },
    [debounce, onChange]
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(internalValue);
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [internalValue, onSearch, handleClear]
  );

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={resolvedPlaceholder}
        autoFocus={autoFocus}
        className={cn('pl-9 pr-9', inputClassName)}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      )}
      {!isLoading && internalValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Filtered Search - Search with filter chips
 */
export function FilteredSearch({
  value,
  onChange,
  filters,
  activeFilters,
  onFilterChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  filters: { id: string; label: string }[];
  activeFilters: string[];
  onFilterChange: (filterId: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <SearchInput value={value} onChange={onChange} placeholder={placeholder} />
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(filter.id)}
                className="h-7 text-xs"
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
