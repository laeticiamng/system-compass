/**
 * AnimatedSkeleton - Premium skeleton with shimmer effect
 * Revolutionary: Smooth gradient animation for premium loading states
 */

import { cn } from "@/lib/utils";

interface AnimatedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  animate?: boolean;
}

function AnimatedSkeleton({ 
  className, 
  variant = 'default',
  animate = true,
  ...props 
}: AnimatedSkeletonProps) {
  const variants = {
    default: 'h-4 w-full',
    card: 'h-32 w-full',
    text: 'h-4 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        variants[variant],
        animate && "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className
      )} 
      {...props} 
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg border bg-card space-y-3", className)}>
      <div className="flex items-center gap-3">
        <AnimatedSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <AnimatedSkeleton className="h-4 w-1/2" />
          <AnimatedSkeleton className="h-3 w-1/3" />
        </div>
      </div>
      <AnimatedSkeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <AnimatedSkeleton variant="button" />
        <AnimatedSkeleton variant="button" className="w-20" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <AnimatedSkeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export { AnimatedSkeleton, SkeletonCard, SkeletonList };
