/**
 * ConfettiCelebration - Animated confetti effect for celebrations
 * Revolutionary: Premium celebration animations for achievements
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
  colors?: string[];
  particleCount?: number;
  duration?: number;
}

const DEFAULT_COLORS = [
  'hsl(45, 93%, 58%)',   // Gold
  'hsl(142, 71%, 45%)',  // Green
  'hsl(217, 91%, 60%)',  // Blue
  'hsl(280, 70%, 55%)',  // Purple
  'hsl(0, 72%, 51%)',    // Red
];

export function ConfettiCelebration({
  isActive,
  onComplete,
  colors = DEFAULT_COLORS,
  particleCount = 50,
  duration = 3000,
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 0.5,
      });
    }
    return newParticles;
  }, [particleCount, colors]);

  useEffect(() => {
    if (isActive) {
      setParticles(generateParticles());
      
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isActive, generateParticles, duration, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              top: '110%',
              rotate: particle.rotation + 360 * 3,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: particle.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size * 0.6,
              backgroundColor: particle.color,
              borderRadius: '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * useConfetti - Hook to trigger confetti celebrations
 */
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const celebrate = useCallback(() => {
    setIsActive(true);
  }, []);

  const onComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return { isActive, celebrate, onComplete };
}
