import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Eye, X, ArrowRight, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOVISuggestions, SimulationType, OVISuggestion } from '@/hooks/useOVISuggestions';
import { useSubscription } from '@/hooks/useSubscription';

interface OVISuggestionsWidgetProps {
  simulationType: SimulationType;
  context?: {
    countryIds?: string[];
    exitKeyIds?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
  };
  className?: string;
  compact?: boolean;
}

export function OVISuggestionsWidget({ 
  simulationType, 
  context, 
  className,
  compact = false
}: OVISuggestionsWidgetProps) {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const { 
    getSuggestionsForSimulation, 
    dismissSuggestion,
    trackSuggestionView 
  } = useOVISuggestions();
  
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const suggestions = getSuggestionsForSimulation(simulationType, context)
    .filter(s => !dismissed.has(s.id))
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  const handleDismiss = (suggestionId: string) => {
    setDismissed(prev => new Set([...prev, suggestionId]));
    dismissSuggestion(suggestionId);
  };

  const handleView = (suggestion: OVISuggestion) => {
    trackSuggestionView(suggestion.id, simulationType);
  };

  if (compact) {
    const topSuggestion = suggestions[0];
    if (!topSuggestion) return null;

    return (
      <div className={cn("glass-card rounded-lg p-3 border-primary/20", className)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {topSuggestion.icon} {topSuggestion.title}
            </span>
          </div>
          <Link to="/ovi" onClick={() => handleView(topSuggestion)}>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-sm">
              {t('ovi.suggestions.title', 'Lectures OVI suggérées')}
            </span>
            <Badge variant="secondary" className="text-xs">
              {suggestions.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              {t('ovi.suggestions.subtitle', 'Ces ressources peuvent enrichir votre réflexion après cette simulation.')}
            </p>

            {suggestions.map(suggestion => (
              <div 
                key={suggestion.id}
                className="flex items-start gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
              >
                <span className="text-lg">{suggestion.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{suggestion.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type === 'framework' ? t('ovi.type.framework', 'Cadre') : t('ovi.type.grid', 'Grille')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canAccessPro && (
                    <Link to="/ovi" onClick={() => handleView(suggestion)}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDismiss(suggestion.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {!canAccessPro && (
              <div className="text-center pt-2">
                <Link to="/pricing">
                  <Button variant="outline" size="sm" className="text-xs">
                    {t('ovi.suggestions.unlockPro', 'Débloquer avec Pro')}
                  </Button>
                </Link>
              </div>
            )}

            <div className="text-center pt-1">
              <Link to="/ovi">
                <Button variant="link" size="sm" className="text-xs text-muted-foreground">
                  {t('ovi.suggestions.viewAll', 'Voir tous les contenus OVI')}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
