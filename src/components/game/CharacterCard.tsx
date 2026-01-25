import { useTranslation } from 'react-i18next';
import { CharacterCard as CharacterCardType } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import ResourceBar from './ResourceBar';

interface CharacterCardProps {
  character: CharacterCardType;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function CharacterCard({ 
  character, 
  isSelected,
  onClick,
  showDetails = true,
  compact = false,
  className 
}: CharacterCardProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  
  // If compact, override showDetails
  const displayDetails = compact ? false : showDetails;

  const country = countries.find(c => c.id === character.birthCountry);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-card rounded-xl p-5 transition-all",
        onClick && "cursor-pointer hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">{character.name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>🌍</span>
            {country?.name || character.birthCountry}
          </p>
        </div>
        <div className="text-2xl">
          {character.majorAspirations[0]?.icon || '🎯'}
        </div>
      </div>

      {/* Traits */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {character.traits.map(trait => (
            <span 
              key={trait.id}
              className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1"
            >
              {trait.icon} {t(trait.label)}
            </span>
          ))}
          <span 
            className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 flex items-center gap-1"
          >
            {character.constraint.icon} {t(character.constraint.label)}
          </span>
        </div>
      </div>

      {/* Aspirations */}
      {displayDetails && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('character.aspirations')}
          </p>
          <div className="space-y-1">
            {character.majorAspirations.map(asp => (
              <div key={asp.id} className="flex items-center gap-2 text-sm">
                <span>{asp.icon}</span>
                <span>{t(asp.label)}</span>
                <span className="text-xs text-primary font-medium">×2</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{character.minorAspiration.icon}</span>
              <span>{t(character.minorAspiration.label)}</span>
              <span className="text-xs">×1</span>
            </div>
          </div>
        </div>
      )}

      {/* Starting Resources */}
      {displayDetails && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {t('character.startingResources')}
          </p>
          <ResourceBar resources={character.startingResources} size="sm" />
        </div>
      )}
    </div>
  );
}
