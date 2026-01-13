import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, StarOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const FAVORITES_STORAGE_KEY = 'terrain-realities-favorites';

interface FavoriteEntry {
  countryId: string;
  countryName: string;
  riskLevel?: 'high' | 'medium' | 'low';
  savedAt: string;
}

export function useTerrainFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  const saveToStorage = (newFavorites: FavoriteEntry[]) => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addToFavorites = (entry: Omit<FavoriteEntry, 'savedAt'>) => {
    const existing = favorites.find(f => f.countryId === entry.countryId);
    if (existing) return;

    const newEntry: FavoriteEntry = {
      ...entry,
      savedAt: new Date().toISOString()
    };
    
    const newFavorites = [newEntry, ...favorites].slice(0, 20);
    saveToStorage(newFavorites);
    toast.success(t('terrainRealities.savedToFavorites'));
  };

  const removeFromFavorites = (countryId: string) => {
    const newFavorites = favorites.filter(f => f.countryId !== countryId);
    saveToStorage(newFavorites);
  };

  const updateRiskLevel = (countryId: string, riskLevel: 'high' | 'medium' | 'low') => {
    const newFavorites = favorites.map(f => 
      f.countryId === countryId ? { ...f, riskLevel } : f
    );
    saveToStorage(newFavorites);
  };

  const isFavorite = (countryId: string) => {
    return favorites.some(f => f.countryId === countryId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    updateRiskLevel,
    isFavorite
  };
}

interface FavoriteButtonProps {
  countryId: string;
  countryName: string;
  riskLevel?: 'high' | 'medium' | 'low';
}

export function FavoriteButton({ countryId, countryName, riskLevel }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { addToFavorites, removeFromFavorites, isFavorite, updateRiskLevel } = useTerrainFavorites();
  const isFav = isFavorite(countryId);

  useEffect(() => {
    if (isFav && riskLevel) {
      updateRiskLevel(countryId, riskLevel);
    }
  }, [riskLevel, countryId, isFav, updateRiskLevel]);

  const handleToggle = () => {
    if (isFav) {
      removeFromFavorites(countryId);
    } else {
      addToFavorites({ countryId, countryName, riskLevel });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="gap-1"
      title={isFav ? t('terrainRealities.removeFromFavorites') : t('terrainRealities.saveToFavorites')}
    >
      {isFav ? (
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ) : (
        <StarOff className="h-4 w-4" />
      )}
    </Button>
  );
}

interface TerrainFavoritesPanelProps {
  currentCountryId?: string;
}

export function TerrainFavoritesPanel({ currentCountryId }: TerrainFavoritesPanelProps) {
  const { t } = useTranslation();
  const { favorites, removeFromFavorites } = useTerrainFavorites();

  const getRiskColor = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-300';
      case 'medium': return 'bg-amber-500/20 text-amber-300';
      case 'low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/30 border-yellow-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
          <Star className="h-4 w-4 fill-current" />
          {t('terrainRealities.saveToFavorites')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {favorites.map(fav => (
            <div 
              key={fav.countryId}
              className={`flex items-center justify-between p-2 rounded ${
                fav.countryId === currentCountryId ? 'bg-primary/10' : 'bg-muted/30'
              }`}
            >
              <Link 
                to={`/country/${fav.countryId}/terrain-realities`}
                className="flex-1 text-sm hover:text-primary"
              >
                {fav.countryName}
              </Link>
              {fav.riskLevel && (
                <Badge variant="outline" className={`text-xs mr-2 ${getRiskColor(fav.riskLevel)}`}>
                  {t(`terrainRealities.risk${fav.riskLevel.charAt(0).toUpperCase() + fav.riskLevel.slice(1)}`)}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  removeFromFavorites(fav.countryId);
                }}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
