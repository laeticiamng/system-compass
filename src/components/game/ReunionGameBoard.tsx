import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GameResources, 
  ResourceType,
  RESOURCE_INFO,
  GAME_ACTIONS,
  GameAction,
} from '@/lib/game-data';
import { PyramidType } from '@/lib/types';
import { ReunionPlayer, CharacterPair } from './ReunionMode';
import { cn } from '@/lib/utils';
import ResourceBar from './ResourceBar';
import { 
  ArrowLeft, 
  ArrowRight,
  Heart, 
  Target,
  Users,
  RefreshCw,
  Dices, 
  Zap, 
  Star, 
  Check, 
  Clock, 
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface ReunionGameBoardProps {
  players: ReunionPlayer[];
  onGameEnd: (winner: ReunionPlayer | null) => void;
  onBack: () => void;
}

// Countries data
const REUNION_COUNTRIES: { id: string; name: string; type: PyramidType; flag: string }[] = [
  { id: 'FR', name: 'France', type: 'STABILITY_REDIS', flag: '🇫🇷' },
  { id: 'DE', name: 'Allemagne', type: 'COMPETENCE_TRUST', flag: '🇩🇪' },
  { id: 'SE', name: 'Suède', type: 'STABILITY_REDIS', flag: '🇸🇪' },
  { id: 'JP', name: 'Japon', type: 'COMPETENCE_TRUST', flag: '🇯🇵' },
  { id: 'US', name: 'États-Unis', type: 'GROWTH_RISK', flag: '🇺🇸' },
  { id: 'SG', name: 'Singapour', type: 'GROWTH_RISK', flag: '🇸🇬' },
  { id: 'AE', name: 'Émirats Arabes Unis', type: 'RESOURCE_EXTRACTION', flag: '🇦🇪' },
  { id: 'BR', name: 'Brésil', type: 'HYBRID_TRANSITION', flag: '🇧🇷' },
  { id: 'IN', name: 'Inde', type: 'HYBRID_TRANSITION', flag: '🇮🇳' },
  { id: 'MX', name: 'Mexique', type: 'HYBRID_TRANSITION', flag: '🇲🇽' },
  { id: 'NG', name: 'Nigeria', type: 'PROBLEM_RENT', flag: '🇳🇬' },
  { id: 'RU', name: 'Russie', type: 'RESOURCE_EXTRACTION', flag: '🇷🇺' },
  { id: 'EG', name: 'Égypte', type: 'PROBLEM_RENT', flag: '🇪🇬' },
  { id: 'PH', name: 'Philippines', type: 'HYBRID_TRANSITION', flag: '🇵🇭' },
];

// Neutral meeting countries for future use
// const MEETING_COUNTRIES = ['SG', 'AE', 'PT', 'TH'];

// Reunion requirements based on distance
function getReunionRequirements(pair: CharacterPair): Partial<GameResources> {
  const country1 = REUNION_COUNTRIES.find(c => c.id === pair.character1.birthCountry);
  const country2 = REUNION_COUNTRIES.find(c => c.id === pair.character2.birthCountry);
  
  if (!country1 || !country2) {
    return { mobility: 5, money: 5 };
  }
  
  // Same type = easier
  if (country1.type === country2.type) {
    return { mobility: 3, money: 3 };
  }
  
  // Similar types
  const similarPairs = [
    ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    ['GROWTH_RISK', 'HYBRID_TRANSITION'],
  ];
  
  const isSimilar = similarPairs.some(p => 
    p.includes(country1.type) && p.includes(country2.type)
  );
  
  if (isSimilar) {
    return { mobility: 4, money: 4, network: 2 };
  }
  
  // Opposite types = hardest
  const oppositePairs = [
    ['STABILITY_REDIS', 'PROBLEM_RENT'],
    ['COMPETENCE_TRUST', 'RESOURCE_EXTRACTION'],
  ];
  
  const isOpposite = oppositePairs.some(p =>
    p.includes(country1.type) && p.includes(country2.type)
  );
  
  if (isOpposite) {
    return { mobility: 7, money: 6, network: 3, skills: 2 };
  }
  
  // Default
  return { mobility: 5, money: 5, network: 2 };
}

function canMeetRequirements(resources1: GameResources, resources2: GameResources, requirements: Partial<GameResources>): boolean {
  return Object.entries(requirements).every(([key, value]) => {
    const res = key as ResourceType;
    // Combined resources from both characters can meet the requirement
    return (resources1[res] + resources2[res]) >= (value || 0);
  });
}

function calculateReunionProgress(resources1: GameResources, resources2: GameResources, requirements: Partial<GameResources>): number {
  let totalRequired = 0;
  let totalProgress = 0;
  
  Object.entries(requirements).forEach(([key, value]) => {
    const res = key as ResourceType;
    const required = value || 0;
    const combined = resources1[res] + resources2[res];
    totalRequired += required;
    totalProgress += Math.min(combined, required);
  });
  
  if (totalRequired === 0) return 100;
  return Math.round((totalProgress / totalRequired) * 100);
}

export default function ReunionGameBoard({
  players: initialPlayers,
  onGameEnd: _onGameEnd,
  onBack,
}: ReunionGameBoardProps) {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<ReunionPlayer[]>(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [phase, setPhase] = useState<'choose_character' | 'action' | 'event' | 'reunion_check'>('choose_character');
  const [actionsRemaining, setActionsRemaining] = useState(2);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<ReunionPlayer | null>(null);
  
  const currentPlayer = players[currentPlayerIndex];
  const activeChar = currentPlayer.activeCharacter;
  const activeResources = activeChar === 1 ? currentPlayer.resources1 : currentPlayer.resources2;
  
  const getCountryInfo = (countryId: string) => {
    return REUNION_COUNTRIES.find(c => c.id === countryId) || { 
      id: countryId, 
      name: countryId, 
      type: 'HYBRID_TRANSITION' as PyramidType,
      flag: '🌍'
    };
  };
  
  const country1Info = getCountryInfo(currentPlayer.pair.character1.birthCountry);
  const country2Info = getCountryInfo(currentPlayer.pair.character2.birthCountry);
  
  // Calculate reunion requirements and progress
  const reunionRequirements = useMemo(() => 
    getReunionRequirements(currentPlayer.pair), 
    [currentPlayer.pair]
  );
  
  const reunionProgress = useMemo(() => 
    calculateReunionProgress(
      currentPlayer.resources1, 
      currentPlayer.resources2, 
      reunionRequirements
    ),
    [currentPlayer.resources1, currentPlayer.resources2, reunionRequirements]
  );
  
  const canReunite = useMemo(() =>
    canMeetRequirements(
      currentPlayer.resources1,
      currentPlayer.resources2,
      reunionRequirements
    ),
    [currentPlayer.resources1, currentPlayer.resources2, reunionRequirements]
  );
  
  const handleChooseCharacter = (char: 1 | 2) => {
    setPlayers(prev => prev.map((p, i) => 
      i === currentPlayerIndex ? { ...p, activeCharacter: char } : p
    ));
    setPhase('action');
    setActionsRemaining(2);
  };
  
  const applyAction = (action: GameAction) => {
    const resourceKey = activeChar === 1 ? 'resources1' : 'resources2';
    const currentResources = { ...activeResources };
    
    // Check requirements
    if (action.requirements) {
      const canPerform = Object.entries(action.requirements).every(
        ([key, value]) => currentResources[key as ResourceType] >= (value || 0)
      );
      if (!canPerform) {
        toast.error(t('game.insufficientResources', 'Ressources insuffisantes'));
        return false;
      }
    }
    
    // Check costs
    const canAfford = Object.entries(action.costs).every(
      ([key, value]) => currentResources[key as ResourceType] >= (value || 0)
    );
    
    if (!canAfford) {
      toast.error(t('game.cannotAfford', 'Vous n\'avez pas les ressources nécessaires'));
      return false;
    }
    
    // Apply costs
    Object.entries(action.costs).forEach(([key, value]) => {
      currentResources[key as ResourceType] -= (value || 0);
    });
    
    // Apply gains with dice roll for major actions
    if (action.type === 'major') {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      
      const multiplier = roll >= 5 ? 1.5 : roll <= 2 ? 0.5 : 1;
      
      Object.entries(action.gains).forEach(([key, value]) => {
        const gain = Math.round((value || 0) * multiplier);
        currentResources[key as ResourceType] = Math.min(10, currentResources[key as ResourceType] + gain);
      });
      
      if (roll >= 5) {
        toast.success(`🎲 ${roll} - ${t('game.criticalSuccess', 'Succès critique !')}`);
      } else if (roll <= 2) {
        toast.warning(`🎲 ${roll} - ${t('game.partialSuccess', 'Succès partiel')}`);
      } else {
        toast.success(`🎲 ${roll} - ${t('game.success', 'Succès !')}`);
      }
    } else {
      // Minor actions always succeed
      Object.entries(action.gains).forEach(([key, value]) => {
        currentResources[key as ResourceType] = Math.min(10, currentResources[key as ResourceType] + (value || 0));
      });
      toast.success(t('game.actionComplete', 'Action complétée !'));
    }
    
    // Update player resources
    setPlayers(prev => prev.map((p, i) => 
      i === currentPlayerIndex ? { ...p, [resourceKey]: currentResources } : p
    ));
    
    setActionsRemaining(prev => prev - 1);
    
    if (actionsRemaining <= 1) {
      setPhase('reunion_check');
    }
    
    return true;
  };
  
  const attemptReunion = () => {
    if (!canReunite) {
      toast.error(t('reunionMode.cannotReuniteYet', 'Pas encore assez de ressources pour se retrouver'));
      return;
    }
    
    // Roll for reunion success
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    setIsRolling(true);
    
    setTimeout(() => {
      setIsRolling(false);
      
      if (roll >= 3) {
        // Success!
        const updatedPlayer = { 
          ...currentPlayer, 
          hasReunited: true, 
          reunionTurn: turnNumber 
        };
        
        setPlayers(prev => prev.map((p, i) => 
          i === currentPlayerIndex ? updatedPlayer : p
        ));
        
        setWinner(updatedPlayer);
        setGameOver(true);
        
        toast.success(`🎉 ${t('reunionMode.reunionSuccess', 'Réunion réussie !')}`, {
          description: t('reunionMode.reunionSuccessDesc', 'Vos personnages se sont enfin retrouvés !'),
          duration: 5000,
        });
      } else {
        toast.error(`🎲 ${roll} - ${t('reunionMode.reunionFailed', 'Échec de la réunion')}`, {
          description: t('reunionMode.tryAgainNextTurn', 'Réessayez au prochain tour'),
        });
        endTurn();
      }
    }, 1500);
  };
  
  const endTurn = () => {
    // Move to next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    if (nextPlayerIndex === 0) {
      setTurnNumber(prev => prev + 1);
    }
    
    setPhase('choose_character');
    setActionsRemaining(2);
    setDiceValue(null);
  };
  
  const skipReunion = () => {
    endTurn();
  };
  
  // Filter actions based on active character's country
  const availableActions = GAME_ACTIONS.filter(action => {
    // Don't show migrate action in reunion mode - it's replaced by reunion mechanic
    if (action.id === 'migrate') return false;
    return true;
  });
  
  if (gameOver && winner) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in max-w-2xl">
          <div className="relative inline-block">
            <div className="absolute -inset-8 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-rose-500/30 to-purple-500/30 border-4 border-rose-500 flex items-center justify-center">
              <Heart className="w-20 h-20 text-rose-400 animate-pulse" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
              {t('reunionMode.victory', 'Réunion Accomplie !')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('reunionMode.victoryDesc', { player: winner.name, turns: winner.reunionTurn })}
            </p>
          </div>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="text-3xl">{getCountryInfo(winner.pair.character1.birthCountry).flag}</span>
                  <p className="font-medium mt-2">{getCountryInfo(winner.pair.character1.birthCountry).name}</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl">{getCountryInfo(winner.pair.character2.birthCountry).flag}</span>
                  <p className="font-medium mt-2">{getCountryInfo(winner.pair.character2.birthCountry).name}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge className="gap-1">
                  <Star className="w-3 h-3" />
                  {t(winner.pair.sharedAspiration.label)}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={onBack} variant="outline" size="lg">
              {t('common.backToMenu', 'Retour au menu')}
            </Button>
            <Button onClick={() => window.location.reload()} size="lg">
              {t('common.playAgain', 'Rejouer')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500" />
                {t('reunionMode.title', 'Mode Réunion')}
              </h1>
              <p className="text-muted-foreground">
                Tour {turnNumber} - {currentPlayer.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {actionsRemaining} {t('game.actionsLeft', 'actions restantes')}
            </Badge>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Characters */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="glass-card overflow-hidden">
              <CardHeader className={cn("py-3", currentPlayer.color.bg, "bg-opacity-20")}>
                <CardTitle className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded-full", currentPlayer.color.bg)} />
                  {currentPlayer.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Character 1 */}
                <div 
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all cursor-pointer",
                    activeChar === 1 
                      ? "border-primary bg-primary/10" 
                      : "border-transparent hover:border-primary/50",
                    phase === 'choose_character' && "animate-pulse"
                  )}
                  onClick={() => phase === 'choose_character' && handleChooseCharacter(1)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{country1Info.flag}</span>
                    <span className="font-medium">{country1Info.name}</span>
                    {activeChar === 1 && <Badge variant="default">Actif</Badge>}
                  </div>
                  <ResourceBar 
                    resources={currentPlayer.resources1}
                  />
                </div>
                
                {/* Connection */}
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                  <Heart className="w-5 h-5 text-rose-400" />
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                </div>
                
                {/* Character 2 */}
                <div 
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all cursor-pointer",
                    activeChar === 2 
                      ? "border-primary bg-primary/10" 
                      : "border-transparent hover:border-primary/50",
                    phase === 'choose_character' && "animate-pulse"
                  )}
                  onClick={() => phase === 'choose_character' && handleChooseCharacter(2)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{country2Info.flag}</span>
                    <span className="font-medium">{country2Info.name}</span>
                    {activeChar === 2 && <Badge variant="default">Actif</Badge>}
                  </div>
                  <ResourceBar 
                    resources={currentPlayer.resources2}
                  />
                </div>
                
                {/* Shared aspiration */}
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Objectif commun</p>
                  <Badge variant="secondary" className="gap-1">
                    <span>{currentPlayer.pair.sharedAspiration.icon}</span>
                    {t(currentPlayer.pair.sharedAspiration.label)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Reunion Progress */}
            <Card className="glass-card border-rose-500/30">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-400" />
                  {t('reunionMode.reunionProgress', 'Progression vers la réunion')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={reunionProgress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground">
                  {reunionProgress}%
                </p>
                
                <div className="space-y-1 text-xs">
                  <p className="font-medium">{t('reunionMode.requirements', 'Ressources combinées nécessaires')}:</p>
                  {Object.entries(reunionRequirements).map(([key, value]) => {
                    const res = key as ResourceType;
                    const combined = currentPlayer.resources1[res] + currentPlayer.resources2[res];
                    const isMet = combined >= (value || 0);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>{RESOURCE_INFO[res].icon}</span>
                          <span>{t(RESOURCE_INFO[res].label)}</span>
                        </span>
                        <span className={isMet ? 'text-emerald-400' : 'text-muted-foreground'}>
                          {combined}/{value}
                          {isMet && <Check className="w-3 h-3 inline ml-1" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {canReunite && phase === 'reunion_check' && (
                  <Button 
                    onClick={attemptReunion}
                    className="w-full gap-2 bg-gradient-to-r from-rose-500 to-purple-500"
                  >
                    <Heart className="w-4 h-4" />
                    {t('reunionMode.attemptReunion', 'Tenter la réunion !')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Center: Actions */}
          <div className="lg:col-span-2">
            {phase === 'choose_character' && (
              <Card className="glass-card h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                  <h2 className="text-xl font-semibold mb-2">
                    {t('reunionMode.chooseCharacter', 'Choisissez votre personnage')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('reunionMode.chooseCharacterDesc', 'Cliquez sur l\'un de vos personnages pour jouer ce tour avec lui')}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {phase === 'action' && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {t('game.chooseAction', 'Choisissez une action')}
                    <Badge className="ml-auto">{actionsRemaining} restantes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="major">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="major" className="flex-1">
                        🎯 {t('game.majorActions', 'Actions majeures')}
                      </TabsTrigger>
                      <TabsTrigger value="minor" className="flex-1">
                        ⚡ {t('game.minorActions', 'Actions mineures')}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="major" className="space-y-2">
                      {availableActions.filter(a => a.type === 'major').map(action => {
                        const canAfford = Object.entries(action.costs).every(
                          ([key, value]) => activeResources[key as ResourceType] >= (value || 0)
                        );
                        
                        return (
                          <button
                            key={action.id}
                            onClick={() => canAfford && applyAction(action)}
                            disabled={!canAfford}
                            className={cn(
                              "w-full p-4 rounded-lg text-left transition-all",
                              canAfford 
                                ? "glass-card hover:border-primary cursor-pointer" 
                                : "bg-muted/30 opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{action.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium">{t(action.label)}</p>
                                <p className="text-xs text-muted-foreground">{t(action.description)}</p>
                              </div>
                              <div className="text-right text-xs">
                                <div className="text-rose-400">
                                  {Object.entries(action.costs).map(([k, v]) => (
                                    <span key={k} className="ml-1">
                                      {RESOURCE_INFO[k as ResourceType].icon}-{v}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-emerald-400">
                                  {Object.entries(action.gains).map(([k, v]) => (
                                    <span key={k} className="ml-1">
                                      {RESOURCE_INFO[k as ResourceType].icon}+{v}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </TabsContent>
                    
                    <TabsContent value="minor" className="space-y-2">
                      {availableActions.filter(a => a.type === 'minor').map(action => {
                        const canAfford = Object.entries(action.costs).every(
                          ([key, value]) => activeResources[key as ResourceType] >= (value || 0)
                        );
                        
                        return (
                          <button
                            key={action.id}
                            onClick={() => canAfford && applyAction(action)}
                            disabled={!canAfford}
                            className={cn(
                              "w-full p-3 rounded-lg text-left transition-all",
                              canAfford 
                                ? "glass-card hover:border-primary cursor-pointer" 
                                : "bg-muted/30 opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{action.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{t(action.label)}</p>
                              </div>
                              <div className="text-right text-xs">
                                <span className="text-rose-400">
                                  {Object.entries(action.costs).map(([k, v]) => (
                                    <span key={k} className="ml-1">
                                      {RESOURCE_INFO[k as ResourceType].icon}-{v}
                                    </span>
                                  ))}
                                </span>
                                <span className="text-emerald-400 ml-2">
                                  {Object.entries(action.gains).map(([k, v]) => (
                                    <span key={k} className="ml-1">
                                      {RESOURCE_INFO[k as ResourceType].icon}+{v}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button onClick={() => setPhase('reunion_check')} variant="outline">
                      {t('game.endActions', 'Terminer les actions')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {phase === 'reunion_check' && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    {t('reunionMode.reunionCheck', 'Vérification de réunion')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {canReunite ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="relative inline-block">
                        <div className="absolute -inset-4 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse" />
                        <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 border-2 border-rose-500 flex items-center justify-center">
                          <Heart className="w-12 h-12 text-rose-400" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-rose-400">
                          {t('reunionMode.reunionPossible', 'Réunion possible !')}
                        </h3>
                        <p className="text-muted-foreground">
                          {t('reunionMode.reunionPossibleDesc', 'Vos personnages ont accumulé assez de ressources pour se retrouver')}
                        </p>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <Button onClick={skipReunion} variant="outline">
                          {t('reunionMode.skipReunion', 'Pas maintenant')}
                        </Button>
                        <Button 
                          onClick={attemptReunion}
                          className="gap-2 bg-gradient-to-r from-rose-500 to-purple-500"
                          disabled={isRolling}
                        >
                          {isRolling ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Dices className="w-4 h-4" />
                          )}
                          {t('reunionMode.attemptReunion', 'Tenter la réunion')}
                        </Button>
                      </div>
                      
                      {diceValue && (
                        <div className="text-4xl font-bold">
                          🎲 {diceValue}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                        <Globe className="w-12 h-12 text-muted-foreground" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-medium">
                          {t('reunionMode.notReadyYet', 'Pas encore prêt')}
                        </h3>
                        <p className="text-muted-foreground">
                          {t('reunionMode.notReadyYetDesc', 'Continuez à accumuler des ressources avec vos deux personnages')}
                        </p>
                      </div>
                      
                      <Button onClick={endTurn}>
                        {t('game.endTurn', 'Terminer le tour')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Other players status */}
        {players.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {t('game.otherPlayers', 'Autres joueurs')}
            </h3>
            <div className="flex flex-wrap gap-3">
              {players.filter((_, i) => i !== currentPlayerIndex).map(player => (
                <div 
                  key={player.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card"
                >
                  <div className={cn("w-3 h-3 rounded-full", player.color.bg)} />
                  <span className="text-sm">{player.name}</span>
                  <Progress 
                    value={calculateReunionProgress(
                      player.resources1,
                      player.resources2,
                      getReunionRequirements(player.pair)
                    )} 
                    className="w-16 h-1.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
