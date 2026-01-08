import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6,
  ArrowDown,
  MousePointerClick
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DicePromptProps {
  diceValue: number | null;
  isRolling: boolean;
  isMoving: boolean;
  isFinished: boolean;
  diceRotation: number;
  onRoll: () => void;
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const DicePrompt = ({ 
  diceValue, 
  isRolling, 
  isMoving, 
  isFinished,
  diceRotation,
  onRoll 
}: DicePromptProps) => {
  const { t } = useTranslation();
  const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;
  const isDisabled = isRolling || isMoving || isFinished;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Animated Arrow */}
      {!isDisabled && (
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <MousePointerClick className="w-6 h-6 text-primary" />
          <ArrowDown className="w-8 h-8 text-primary" />
        </div>
      )}

      {/* Dice Button */}
      <button
        onClick={onRoll}
        disabled={isDisabled}
        className={cn(
          "p-8 rounded-2xl transition-all duration-300",
          !isDisabled && "bg-primary/10 hover:bg-primary/20 hover:scale-110 cursor-pointer",
          isDisabled && "bg-muted/50 cursor-not-allowed opacity-50",
          (isRolling || isMoving) && "pointer-events-none"
        )}
        style={{ transform: `rotate(${diceRotation}deg)` }}
      >
        <DiceIcon className={cn(
          "w-16 h-16 transition-all",
          !isDisabled && "text-primary",
          isDisabled && "text-muted-foreground",
          isRolling && "animate-spin"
        )} />
      </button>

      {/* Action Button */}
      <Button
        onClick={onRoll}
        disabled={isDisabled}
        size="lg"
        className={cn(
          "gap-2 text-lg px-8 py-6 animate-pulse",
          !isDisabled && "bg-primary hover:bg-primary/90",
        )}
      >
        <Dice6 className="w-5 h-5" />
        {isMoving ? t('pyramidQuiz.board.moving') : t('dicePrompt.rollButton')}
      </Button>

      {/* Status Text */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isMoving 
          ? t('pyramidQuiz.board.moving')
          : isFinished 
            ? t('dicePrompt.finished')
            : t('dicePrompt.instruction')
        }
      </p>
    </div>
  );
};

export default DicePrompt;
