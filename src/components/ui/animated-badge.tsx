import { motion } from "framer-motion";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps extends BadgeProps {
  pulse?: boolean;
  delay?: number;
}

export function AnimatedBadge({
  children,
  className,
  pulse = false,
  delay = 0,
  ...props
}: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay }}
    >
      <Badge
        className={cn(
          pulse && "animate-pulse-slow",
          className
        )}
        {...props}
      >
        {children}
      </Badge>
    </motion.div>
  );
}

// Status badge with color variants
interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "pending";
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

const statusStyles = {
  success: "bg-risk-low/10 text-risk-low border-risk-low/30",
  warning: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-pyramid-stability/10 text-pyramid-stability border-pyramid-stability/30",
  pending: "bg-muted text-muted-foreground border-border",
};

const dotStyles = {
  success: "bg-risk-low",
  warning: "bg-risk-medium",
  error: "bg-destructive",
  info: "bg-pyramid-stability",
  pending: "bg-muted-foreground",
};

export function StatusBadge({
  status,
  children,
  className,
  showDot = true,
}: StatusBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 font-medium",
          statusStyles[status],
          className
        )}
      >
        {showDot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              dotStyles[status],
              status === "pending" && "animate-pulse"
            )}
          />
        )}
        {children}
      </Badge>
    </motion.div>
  );
}

// Count badge with animation
interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: "default" | "primary" | "destructive";
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  variant = "default",
  className,
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  if (count === 0) return null;

  return (
    <motion.span
      key={count}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {displayCount}
    </motion.span>
  );
}
