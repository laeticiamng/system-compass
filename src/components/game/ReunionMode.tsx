import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CharacterCard as CharacterCardType, 
  GameResources, 
  createDefaultResources,
  ASPIRATIONS,
  CharacterAspiration,
  POSITIVE_TRAITS,
  NEGATIVE_TRAITS,
  ResourceType,
} from '@/lib/game-data';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import CharacterCard from './CharacterCard';
import { 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  Target,
  Plane,
  Users,
  Shuffle,
  Globe,
  Sparkles,
  Star,
  Play
} from 'lucide-react';

// Countries with contrasting pyramid types for interesting gameplay
const REUNION_COUNTRIES: { id: string; name: string; type: PyramidType; flag: string }[] = [
  // Stability countries
  { id: 'FR', name: 'France', type: 'STABILITY_REDIS', flag: '🇫🇷' },
  { id: 'DE', name: 'Allemagne', type: 'COMPETENCE_TRUST', flag: '🇩🇪' },
  { id: 'SE', name: 'Suède', type: 'STABILITY_REDIS', flag: '🇸🇪' },
  { id: 'JP', name: 'Japon', type: 'COMPETENCE_TRUST', flag: '🇯🇵' },
  // Growth countries
  { id: 'US', name: 'États-Unis', type: 'GROWTH_RISK', flag: '🇺🇸' },
  { id: 'SG', name: 'Singapour', type: 'GROWTH_RISK', flag: '🇸🇬' },
  { id: 'AE', name: 'Émirats Arabes Unis', type: 'RESOURCE_EXTRACTION', flag: '🇦🇪' },
  // Transition countries
  { id: 'BR', name: 'Brésil', type: 'HYBRID_TRANSITION', flag: '🇧🇷' },
  { id: 'IN', name: 'Inde', type: 'HYBRID_TRANSITION', flag: '🇮🇳' },
  { id: 'MX', name: 'Mexique', type: 'HYBRID_TRANSITION', flag: '🇲🇽' },
  // Challenge countries
  { id: 'NG', name: 'Nigeria', type: 'PROBLEM_RENT', flag: '🇳🇬' },
  { id: 'RU', name: 'Russie', type: 'RESOURCE_EXTRACTION', flag: '🇷🇺' },
  { id: 'EG', name: 'Égypte', type: 'PROBLEM_RENT', flag: '🇪🇬' },
  { id: 'PH', name: 'Philippines', type: 'HYBRID_TRANSITION', flag: '🇵🇭' },
];

export interface CharacterPair {
  character1: CharacterCardType;
  character2: CharacterCardType;
  sharedAspiration: CharacterAspiration;
  reunionProgress: number; // 0-100
  meetingPoint: string | null; // Country ID where they will meet
}

export interface ReunionPlayer {
  id: number;
  name: string;
  color: { bg: string; ring: string; text: string };
  pair: CharacterPair;
  resources1: GameResources;
  resources2: GameResources;
  activeCharacter: 1 | 2;
  position1: number;
  position2: number;
  hasReunited: boolean;
  reunionTurn?: number;
}

interface ReunionModeProps {
  playerCount: number;
  playerColors: { bg: string; ring: string; text: string }[];
  onComplete: (players: ReunionPlayer[]) => void;
  onBack: () => void;
}

// Generate a pair of characters with same aspiration but different countries
function generateCharacterPair(
  playerId: number,
  playerName: string
): CharacterPair {
  // Pick a shared aspiration
  const sharedAspiration = ASPIRATIONS[Math.floor(Math.random() * ASPIRATIONS.length)];
  
  // Get two countries with DIFFERENT pyramid types for contrast
  const shuffledCountries = [...REUNION_COUNTRIES].sort(() => Math.random() - 0.5);
  const country1 = shuffledCountries[0];
  let country2 = shuffledCountries.find(c => c.type !== country1.type) || shuffledCountries[1];
  
  // Create first character
  const char1 = generateCharacterForReunion(
    `${playerId}_char1`,
    `${playerName} (${country1.flag})`,
    country1.id,
    country1.type,
    sharedAspiration
  );
  
  // Create second character with same aspiration
  const char2 = generateCharacterForReunion(
    `${playerId}_char2`,
    `${playerName} (${country2.flag})`,
    country2.id,
    country2.type,
    sharedAspiration
  );
  
  return {
    character1: char1,
    character2: char2,
    sharedAspiration,
    reunionProgress: 0,
    meetingPoint: null,
  };
}

