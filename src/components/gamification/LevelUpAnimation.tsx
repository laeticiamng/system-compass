import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelUpAnimationProps {
  newLevel: string;
  levelIcon: string;
  onClose: () => void;
}

export function LevelUpAnimation({ newLevel, levelIcon, onClose }: LevelUpAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary blur-3xl opacity-50"
              style={{ width: 300, height: 300, left: -50, top: -50 }}
            />

            <div className="relative bg-card border-2 border-primary rounded-2xl p-8 shadow-2xl min-w-[320px] text-center">
              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    y: [-20, -60],
                    opacity: [0, 1, 0],
                    x: Math.sin(i * 0.8) * 30,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    bottom: '30%',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center justify-center gap-2 text-primary mb-4"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-lg font-bold uppercase tracking-wider">Level Up!</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-7xl mb-4"
              >
                {levelIcon}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-2xl font-bold mb-2"
              >
                {newLevel}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-muted-foreground mb-6"
              >
                Félicitations ! Vous avez atteint un nouveau niveau.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  Continuer
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
