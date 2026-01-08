import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Zap, ChevronRight, Globe, Plane, Map, 
  Save, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExitKeyFilters } from './ExitKeyFilters';
import { cn } from '@/lib/utils';
import type { LifePriority } from '@/lib/types';

interface ExitKeyResultSimple {
  key: {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: string;
    timeframe: string;
  };
  compatibility: number;
}

interface DestinationRecommendationSimple {
  countryId: string;
  countryName: string;
  score: number;
}

function getFlagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

const priorityOptions: { value: LifePriority; label: string; icon: string }[] = [
  { value: 'freedom', label: 'Liberté', icon: '🦅' },
  { value: 'money', label: 'Argent', icon: '💰' },
  { value: 'meaning', label: 'Sens', icon: '💫' },
  { value: 'status', label: 'Statut', icon: '👔' },
  { value: 'family', label: 'Famille', icon: '👨‍👩‍👧' },
  { value: 'calm', label: 'Sérénité', icon: '🧘' },
];

export function ResultsDisplay({
  exitKeyResults,
  filteredResults,
  difficultyFilter,
  durationFilter,
  onDifficultyChange,
  onDurationChange,
  birthCountry,
  currentCountry,
  desiredLife,
  nationalityAdvantages,
  destinationRecommendations,
  onSaveProfile,
  onReset,
  isLoggedIn,
}: ResultsDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('exitKeys.yourKeys', 'Vos Clés de Sortie')}</h2>
        <p className="text-muted-foreground">
          {exitKeyResults.length} {t('exitKeys.strategiesFound', 'stratégies identifiées pour votre situation')}
        </p>
      </div>

      {/* Context Summary */}
      <div className="glass-card rounded-xl p-6 bg-primary/5">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {birthCountry && (
            <div className="flex items-center gap-2">
              <span className="text-xl">{getFlagEmoji(birthCountry.iso2)}</span>
              <span>{birthCountry.name}</span>
            </div>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {currentCountry && (
            <div className="flex items-center gap-2">
              <span className="text-xl">{getFlagEmoji(currentCountry.iso2)}</span>
              <span>{currentCountry.name}</span>
            </div>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <span className="text-xl">{priorityOptions.find(p => p.value === desiredLife)?.icon}</span>
            <span>{priorityOptions.find(p => p.value === desiredLife)?.label}</span>
          </div>
        </div>
      </div>

      {/* Nationality Advantages */}
      {nationalityAdvantages.uniqueAdvantages.length > 0 && (
        <div className="glass-card rounded-xl p-6 border-2 border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('exitKeys.nationalityAdvantages', 'Avantages de vos Nationalités')}
            {nationalityAdvantages.strongestPassport && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full bg-primary/10",
                getPassportStrengthLabel(nationalityAdvantages.strongestPassport.passportStrength).color
              )}>
                {getPassportStrengthLabel(nationalityAdvantages.strongestPassport.passportStrength).label}
              </span>
            )}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t('exitKeys.regionalBlocs', 'Blocs régionaux')}</p>
              <div className="flex flex-wrap gap-2">
                {nationalityAdvantages.regionalBlocs.map(bloc => {
                  const blocInfo = REGIONAL_BLOCS[bloc];
                  return (
                    <Badge key={bloc} variant="outline" className="text-xs">
                      {blocInfo?.name || bloc}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t('exitKeys.uniqueAdvantages', 'Avantages uniques')}</p>
              <ul className="text-sm space-y-1">
                {nationalityAdvantages.uniqueAdvantages.slice(0, 3).map((adv, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <Plane className="w-3 h-3 text-primary" />
                    <span className="truncate">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Destination Map */}
      {destinationRecommendations.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            {t('exitKeys.recommendedDestinations', 'Destinations Recommandées')}
          </h3>
          <DestinationMap recommendations={destinationRecommendations} />
          <DestinationCompare recommendations={destinationRecommendations.slice(0, 4)} />
        </div>
      )}

      {/* Filters */}
      <ExitKeyFilters
        difficultyFilter={difficultyFilter}
        durationFilter={durationFilter}
        onDifficultyChange={onDifficultyChange}
        onDurationChange={onDurationChange}
        resultCount={exitKeyResults.length}
        filteredCount={filteredResults.length}
      />

      {/* Exit Keys List */}
      <div className="space-y-6">
        {filteredResults.map((result, index) => (
          <ExitKeyCard 
            key={result.key.id} 
            result={result} 
            rank={index + 1}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-6 border-t">
        <Button onClick={onSaveProfile} className="gap-2">
          <Save className="w-4 h-4" />
          {t('exitKeys.saveProfile', 'Sauvegarder mon profil')}
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t('exitKeys.restart', 'Recommencer')}
        </Button>
        <Link to="/exit-keys/compare">
          <Button variant="outline" className="gap-2">
            {t('exitKeys.compareKeys', 'Comparer les stratégies')}
          </Button>
        </Link>
      </div>

      {!isLoggedIn && (
        <div className="text-center text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">
            {t('exitKeys.loginToSave', 'Connectez-vous pour sauvegarder votre profil')}
          </Link>
        </div>
      )}
    </div>
  );
}
