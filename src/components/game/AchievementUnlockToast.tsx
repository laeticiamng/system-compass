import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, X } from 'lucide-react';
import { Achievement, getRarityColor } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface AchievementUnlockToastProps {
  achievement: Achievement;
  onClose: () => void;
  duration?: number;
}

export function AchievementUnlockToast({ 
  achievement, 
  onClose, 
  duration = 5000 
}: AchievementUnlockToastProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Trigger exit animation
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        isVisible && !isExiting ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <div className={cn(
        "p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm flex items-center gap-4 min-w-[300px] max-w-[400px]",
        getRarityColor(achievement.rarity)
      )}>
        <div className="relative">
          <div className="text-4xl animate-bounce">
            {achievement.icon}
          </div>
          <Trophy className="w-4 h-4 absolute -bottom-1 -right-1 text-amber-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium uppercase tracking-wide opacity-75">
              {t('achievements.unlocked', 'Débloqué')}!
            </span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded capitalize",
              achievement.rarity === 'legendary' && "bg-amber-500/20 text-amber-400",
              achievement.rarity === 'epic' && "bg-purple-500/20 text-purple-400",
              achievement.rarity === 'rare' && "bg-blue-500/20 text-blue-400",
              achievement.rarity === 'common' && "bg-gray-500/20 text-gray-400"
            )}>
              {achievement.rarity}
            </span>
          </div>
          <h4 className="font-bold truncate">
            {t(`achievements.${achievement.id}.name`, achievement.name)}
          </h4>
          <p className="text-xs opacity-75 line-clamp-1">
            {t(`achievements.${achievement.id}.description`, achievement.description)}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Container to manage multiple achievement toasts
interface AchievementToastContainerProps {
  achievements: Achievement[];
  onClear: () => void;
}

export function AchievementToastContainer({ 
  achievements, 
  onClear 
}: AchievementToastContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClose = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClear();
    }
  };

  if (achievements.length === 0 || currentIndex >= achievements.length) {
    return null;
  }

  return (
    <AchievementUnlockToast
      key={achievements[currentIndex].id}
      achievement={achievements[currentIndex]}
      onClose={handleClose}
    />
  );
}
