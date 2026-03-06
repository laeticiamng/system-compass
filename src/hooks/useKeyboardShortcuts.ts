/**
 * useKeyboardShortcuts - Global keyboard shortcuts for power users
 * Provides navigation and action shortcuts across the platform
 */

import { useEffect, useCallback, useState } from 'react';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useToast } from '@/hooks/use-toast';

interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'action' | 'modal';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  showToast?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, showToast = false } = options;
  const navigate = useLocalizedNavigate();
  const { toast } = useToast();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Define all shortcuts
  const shortcuts: ShortcutDefinition[] = [
    // Navigation shortcuts (Alt + letter)
    {
      key: 'h',
      alt: true,
      description: 'Accueil',
      category: 'navigation',
      action: () => navigate('/'),
    },
    {
      key: 'd',
      alt: true,
      description: 'Dashboard',
      category: 'navigation',
      action: () => navigate('/dashboard'),
    },
    {
      key: 'c',
      alt: true,
      description: 'Pays',
      category: 'navigation',
      action: () => navigate('/countries'),
    },
    {
      key: 'e',
      alt: true,
      description: 'Stratégies',
      category: 'navigation',
      action: () => navigate('/exit-keys'),
    },
    {
      key: 'b',
      alt: true,
      description: 'B2B',
      category: 'navigation',
      action: () => navigate('/b2b'),
    },
    {
      key: 'p',
      alt: true,
      description: 'Profil',
      category: 'navigation',
      action: () => navigate('/profile'),
    },
    {
      key: 'f',
      alt: true,
      description: 'Filtre Prévention',
      category: 'navigation',
      action: () => navigate('/prevention-filter'),
    },
    {
      key: 'g',
      alt: true,
      description: 'Jeu éducatif',
      category: 'navigation',
      action: () => navigate('/life-game'),
    },
    {
      key: 'l',
      alt: true,
      description: 'Zones latentes',
      category: 'navigation',
      action: () => navigate('/latent-zones'),
    },
    {
      key: 't',
      alt: true,
      description: 'TraceOS',
      category: 'navigation',
      action: () => navigate('/traceos'),
    },
    // Action shortcuts (Ctrl + letter)
    {
      key: 'k',
      ctrl: true,
      description: 'Recherche rapide',
      category: 'action',
      action: () => {
        // Trigger command palette or search
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: '/',
      description: 'Aide raccourcis',
      category: 'modal',
      action: () => setIsHelpOpen(prev => !prev),
    },
    {
      key: 'Escape',
      description: 'Fermer modal',
      category: 'modal',
      action: () => setIsHelpOpen(false),
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable
    ) {
      // Only allow Escape in inputs
      if (event.key !== 'Escape') return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      
      return keyMatch && ctrlMatch && altMatch && shiftMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      matchingShortcut.action();
      
      if (showToast && matchingShortcut.category === 'navigation') {
        toast({
          title: `Navigation: ${matchingShortcut.description}`,
          duration: 1500,
        });
      }
    }
  }, [enabled, shortcuts, showToast, toast]);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    shortcuts,
    isHelpOpen,
    setIsHelpOpen,
    shortcutsByCategory: {
      navigation: shortcuts.filter(s => s.category === 'navigation'),
      action: shortcuts.filter(s => s.category === 'action'),
      modal: shortcuts.filter(s => s.category === 'modal'),
    },
  };
}

/**
 * Format shortcut key for display
 */
export function formatShortcutKey(shortcut: ShortcutDefinition): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('⌘/Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('⇧');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}
