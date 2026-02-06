/**
 * Persona Preferences Storage
 * Persists user's selected persona and preferences
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, Bookmark, Check } from 'lucide-react';

const STORAGE_KEY = 'persona_preferences';

interface PersonaPreferences {
  selectedPersonaId: string | null;
  favoriteCountries: string[];
  viewedPersonas: string[];
  lastVisit: string;
}

export function usePersonaPreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<PersonaPreferences>({
    selectedPersonaId: null,
    favoriteCountries: [],
    viewedPersonas: [],
    lastVisit: new Date().toISOString(),
  });

  // Load preferences on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        // Keep default
      }
    }
  }, []);

  const savePreferences = (updates: Partial<PersonaPreferences>) => {
    const updated = { ...preferences, ...updates, lastVisit: new Date().toISOString() };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const selectPersona = (personaId: string) => {
    savePreferences({
      selectedPersonaId: personaId,
      viewedPersonas: [...new Set([...preferences.viewedPersonas, personaId])],
    });
    toast.success(t('toast.persona.selected', 'Profil sélectionné'));
  };

  const toggleFavoriteCountry = (countryId: string) => {
    const isFavorite = preferences.favoriteCountries.includes(countryId);
    const updated = isFavorite
      ? preferences.favoriteCountries.filter(id => id !== countryId)
      : [...preferences.favoriteCountries, countryId];
    
    savePreferences({ favoriteCountries: updated });
    toast.success(isFavorite ? t('toast.persona.removedFavorite', 'Retiré des favoris') : t('toast.persona.addedFavorite', 'Ajouté aux favoris'));
  };

  const markPersonaViewed = (personaId: string) => {
    if (!preferences.viewedPersonas.includes(personaId)) {
      savePreferences({
        viewedPersonas: [...preferences.viewedPersonas, personaId],
      });
    }
  };

  return {
    preferences,
    selectPersona,
    toggleFavoriteCountry,
    markPersonaViewed,
    isPersonaSelected: (id: string) => preferences.selectedPersonaId === id,
    isCountryFavorite: (id: string) => preferences.favoriteCountries.includes(id),
    hasViewedPersona: (id: string) => preferences.viewedPersonas.includes(id),
  };
}

interface PersonaSelectButtonProps {
  personaId: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function PersonaSelectButton({ isSelected, onSelect }: PersonaSelectButtonProps) {
  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size="sm"
      onClick={onSelect}
      className="gap-2"
    >
      {isSelected ? (
        <>
          <Check className="w-4 h-4" />
          Sélectionné
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          Sélectionner
        </>
      )}
    </Button>
  );
}

interface CountryFavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function CountryFavoriteButton({ isFavorite, onToggle }: CountryFavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="p-2"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        }`}
      />
    </Button>
  );
}

interface PersonaProgressBadgeProps {
  viewedCount: number;
  totalCount: number;
}

export function PersonaProgressBadge({ viewedCount, totalCount }: PersonaProgressBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1">
      <span className="text-primary">{viewedCount}/{totalCount}</span>
      <span className="text-muted-foreground">personas explorés</span>
    </Badge>
  );
}
