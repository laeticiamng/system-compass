import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { FamilyStatus } from '@/lib/family-system';
import { cn } from '@/lib/utils';
import HexagonalBoard, { HEXAGONAL_BOARD } from '@/components/game/HexagonalBoard';
import { GamePlayerProfile } from '@/components/game/PlayerProfile';
import SavedGamesDialog from '@/components/game/SavedGamesDialog';
import RulesDialog from '@/components/game/RulesDialog';
import ArchetypeSelector from '@/components/game/ArchetypeSelector';
import TurnManager, { TurnPhase } from '@/components/game/TurnManager';
import GameEndSummary from '@/components/game/GameEndSummary';
import TutorialMode, { shouldSkipTutorial } from '@/components/game/TutorialMode';
import TurnPhaseHelper from '@/components/game/TurnPhaseHelper';
import DicePrompt from '@/components/game/DicePrompt';
import CurrentPlayerInfo from '@/components/game/CurrentPlayerInfo';
import { useSavedGames, SavedGame, SavedGameState } from '@/hooks/useSavedGames';
import { useGameStatistics } from '@/hooks/useGameStatistics';
import { getNewlyUnlockedAchievements } from '@/lib/achievements';
import { useAuth } from '@/hooks/useAuth';
import {
  CharacterCard as CharacterCardType,
  GameResources,
  createDefaultResources,
} from '@/lib/game-data';
import {
  ArrowRight,
  ArrowLeft,
  Target,
  Shield,
  Zap,
  Heart,
  Globe,
  Coins,
  Users,
  Building,
  Swords,
  HandHeart,
  Flag,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type GameMode = 'solo' | 'race' | 'points_duel' | 'cooperative' | null;
type DbGameMode = Database['public']['Enums']['game_mode'];
type SetupPhase = 'mode' | 'playerCount' | 'archetype' | 'tutorial' | 'draft' | 'playing';

interface QuizQuestion {
  id: string;
  icon: React.ReactNode;
  options: {
    text: string;
    scores: Partial<Record<PyramidType, number>>;
  }[];
}

interface Player {
  id: number;
  name: string;
  position: number;
  scores: Record<PyramidType, number>;
  color: string;
  result?: PyramidType;
  profile?: GamePlayerProfile;
  character?: CharacterCardType;
  resources: GameResources;
  countryType: PyramidType;
  familyStatus?: FamilyStatus;
}

// Game statistics tracking
interface GameStats {
  risksTaken: number;
  risksSucceeded: number;
  risksFailed: number;
  risksCatastrophic: number;
  actionsCompleted: number;
  actionsFailed: number;
  countriesVisited: string[];
  totalMoneyEarned: number;
  totalMoneyLost: number;
  healthLost: number;
}

const PLAYER_COLORS = [
  { bg: 'bg-blue-500', ring: 'ring-blue-500', text: 'text-blue-500' },
  { bg: 'bg-pink-500', ring: 'ring-pink-500', text: 'text-pink-500' },
  { bg: 'bg-green-500', ring: 'ring-green-500', text: 'text-green-500' },
  { bg: 'bg-orange-500', ring: 'ring-orange-500', text: 'text-orange-500' },
];

// Map pyramid type to translation key (camelCase format)
const PYRAMID_TRANSLATION_KEY: Record<PyramidType, string> = {
  PROBLEM_RENT: 'problemRent',
  STABILITY_REDIS: 'stabilityRedis',
  COMPETENCE_TRUST: 'competenceTrust',
  GROWTH_RISK: 'growthRisk',
  HYBRID_TRANSITION: 'hybridTransition',
  RESOURCE_EXTRACTION: 'resourceExtraction',
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'priority',
    icon: <Target className="w-6 h-6" />,
    options: [
      { text: 'security', scores: { STABILITY_REDIS: 3, COMPETENCE_TRUST: 2 } },
      { text: 'growth', scores: { GROWTH_RISK: 3, HYBRID_TRANSITION: 2 } },
      { text: 'freedom', scores: { GROWTH_RISK: 2, RESOURCE_EXTRACTION: 3 } },
      { text: 'connections', scores: { PROBLEM_RENT: 3, HYBRID_TRANSITION: 2 } },
    ],
  },
  {
    id: 'riskTolerance',
    icon: <Zap className="w-6 h-6" />,
    options: [
      { text: 'avoidRisk', scores: { STABILITY_REDIS: 3, COMPETENCE_TRUST: 2 } },
      { text: 'calculatedRisk', scores: { COMPETENCE_TRUST: 2, HYBRID_TRANSITION: 2 } },
      { text: 'embraceRisk', scores: { GROWTH_RISK: 3, RESOURCE_EXTRACTION: 2 } },
      { text: 'thriveInChaos', scores: { PROBLEM_RENT: 3, HYBRID_TRANSITION: 2 } },
    ],
  },
  {
    id: 'workStyle',
    icon: <Building className="w-6 h-6" />,
    options: [
      { text: 'stableJob', scores: { STABILITY_REDIS: 3, COMPETENCE_TRUST: 2 } },
      { text: 'entrepreneur', scores: { GROWTH_RISK: 3, HYBRID_TRANSITION: 2 } },
      { text: 'freelance', scores: { COMPETENCE_TRUST: 2, RESOURCE_EXTRACTION: 2 } },
      { text: 'opportunist', scores: { PROBLEM_RENT: 3, RESOURCE_EXTRACTION: 2 } },
    ],
  },
  {
    id: 'valueSystem',
    icon: <Heart className="w-6 h-6" />,
    options: [
      { text: 'meritocracy', scores: { COMPETENCE_TRUST: 3, GROWTH_RISK: 2 } },
      { text: 'socialProtection', scores: { STABILITY_REDIS: 3 } },
      { text: 'pragmatism', scores: { PROBLEM_RENT: 2, HYBRID_TRANSITION: 3 } },
      { text: 'wealth', scores: { RESOURCE_EXTRACTION: 3, GROWTH_RISK: 2 } },
    ],
  },
  {
    id: 'networkStyle',
    icon: <Users className="w-6 h-6" />,
    options: [
      { text: 'formalNetworks', scores: { COMPETENCE_TRUST: 3, STABILITY_REDIS: 2 } },
      { text: 'informalNetworks', scores: { PROBLEM_RENT: 3, HYBRID_TRANSITION: 2 } },
      { text: 'businessNetworks', scores: { GROWTH_RISK: 3, RESOURCE_EXTRACTION: 2 } },
      { text: 'minimalNetworks', scores: { STABILITY_REDIS: 2, COMPETENCE_TRUST: 2 } },
    ],
  },
  {
    id: 'futureVision',
    icon: <Globe className="w-6 h-6" />,
    options: [
      { text: 'stayLocal', scores: { STABILITY_REDIS: 3, PROBLEM_RENT: 2 } },
      { text: 'goGlobal', scores: { GROWTH_RISK: 3, RESOURCE_EXTRACTION: 2 } },
      { text: 'strategic', scores: { HYBRID_TRANSITION: 3, COMPETENCE_TRUST: 2 } },
      { text: 'opportunistic', scores: { RESOURCE_EXTRACTION: 3, PROBLEM_RENT: 2 } },
    ],
  },
  {
    id: 'moneyRelation',
    icon: <Coins className="w-6 h-6" />,
    options: [
      { text: 'saveSafely', scores: { STABILITY_REDIS: 3, COMPETENCE_TRUST: 2 } },
      { text: 'investGrowth', scores: { GROWTH_RISK: 3, HYBRID_TRANSITION: 2 } },
      { text: 'maximizeNow', scores: { RESOURCE_EXTRACTION: 3 } },
      { text: 'diversify', scores: { PROBLEM_RENT: 2, HYBRID_TRANSITION: 3 } },
    ],
  },
  {
    id: 'rulesAttitude',
    icon: <Shield className="w-6 h-6" />,
    options: [
      { text: 'followStrictly', scores: { COMPETENCE_TRUST: 3, STABILITY_REDIS: 2 } },
      { text: 'useWisely', scores: { STABILITY_REDIS: 2, HYBRID_TRANSITION: 2 } },
      { text: 'findLoopholes', scores: { PROBLEM_RENT: 3, RESOURCE_EXTRACTION: 2 } },
      { text: 'createOwn', scores: { GROWTH_RISK: 3 } },
    ],
  },
];

