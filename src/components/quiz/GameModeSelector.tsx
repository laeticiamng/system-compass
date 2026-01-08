import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Trophy, HandHeart, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameMode = 'online' | 'solo' | 'race' | 'points_duel' | 'cooperative';

interface GameModeOption {
  id: GameMode;
  icon: React.ReactNode;
  players: string;
  color: string;
}

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  onLoadGame?: () => void;
  hasLoadGameOption?: boolean;
}

const gameModes: GameModeOption[] = [
  {
    id: 'online',
    icon: <Globe className="w-8 h-8" />,
    players: '1',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  },
  {
    id: 'solo',
    icon: <Gamepad2 className="w-8 h-8" />,
    players: '1',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  },
  {
    id: 'race',
    icon: <Trophy className="w-8 h-8" />,
    players: '2-4',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  },
  {
    id: 'points_duel',
    icon: <Users className="w-8 h-8" />,
    players: '2-4',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  },
  {
    id: 'cooperative',
    icon: <HandHeart className="w-8 h-8" />,
    players: '2-4',
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  },
];

export function GameModeSelector({ 
  onSelectMode, 
  onLoadGame,
  hasLoadGameOption = false 
}: GameModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/20">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold">{t('pyramidQuiz.title')}</h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('pyramidQuiz.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {gameModes.map((mode, index) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                "group relative p-6 rounded-2xl border-2 bg-gradient-to-br transition-all duration-300",
                "hover:scale-105 hover:shadow-xl animate-scale-in",
                mode.color
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-xl bg-background/50 group-hover:bg-background/80 transition-colors">
                  {mode.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-display font-bold text-lg">
                    {t(`gameModes.${mode.id === 'points_duel' ? 'pointsDuel' : mode.id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`gameModes.${mode.id === 'points_duel' ? 'pointsDuel' : mode.id}.description`)}
                  </p>
                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-background/50">
                    {mode.players} {t('pyramidQuiz.players', 'joueur(s)')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {hasLoadGameOption && onLoadGame && (
          <div className="text-center">
            <Button variant="outline" onClick={onLoadGame} className="gap-2">
              {t('pyramidQuiz.loadGame', 'Charger une partie')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}