function generateCharacterForReunion(
  id: string,
  name: string,
  countryId: string,
  countryType: PyramidType,
  sharedAspiration: CharacterAspiration
): CharacterCardType {
  // Pick 2 random positive traits
  const shuffledPositive = [...POSITIVE_TRAITS].sort(() => Math.random() - 0.5);
  const traits = shuffledPositive.slice(0, 2);
  
  // Pick 1 random constraint
  const shuffledNegative = [...NEGATIVE_TRAITS].sort(() => Math.random() - 0.5);
  const constraint = shuffledNegative[0];
  
  // The shared aspiration becomes the major aspiration for both
  const majorAspirations = [{ ...sharedAspiration, scoreMultiplier: 2 }];
  
  // Pick another aspiration as minor
  const otherAspirations = ASPIRATIONS.filter(a => a.id !== sharedAspiration.id);
  const minorAspiration = { 
    ...otherAspirations[Math.floor(Math.random() * otherAspirations.length)], 
    scoreMultiplier: 1 
  };
  
  // Calculate starting resources
  const startingResources = createDefaultResources();
  
  // Apply trait bonuses
  [...traits, constraint].forEach(trait => {
    if (trait.resourceBonus) {
      Object.entries(trait.resourceBonus).forEach(([resource, bonus]) => {
        startingResources[resource as ResourceType] = Math.max(0, Math.min(10,
          startingResources[resource as ResourceType] + bonus
        ));
      });
    }
  });
  
  // Apply country-based modifier
  if (countryType === 'GROWTH_RISK') {
    startingResources.money += 1;
    startingResources.mobility += 1;
  } else if (countryType === 'STABILITY_REDIS') {
    startingResources.health += 1;
    startingResources.family += 1;
  } else if (countryType === 'PROBLEM_RENT') {
    startingResources.network += 2;
    startingResources.mobility -= 1;
  } else if (countryType === 'COMPETENCE_TRUST') {
    startingResources.skills += 2;
  } else if (countryType === 'RESOURCE_EXTRACTION') {
    startingResources.money += 2;
    startingResources.mobility -= 2;
  } else if (countryType === 'HYBRID_TRANSITION') {
    startingResources.mobility += 1;
    startingResources.network += 1;
  }
  
  return {
    id,
    name,
    birthCountry: countryId,
    traits,
    constraint,
    majorAspirations,
    minorAspiration,
    startingResources,
  };
}

