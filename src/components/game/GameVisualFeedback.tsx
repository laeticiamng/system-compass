import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameResources, ResourceType, RESOURCE_INFO } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Zap, 
  Heart,
  Coins,
  Clock,
  Users,
  Plane,
  BookOpen
} from 'lucide-react';

interface ResourceChange {
  resource: ResourceType;
  change: number;
  id: string;
}

interface GameVisualFeedbackProps {
  resourceChanges: ResourceChange[];
  onComplete?: () => void;
  position?: 'center' | 'top-right' | 'bottom';
}

export default function GameVisualFeedback({
  resourceChanges,
  onComplete,
  position = 'center',
}: GameVisualFeedbackProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const positionClasses = {
    center: 'fixed inset-0 flex items-center justify-center z-50',
    'top-right': 'fixed top-20 right-4 z-50',
    bottom: 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50',
  };

  const resourceIcons = {
    money: <Coins className="w-5 h-5" />,
    health: <Heart className="w-5 h-5" />,
    time: <Clock className="w-5 h-5" />,
    network: <Users className="w-5 h-5" />,
    mobility: <Plane className="w-5 h-5" />,
    skills: <BookOpen className="w-5 h-5" />,
  };

  return (
    <AnimatePresence>
      {visible && resourceChanges.length > 0 && (
        <div className={positionClasses[position]} style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center gap-3">
            {resourceChanges.map((change, index) => (
              <motion.div
                key={change.id}
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  scale: 1,
                }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ 
                  delay: index * 0.15,
                  type: 'spring',
                  stiffness: 200,
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg shadow-lg backdrop-blur-sm",
                  change.change > 0 
                    ? "bg-emerald-500/90 text-white shadow-emerald-500/30" 
                    : "bg-rose-500/90 text-white shadow-rose-500/30"
                )}
              >
                {change.change > 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {RESOURCE_INFO[change.resource]?.icon}
                <span>{change.change > 0 ? '+' : ''}{change.change}</span>
                <span className="text-sm font-normal opacity-80">
                  {RESOURCE_INFO[change.resource]?.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Composant pour les animations de succès/échec
interface OutcomeAnimationProps {
  outcome: 'success' | 'failure' | 'critical_success' | 'critical_failure';
  message?: string;
  onComplete?: () => void;
}

export function OutcomeAnimation({ outcome, message, onComplete }: OutcomeAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const outcomeConfig = {
    success: {
      emoji: '✅',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      label: 'Succès !',
    },
    failure: {
      emoji: '❌',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      label: 'Échec...',
    },
    critical_success: {
      emoji: '🌟',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      label: 'Succès critique !',
    },
    critical_failure: {
      emoji: '💀',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      label: 'Échec critique !',
    },
  };

  const config = outcomeConfig[outcome];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={cn(
              "p-8 rounded-2xl border-2",
              config.bg,
              config.border
            )}
          >
            <div className="text-center">
              <motion.span 
                className="text-6xl block mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                {config.emoji}
              </motion.span>
              <h3 className={cn("font-display text-2xl font-bold mb-2", config.text)}>
                {config.label}
              </h3>
              {message && (
                <p className="text-muted-foreground">{message}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating notifications for game events
interface FloatingNotificationProps {
  icon: string;
  text: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
  onComplete?: () => void;
}

export function FloatingNotification({ 
  icon, 
  text, 
  variant = 'info',
  duration = 3000,
  onComplete 
}: FloatingNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const variantClasses = {
    info: 'bg-blue-500/90 text-white',
    success: 'bg-emerald-500/90 text-white',
    warning: 'bg-amber-500/90 text-black',
    danger: 'bg-rose-500/90 text-white',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg",
            variantClasses[variant]
          )}>
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
