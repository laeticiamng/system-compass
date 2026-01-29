import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Fade In animation wrapper
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.3, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide Up animation
interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SlideUp({ children, delay = 0, className }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale In animation
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay, type: "spring", stiffness: 300 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
interface StaggerListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggerList({ children, staggerDelay = 0.05, className }: StaggerListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Hover lift effect
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export function HoverLift({ children, className, liftAmount = 4 }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -liftAmount }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Tap scale effect
interface TapScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function TapScale({ children, className, scale = 0.98 }: TapScaleProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ duration: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for attention
interface PulseProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function Pulse({ children, className, active = true }: PulseProps) {
  return (
    <motion.div
      animate={active ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Success checkmark animation
interface SuccessCheckProps {
  show: boolean;
  className?: string;
}

export function SuccessCheck({ show, className }: SuccessCheckProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn("text-risk-low", className)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Counter animation for numbers
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glow effect on hover
interface GlowEffectProps {
  children: ReactNode;
  className?: string;
}

export function GlowEffect({ children, className }: GlowEffectProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      whileHover="hover"
      initial="initial"
    >
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
