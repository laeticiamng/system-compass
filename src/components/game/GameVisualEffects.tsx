import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Composant d'effet visuel pour les résultats
interface ResultEffectProps {
  type: 'success' | 'failure' | 'critical_success' | 'catastrophic';
  onComplete?: () => void;
}

export function ResultEffect({ type, onComplete }: ResultEffectProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const effects = {
    success: {
      emoji: '✨',
      color: 'from-emerald-500/30 to-green-500/30',
      text: 'SUCCÈS !',
      particles: ['💫', '⭐', '✨'],
    },
    failure: {
      emoji: '💔',
      color: 'from-rose-500/30 to-red-500/30',
      text: 'ÉCHEC',
      particles: ['😔', '💨', '❌'],
    },
    critical_success: {
      emoji: '🎉',
      color: 'from-amber-500/30 to-yellow-500/30',
      text: 'CRITIQUE !',
      particles: ['🌟', '🎊', '💎', '🏆'],
    },
    catastrophic: {
      emoji: '💀',
      color: 'from-purple-900/50 to-black/50',
      text: 'CATASTROPHE',
      particles: ['⚡', '🔥', '💥'],
    },
  };

  const effect = effects[type];

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-radial animate-pulse",
          effect.color
        )}
      />
      
      {/* Particules flottantes */}
      <div className="absolute inset-0">
        {effect.particles.map((particle, i) => (
          <span
            key={i}
            className="absolute text-4xl animate-float-up"
            style={{
              left: `${20 + i * 20}%`,
              animationDelay: `${i * 0.2}s`,
              top: '60%',
            }}
          >
            {particle}
          </span>
        ))}
      </div>
      
      {/* Emoji central */}
      <div className="relative z-10 animate-scale-bounce">
        <span className="text-8xl drop-shadow-glow">{effect.emoji}</span>
        <div className="text-center mt-4">
          <span className={cn(
            "font-display text-4xl font-bold tracking-wider",
            type === 'success' && "text-emerald-400",
            type === 'failure' && "text-rose-400",
            type === 'critical_success' && "text-amber-400",
            type === 'catastrophic' && "text-purple-400"
          )}>
            {effect.text}
          </span>
        </div>
      </div>
    </div>
  );
}

// Composant de dé 3D animé
interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRollComplete?: (value: number) => void;
}

export function Dice3D({ value, isRolling, size = 'md', onRollComplete: _onRollComplete }: Dice3DProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-28 h-28 text-5xl',
  };

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        isRolling && "animate-dice-roll"
      )}
    >
      <div className={cn(
        "w-full h-full rounded-xl flex items-center justify-center font-bold",
        "bg-gradient-to-br from-white to-gray-200 shadow-xl",
        "border-4 border-gray-300",
        isRolling && "animate-spin"
      )}>
        <span className={cn(
          "text-gray-800",
          isRolling && "animate-pulse"
        )}>
          {value ? diceFaces[value - 1] : '?'}
        </span>
      </div>
      
      {/* Effet de lueur */}
      {value && value >= 5 && !isRolling && (
        <div className="absolute inset-0 rounded-xl bg-amber-400/30 animate-pulse" />
      )}
    </div>
  );
}

// Barre de ressource animée
interface AnimatedResourceBarProps {
  resource: string;
  value: number;
  maxValue?: number;
  icon: string;
  color: string;
  change?: number;
}

export function AnimatedResourceBar({ 
  resource: _resource, 
  value, 
  maxValue = 10, 
  icon, 
  color: _color,
  change 
}: AnimatedResourceBarProps) {
  const percentage = (value / maxValue) * 100;
  const isLow = value <= 2;
  const isCritical = value === 0;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xl transition-transform",
          isLow && "animate-shake",
          isCritical && "grayscale"
        )}>
          {icon}
        </span>
        
        <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isLow ? "bg-gradient-to-r from-rose-600 to-rose-400" :
              value <= 5 ? "bg-gradient-to-r from-amber-600 to-amber-400" :
              "bg-gradient-to-r from-emerald-600 to-emerald-400"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <span className={cn(
          "font-mono text-sm font-bold min-w-[2rem] text-right",
          isLow ? "text-rose-400" : value <= 5 ? "text-amber-400" : "text-emerald-400"
        )}>
          {value}
        </span>
        
        {/* Indicateur de changement */}
        {change !== undefined && change !== 0 && (
          <span className={cn(
            "text-xs font-bold animate-bounce-in",
            change > 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            {change > 0 ? `+${change}` : change}
          </span>
        )}
      </div>
      
      {/* Alerte basse ressource */}
      {isCritical && (
        <div className="absolute -right-2 -top-2">
          <span className="text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
            ⚠️
          </span>
        </div>
      )}
    </div>
  );
}

// Composant de notification de tour
interface TurnNotificationProps {
  turnNumber: number;
  playerName: string;
  isNewPhase?: boolean;
  phaseName?: string;
}

export function TurnNotification({ turnNumber, playerName, isNewPhase, phaseName }: TurnNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [turnNumber, phaseName]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-slide-down">
      <div className="glass-card px-6 py-3 rounded-full border border-primary/50 shadow-lg shadow-primary/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Année {turnNumber}</div>
            <div className="font-semibold text-primary">
              {isNewPhase ? phaseName : `Tour de ${playerName}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant de milestone/objectif
interface MilestoneProps {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward?: string;
  isComplete?: boolean;
}

export function MilestoneCard({ title, description, progress, maxProgress, reward, isComplete }: MilestoneProps) {
  const percentage = (progress / maxProgress) * 100;

  return (
    <div className={cn(
      "glass-card rounded-lg p-4 border-2 transition-all",
      isComplete 
        ? "border-amber-500/50 bg-amber-500/10" 
        : "border-border hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm flex items-center gap-2">
            {isComplete && <span className="text-amber-400">✓</span>}
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {reward && (
          <span className="text-lg">{reward}</span>
        )}
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isComplete 
              ? "bg-gradient-to-r from-amber-500 to-yellow-400" 
              : "bg-gradient-to-r from-primary to-primary/70"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-right mt-1 text-muted-foreground">
        {progress}/{maxProgress}
      </div>
    </div>
  );
}

// Effet de particules pour événements importants
export function ParticleExplosion({ type }: { type: 'gold' | 'damage' | 'heal' | 'level' }) {
  const particles = {
    gold: ['💰', '💎', '✨', '🪙'],
    damage: ['💔', '❌', '💥', '🔥'],
    heal: ['❤️', '💚', '✨', '🌟'],
    level: ['⭐', '🎊', '🎉', '🏆'],
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles[type].map((particle, i) => (
        <span
          key={i}
          className="absolute text-3xl animate-particle-explode"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${40 + Math.random() * 20}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {particle}
        </span>
      ))}
    </div>
  );
}