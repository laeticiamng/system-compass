import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  Languages,
  X
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExpertSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  availableCountries: string[];
  minRating?: number;
  onMinRatingChange?: (rating: number) => void;
  verifiedOnly?: boolean;
  onVerifiedOnlyChange?: (verified: boolean) => void;
  languages?: string[];
  selectedLanguages?: string[];
  onLanguageToggle?: (language: string) => void;
  onClearFilters?: () => void;
}

const EXPERT_TYPES = [
  { value: 'all', label: 'Tous les experts' },
  { value: 'lawyer', label: 'Avocats' },
  { value: 'tax_advisor', label: 'Conseillers fiscaux' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'notary', label: 'Notaires' },
  { value: 'business', label: 'Business' },
];

const AVAILABLE_LANGUAGES = [
  'Français', 'English', 'Español', 'Deutsch', 'Português', 
  'Italiano', '中文', 'العربية', 'Nederlands'
];

export function ExpertSearchFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCountry,
  onCountryChange,
  availableCountries,
  minRating = 0,
  onMinRatingChange,
  verifiedOnly = false,
  onVerifiedOnlyChange,
  selectedLanguages = [],
  onLanguageToggle,
  onClearFilters,
}: ExpertSearchFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedCountry !== 'all',
    minRating > 0,
    verifiedOnly,
    selectedLanguages.length > 0,
  ].filter(Boolean).length;

  return (
    <Card className="glass-card">
      <CardContent className="p-4 sm:p-6">
        {/* Basic filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, spécialité, pays..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'expert" />
            </SelectTrigger>
            <SelectContent>
              {EXPERT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCountry} onValueChange={onCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pays</SelectItem>
              {availableCountries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced filters toggle */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres avancés
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            
            {activeFiltersCount > 0 && onClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-1 text-muted-foreground"
              >
                <X className="w-4 h-4" />
                Effacer les filtres
              </Button>
            )}
          </div>

          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Rating filter */}
              {onMinRatingChange && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Note minimale: {minRating > 0 ? minRating.toFixed(1) : 'Aucune'}
                  </Label>
                  <Slider
                    value={[minRating]}
                    min={0}
                    max={5}
                    step={0.5}
                    onValueChange={([value]) => onMinRatingChange(value)}
                    className="w-full"
                  />
                </div>
              )}

              {/* Verified only */}
              {onVerifiedOnlyChange && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Experts vérifiés uniquement</Label>
                    <Switch
                      checked={verifiedOnly}
                      onCheckedChange={onVerifiedOnlyChange}
                    />
                  </div>
                </div>
              )}

              {/* Languages */}
              {onLanguageToggle && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Langues
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LANGUAGES.slice(0, 5).map((lang) => (
                      <Badge
                        key={lang}
                        variant={selectedLanguages.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => onLanguageToggle(lang)}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