const PYRAMID_COLORS: Record<PyramidType, string> = {
  PROBLEM_RENT: 'bg-red-500/20 border-red-500 text-red-400',
  STABILITY_REDIS: 'bg-blue-500/20 border-blue-500 text-blue-400',
  COMPETENCE_TRUST: 'bg-green-500/20 border-green-500 text-green-400',
  GROWTH_RISK: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  HYBRID_TRANSITION: 'bg-purple-500/20 border-purple-500 text-purple-400',
  RESOURCE_EXTRACTION: 'bg-orange-500/20 border-orange-500 text-orange-400',
};

const createEmptyScores = (): Record<PyramidType, number> => ({
  PROBLEM_RENT: 0,
  STABILITY_REDIS: 0,
  COMPETENCE_TRUST: 0,
  GROWTH_RISK: 0,
  HYBRID_TRANSITION: 0,
  RESOURCE_EXTRACTION: 0,
});

const FINISH_POSITION = 41;

export default function PyramidQuiz() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { saveGame, loadGame, loading: savingGame } = useSavedGames();
  const { 
    stats: persistedStats, 
    trackGameCompleted, 
    trackRiskEvent: trackPersistentRisk,
    trackActionUsed: trackPersistentAction,
  } = useGameStatistics();
  
  const [mode, setMode] = useState<GameMode>(null);
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('mode');
  
  // Board game state
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerCount, setPlayerCount] = useState(2);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [boardQuestion, setBoardQuestion] = useState<number | null>(null);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const [diceRotation, setDiceRotation] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [gameName, setGameName] = useState('');
  const [turnNumber, setTurnNumber] = useState(1);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('global_event');
  const [playerProfiles] = useState<GamePlayerProfile[]>([]);
  const [awaitingEndTurn, setAwaitingEndTurn] = useState(false);

  // Refs for pending tutorial data (replaces window globals)
  const pendingCharsRef = useRef<CharacterCardType[] | null>(null);
  const pendingFamilyStatusesRef = useRef<FamilyStatus[] | null>(null);

  // Game statistics
  const [gameStats, setGameStats] = useState<GameStats>({
    risksTaken: 0,
    risksSucceeded: 0,
    risksFailed: 0,
    risksCatastrophic: 0,
    actionsCompleted: 0,
    actionsFailed: 0,
    countriesVisited: [],
    totalMoneyEarned: 0,
    totalMoneyLost: 0,
    healthLost: 0,
  });

  const trackRiskOutcome = useCallback((outcome: 'success' | 'failure' | 'catastrophic', moneyChange: number, healthChange: number) => {
    setGameStats(prev => ({
      ...prev,
      risksTaken: prev.risksTaken + 1,
      risksSucceeded: outcome === 'success' ? prev.risksSucceeded + 1 : prev.risksSucceeded,
      risksFailed: outcome === 'failure' ? prev.risksFailed + 1 : prev.risksFailed,
      risksCatastrophic: outcome === 'catastrophic' ? prev.risksCatastrophic + 1 : prev.risksCatastrophic,
      totalMoneyEarned: moneyChange > 0 ? prev.totalMoneyEarned + moneyChange : prev.totalMoneyEarned,
      totalMoneyLost: moneyChange < 0 ? prev.totalMoneyLost + Math.abs(moneyChange) : prev.totalMoneyLost,
      healthLost: healthChange < 0 ? prev.healthLost + Math.abs(healthChange) : prev.healthLost,
    }));
    // Persist to cloud
    trackPersistentRisk(outcome, moneyChange, healthChange);
  }, [trackPersistentRisk]);

  const trackAction = useCallback((success: boolean, actionId?: string) => {
    setGameStats(prev => ({
      ...prev,
      actionsCompleted: success ? prev.actionsCompleted + 1 : prev.actionsCompleted,
      actionsFailed: !success ? prev.actionsFailed + 1 : prev.actionsFailed,
    }));
    // Persist to cloud only on successful action
    if (actionId && success) {
      trackPersistentAction(actionId);
    }
  }, [trackPersistentAction]);

  // Cooperative mode: shared score pool
  const [cooperativePool, setCooperativePool] = useState<Record<PyramidType, number>>(createEmptyScores());

  // Load game from URL parameter (from Dashboard)
  useEffect(() => {
    const loadGameId = searchParams.get('loadGame');
    if (loadGameId && user) {
      loadGame(loadGameId).then(savedGame => {
        if (savedGame) {
          // Restore game state
          setMode(savedGame.game_mode as GameMode);
          const savedPlayers = savedGame.game_state.players as Array<Partial<Player>>;
          setPlayers(savedPlayers.map((p) => ({
            ...p,
            resources: p.resources || createDefaultResources(),
            countryType: p.countryType || ('STABILITY_REDIS' as PyramidType),
          })) as Player[]);
          setCurrentPlayerIndex(savedGame.game_state.currentPlayerIndex);
          setDiceValue(savedGame.game_state.diceValue);
          setGameMessage(savedGame.game_state.gameMessage || '');
          setPlayerCount(savedGame.player_count);
          setCurrentGameId(savedGame.id);
          setGameFinished(savedGame.is_finished);
          setSetupPhase('playing');
          toast.success(t('pyramidQuiz.gameLoaded', 'Partie chargée !'));
        }
      });
    }
  }, [searchParams, user, loadGame, t]);

  // Game mode specific win conditions
  const checkWinCondition = useCallback(() => {
    if (mode === 'race') {
      // First to finish wins
      const finishedPlayer = players.find(p => p.position >= FINISH_POSITION);
      if (finishedPlayer) {
        setGameFinished(true);
        return finishedPlayer;
      }
    } else if (mode === 'points_duel') {
      // All must finish, highest total score wins
      if (players.every(p => p.position >= FINISH_POSITION)) {
        setGameFinished(true);
        const winner = players.reduce((a, b) => {
          const aTotal = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
          const bTotal = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
          return aTotal > bTotal ? a : b;
        });
        return winner;
      }
    } else if (mode === 'cooperative') {
      // All finish, check combined score against threshold
      if (players.every(p => p.position >= FINISH_POSITION)) {
        setGameFinished(true);
        return null; // No single winner
      }
    } else {
      // Solo mode
      if (players.every(p => p.position >= FINISH_POSITION)) {
        setGameFinished(true);
      }
    }
    return null;
  }, [mode, players]);

  // Persist stats when game ends
  useEffect(() => {
    if (gameFinished && players.length > 0) {
      const mainPlayer = players[0];
      const totalScore = Object.values(mainPlayer.scores).reduce((a, b) => a + b, 0);
      const archetypeId = mainPlayer.character?.id || 'unknown';
      const countryId = mainPlayer.character?.birthCountry || 'unknown';
      
      // Track game completion
      trackGameCompleted(
        (mode as 'solo' | 'race' | 'points_duel' | 'cooperative') || 'solo',
        totalScore,
        archetypeId,
        countryId,
        turnNumber
      );

      // Show achievement unlocks
      const newAchievements = getNewlyUnlockedAchievements(persistedStats, {
        ...persistedStats,
        totalGamesPlayed: persistedStats.totalGamesPlayed + 1,
        totalTurnsPlayed: persistedStats.totalTurnsPlayed + turnNumber,
        archetypesUsed: persistedStats.archetypesUsed.includes(archetypeId) 
          ? persistedStats.archetypesUsed 
          : [...persistedStats.archetypesUsed, archetypeId],
        countriesVisited: persistedStats.countriesVisited.includes(countryId)
          ? persistedStats.countriesVisited
          : [...persistedStats.countriesVisited, countryId],
        bestScoreSolo: mode === 'solo' && totalScore > persistedStats.bestScoreSolo 
          ? totalScore : persistedStats.bestScoreSolo,
        bestScoreRace: mode === 'race' && totalScore > persistedStats.bestScoreRace 
          ? totalScore : persistedStats.bestScoreRace,
      });

      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast.success(`🏆 ${t('achievements.unlocked', 'Achievement unlocked')}: ${t(`achievements.${achievement.id}.name`, achievement.name)}`, {
            description: t(`achievements.${achievement.id}.description`, achievement.description),
            duration: 5000,
          });
        });
      }
    }
  }, [gameFinished]);

  const rollDice = () => {
    if (isRolling || isMoving) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.position >= FINISH_POSITION) return;
    
    setIsRolling(true);
    setGameMessage('');
    
    let rotationCount = 0;
    const rotationInterval = setInterval(() => {
      setDiceRotation(prev => prev + 45);
      rotationCount++;
    }, 50);
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(rollInterval);
        clearInterval(rotationInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);
        setDiceRotation(0);
        
        const newPosition = Math.min(currentPlayer.position + finalValue, FINISH_POSITION);
        animateMovement(currentPlayerIndex, currentPlayer.position, newPosition);
      }
    }, 80);
  };

  const animateMovement = (playerIdx: number, from: number, to: number) => {
    if (from >= to) {
      handleBoardSquare(playerIdx, to);
      return;
    }
    
    setIsMoving(true);
    let currentPos = from;
    
    const moveInterval = setInterval(() => {
      currentPos++;
      setPlayers(prev => prev.map((p, idx) => 
        idx === playerIdx ? { ...p, position: currentPos } : p
      ));
      
      if (currentPos >= to) {
        clearInterval(moveInterval);
        setIsMoving(false);
        handleBoardSquare(playerIdx, to);
      }
    }, 300);
  };

  const handleBoardSquare = (playerIdx: number, position: number) => {
    const square = HEXAGONAL_BOARD[position];
    if (!square) {
      setAwaitingEndTurn(true);
      return;
    }
    
    if (square.type === 'pyramid' && square.pyramid) {
      const pyramidType = square.pyramid;
      const pointsGained = mode === 'cooperative' ? 3 : 2;
      
      if (mode === 'cooperative') {
        setCooperativePool(prev => ({
          ...prev,
          [pyramidType]: prev[pyramidType] + pointsGained
        }));
      } else {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          const newScores = { ...p.scores };
          newScores[pyramidType] += pointsGained;
          return { ...p, scores: newScores };
        }));
      }
      setGameMessage(t('pyramidQuiz.board.landedPyramid', { type: t(`pyramids.${PYRAMID_TRANSLATION_KEY[pyramidType]}.label`) }));
      setAwaitingEndTurn(true);
    } else if (square.type === 'question' && square.questionIndex !== undefined) {
      setBoardQuestion(square.questionIndex % QUIZ_QUESTIONS.length);
    } else if (square.type === 'chance') {
      const pyramidTypes: PyramidType[] = ['PROBLEM_RENT', 'STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'];
      const randomType = pyramidTypes[Math.floor(Math.random() * pyramidTypes.length)];
      
      if (mode === 'cooperative') {
        setCooperativePool(prev => ({
          ...prev,
          [randomType]: prev[randomType] + 3
        }));
      } else {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          const newScores = { ...p.scores };
          newScores[randomType] += 3;
          return { ...p, scores: newScores };
        }));
      }
      setGameMessage(t('pyramidQuiz.board.chanceCard', { type: t(`pyramids.${PYRAMID_TRANSLATION_KEY[randomType]}.label`) }));
      setAwaitingEndTurn(true);
    } else if (square.type === 'trap') {
      if (mode === 'cooperative') {
        const maxType = Object.entries(cooperativePool).reduce((a, b) => a[1] > b[1] ? a : b)[0] as PyramidType;
        setCooperativePool(prev => ({
          ...prev,
          [maxType]: Math.max(0, prev[maxType] - 2)
        }));
      } else {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          const maxType = Object.entries(p.scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as PyramidType;
          const newScores = { ...p.scores };
          newScores[maxType] = Math.max(0, newScores[maxType] - 2);
          return { ...p, scores: newScores };
        }));
      }
      setGameMessage(t('pyramidQuiz.board.trap'));
      setAwaitingEndTurn(true);
    } else if (square.type === 'bonus') {
      if (mode === 'cooperative') {
        setCooperativePool(prev => {
          const newPool = { ...prev };
          Object.keys(newPool).forEach(type => {
            newPool[type as PyramidType] += 1;
          });
          return newPool;
        });
      } else {
        setPlayers(prev => prev.map((p, idx) => {
          if (idx !== playerIdx) return p;
          const newScores = { ...p.scores };
          Object.keys(newScores).forEach(type => {
            newScores[type as PyramidType] += 1;
          });
          return { ...p, scores: newScores };
        }));
      }
      setGameMessage(t('pyramidQuiz.board.bonus'));
      setAwaitingEndTurn(true);
    } else if (square.type === 'finish') {
      const player = players[playerIdx];
      const result = Object.entries(player.scores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as PyramidType;
      setPlayers(prev => prev.map((p, idx) => 
        idx === playerIdx ? { ...p, result } : p
      ));
      checkWinCondition();
      setAwaitingEndTurn(true);
    } else if (square.type === 'corner') {
      setGameMessage(t('pyramidQuiz.board.corner', 'Croisement ! Continuez votre chemin.'));
      setAwaitingEndTurn(true);
    } else {
      setAwaitingEndTurn(true);
    }
  };

  // Handle end turn button click
  const handleEndTurnClick = () => {
    setAwaitingEndTurn(false);
    nextPlayer();
  };

  const handleBoardAnswer = (optionScores: Partial<Record<PyramidType, number>>) => {
    if (mode === 'cooperative') {
      setCooperativePool(prev => {
        const newPool = { ...prev };
        Object.entries(optionScores).forEach(([type, score]) => {
          newPool[type as PyramidType] += score || 0;
        });
        return newPool;
      });
    } else {
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== currentPlayerIndex) return p;
        const newScores = { ...p.scores };
        Object.entries(optionScores).forEach(([type, score]) => {
          newScores[type as PyramidType] += score || 0;
        });
        return { ...p, scores: newScores };
      }));
    }
    setBoardQuestion(null);
    setGameMessage(t('pyramidQuiz.board.answeredQuestion'));
    setTimeout(nextPlayer, 1000);
  };

  // Auto-save function
  const autoSaveGame = useCallback(async () => {
    if (!user || !mode || players.length === 0) return;
    
    const gameState: SavedGameState = {
      players,
      currentPlayerIndex,
      diceValue,
      gameMessage,
    };

    const dbMode: DbGameMode = mode === 'race' ? 'race' 
      : mode === 'points_duel' ? 'points_duel' 
      : mode === 'cooperative' ? 'cooperative' 
      : 'solo';

    const autoSaveName = currentGameId 
      ? gameName || `Auto-save ${new Date().toLocaleDateString()}`
      : `Auto-save ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const savedId = await saveGame(autoSaveName, dbMode, gameState, currentGameId || undefined);
    
    if (savedId && !currentGameId) {
      setCurrentGameId(savedId);
      setGameName(autoSaveName);
    }
  }, [user, mode, players, currentPlayerIndex, diceValue, gameMessage, currentGameId, gameName, saveGame]);

  const nextPlayer = () => {
    // Check win condition first
    checkWinCondition();
    if (gameFinished) return;

    // Find next player who hasn't finished
    let nextIdx = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;
    while (players[nextIdx]?.position >= FINISH_POSITION && attempts < players.length) {
      nextIdx = (nextIdx + 1) % players.length;
      attempts++;
    }
    
    if (attempts >= players.length) {
      setGameFinished(true);
    } else {
      // Increment turn number when returning to first player
      if (nextIdx <= currentPlayerIndex) {
        setTurnNumber(prev => prev + 1);
      }
      setCurrentPlayerIndex(nextIdx);
      setGameMessage('');
      
      // CRITICAL: Reset turn phase to start new turn with events
      setTurnPhase('global_event');
      
      // Auto-save at end of each turn
      autoSaveGame();
    }
  };

  const handleArchetypeComplete = (characters: CharacterCardType[], familyStatuses: FamilyStatus[]) => {
    // Skip tutorial if user has opted out, go directly to playing
    if (shouldSkipTutorial()) {
      handleDraftComplete(characters, familyStatuses);
    } else {
      // Store characters and family statuses for after tutorial
      pendingCharsRef.current = characters;
      pendingFamilyStatusesRef.current = familyStatuses;
      setSetupPhase('tutorial');
    }
  };

  const handleDraftComplete = (characters: CharacterCardType[], familyStatuses?: FamilyStatus[]) => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      const character = characters[i];
      const profile = playerProfiles[i];
      const familyStatus = familyStatuses?.[i] || 'single';
      
      // Determine country type from character or default
      const countryType: PyramidType = character 
        ? (getCountryType(character.birthCountry) || 'HYBRID_TRANSITION')
        : 'HYBRID_TRANSITION';
      
      newPlayers.push({
        id: i,
        name: character?.name || profile?.name || `${t('pyramidQuiz.multiplayer.player')} ${i + 1}`,
        position: 0,
        scores: createEmptyScores(),
        color: PLAYER_COLORS[i].bg,
        profile,
        character,
        resources: character?.startingResources || createDefaultResources(),
        countryType,
        familyStatus,
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setCooperativePool(createEmptyScores());
    setTurnNumber(1);
    setTurnPhase('global_event');
    setSetupPhase('playing');
    setGameFinished(false);
  };

  // Helper to get country type
  const getCountryType = (countryId: string): PyramidType | null => {
    const countryMap: Record<string, PyramidType> = {
      'US': 'GROWTH_RISK',
      'FR': 'STABILITY_REDIS',
      'JP': 'COMPETENCE_TRUST',
      'NG': 'PROBLEM_RENT',
      'BR': 'HYBRID_TRANSITION',
      'SA': 'RESOURCE_EXTRACTION',
      'DE': 'COMPETENCE_TRUST',
      'IN': 'GROWTH_RISK',
      'RU': 'RESOURCE_EXTRACTION',
      'CN': 'HYBRID_TRANSITION',
    };
    return countryMap[countryId] || null;
  };

  const handleSaveGame = async () => {
    if (!gameName.trim()) {
      toast.error(t('savedGames.nameRequired'));
      return;
    }

    const gameState: SavedGameState = {
      players,
      currentPlayerIndex,
      diceValue,
      gameMessage,
    };

    const dbMode: DbGameMode = mode === 'race' ? 'race' 
      : mode === 'points_duel' ? 'points_duel' 
      : mode === 'cooperative' ? 'cooperative' 
      : 'solo';

    const savedId = await saveGame(gameName, dbMode, gameState, currentGameId || undefined);
    
    if (savedId) {
      setCurrentGameId(savedId);
      setSaveDialogOpen(false);
      toast.success(t('savedGames.saved'));
    } else {
      toast.error(t('savedGames.saveFailed'));
    }
  };

  const handleLoadGame = (game: SavedGame) => {
    setMode(game.game_mode as GameMode);
    // Add default values for new properties if loading old saves
    const loadedPlayers = game.game_state.players.map((p: any) => ({
      ...p,
      resources: p.resources || createDefaultResources(),
      countryType: p.countryType || 'HYBRID_TRANSITION' as PyramidType,
    }));
    setPlayers(loadedPlayers);
    setCurrentPlayerIndex(game.game_state.currentPlayerIndex);
    setDiceValue(game.game_state.diceValue);
    setGameMessage(game.game_state.gameMessage);
    setPlayerCount(game.player_count);
    setCurrentGameId(game.id);
    setSetupPhase('playing');
    setGameFinished(false);
  };

  const resetGame = () => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setBoardQuestion(null);
    setGameMessage('');
    setMode(null);
    setSetupPhase('mode');
    setGameFinished(false);
    setIsMoving(false);
    setDiceRotation(0);
    setCooperativePool(createEmptyScores());
    setCurrentGameId(null);
    setGameName('');
    setGameStats({
      risksTaken: 0,
      risksSucceeded: 0,
      risksFailed: 0,
      risksCatastrophic: 0,
      actionsCompleted: 0,
      actionsFailed: 0,
      countriesVisited: [],
      totalMoneyEarned: 0,
      totalMoneyLost: 0,
      healthLost: 0,
    });
  };

  // Mode selection
  if (setupPhase === 'mode') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-4xl font-bold mb-4">{t('pyramidQuiz.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('pyramidQuiz.subtitle')}</p>
          </div>

          {/* Clarification Banner */}
          <div className="glass-card rounded-xl p-4 md:p-6 max-w-2xl mx-auto mb-8 border-amber-500/30 bg-amber-500/5 animate-fade-in">
            <p className="text-center text-amber-400 font-medium mb-3">
              {t('pyramidQuiz.disclaimer', "⚠️ Tu vas incarner un personnage fictif au hasard. Ce n'est pas ta vraie vie — c'est un jeu éducatif !")}
            </p>
            <div className="text-center">
              <Link to="/exit-keys" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                {t('pyramidQuiz.realLifeLink', 'Tu veux planifier ta vraie vie ?')}
                <ArrowRight className="w-3 h-3" />
                <span className="font-medium">{t('nav.exitKeys', 'Stratégies')}</span>
              </Link>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <RulesDialog />
            {user && <SavedGamesDialog onLoadGame={handleLoadGame} />}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Solo Board */}
            <button
              onClick={() => { setMode('solo'); setPlayerCount(1); setSetupPhase('archetype'); }}
              className="glass-card rounded-2xl p-8 text-left hover:border-blue-500/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('gameModes.solo.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('gameModes.solo.description')}</p>
              <div className="flex items-center gap-2 text-blue-500 font-medium">
                {t('pyramidQuiz.modes.board.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            {/* Race Mode */}
            <button
              onClick={() => { setMode('race'); setSetupPhase('playerCount'); }}
              className="glass-card rounded-2xl p-8 text-left hover:border-yellow-500/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all">
                  <Flag className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('gameModes.race.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('gameModes.race.description')}</p>
              <div className="flex items-center gap-2 text-yellow-500 font-medium">
                {t('pyramidQuiz.modes.multiplayer.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            {/* Points Duel */}
            <button
              onClick={() => { setMode('points_duel'); setSetupPhase('playerCount'); }}
              className="glass-card rounded-2xl p-8 text-left hover:border-rose-500/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-all">
                  <Swords className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('gameModes.pointsDuel.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('gameModes.pointsDuel.description')}</p>
              <div className="flex items-center gap-2 text-rose-500 font-medium">
                {t('pyramidQuiz.modes.multiplayer.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            {/* Cooperative */}
            <button
              onClick={() => { setMode('cooperative'); setSetupPhase('playerCount'); }}
              className="glass-card rounded-2xl p-8 text-left hover:border-emerald-500/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all">
                  <HandHeart className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('gameModes.cooperative.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('gameModes.cooperative.description')}</p>
              <div className="flex items-center gap-2 text-emerald-500 font-medium">
                {t('pyramidQuiz.modes.multiplayer.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Player count selection
  if (setupPhase === 'playerCount') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-3xl font-bold mb-4">
              {mode === 'race' && t('gameModes.race.title')}
              {mode === 'points_duel' && t('gameModes.pointsDuel.title')}
              {mode === 'cooperative' && t('gameModes.cooperative.title')}
            </h1>
            <p className="text-muted-foreground">{t('pyramidQuiz.multiplayer.setup')}</p>
          </div>

          <div className="glass-card rounded-xl p-8 animate-scale-in">
            <h3 className="font-semibold mb-6">{t('pyramidQuiz.multiplayer.selectPlayers')}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105",
                    playerCount === count 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex justify-center gap-1 mb-2">
                    {Array.from({ length: count }).map((_, i) => (
                      <div key={i} className={cn("w-4 h-4 rounded-full", PLAYER_COLORS[i].bg)} />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{count}</span>
                </button>
              ))}
            </div>

            <Button onClick={() => setSetupPhase('archetype')} className="w-full gap-2">
              {t('common.next') || 'Suivant'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={resetGame} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('pyramidQuiz.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Archetype selection phase
  if (setupPhase === 'archetype') {
    return (
      <ArchetypeSelector
        playerCount={playerCount}
        playerColors={PLAYER_COLORS}
        onComplete={handleArchetypeComplete}
        onBack={() => setSetupPhase(playerCount > 1 ? 'playerCount' : 'mode')}
      />
    );
  }

  // Tutorial phase
  if (setupPhase === 'tutorial') {
    const handleTutorialComplete = () => {
      // Use pending characters and family statuses from archetype selection
      const pendingChars = pendingCharsRef.current;
      const pendingFamilyStatuses = pendingFamilyStatusesRef.current;
      if (pendingChars) {
        pendingCharsRef.current = null;
        pendingFamilyStatusesRef.current = null;
        handleDraftComplete(pendingChars, pendingFamilyStatuses ?? undefined);
      } else {
        setSetupPhase('archetype');
      }
    };
    
    return (
      <TutorialMode
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialComplete}
      />
    );
  }

  // Board Game Modes
  if (setupPhase === 'playing' && players.length > 0) {
    const currentPlayer = players[currentPlayerIndex];

    // Game finished screen - Use GameEndSummary
    if (gameFinished) {
      return (
        <GameEndSummary
          players={players.map(p => ({
            id: p.id,
            name: p.name,
            character: p.character,
            resources: p.resources,
            scores: p.scores,
            position: p.position,
          }))}
          turnCount={turnNumber}
          gameMode={(mode || 'solo') as 'solo' | 'race' | 'points_duel' | 'cooperative'}
          gameStats={gameStats}
          onPlayAgain={resetGame}
          onBackToMenu={resetGame}
        />
      );
    }

    // Question modal
    if (boardQuestion !== null) {
      const question = QUIZ_QUESTIONS[boardQuestion];
      
      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div className={cn("w-6 h-6 rounded-full", currentPlayer.color)} />
              <span className="font-semibold">{currentPlayer.name}</span>
            </div>
            
            <div className="glass-card rounded-xl p-8 animate-scale-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg bg-primary/10 animate-pulse">
                  {question.icon}
                </div>
                <h2 className="font-display text-xl font-semibold">
                  {t(`pyramidQuiz.questions.${question.id}.question`)}
                </h2>
              </div>

              <div className="grid gap-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleBoardAnswer(option.scores)}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-200 text-left animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {t(`pyramidQuiz.questions.${question.id}.options.${option.text}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Current Player Full Info Card */}
          <CurrentPlayerInfo 
            player={{
              ...currentPlayer,
              color: currentPlayer.color,
              resources: currentPlayer.resources,
              countryType: currentPlayer.countryType,
              familyStatus: currentPlayer.familyStatus,
              position: currentPlayer.position,
            }}
            turnNumber={turnNumber}
          />

          {/* Other Players Stats Bar */}
          {players.length > 1 && (
            <div className="flex justify-center gap-4 my-4 flex-wrap">
              {players.filter((_, idx) => idx !== currentPlayerIndex).map((player) => (
                <div 
                  key={player.id}
                  className="glass-card rounded-lg px-4 py-2 flex items-center gap-2 opacity-60"
                >
                  <div className={cn("w-3 h-3 rounded-full", player.color)} />
                  <span className="text-sm">{player.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {mode === 'cooperative' ? `#${player.position}` : `${Object.values(player.scores).reduce((s, v) => s + v, 0)}pts`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Turn Phase Helper */}
          <TurnPhaseHelper currentPhase={turnPhase} />

          {/* Turn Manager - Phases: Events → Actions → Board */}
          {turnPhase !== 'board_move' ? (
            <TurnManager
              currentPlayer={{
                id: currentPlayer.id,
                name: currentPlayer.name,
                character: currentPlayer.character!,
                resources: currentPlayer.resources,
                countryType: currentPlayer.countryType,
              }}
              turnNumber={turnNumber}
              onResourceChange={(playerId, newResources) => {
                setPlayers(prev => prev.map(p => 
                  p.id === playerId ? { ...p, resources: newResources } : p
                ));
              }}
              onPyramidScoreChange={(playerId, pyramidChanges) => {
                if (mode === 'cooperative') {
                  setCooperativePool(prev => {
                    const newPool = { ...prev };
                    Object.entries(pyramidChanges).forEach(([type, change]) => {
                      if (change) newPool[type as PyramidType] = (newPool[type as PyramidType] || 0) + change;
                    });
                    return newPool;
                  });
                } else {
                  setPlayers(prev => prev.map(p => {
                    if (p.id !== playerId) return p;
                    const newScores = { ...p.scores };
                    Object.entries(pyramidChanges).forEach(([type, change]) => {
                      if (change) newScores[type as PyramidType] = (newScores[type as PyramidType] || 0) + change;
                    });
                    return { ...p, scores: newScores };
                  }));
                }
              }}
              onPhaseComplete={(phase, _data) => {
                if (phase === 'action_resolution') {
                  setTurnPhase('board_move');
                }
              }}
              onTurnEnd={() => {
                setTurnNumber(prev => prev + 1);
                setTurnPhase('global_event');
                nextPlayer();
              }}
              onTrackRisk={trackRiskOutcome}
              onTrackAction={trackAction}
            />
          ) : (
            <>
              {/* Hexagonal Board */}
              <HexagonalBoard
                players={players.map(p => ({
                  id: p.id,
                  position: p.position,
                  color: p.color,
                  isMoving: isMoving && p.id === currentPlayer.id,
                }))}
                currentPlayerId={currentPlayer.id}
              />

              {/* Game Message */}
              {gameMessage && (
                <div className="glass-card rounded-lg p-4 mt-6 text-center animate-fade-in">
                  <p className="font-medium">{gameMessage}</p>
                </div>
              )}

              {/* Cooperative Score Display */}
              {mode === 'cooperative' && (
                <div className="glass-card rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-semibold mb-2 text-center">{t('pyramidQuiz.cooperative.poolScore')}</h4>
                  <div className="flex flex-wrap justify-center gap-4">
                    {Object.entries(cooperativePool)
                      .filter(([, score]) => score > 0)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, score]) => (
                        <div key={type} className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded", PYRAMID_COLORS[type as PyramidType].split(' ')[0])} />
                          <span className="text-xs">{PYRAMID_TYPE_INFO[type as PyramidType].label.split(' ')[0]}</span>
                          <span className="text-xs font-bold">{score}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Dice Prompt OR End Turn Button */}
              {awaitingEndTurn ? (
                <div className="flex flex-col items-center gap-4 mt-8 animate-fade-in">
                  <div className="glass-card rounded-xl p-6 text-center max-w-md">
                    <p className="text-lg font-medium mb-4">{gameMessage || t('game.turnComplete', 'Tour terminé !')}</p>
                    <Button 
                      onClick={handleEndTurnClick} 
                      size="lg" 
                      className="gap-2 text-lg px-8 py-6"
                    >
                      <ArrowRight className="w-5 h-5" />
                      {t('game.endTurn', 'Terminer mon tour')}
                    </Button>
                  </div>
                </div>
              ) : (
                <DicePrompt
                  diceValue={diceValue}
                  isRolling={isRolling}
                  isMoving={isMoving}
                  isFinished={currentPlayer.position >= FINISH_POSITION}
                  diceRotation={diceRotation}
                  onRoll={rollDice}
                />
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Button onClick={resetGame} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('pyramidQuiz.back')}
            </Button>
            
            {user && (
              <Button onClick={() => setSaveDialogOpen(true)} variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                {t('savedGames.save')}
              </Button>
            )}
          </div>
        </div>

        {/* Save Game Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('savedGames.saveGame')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder={t('savedGames.gameName')}
              />
              <Button 
                onClick={handleSaveGame} 
                className="w-full gap-2"
                disabled={savingGame}
              >
                {savingGame ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t('savedGames.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
