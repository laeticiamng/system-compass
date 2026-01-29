import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SAVED_COUNTRIES_KEY = 'pyramid_saved_countries';

function getSavedCountries(): string[] {
  try {
    const stored = localStorage.getItem(SAVED_COUNTRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function toggleSavedCountry(countryId: string): boolean {
  const saved = getSavedCountries();
  const index = saved.indexOf(countryId);
  
  if (index === -1) {
    saved.push(countryId);
    localStorage.setItem(SAVED_COUNTRIES_KEY, JSON.stringify(saved));
    return true;
  } else {
    saved.splice(index, 1);
    localStorage.setItem(SAVED_COUNTRIES_KEY, JSON.stringify(saved));
    return false;
  }
}

interface SavedCountriesButtonProps {
  countryId: string;
  countryName?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function SavedCountriesButton({ 
  countryId, 
  countryName,
  variant = 'icon',
  size = 'default',
  className 
}: SavedCountriesButtonProps) {
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(getSavedCountries().includes(countryId));
  }, [countryId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const nowSaved = toggleSavedCountry(countryId);
    setIsSaved(nowSaved);
    
    if (nowSaved) {
      toast.success(t('countries.saved', '{{name}} ajouté aux favoris', { name: countryName || countryId }));
    } else {
      toast.success(t('countries.unsaved', '{{name}} retiré des favoris', { name: countryName || countryId }));
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "p-2 rounded-full transition-all hover:scale-110",
          isSaved 
            ? "bg-rose-500/20 text-rose-500" 
            : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
        aria-label={isSaved ? t('countries.unsave', 'Retirer des favoris') : t('countries.save', 'Ajouter aux favoris')}
      >
        {isSaved ? (
          <Heart className={cn(
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
            'fill-current'
          )} />
        ) : (
          <Heart className={cn(
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          )} />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      className={cn(
        "gap-2",
        isSaved && "bg-destructive hover:bg-destructive/90",
        className
      )}
    >
      {isSaved ? (
        <>
          <Heart className="w-4 h-4 fill-current" />
          {t('countries.saved_btn', 'Sauvegardé')}
        </>
      ) : (
        <>
          <Heart className="w-4 h-4" />
          {t('countries.save_btn', 'Sauvegarder')}
        </>
      )}
    </Button>
  );
}

// Hook to use saved countries elsewhere
export function useSavedCountries() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedCountries());
    
    // Listen for storage changes
    const handleStorage = () => setSavedIds(getSavedCountries());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    savedIds,
    isSaved: (id: string) => savedIds.includes(id),
    count: savedIds.length,
  };
}
