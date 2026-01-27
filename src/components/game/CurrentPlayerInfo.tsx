import { useTranslation } from 'react-i18next';
import { CharacterCard, GameResources } from '@/lib/game-data';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { FamilyStatus, FAMILY_STATUS_LABELS } from '@/lib/family-system';
import { cn } from '@/lib/utils';
import { MapPin, User, Clock, Sparkles, Flag } from 'lucide-react';

interface CurrentPlayerInfoProps {
  player: {
    id: number;
    name: string;
    color: string;
    character?: CharacterCard;
    countryType: PyramidType;
    resources: GameResources;
    familyStatus?: FamilyStatus;
    position: number;
  };
  turnNumber: number;
  compact?: boolean;
}

const COUNTRY_NAMES: Record<string, string> = {
  'US': 'États-Unis',
  'FR': 'France',
  'JP': 'Japon',
  'NG': 'Nigeria',
  'BR': 'Brésil',
  'SA': 'Arabie Saoudite',
  'DE': 'Allemagne',
  'IN': 'Inde',
  'RU': 'Russie',
  'CN': 'Chine',
  'UK': 'Royaume-Uni',
  'MX': 'Mexique',
  'KR': 'Corée du Sud',
};

const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'FR': '🇫🇷',
  'JP': '🇯🇵',
  'NG': '🇳🇬',
  'BR': '🇧🇷',
  'SA': '🇸🇦',
  'DE': '🇩🇪',
  'IN': '🇮🇳',
  'RU': '🇷🇺',
  'CN': '🇨🇳',
  'UK': '🇬🇧',
  'MX': '🇲🇽',
  'KR': '🇰🇷',
};

export default function CurrentPlayerInfo({ player, turnNumber, compact = false }: CurrentPlayerInfoProps) {
  const { t } = useTranslation();
  const character = player.character;
  const countryName = character?.birthCountry ? COUNTRY_NAMES[character.birthCountry] || character.birthCountry : 'Inconnu';
  const countryFlag = character?.birthCountry ? COUNTRY_FLAGS[character.birthCountry] || '🌍' : '🌍';
  const pyramidInfo = PYRAMID_TYPE_INFO[player.countryType];

  if (compact) {
    return (
      <div className="glass-card rounded-lg p-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={cn("w-4 h-4 rounded-full", player.color)} />
          <span className="font-semibold">{player.name}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="text-xl">{countryFlag}</span>
          <span>{countryName}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3 h-3" />
          <span>{t('turnManager.year', { year: turnNumber })}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 md:p-6 animate-fade-in">
      {/* Header with player name and avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-3xl",
          player.color,
          "ring-4 ring-primary/30"
        )}>
          {character?.id ? character.id.slice(0, 2).toUpperCase() : '👤'}
        </div>
        
        <div className="flex-1">
          <h2 className="font-display text-xl md:text-2xl font-bold">{player.name}</h2>
          {character?.id && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {character.id}
            </p>
          )}
        </div>

        {/* Turn indicator */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{t('game.turn', 'Tour')}</div>
          <div className="text-2xl font-bold text-primary">{turnNumber}</div>
        </div>
      </div>

      {/* Country and System Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">{t('game.birthCountry', 'Pays de naissance')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{countryFlag}</span>
            <span className="font-semibold">{countryName}</span>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">{t('game.systemType', 'Type de système')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{pyramidInfo?.label || player.countryType}</span>
          </div>
        </div>
      </div>

      {/* Family status if applicable */}
      {player.familyStatus && FAMILY_STATUS_LABELS[player.familyStatus] && (
        <div className="bg-rose-500/10 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{FAMILY_STATUS_LABELS[player.familyStatus].icon}</span>
            <span className="font-medium text-rose-400">
              {t(FAMILY_STATUS_LABELS[player.familyStatus].label, player.familyStatus)}
            </span>
          </div>
        </div>
      )}

      {/* Character traits if available */}
      {character?.traits && character.traits.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="w-3 h-3" />
            {t('game.traits', 'Traits de caractère')}
          </div>
          <div className="flex flex-wrap gap-2">
            {character.traits.map((trait, idx) => (
              <span 
                key={idx}
                className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  trait.type === 'positive'
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/20 text-rose-400"
                )}
              >
                {trait.type === 'positive' ? '+' : '-'} {t(trait.label)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Position on board */}
      <div className="mt-4 pt-4 border-t border-border/50 text-center">
        <span className="text-sm text-muted-foreground">
          {t('game.boardPosition', 'Position sur le plateau')}: 
          <span className="ml-2 font-bold text-primary">{player.position} / 41</span>
        </span>
      </div>
    </div>
  );
}
