import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries } from '@/lib/countries-data';
import { Globe, MapPin, Star, User } from 'lucide-react';

export interface GamePlayerProfile {
  id: number;
  name: string;
  birthCountry: string;
  currentCountry: string;
  desiredLife: 'stability' | 'growth' | 'freedom' | 'wealth' | 'meaning';
  color: string;
}

interface PlayerProfileSetupProps {
  playerCount: number;
  playerColors: { bg: string; ring: string; text: string }[];
  onComplete: (profiles: GamePlayerProfile[]) => void;
  onBack: () => void;
}

const LIFE_GOALS = [
  { value: 'stability', label: 'playerProfile.goals.stability', icon: '🏠' },
  { value: 'growth', label: 'playerProfile.goals.growth', icon: '📈' },
  { value: 'freedom', label: 'playerProfile.goals.freedom', icon: '🦅' },
  { value: 'wealth', label: 'playerProfile.goals.wealth', icon: '💰' },
  { value: 'meaning', label: 'playerProfile.goals.meaning', icon: '💫' },
] as const;

export default function PlayerProfileSetup({ 
  playerCount, 
  playerColors, 
  onComplete, 
  onBack 
}: PlayerProfileSetupProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [profiles, setProfiles] = useState<Partial<GamePlayerProfile>[]>(
    Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      color: playerColors[i].bg,
      name: '',
      birthCountry: '',
      currentCountry: '',
      desiredLife: undefined,
    }))
  );

  const currentProfile = profiles[currentPlayerIndex];
  const isCurrentProfileComplete = 
    currentProfile.name && 
    currentProfile.birthCountry && 
    currentProfile.currentCountry && 
    currentProfile.desiredLife;

  const updateCurrentProfile = (updates: Partial<GamePlayerProfile>) => {
    setProfiles(prev => prev.map((p, i) => 
      i === currentPlayerIndex ? { ...p, ...updates } : p
    ));
  };

  const handleNext = () => {
    if (currentPlayerIndex < playerCount - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      onComplete(profiles as GamePlayerProfile[]);
    }
  };

  const handlePrevious = () => {
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-2">
            {t('playerProfile.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('playerProfile.subtitle')}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: playerCount }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i === currentPlayerIndex
                  ? `${playerColors[i].bg} ring-2 ring-white scale-110`
                  : i < currentPlayerIndex
                  ? `${playerColors[i].bg} opacity-50`
                  : 'bg-muted'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 animate-scale-in" key={currentPlayerIndex}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-full ${playerColors[currentPlayerIndex].bg}`} />
            <h2 className="font-display text-xl font-semibold">
              {t('playerProfile.playerNumber', { number: currentPlayerIndex + 1 })}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('playerProfile.name')}
              </Label>
              <Input
                value={currentProfile.name || ''}
                onChange={(e) => updateCurrentProfile({ name: e.target.value })}
                placeholder={t('playerProfile.namePlaceholder')}
                className="bg-background/50"
              />
            </div>

            {/* Birth Country */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('playerProfile.birthCountry')}
              </Label>
              <Select
                value={currentProfile.birthCountry || ''}
                onValueChange={(value) => updateCurrentProfile({ birthCountry: value })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('playerProfile.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Country */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('playerProfile.currentCountry')}
              </Label>
              <Select
                value={currentProfile.currentCountry || ''}
                onValueChange={(value) => updateCurrentProfile({ currentCountry: value })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={t('playerProfile.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desired Life */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                {t('playerProfile.desiredLife')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {LIFE_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => updateCurrentProfile({ desiredLife: goal.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      currentProfile.desiredLife === goal.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg mr-2">{goal.icon}</span>
                    <span className="text-sm">{t(goal.label)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handlePrevious}>
              {t('common.back')}
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!isCurrentProfileComplete}
            >
              {currentPlayerIndex < playerCount - 1 
                ? t('playerProfile.nextPlayer') 
                : t('playerProfile.startGame')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
