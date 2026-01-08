import { useTranslation } from 'react-i18next';
import { Gamepad2, Target, Flag, Swords, HandHeart, ArrowRight } from 'lucide-react';
import RulesDialog from '@/components/game/RulesDialog';
import SavedGamesDialog from '@/components/game/SavedGamesDialog';
import { SavedGame } from '@/hooks/useSavedGames';

type GameMode = 'online' | 'solo' | 'race' | 'points_duel' | 'cooperative';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode, playerCount?: number) => void;
  onLoadGame: (game: SavedGame) => void;
  isLoggedIn: boolean;
}

const GAME_MODES = [
  {
    mode: 'online' as GameMode,
    icon: Gamepad2,
    color: 'primary',
    titleKey: 'pyramidQuiz.modes.online.title',
    descKey: 'pyramidQuiz.modes.online.description',
    ctaKey: 'pyramidQuiz.modes.online.cta',
  },
  {
    mode: 'solo' as GameMode,
    icon: Target,
    color: 'blue-500',
    titleKey: 'gameModes.solo.title',
    descKey: 'gameModes.solo.description',
    ctaKey: 'pyramidQuiz.modes.board.cta',
    playerCount: 1,
  },
  {
    mode: 'race' as GameMode,
    icon: Flag,
    color: 'yellow-500',
    titleKey: 'gameModes.race.title',
    descKey: 'gameModes.race.description',
    ctaKey: 'pyramidQuiz.modes.multiplayer.cta',
  },
  {
    mode: 'points_duel' as GameMode,
    icon: Swords,
    color: 'rose-500',
    titleKey: 'gameModes.pointsDuel.title',
    descKey: 'gameModes.pointsDuel.description',
    ctaKey: 'pyramidQuiz.modes.multiplayer.cta',
  },
  {
    mode: 'cooperative' as GameMode,
    icon: HandHeart,
    color: 'emerald-500',
    titleKey: 'gameModes.cooperative.title',
    descKey: 'gameModes.cooperative.description',
    ctaKey: 'pyramidQuiz.modes.multiplayer.cta',
  },
];

export function GameModeSelector({ onSelectMode, onLoadGame, isLoggedIn }: GameModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl font-bold mb-4">{t('pyramidQuiz.title')}</h1>
          <p className="text-xl text-muted-foreground">{t('pyramidQuiz.subtitle')}</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <RulesDialog />
          {isLoggedIn && <SavedGamesDialog onLoadGame={onLoadGame} />}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_MODES.map((gameMode, index) => {
            const Icon = gameMode.icon;
            return (
              <button
                key={gameMode.mode}
                onClick={() => onSelectMode(gameMode.mode, gameMode.playerCount)}
                className={`glass-card rounded-2xl p-8 text-left hover:border-${gameMode.color}/50 
                           hover:scale-105 transition-all duration-300 group animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 rounded-xl bg-${gameMode.color}/10 group-hover:bg-${gameMode.color}/20 transition-all`}>
                    <Icon className={`w-8 h-8 text-${gameMode.color}`} />
                  </div>
                  <h2 className="font-display text-xl font-semibold">{t(gameMode.titleKey)}</h2>
                </div>
                <p className="text-muted-foreground mb-6 text-sm">{t(gameMode.descKey)}</p>
                <div className={`flex items-center gap-2 text-${gameMode.color} font-medium`}>
                  {t(gameMode.ctaKey)}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
