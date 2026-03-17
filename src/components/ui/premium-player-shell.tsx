/**
 * PremiumPlayerShell - Unified premium container for audio/video players
 * Provides depth, grain, edge lighting, and cinematic presence
 */

import { forwardRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumPlayerShellProps {
  children: ReactNode;
  className?: string;
  isPlaying?: boolean;
  /** Accent color for glow (CSS color string) */
  accentColor?: string;
  /** Compact mode for inline players */
  compact?: boolean;
}

export const PremiumPlayerShell = forwardRef<HTMLDivElement, PremiumPlayerShellProps>(
  ({ children, className, isPlaying = false, accentColor, compact = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'player-shell relative',
          compact ? 'rounded-xl p-3' : 'rounded-2xl p-5',
          className
        )}
        animate={{
          boxShadow: isPlaying
            ? `var(--shadow-depth-3), var(--edge-light-strong), 0 0 40px -8px ${accentColor || 'hsl(var(--primary) / 0.2)'}`
            : 'var(--shadow-depth-2), var(--edge-light)',
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Ambient glow when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="absolute -inset-px rounded-[inherit] pointer-events-none z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accentColor || 'hsl(var(--primary) / 0.08)'} 0%, transparent 70%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-20">
          {children}
        </div>
      </motion.div>
    );
  }
);

PremiumPlayerShell.displayName = 'PremiumPlayerShell';

/**
 * AudioVisualizer - Animated bars that react to playback state
 */
export function AudioVisualizer({
  isPlaying,
  barCount = 5,
  className,
}: {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}) {
  return (
    <div className={cn('audio-bars', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="bar"
          animate={
            isPlaying
              ? { scaleY: [0.3, 1, 0.3], opacity: [0.7, 1, 0.7] }
              : { scaleY: 0.15, opacity: 0.3 }
          }
          transition={
            isPlaying
              ? {
                  repeat: Infinity,
                  duration: 0.6 + Math.random() * 0.4,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

/**
 * PremiumProgressBar - Expandable progress bar with glow thumb
 */
export function PremiumProgressBar({
  progress,
  duration,
  onSeek,
  className,
}: {
  progress: number;
  duration: number;
  onSeek?: (time: number) => void;
  className?: string;
}) {
  const percentage = duration > 0 ? (progress / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    onSeek(pct * duration);
  };

  return (
    <div
      className={cn('progress-premium group', className)}
      onClick={handleClick}
      role="slider"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={duration}
    >
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      >
        <div className="progress-thumb" />
      </div>
    </div>
  );
}

/**
 * PlayButton - Premium play/pause button with ripple
 */
export function PlayButton({
  isPlaying,
  isLoading,
  onClick,
  size = 'default',
  className,
}: {
  isPlaying: boolean;
  isLoading?: boolean;
  onClick: () => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-10 w-10',
    default: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      className={cn(
        'play-btn-premium rounded-full flex items-center justify-center',
        'bg-primary text-primary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      disabled={isLoading}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ rotate: { repeat: Infinity, duration: 1, ease: 'linear' }, opacity: { duration: 0.15 } }}
            className={cn(iconSize[size], 'border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full')}
          />
        ) : isPlaying ? (
          <motion.svg
            key="pause"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className={iconSize[size]}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </motion.svg>
        ) : (
          <motion.svg
            key="play"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className={cn(iconSize[size], 'ml-0.5')}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36A1 1 0 0 0 8 5.14z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
