import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAYER_COLORS = [
  { bg: 'bg-blue-500' },
  { bg: 'bg-pink-500' },
  { bg: 'bg-green-500' },
  { bg: 'bg-orange-500' },
];

interface PlayerCountSelectorProps {
  mode: 'race' | 'points_duel' | 'cooperative';
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PlayerCountSelector({
  mode,
  playerCount,
  onPlayerCountChange,
  onNext,
  onBack,
}: PlayerCountSelectorProps) {
  const { t } = useTranslation();

  const getModeTitle = () => {
    switch (mode) {
      case 'race': return t('gameModes.race.title');
      case 'points_duel': return t('gameModes.pointsDuel.title');
      case 'cooperative': return t('gameModes.cooperative.title');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-4">{getModeTitle()}</h1>
          <p className="text-muted-foreground">{t('pyramidQuiz.multiplayer.setup')}</p>
        </div>

        <div className="glass-card rounded-xl p-8 animate-scale-in">
          <h3 className="font-semibold mb-6">{t('pyramidQuiz.multiplayer.selectPlayers')}</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => onPlayerCountChange(count)}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105",
                  playerCount === count 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={cn("w-4 h-4 rounded-full", PLAYER_COLORS[i].bg)} />
                  ))}
                </div>
                <span className="text-lg font-bold">{count}</span>
              </button>
            ))}
          </div>

          <Button onClick={onNext} className="w-full gap-2">
            {t('common.next', 'Next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('pyramidQuiz.back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
