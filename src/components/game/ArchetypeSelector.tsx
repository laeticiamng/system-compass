import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CHARACTER_ARCHETYPES, 
  CharacterArchetype, 
  getDifficultyColor,
  archetypeToCharacterCard 
} from '@/lib/character-archetypes';
import { CharacterCard as CharacterCardType } from '@/lib/game-data';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Shuffle, 
  Sparkles,
  Heart,
  Coins,
  Clock,
  Users,
  GraduationCap,
  Plane
} from 'lucide-react';

interface ArchetypeSelectorProps {
  playerCount: number;
  playerColors: { bg: string; ring: string; text: string }[];
  onComplete: (characters: CharacterCardType[]) => void;
  onBack: () => void;
}

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  time: <Clock className="w-3 h-3" />,
  money: <Coins className="w-3 h-3" />,
  health: <Heart className="w-3 h-3" />,
  network: <Users className="w-3 h-3" />,
  skills: <GraduationCap className="w-3 h-3" />,
  mobility: <Plane className="w-3 h-3" />,
};

export default function ArchetypeSelector({ 
  playerCount, 
  playerColors, 
  onComplete, 
  onBack 
}: ArchetypeSelectorProps) {
  const { t } = useTranslation();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedArchetypes, setSelectedArchetypes] = useState<CharacterArchetype[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);
  const [mode, setMode] = useState<'choose' | 'random' | null>(null);

  const handleSelectArchetype = (archetypeId: string) => {
    setCurrentSelection(archetypeId);
  };

  const handleRandomSelect = () => {
    // Filter out already selected archetypes
    const available = CHARACTER_ARCHETYPES.filter(
      a => !selectedArchetypes.find(s => s.archetypeId === a.archetypeId)
    );
    const random = available[Math.floor(Math.random() * available.length)];
    setCurrentSelection(random.archetypeId);
  };

  const handleConfirm = () => {
    if (!currentSelection) return;
    
    const archetype = CHARACTER_ARCHETYPES.find(a => a.archetypeId === currentSelection);
    if (!archetype) return;

    const newSelected = [...selectedArchetypes, archetype];
    setSelectedArchetypes(newSelected);

    if (currentPlayer < playerCount - 1) {
      setCurrentPlayer(currentPlayer + 1);
      setCurrentSelection(null);
    } else {
      // Convert archetypes to character cards and complete
      const characters = newSelected.map((arch, idx) => 
        archetypeToCharacterCard(arch, `player_${idx}`)
      );
      onComplete(characters);
    }
  };

  const handleAllRandom = () => {
    // Assign random archetypes to all players
    const shuffled = [...CHARACTER_ARCHETYPES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, playerCount);
    const characters = selected.map((arch, idx) => 
      archetypeToCharacterCard(arch, `player_${idx}`)
    );
    onComplete(characters);
  };

  // Available archetypes (not yet selected)
  const availableArchetypes = CHARACTER_ARCHETYPES.filter(
    a => !selectedArchetypes.find(s => s.archetypeId === a.archetypeId)
  );

  // Group by difficulty
  const groupedArchetypes = {
    easy: availableArchetypes.filter(a => a.difficulty === 'easy'),
    medium: availableArchetypes.filter(a => a.difficulty === 'medium'),
    hard: availableArchetypes.filter(a => a.difficulty === 'hard'),
    extreme: availableArchetypes.filter(a => a.difficulty === 'extreme'),
  };

  if (!mode) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-3xl font-bold mb-4">
              {t('archetypeSelector.title', 'Choisissez votre Destin')}
            </h1>
            <p className="text-muted-foreground">
              {t('archetypeSelector.subtitle', 'Comment voulez-vous définir votre personnage ?')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setMode('choose')}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">
                  {t('archetypeSelector.chooseMode', 'Choisir mon archétype')}
                </h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                {t('archetypeSelector.chooseModeDesc', 'Parcourez les 12 archétypes sociaux et choisissez celui qui vous correspond ou vous intrigue.')}
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                {t('archetypeSelector.selectArchetype', 'Sélectionner')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            <button
              onClick={handleAllRandom}
              className="glass-card rounded-2xl p-8 text-left hover:border-amber-500/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-all">
                  <Shuffle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="font-display text-xl font-semibold">
                  {t('archetypeSelector.randomMode', 'Laisser le destin décider')}
                </h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                {t('archetypeSelector.randomModeDesc', 'La vie ne choisit pas. Recevez un archétype aléatoire et découvrez les défis qui vous attendent.')}
              </p>
              <div className="flex items-center gap-2 text-amber-500 font-medium">
                {t('archetypeSelector.rollDice', 'Tirer au sort')}
                <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </div>
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <Button onClick={onBack} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back', 'Retour')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
              playerColors[currentPlayer].bg
            )}>
              {currentPlayer + 1}
            </div>
            <h1 className="font-display text-3xl font-bold">
              {t('archetypeSelector.playerSelect', { player: currentPlayer + 1 })}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('archetypeSelector.selectHint', 'Chaque archétype a ses avantages et ses obstacles. La difficulté reflète les inégalités du monde réel.')}
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

        {/* Difficulty sections */}
        {(['easy', 'medium', 'hard', 'extreme'] as const).map((difficulty) => (
          groupedArchetypes[difficulty].length > 0 && (
            <div key={difficulty} className="mb-8">
              <h3 className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2",
                difficulty === 'easy' && "text-emerald-400",
                difficulty === 'medium' && "text-amber-400",
                difficulty === 'hard' && "text-orange-400",
                difficulty === 'extreme' && "text-rose-400",
              )}>
                {t(`archetypeSelector.difficulty.${difficulty}`, difficulty)}
                <span className="text-xs opacity-60">
                  ({groupedArchetypes[difficulty].length})
                </span>
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedArchetypes[difficulty].map((archetype) => (
                  <button
                    key={archetype.archetypeId}
                    onClick={() => handleSelectArchetype(archetype.archetypeId)}
                    className={cn(
                      "glass-card rounded-xl p-4 text-left transition-all duration-300 animate-scale-in",
                      currentSelection === archetype.archetypeId
                        ? "ring-2 ring-primary scale-[1.02] border-primary"
                        : "hover:border-primary/50 hover:scale-[1.01]"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{archetype.archetypeIcon}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        getDifficultyColor(archetype.difficulty)
                      )}>
                        {t(`archetypeSelector.difficulty.${archetype.difficulty}`, archetype.difficulty)}
                      </span>
                    </div>

                    {/* Name & Country */}
                    <h4 className="font-semibold mb-1">{t(archetype.archetypeLabel)}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {t(archetype.archetypeDescription)}
                    </p>

                    {/* Resources preview */}
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(archetype.startingResources).map(([key, value]) => (
                        <div 
                          key={key}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                            value >= 7 ? "bg-emerald-500/20 text-emerald-400" :
                            value >= 4 ? "bg-amber-500/20 text-amber-400" :
                            "bg-rose-500/20 text-rose-400"
                          )}
                        >
                          {RESOURCE_ICONS[key]}
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Example */}
                    <p className="text-xs text-muted-foreground/60 mt-2 italic">
                      {t(archetype.realWorldExample)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm py-4 rounded-xl">
          <Button onClick={() => setMode(null)} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Button>
          
          <Button onClick={handleRandomSelect} variant="outline" className="gap-2">
            <Shuffle className="w-4 h-4" />
            {t('archetypeSelector.randomOne', 'Aléatoire')}
          </Button>
          
          <Button 
            onClick={handleConfirm} 
            disabled={!currentSelection}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            {currentPlayer < playerCount - 1 
              ? t('archetypeSelector.confirmNext', 'Valider et suivant')
              : t('archetypeSelector.startGame', 'Commencer la partie')
            }
          </Button>
        </div>

        {/* Selected preview */}
        {selectedArchetypes.length > 0 && (
          <div className="mt-8 glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('archetypeSelector.selectedPlayers', 'Joueurs confirmés')}
            </h3>
            <div className="flex flex-wrap gap-4">
              {selectedArchetypes.map((arch, i) => (
                <div 
                  key={arch.archetypeId}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border",
                    playerColors[i].bg.replace('bg-', 'border-')
                  )}
                >
                  <span className="text-xl">{arch.archetypeIcon}</span>
                  <div>
                    <span className="font-medium">{t(arch.archetypeLabel)}</span>
                    <span className={cn(
                      "text-xs ml-2 px-1.5 py-0.5 rounded",
                      getDifficultyColor(arch.difficulty)
                    )}>
                      {arch.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
