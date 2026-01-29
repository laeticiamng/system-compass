/**
 * useFavorites - Manage user's favorite navigation items
 * Persisted to localStorage for quick access
 */

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'pyramid-compass-favorites';
const MAX_FAVORITES = 6;

export interface FavoriteItem {
  href: string;
  label: string;
  icon: string; // Icon name for serialization
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }, [favorites]);

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      // Don't add if already exists or at max
      if (prev.some(f => f.href === item.href)) return prev;
      if (prev.length >= MAX_FAVORITES) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFavorite = useCallback((href: string) => {
    setFavorites(prev => prev.filter(f => f.href !== href));
  }, []);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.href === item.href);
      if (exists) {
        return prev.filter(f => f.href !== item.href);
      }
      if (prev.length >= MAX_FAVORITES) return prev;
      return [...prev, item];
    });
  }, []);

  const isFavorite = useCallback((href: string) => {
    return favorites.some(f => f.href === href);
  }, [favorites]);

  const reorderFavorites = useCallback((fromIndex: number, toIndex: number) => {
    setFavorites(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    reorderFavorites,
    maxFavorites: MAX_FAVORITES,
    canAddMore: favorites.length < MAX_FAVORITES,
  };
}
