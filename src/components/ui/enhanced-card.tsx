import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow" | "premium";
  animate?: boolean;
  delay?: number;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", animate = true, delay = 0, children, ...props }, ref) => {
    const baseStyles = "rounded-xl border bg-card text-card-foreground transition-all duration-300";
    
    const variantStyles = {
      default: "shadow-sm hover:shadow-md",
      glass: "backdrop-blur-xl bg-card/80 border-border/50 shadow-soft hover:shadow-card",
      glow: "border-primary/20 shadow-soft hover:shadow-glow hover:-translate-y-1",
      premium: "border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-glow",
    };

    const content = (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );

    if (!animate) return content;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

export { EnhancedCard };
