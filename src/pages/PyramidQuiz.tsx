import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import HexagonalBoard, { HEXAGONAL_BOARD } from '@/components/game/HexagonalBoard';
import PlayerProfileSetup, { GamePlayerProfile } from '@/components/game/PlayerProfile';
import SavedGamesDialog from '@/components/game/SavedGamesDialog';
import { useSavedGames, SavedGame, SavedGameState } from '@/hooks/useSavedGames';
import { useAuth } from '@/hooks/useAuth';
import { 
  Gamepad2, 
  ArrowRight, 
  ArrowLeft, 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6,
  Trophy,
  RotateCcw,
  Target,
  Shield,
  Zap,
  Heart,
  Globe,
  Coins,
  Users,
  Building,
  Crown,
  Swords,
  HandHeart,
  Flag,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type GameMode = 'online' | 'solo' | 'race' | 'points_duel' | 'cooperative' | null;
type DbGameMode = Database['public']['Enums']['game_mode'];

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
}

const PLAYER_COLORS = [
  { bg: 'bg-blue-500', ring: 'ring-blue-500', text: 'text-blue-500' },
  { bg: 'bg-pink-500', ring: 'ring-pink-500', text: 'text-pink-500' },
  { bg: 'bg-green-500', ring: 'ring-green-500', text: 'text-green-500' },
  { bg: 'bg-orange-500', ring: 'ring-orange-500', text: 'text-orange-500' },
];

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

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

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
  const { saveGame, loading: savingGame } = useSavedGames();
  
  const [mode, setMode] = useState<GameMode>(null);
  const [setupPhase, setSetupPhase] = useState<'mode' | 'playerCount' | 'profiles' | 'playing'>('mode');
  
  // Online quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<PyramidType, number>>(createEmptyScores());
  const [quizResult, setQuizResult] = useState<PyramidType | null>(null);

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

  const diceRef = useRef<HTMLButtonElement>(null);

  // Cooperative mode: shared score pool
  const [cooperativePool, setCooperativePool] = useState<Record<PyramidType, number>>(createEmptyScores());

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

  const handleAnswer = (optionScores: Partial<Record<PyramidType, number>>) => {
    const newScores = { ...scores };
    Object.entries(optionScores).forEach(([type, score]) => {
      newScores[type as PyramidType] += score || 0;
    });
    setScores(newScores);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = Object.entries(newScores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as PyramidType;
      setQuizResult(result);
    }
  };

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
      nextPlayer();
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
      setGameMessage(t('pyramidQuiz.board.landedPyramid', { type: t(`pyramids.${pyramidType.toLowerCase().replace('_', '')}.label`) }));
      setTimeout(nextPlayer, 1500);
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
      setGameMessage(t('pyramidQuiz.board.chanceCard', { type: t(`pyramids.${randomType.toLowerCase().replace('_', '')}.label`) }));
      setTimeout(nextPlayer, 1500);
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
      setTimeout(nextPlayer, 1500);
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
      setTimeout(nextPlayer, 1500);
    } else if (square.type === 'finish') {
      const player = players[playerIdx];
      const result = Object.entries(player.scores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as PyramidType;
      setPlayers(prev => prev.map((p, idx) => 
        idx === playerIdx ? { ...p, result } : p
      ));
      checkWinCondition();
      setTimeout(nextPlayer, 1500);
    } else if (square.type === 'corner') {
      // Special corner: choose which side to go next (for future enhancement)
      setTimeout(nextPlayer, 1000);
    } else {
      setTimeout(nextPlayer, 1000);
    }
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
      setCurrentPlayerIndex(nextIdx);
      setGameMessage('');
    }
  };

  const startGame = (profiles?: GamePlayerProfile[]) => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: profiles?.[i]?.name || `${t('pyramidQuiz.multiplayer.player')} ${i + 1}`,
        position: 0,
        scores: createEmptyScores(),
        color: PLAYER_COLORS[i].bg,
        profile: profiles?.[i],
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setCooperativePool(createEmptyScores());
    setSetupPhase('playing');
    setGameFinished(false);
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
    setPlayers(game.game_state.players);
    setCurrentPlayerIndex(game.game_state.currentPlayerIndex);
    setDiceValue(game.game_state.diceValue);
    setGameMessage(game.game_state.gameMessage);
    setPlayerCount(game.player_count);
    setCurrentGameId(game.id);
    setSetupPhase('playing');
    setGameFinished(false);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScores(createEmptyScores());
    setQuizResult(null);
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
  };

  // Mode selection
  if (setupPhase === 'mode') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-4xl font-bold mb-4">{t('pyramidQuiz.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('pyramidQuiz.subtitle')}</p>
          </div>

          {user && (
            <div className="flex justify-center mb-8">
              <SavedGamesDialog onLoadGame={handleLoadGame} />
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Online Quiz */}
            <button
              onClick={() => setMode('online')}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all">
                  <Gamepad2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('pyramidQuiz.modes.online.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('pyramidQuiz.modes.online.description')}</p>
              <div className="flex items-center gap-2 text-primary font-medium">
                {t('pyramidQuiz.modes.online.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            {/* Solo Board */}
            <button
              onClick={() => { setMode('solo'); setPlayerCount(1); setSetupPhase('profiles'); }}
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

            <Button onClick={() => setSetupPhase('profiles')} className="w-full gap-2">
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

  // Player profile setup
  if (setupPhase === 'profiles') {
    return (
      <PlayerProfileSetup
        playerCount={playerCount}
        playerColors={PLAYER_COLORS}
        onComplete={startGame}
        onBack={() => setSetupPhase(playerCount > 1 ? 'playerCount' : 'mode')}
      />
    );
  }

  // Online Quiz Mode
  if (mode === 'online') {
    if (quizResult) {
      const info = PYRAMID_TYPE_INFO[quizResult];
      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12 animate-scale-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6 animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">{t('pyramidQuiz.result.title')}</h1>
              <p className="text-muted-foreground">{t('pyramidQuiz.result.subtitle')}</p>
            </div>

            <div className={cn(
              "glass-card rounded-2xl p-8 mb-8 border-2 animate-fade-in",
              PYRAMID_COLORS[quizResult]
            )}>
              <h2 className="font-display text-2xl font-bold mb-4">{info.label}</h2>
              <p className="text-muted-foreground mb-6">{info.description}</p>
              
              <div className="space-y-4">
                <h3 className="font-semibold">{t('pyramidQuiz.result.scores')}</h3>
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, score], index) => (
                    <div key={type} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <span className="text-sm w-40">{PYRAMID_TYPE_INFO[type as PyramidType].label}</span>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", PYRAMID_COLORS[type as PyramidType].split(' ')[0])}
                          style={{ width: `${(score / 24) * 100}%`, transitionDelay: `${index * 0.1}s` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-8">{score}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('pyramidQuiz.result.playAgain')}
              </Button>
              <Button onClick={() => window.location.href = `/pyramid-types`} className="gap-2">
                {t('pyramidQuiz.result.learnMore')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const question = QUIZ_QUESTIONS[currentQuestion];
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Progress */}
          <div className="mb-8 animate-fade-in">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{t('pyramidQuiz.questionOf', { current: currentQuestion + 1, total: QUIZ_QUESTIONS.length })}</span>
              <span>{Math.round(((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="glass-card rounded-xl p-8 mb-8 animate-scale-in" key={currentQuestion}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-lg bg-primary/10">
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
                  onClick={() => handleAnswer(option.scores)}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-200 text-left animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {t(`pyramidQuiz.questions.${question.id}.options.${option.text}`)}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={resetGame} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('pyramidQuiz.back')}
          </Button>
        </div>
      </div>
    );
  }

  // Board Game Modes
  if (setupPhase === 'playing' && players.length > 0) {
    const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;
    const currentPlayer = players[currentPlayerIndex];

    // Game finished screen
    if (gameFinished) {
      const sortedPlayers = [...players].sort((a, b) => {
        if (mode === 'race') {
          // First to finish wins
          return (a.result ? 0 : 1) - (b.result ? 0 : 1);
        }
        // Otherwise by total score
        const aTotal = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
        const bTotal = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
        return bTotal - aTotal;
      });

      const cooperativeTotal = Object.values(cooperativePool).reduce((sum, s) => sum + s, 0);
      const cooperativeTarget = players.length * 30;
      const cooperativeWin = cooperativeTotal >= cooperativeTarget;

      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12 animate-scale-in">
              <div className={cn(
                "inline-flex items-center justify-center w-20 h-20 rounded-full mb-6",
                mode === 'cooperative' 
                  ? cooperativeWin ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                  : "bg-yellow-500/20 text-yellow-500"
              )}>
                {mode === 'cooperative' 
                  ? <HandHeart className="w-10 h-10 animate-bounce" />
                  : <Crown className="w-10 h-10 animate-bounce" />
                }
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">
                {mode === 'cooperative' 
                  ? (cooperativeWin ? t('pyramidQuiz.cooperative.victory') : t('pyramidQuiz.cooperative.defeat'))
                  : t('pyramidQuiz.multiplayer.gameOver')
                }
              </h1>
              {mode === 'cooperative' && (
                <p className="text-xl text-muted-foreground">
                  {t('pyramidQuiz.cooperative.score', { score: cooperativeTotal, target: cooperativeTarget })}
                </p>
              )}
            </div>

            {mode === 'cooperative' ? (
              <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in">
                <h3 className="font-semibold mb-4">{t('pyramidQuiz.result.scores')}</h3>
                {Object.entries(cooperativePool)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, score]) => (
                    <div key={type} className="flex items-center gap-4 mb-2">
                      <span className="text-sm w-32">{PYRAMID_TYPE_INFO[type as PyramidType].label}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", PYRAMID_COLORS[type as PyramidType].split(' ')[0])}
                          style={{ width: `${(score / 30) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-6">{score}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {sortedPlayers.map((player, index) => (
                  <div 
                    key={player.id} 
                    className={cn(
                      "glass-card rounded-xl p-6 animate-fade-in",
                      index === 0 && "ring-2 ring-yellow-500"
                    )}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold", player.color)}>
                        {index + 1}
                      </div>
                      <span className="font-semibold text-lg">{player.name}</span>
                      {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                      <span className="ml-auto text-muted-foreground">
                        {Object.values(player.scores).reduce((sum, s) => sum + s, 0)} pts
                      </span>
                    </div>
                    {player.result && (
                      <div className={cn("rounded-lg p-3", PYRAMID_COLORS[player.result])}>
                        <span className="font-medium">{PYRAMID_TYPE_INFO[player.result].label}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('pyramidQuiz.result.playAgain')}
              </Button>
            </div>
          </div>
        </div>
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
          {/* Current Player Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            <div className={cn("w-8 h-8 rounded-full animate-pulse", currentPlayer.color)} />
            <span className="font-display text-2xl font-bold">{currentPlayer.name}</span>
            <span className="text-muted-foreground">{t('pyramidQuiz.multiplayer.yourTurn')}</span>
          </div>

          {/* Player Stats Bar */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {players.map((player, idx) => (
              <div 
                key={player.id}
                className={cn(
                  "glass-card rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300",
                  idx === currentPlayerIndex && "ring-2 ring-primary scale-105"
                )}
              >
                <div className={cn("w-4 h-4 rounded-full", player.color)} />
                <span className="text-sm font-medium">{player.name}</span>
                <span className="text-xs text-muted-foreground">
                  {mode === 'cooperative' ? `#${player.position}` : `${Object.values(player.scores).reduce((s, v) => s + v, 0)}pts`}
                </span>
              </div>
            ))}
          </div>

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

          {/* Dice and Controls */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <button
              ref={diceRef}
              onClick={rollDice}
              disabled={isRolling || isMoving || currentPlayer.position >= FINISH_POSITION}
              className={cn(
                "p-8 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 hover:scale-110",
                (isRolling || isMoving) && "pointer-events-none"
              )}
              style={{ transform: `rotate(${diceRotation}deg)` }}
            >
              <DiceIcon className={cn(
                "w-16 h-16 text-primary transition-all",
                isRolling && "animate-spin"
              )} />
            </button>
            
            <p className="text-muted-foreground">
              {isMoving ? t('pyramidQuiz.board.moving') : t('pyramidQuiz.board.rollDice')}
            </p>
          </div>

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