export default function ReunionMode({
  playerCount,
  playerColors,
  onComplete,
  onBack,
}: ReunionModeProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'intro' | 'reveal' | 'ready'>('intro');
  const [revealedPlayers, setRevealedPlayers] = useState<number[]>([]);
  const [currentReveal, setCurrentReveal] = useState(0);
  
  // Generate all player pairs
  const [playerPairs] = useState<CharacterPair[]>(() => 
    Array.from({ length: playerCount }, (_, i) => 
      generateCharacterPair(i + 1, `Joueur ${i + 1}`)
    )
  );
  
  const handleReveal = () => {
    if (currentReveal < playerCount) {
      setRevealedPlayers(prev => [...prev, currentReveal]);
      setCurrentReveal(prev => prev + 1);
      
      if (currentReveal === playerCount - 1) {
        setTimeout(() => setCurrentStep('ready'), 500);
      }
    }
  };
  
  const handleRegenerate = () => {
    window.location.reload(); // Simple way to regenerate
  };
  
  const handleStart = () => {
    const players: ReunionPlayer[] = playerPairs.map((pair, i) => ({
      id: i + 1,
      name: `Joueur ${i + 1}`,
      color: playerColors[i],
      pair,
      resources1: { ...pair.character1.startingResources },
      resources2: { ...pair.character2.startingResources },
      activeCharacter: 1 as const,
      position1: 0,
      position2: 0,
      hasReunited: false,
    }));
    
    onComplete(players);
  };
  
  const getCountryInfo = (countryId: string) => {
    return REUNION_COUNTRIES.find(c => c.id === countryId) || { 
      id: countryId, 
      name: countryId, 
      type: 'HYBRID_TRANSITION' as PyramidType,
      flag: '🌍'
    };
  };
  
  const calculateDistance = (pair: CharacterPair) => {
    const country1 = getCountryInfo(pair.character1.birthCountry);
    const country2 = getCountryInfo(pair.character2.birthCountry);
    
    // Distance basée sur la différence de type de pyramide
    const typeDistance: Record<string, number> = {
      'same': 20,
      'similar': 40,
      'different': 60,
      'opposite': 80,
    };
    
    if (country1.type === country2.type) return typeDistance['same'];
    
    const similarPairs = [
      ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
      ['GROWTH_RISK', 'HYBRID_TRANSITION'],
      ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    ];
    
    const isSimilar = similarPairs.some(pair => 
      pair.includes(country1.type) && pair.includes(country2.type)
    );
    
    if (isSimilar) return typeDistance['similar'];
    
    const oppositePairs = [
      ['STABILITY_REDIS', 'PROBLEM_RENT'],
      ['COMPETENCE_TRUST', 'RESOURCE_EXTRACTION'],
      ['GROWTH_RISK', 'STABILITY_REDIS'],
    ];
    
    const isOpposite = oppositePairs.some(pair =>
      pair.includes(country1.type) && pair.includes(country2.type)
    );
    
    if (isOpposite) return typeDistance['opposite'];
    
    return typeDistance['different'];
  };
  
  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 border-2 border-rose-500/50 flex items-center justify-center">
                <Heart className="w-16 h-16 text-rose-400" />
              </div>
            </div>
            
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {t('reunionMode.title', 'Mode Réunion')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('reunionMode.subtitle', 'Deux âmes, deux pays, un même destin')}
              </p>
            </div>
            
            <Card className="max-w-3xl mx-auto glass-card border-primary/30">
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                    <Users className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                    <h3 className="font-semibold text-rose-400">
                      {t('reunionMode.rule1Title', '2 Personnages')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('reunionMode.rule1Desc', 'Chaque joueur contrôle 2 personnages dans des pays différents')}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <Target className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <h3 className="font-semibold text-purple-400">
                      {t('reunionMode.rule2Title', '1 Aspiration')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('reunionMode.rule2Desc', 'Les deux personnages partagent le même objectif de vie')}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <Plane className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <h3 className="font-semibold text-cyan-400">
                      {t('reunionMode.rule3Title', 'Réunion')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('reunionMode.rule3Desc', 'Le premier à réunir ses personnages gagne')}
                    </p>
                  </div>
                </div>
                
                <div className="glass-card rounded-lg p-4 bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-200 text-center">
                    💡 {t('reunionMode.tip', 'Plus les pays sont différents, plus la réunion est difficile mais les récompenses sont grandes !')}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('common.back', 'Retour')}
              </Button>
              <Button 
                onClick={() => setCurrentStep('reveal')} 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600"
              >
                {t('reunionMode.discoverCharacters', 'Découvrir les personnages')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Reveal Step */}
        {currentStep === 'reveal' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {t('reunionMode.yourDestinies', 'Vos destins croisés')}
              </h2>
              <p className="text-muted-foreground">
                {revealedPlayers.length < playerCount 
                  ? t('reunionMode.clickToReveal', 'Cliquez pour révéler chaque paire')
                  : t('reunionMode.allRevealed', 'Tous les personnages sont révélés !')
                }
              </p>
            </div>
            
            <div className="space-y-6">
              {playerPairs.map((pair, index) => {
                const isRevealed = revealedPlayers.includes(index);
                const isCurrent = index === currentReveal && !isRevealed;
                const country1 = getCountryInfo(pair.character1.birthCountry);
                const country2 = getCountryInfo(pair.character2.birthCountry);
                const distance = calculateDistance(pair);
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "transition-all duration-500",
                      isRevealed ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-40"
                    )}
                  >
                    {isCurrent && !isRevealed && (
                      <Button
                        onClick={handleReveal}
                        className="w-full h-32 text-xl gap-4 glass-card border-2 border-dashed border-primary/50 hover:border-primary bg-gradient-to-r from-rose-500/10 to-purple-500/10"
                        variant="ghost"
                      >
                        <div className={cn("w-8 h-8 rounded-full", playerColors[index].bg)} />
                        <span>{t('reunionMode.revealPlayer', { player: index + 1 })}</span>
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                      </Button>
                    )}
                    
                    {isRevealed && (
                      <Card className="overflow-hidden animate-scale-in glass-card">
                        <CardHeader className={cn("py-3", playerColors[index].bg, "bg-opacity-20")}>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-6 h-6 rounded-full", playerColors[index].bg)} />
                              <span>Joueur {index + 1}</span>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Star className="w-3 h-3" />
                              {t(pair.sharedAspiration.label)}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Character 1 */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{country1.flag}</span>
                                <div>
                                  <p className="font-semibold">{country1.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {PYRAMID_TYPE_INFO[country1.type].label}
                                  </Badge>
                                </div>
                              </div>
                              <CharacterCard character={pair.character1} compact />
                            </div>
                            
                            {/* Connection */}
                            <div className="hidden md:flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2 z-10">
                              <div className="w-px h-full bg-gradient-to-b from-transparent via-rose-500/50 to-transparent" />
                              <div className="p-2 rounded-full bg-rose-500/20 border border-rose-500/50">
                                <Heart className="w-4 h-4 text-rose-400" />
                              </div>
                              <div className="w-px h-full bg-gradient-to-b from-transparent via-rose-500/50 to-transparent" />
                            </div>
                            
                            {/* Character 2 */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{country2.flag}</span>
                                <div>
                                  <p className="font-semibold">{country2.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {PYRAMID_TYPE_INFO[country2.type].label}
                                  </Badge>
                                </div>
                              </div>
                              <CharacterCard character={pair.character2} compact />
                            </div>
                          </div>
                          
                          {/* Distance indicator */}
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">
                                {t('reunionMode.distanceLabel', 'Distance à parcourir')}
                              </span>
                              <Badge 
                                variant={distance <= 30 ? 'default' : distance <= 50 ? 'secondary' : 'destructive'}
                              >
                                {distance <= 30 ? t('reunionMode.close', 'Proche') :
                                 distance <= 50 ? t('reunionMode.medium', 'Moyen') :
                                 distance <= 70 ? t('reunionMode.far', 'Loin') :
                                 t('reunionMode.veryFar', 'Très loin')}
                              </Badge>
                            </div>
                            <Progress value={100 - distance} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {!isCurrent && !isRevealed && (
                      <div className="h-32 glass-card rounded-lg flex items-center justify-center border border-border/50">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className={cn("w-6 h-6 rounded-full", playerColors[index].bg, "opacity-50")} />
                          <span>Joueur {index + 1} - En attente</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {revealedPlayers.length === playerCount && (
              <div className="flex flex-wrap gap-4 justify-center pt-4 animate-fade-in">
                <Button onClick={handleRegenerate} variant="outline" size="lg" className="gap-2">
                  <Shuffle className="w-4 h-4" />
                  {t('reunionMode.regenerate', 'Régénérer')}
                </Button>
                <Button 
                  onClick={handleStart}
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600"
                >
                  <Play className="w-4 h-4" />
                  {t('reunionMode.startGame', 'Commencer la partie')}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Ready Step */}
        {currentStep === 'ready' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
                <Globe className="w-16 h-16 text-emerald-400" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold">
              {t('reunionMode.ready', 'Prêt à jouer !')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('reunionMode.readyDesc', 'Chaque tour, vous pourrez jouer avec l\'un de vos deux personnages. Faites-les se rapprocher en accumulant les ressources nécessaires pour migrer !')}
            </p>
            
            <Button 
              onClick={handleStart}
              size="lg" 
              className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              <Play className="w-5 h-5" />
              {t('reunionMode.letsGo', 'C\'est parti !')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
