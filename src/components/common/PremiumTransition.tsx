/**
 * PremiumTransition - Animated page/component transitions
 * Revolutionary: Smooth, premium-feel animations for all transitions
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  delay?: number;
  duration?: number;
  className?: string;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
};

export function PremiumTransition({ 
  children, 
  type = 'fade', 
  delay = 0, 
  duration = 0.3,
  className 
}: PremiumTransitionProps) {
  const variant = variants[type];

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] // Premium easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.1, className }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.02, className }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface TactileFeedbackProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TactileFeedback({ children, onClick, className }: TactileFeedbackProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

export function Pulse({ children, active = true, className }: PulseProps) {
  return (
    <motion.div
      animate={active ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlowProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Glow({ children, color = 'primary', className }: GlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px 0px hsl(var(--${color}) / 0.1)`,
          `0 0 30px 5px hsl(var(--${color}) / 0.2)`,
          `0 0 20px 0px hsl(var(--${color}) / 0.1)`,
        ],
      }}
      transition={{ repeat: Infinity, duration: 3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
