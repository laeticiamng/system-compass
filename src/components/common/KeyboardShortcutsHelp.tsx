/**
 * KeyboardShortcutsHelp - Modal showing all available keyboard shortcuts
 */

import { useKeyboardShortcuts, formatShortcutKey } from '@/hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Navigation, Zap, Layers } from 'lucide-react';

export function KeyboardShortcutsHelp() {
  const { isHelpOpen, setIsHelpOpen, shortcutsByCategory } = useKeyboardShortcuts();

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Raccourcis clavier
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
              <Navigation className="w-4 h-4" />
              Navigation (Alt + touche)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {shortcutsByCategory.navigation.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatShortcutKey(shortcut)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
              <Zap className="w-4 h-4" />
              Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              {shortcutsByCategory.action.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatShortcutKey(shortcut)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Modals */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
              <Layers className="w-4 h-4" />
              Modales
            </div>
            <div className="grid grid-cols-2 gap-2">
              {shortcutsByCategory.modal.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">{shortcut.description}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatShortcutKey(shortcut)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Appuyez sur <Badge variant="outline" className="font-mono text-xs mx-1">/</Badge> n'importe où pour afficher cette aide
        </p>
      </DialogContent>
    </Dialog>
  );
}
