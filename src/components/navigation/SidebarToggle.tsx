/**
 * SidebarToggle - Floating button to toggle sidebar visibility
 * Appears when sidebar is hidden, accessible via keyboard shortcut
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  const [showHint, setShowHint] = useState(false);

  // Show hint after 3 seconds on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('sidebar-hint-seen');
    if (!hasSeenHint && !isOpen) {
      const timer = setTimeout(() => {
        setShowHint(true);
        localStorage.setItem('sidebar-hint-seen', 'true');
        // Hide hint after 5 seconds
        setTimeout(() => setShowHint(false), 5000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed left-4 top-20 z-50"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggle}
                className={cn(
                  "h-10 w-10 rounded-full shadow-lg",
                  "bg-background/95 backdrop-blur-sm",
                  "border-primary/20 hover:border-primary/50",
                  "transition-all hover:scale-105"
                )}
              >
                <PanelLeft className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Ouvrir la navigation (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>

          {/* First-time hint */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                className="absolute left-12 top-0 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
              >
                <button
                  onClick={() => setShowHint(false)}
                  className="absolute -top-1 -right-1 p-0.5 rounded-full bg-background text-foreground hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="font-medium">💡 Astuce</p>
                <p className="text-xs opacity-90">Ctrl+B pour la navigation rapide</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
