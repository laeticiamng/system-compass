import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = "md",
  animate = true,
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: "py-8",
      icon: "w-8 h-8",
      iconContainer: "w-14 h-14",
      title: "text-base",
      description: "text-xs",
    },
    md: {
      container: "py-12",
      icon: "w-10 h-10",
      iconContainer: "w-18 h-18",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "w-12 h-12",
      iconContainer: "w-20 h-20",
      title: "text-xl",
      description: "text-base",
    },
  };

  const styles = sizeStyles[size];

  const content = (
    <>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 mb-4",
          styles.iconContainer
        )}
      >
        <Icon className={cn("text-muted-foreground", styles.icon)} />
      </div>

      <h3 className={cn("font-semibold text-foreground mb-2", styles.title)}>
        {title}
      </h3>

      <p className={cn("text-muted-foreground max-w-sm mb-6 text-center", styles.description)}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className={action.variant === "default" || !action.variant ? "btn-premium text-primary-foreground" : ""}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </>
  );

  if (!animate) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center px-4",
          styles.container,
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-4",
        styles.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 mb-4",
          styles.iconContainer
        )}
      >
        <Icon className={cn("text-muted-foreground", styles.icon)} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={cn("font-semibold text-foreground mb-2", styles.title)}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className={cn("text-muted-foreground max-w-sm mb-6 text-center", styles.description)}
      >
        {description}
      </motion.p>

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className={action.variant === "default" || !action.variant ? "btn-premium text-primary-foreground" : ""}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="mt-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
