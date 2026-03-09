import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ 
  message, 
  className,
  fullScreen = false 
}: LoadingOverlayProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "p-8",
        className
      )}
    >
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}
