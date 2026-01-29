import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AchievementNotificationProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  } | null;
  onClose: () => void;
}

const rarityColors = {
  common: 'from-slate-400 to-slate-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-amber-600',
};

const rarityLabels = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export function AchievementNotification({ badge, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {isVisible && badge && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`
            relative overflow-hidden rounded-xl shadow-2xl
            bg-gradient-to-r ${rarityColors[badge.rarity]}
            p-1
          `}>
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-6 min-w-[320px]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className={`
                    w-16 h-16 rounded-full
                    bg-gradient-to-br ${rarityColors[badge.rarity]}
                    flex items-center justify-center text-3xl
                    shadow-lg
                  `}
                >
                  {badge.icon}
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Badge Débloqué !
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs bg-gradient-to-r ${rarityColors[badge.rarity]} text-white border-none`}
                    >
                      {rarityLabels[badge.rarity]}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Star className="w-3 h-3" />
                      <span>+{badge.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sparkle effects */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="absolute w-3 h-3 text-amber-400"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
