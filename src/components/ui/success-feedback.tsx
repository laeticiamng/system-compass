import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessFeedbackProps {
  show: boolean;
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  className?: string;
  onComplete?: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorStyles = {
  success: "text-risk-low bg-risk-low/10 border-risk-low/30",
  error: "text-destructive bg-destructive/10 border-destructive/30",
  warning: "text-risk-medium bg-risk-medium/10 border-risk-medium/30",
  info: "text-pyramid-stability bg-pyramid-stability/10 border-pyramid-stability/30",
};

export function SuccessFeedback({
  show,
  type = "success",
  message,
  className,
  onComplete,
}: SuccessFeedbackProps) {
  const Icon = icons[type];
  const colorClass = colorStyles[type];

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border",
            colorClass,
            className
          )}
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          {message && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium"
            >
              {message}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline success indicator (smaller, for forms)
interface InlineSuccessProps {
  show: boolean;
  className?: string;
}

export function InlineSuccess({ show, className }: InlineSuccessProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn("inline-flex text-risk-low", className)}
        >
          <CheckCircle2 className="w-4 h-4" />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// Progress completion celebration
interface CompletionCelebrationProps {
  show: boolean;
  className?: string;
}

export function CompletionCelebration({ show, className }: CompletionCelebrationProps) {
  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--risk-low))",
    "hsl(var(--pyramid-stability))",
  ];
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 pointer-events-none z-50", className)}
        >
          {/* Confetti-like particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary"
              style={{
                left: `${Math.random() * 100}%`,
                top: "50%",
                backgroundColor: colors[i % 3],
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{
                y: [0, -200 - Math.random() * 200],
                x: [(Math.random() - 0.5) * 200],
                opacity: [1, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                ease: "easeOut",
              }}
            />
          ))}
          
          {/* Center checkmark */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.7, 1] }}
          >
            <div className="p-6 rounded-full bg-risk-low/20 backdrop-blur-sm">
              <CheckCircle2 className="w-16 h-16 text-risk-low" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
