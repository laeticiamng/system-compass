import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ============================================
// KEYBOARD SHORTCUTS FOR IRREVERSA MODULE
// Accessibility enhancement for power users
// ============================================

interface UseIrreversaKeyboardShortcutsProps {
  onNewThreshold?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onToggleStats?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useIrreversaKeyboardShortcuts({
  onNewThreshold,
  onSearch,
  onExport,
  onToggleStats,
  onEscape,
  enabled = true
}: UseIrreversaKeyboardShortcutsProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
      return;
    }

    // Escape - close dialogs/forms
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Ctrl+N or N - New threshold
    if ((event.key === 'n' || event.key === 'N') && onNewThreshold) {
      if (event.ctrlKey || event.metaKey || !event.shiftKey) {
        event.preventDefault();
        onNewThreshold();
        return;
      }
    }

    // Ctrl+F or / - Focus search
    if ((event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key === 'f')) && onSearch) {
      event.preventDefault();
      onSearch();
      return;
    }

    // Ctrl+E - Export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e' && onExport) {
      event.preventDefault();
      onExport();
      return;
    }

    // Ctrl+S - Toggle stats
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && onToggleStats) {
      event.preventDefault();
      onToggleStats();
      return;
    }
  }, [enabled, onNewThreshold, onSearch, onExport, onToggleStats, onEscape]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

// Keyboard shortcut help display
export const IRREVERSA_SHORTCUTS = [
  { key: 'N', description: 'Nouveau seuil' },
  { key: '/', description: 'Rechercher' },
  { key: 'Ctrl+E', description: 'Exporter' },
  { key: 'Ctrl+S', description: 'Statistiques' },
  { key: 'Esc', description: 'Fermer' },
];

export function showShortcutsToast() {
  toast.info(
    <div className="space-y-1">
      <p className="font-semibold text-sm">Raccourcis clavier</p>
      {IRREVERSA_SHORTCUTS.map(s => (
        <div key={s.key} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{s.description}</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{s.key}</kbd>
        </div>
      ))}
    </div>,
    { duration: 5000 }
  );
}
