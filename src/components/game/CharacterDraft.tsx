import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CharacterCard as CharacterCardType, generateRandomCharacter } from '@/lib/game-data';
import { PyramidType } from '@/lib/types';
import { ArrowLeft, Check, Shuffle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import CharacterCard from './CharacterCard';

interface CharacterDraftProps {
  playerCount: number;
  playerColors: { bg: string; ring: string; text: string }[];
  onComplete: (characters: CharacterCardType[]) => void;
  onBack: () => void;
}

const COUNTRIES: { id: string; name: string; type: PyramidType }[] = [
  { id: 'US', name: 'États-Unis', type: 'GROWTH_RISK' },
  { id: 'FR', name: 'France', type: 'STABILITY_REDIS' },
  { id: 'JP', name: 'Japon', type: 'COMPETENCE_TRUST' },
  { id: 'NG', name: 'Nigeria', type: 'PROBLEM_RENT' },
  { id: 'BR', name: 'Brésil', type: 'HYBRID_TRANSITION' },
  { id: 'SA', name: 'Arabie Saoudite', type: 'RESOURCE_EXTRACTION' },
  { id: 'DE', name: 'Allemagne', type: 'COMPETENCE_TRUST' },
  { id: 'IN', name: 'Inde', type: 'GROWTH_RISK' },
  { id: 'RU', name: 'Russie', type: 'RESOURCE_EXTRACTION' },
  { id: 'CN', name: 'Chine', type: 'HYBRID_TRANSITION' },
];

const NAMES = [
  'Alex', 'Jordan', 'Morgan', 'Casey', 'Taylor', 'Riley', 'Quinn', 'Avery',
  'Charlie', 'Skyler', 'Dakota', 'Phoenix', 'River', 'Sage', 'Rowan', 'Reese',
];

function generateDraftPool(count: number): CharacterCardType[] {
  const shuffledNames = [...NAMES].sort(() => Math.random() - 0.5);
  const shuffledCountries = [...COUNTRIES].sort(() => Math.random() - 0.5);
  
  return Array.from({ length: count }, (_, i) => {
    const country = shuffledCountries[i % shuffledCountries.length];
    return generateRandomCharacter(
      `char_${i}`,
      shuffledNames[i],
      country.id,
      country.type
    );
  });
}

export default function CharacterDraft({ 
  playerCount, 
  playerColors, 
  onComplete, 
  onBack 
}: CharacterDraftProps) {
  const { t } = useTranslation();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [draftPool, setDraftPool] = useState<CharacterCardType[]>(() => 
    generateDraftPool(playerCount * 4) // 4 options per player
  );
  const [selectedCharacters, setSelectedCharacters] = useState<CharacterCardType[]>([]);
  const [currentSelection, setCurrentSelection] = useState<number | null>(null);

  const getCurrentPlayerPool = () => {
    const startIdx = currentPlayer * 4;
    return draftPool.slice(startIdx, startIdx + 4);
  };

  const handleSelect = (charIndex: number) => {
    setCurrentSelection(charIndex);
  };

  const handleConfirm = () => {
    if (currentSelection === null) return;
    
    const pool = getCurrentPlayerPool();
    const selected = pool[currentSelection];
    
    const newSelected = [...selectedCharacters, selected];
    setSelectedCharacters(newSelected);
    
    if (currentPlayer < playerCount - 1) {
      setCurrentPlayer(currentPlayer + 1);
      setCurrentSelection(null);
    } else {
      onComplete(newSelected);
    }
  };

  const handleReshuffle = () => {
    setDraftPool(generateDraftPool(playerCount * 4));
    setCurrentSelection(null);
  };

  const pool = getCurrentPlayerPool();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
              playerColors[currentPlayer].bg
            )}>
              {currentPlayer + 1}
            </div>
            <h1 className="font-display text-3xl font-bold">
              {t('characterDraft.title', { player: currentPlayer + 1 })}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('characterDraft.subtitle')}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: playerCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                i < currentPlayer 
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                  : i === currentPlayer 
                    ? cn(playerColors[i].bg, "text-white border-transparent")
                    : "border-border text-muted-foreground"
              )}
            >
              {i < currentPlayer ? <Check className="w-5 h-5" /> : i + 1}
            </div>
          ))}
        </div>

        {/* Draft pool */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pool.map((character, index) => (
            <div
              key={character.id}
              onClick={() => handleSelect(index)}
              className={cn(
                "cursor-pointer transition-all duration-300 animate-scale-in",
                currentSelection === index 
                  ? "ring-4 ring-primary scale-105" 
                  : "hover:scale-102 hover:ring-2 hover:ring-primary/50"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CharacterCard character={character} compact />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back') || 'Retour'}
          </Button>
          
          <Button onClick={handleReshuffle} variant="outline" className="gap-2">
            <Shuffle className="w-4 h-4" />
            {t('characterDraft.reshuffle')}
          </Button>
          
          <Button 
            onClick={handleConfirm} 
            disabled={currentSelection === null}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            {currentPlayer < playerCount - 1 
              ? t('characterDraft.confirmNext')
              : t('characterDraft.startGame')
            }
          </Button>
        </div>

        {/* Selected characters preview */}
        {selectedCharacters.length > 0 && (
          <div className="mt-8 glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('characterDraft.selectedCharacters')}
            </h3>
            <div className="flex flex-wrap gap-4">
              {selectedCharacters.map((char, i) => (
                <div 
                  key={char.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border",
                    playerColors[i].bg.replace('bg-', 'border-')
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full", playerColors[i].bg)} />
                  <span className="font-medium">{char.name}</span>
                  <span className="text-sm text-muted-foreground">({char.birthCountry})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
