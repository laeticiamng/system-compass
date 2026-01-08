import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Gamepad2, 
  LayoutGrid, 
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
  UserPlus,
  Crown
} from 'lucide-react';

type GameMode = 'online' | 'board' | 'multiplayer' | null;

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

// Board game configuration
const BOARD_SQUARES = [
  { id: 0, type: 'start', name: 'Départ' },
  { id: 1, type: 'pyramid', pyramid: 'COMPETENCE_TRUST' },
  { id: 2, type: 'chance', name: 'Chance' },
  { id: 3, type: 'pyramid', pyramid: 'STABILITY_REDIS' },
  { id: 4, type: 'question', questionIndex: 0 },
  { id: 5, type: 'pyramid', pyramid: 'GROWTH_RISK' },
  { id: 6, type: 'trap', name: 'Piège' },
  { id: 7, type: 'pyramid', pyramid: 'PROBLEM_RENT' },
  { id: 8, type: 'chance', name: 'Chance' },
  { id: 9, type: 'pyramid', pyramid: 'HYBRID_TRANSITION' },
  { id: 10, type: 'question', questionIndex: 1 },
  { id: 11, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION' },
  { id: 12, type: 'bonus', name: 'Bonus' },
  { id: 13, type: 'pyramid', pyramid: 'COMPETENCE_TRUST' },
  { id: 14, type: 'trap', name: 'Piège' },
  { id: 15, type: 'pyramid', pyramid: 'STABILITY_REDIS' },
  { id: 16, type: 'question', questionIndex: 2 },
  { id: 17, type: 'pyramid', pyramid: 'GROWTH_RISK' },
  { id: 18, type: 'chance', name: 'Chance' },
  { id: 19, type: 'pyramid', pyramid: 'PROBLEM_RENT' },
  { id: 20, type: 'question', questionIndex: 3 },
  { id: 21, type: 'pyramid', pyramid: 'HYBRID_TRANSITION' },
  { id: 22, type: 'bonus', name: 'Bonus' },
  { id: 23, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION' },
  { id: 24, type: 'finish', name: 'Arrivée' },
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

export default function PyramidQuiz() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<GameMode>(null);
  
  // Online quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<PyramidType, number>>(createEmptyScores());
  const [quizResult, setQuizResult] = useState<PyramidType | null>(null);

  // Single player board state
  const [playerPosition, setPlayerPosition] = useState(0);
  const [boardScores, setBoardScores] = useState<Record<PyramidType, number>>(createEmptyScores());
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [boardQuestion, setBoardQuestion] = useState<number | null>(null);
  const [boardResult, setBoardResult] = useState<PyramidType | null>(null);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const [diceRotation, setDiceRotation] = useState(0);
  
  // Multiplayer state
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerCount, setPlayerCount] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [multiplayerQuestion, setMultiplayerQuestion] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const diceRef = useRef<HTMLButtonElement>(null);

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

  // Enhanced dice rolling with 3D-like animation
  const rollDice = () => {
    if (isRolling || playerPosition >= 24) return;
    
    setIsRolling(true);
    setGameMessage('');
    
    // Start rotation animation
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
        
        // Animate movement step by step
        animateMovement(playerPosition, Math.min(playerPosition + finalValue, 24));
      }
    }, 80);
  };

  // Animated movement from one position to another
  const animateMovement = (from: number, to: number) => {
    if (from >= to) {
      handleBoardSquare(to);
      return;
    }
    
    setIsMoving(true);
    let currentPos = from;
    
    const moveInterval = setInterval(() => {
      currentPos++;
      setPlayerPosition(currentPos);
      
      if (currentPos >= to) {
        clearInterval(moveInterval);
        setIsMoving(false);
        handleBoardSquare(to);
      }
    }, 300);
  };

  const handleBoardSquare = (position: number) => {
    const square = BOARD_SQUARES[position];
    
    if (square.type === 'pyramid' && square.pyramid) {
      const newScores = { ...boardScores };
      newScores[square.pyramid as PyramidType] += 2;
      setBoardScores(newScores);
      setGameMessage(t('pyramidQuiz.board.landedPyramid', { type: t(`pyramids.${square.pyramid.toLowerCase().replace('_', '')}.label`) }));
    } else if (square.type === 'question' && square.questionIndex !== undefined) {
      setBoardQuestion(square.questionIndex);
    } else if (square.type === 'chance') {
      const pyramidTypes: PyramidType[] = ['PROBLEM_RENT', 'STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'];
      const randomType = pyramidTypes[Math.floor(Math.random() * pyramidTypes.length)];
      const newScores = { ...boardScores };
      newScores[randomType] += 3;
      setBoardScores(newScores);
      setGameMessage(t('pyramidQuiz.board.chanceCard', { type: t(`pyramids.${randomType.toLowerCase().replace('_', '')}.label`) }));
    } else if (square.type === 'trap') {
      const maxType = Object.entries(boardScores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as PyramidType;
      const newScores = { ...boardScores };
      newScores[maxType] = Math.max(0, newScores[maxType] - 2);
      setBoardScores(newScores);
      setGameMessage(t('pyramidQuiz.board.trap'));
    } else if (square.type === 'bonus') {
      const newScores = { ...boardScores };
      Object.keys(newScores).forEach(type => {
        newScores[type as PyramidType] += 1;
      });
      setBoardScores(newScores);
      setGameMessage(t('pyramidQuiz.board.bonus'));
    } else if (square.type === 'finish') {
      const result = Object.entries(boardScores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as PyramidType;
      setBoardResult(result);
    }
  };

  const handleBoardAnswer = (optionScores: Partial<Record<PyramidType, number>>) => {
    const newScores = { ...boardScores };
    Object.entries(optionScores).forEach(([type, score]) => {
      newScores[type as PyramidType] += score || 0;
    });
    setBoardScores(newScores);
    setBoardQuestion(null);
    setGameMessage(t('pyramidQuiz.board.answeredQuestion'));
  };

  // Multiplayer functions
  const startMultiplayerGame = () => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: `${t('pyramidQuiz.multiplayer.player')} ${i + 1}`,
        position: 0,
        scores: createEmptyScores(),
        color: PLAYER_COLORS[i].bg,
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameStarted(true);
    setGameFinished(false);
  };

  const rollDiceMultiplayer = () => {
    if (isRolling || isMoving) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.position >= 24) return;
    
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
        
        const newPosition = Math.min(currentPlayer.position + finalValue, 24);
        animateMultiplayerMovement(currentPlayerIndex, currentPlayer.position, newPosition);
      }
    }, 80);
  };

  const animateMultiplayerMovement = (playerIdx: number, from: number, to: number) => {
    if (from >= to) {
      handleMultiplayerSquare(playerIdx, to);
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
        handleMultiplayerSquare(playerIdx, to);
      }
    }, 300);
  };

  const handleMultiplayerSquare = (playerIdx: number, position: number) => {
    const square = BOARD_SQUARES[position];
    const player = players[playerIdx];
    
    if (square.type === 'pyramid' && square.pyramid) {
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        const newScores = { ...p.scores };
        newScores[square.pyramid as PyramidType] += 2;
        return { ...p, scores: newScores };
      }));
      setGameMessage(t('pyramidQuiz.board.landedPyramid', { type: t(`pyramids.${square.pyramid.toLowerCase().replace('_', '')}.label`) }));
      setTimeout(nextPlayer, 1500);
    } else if (square.type === 'question' && square.questionIndex !== undefined) {
      setMultiplayerQuestion(square.questionIndex);
    } else if (square.type === 'chance') {
      const pyramidTypes: PyramidType[] = ['PROBLEM_RENT', 'STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'];
      const randomType = pyramidTypes[Math.floor(Math.random() * pyramidTypes.length)];
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        const newScores = { ...p.scores };
        newScores[randomType] += 3;
        return { ...p, scores: newScores };
      }));
      setGameMessage(t('pyramidQuiz.board.chanceCard', { type: t(`pyramids.${randomType.toLowerCase().replace('_', '')}.label`) }));
      setTimeout(nextPlayer, 1500);
    } else if (square.type === 'trap') {
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        const maxType = Object.entries(p.scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as PyramidType;
        const newScores = { ...p.scores };
        newScores[maxType] = Math.max(0, newScores[maxType] - 2);
        return { ...p, scores: newScores };
      }));
      setGameMessage(t('pyramidQuiz.board.trap'));
      setTimeout(nextPlayer, 1500);
    } else if (square.type === 'bonus') {
      setPlayers(prev => prev.map((p, idx) => {
        if (idx !== playerIdx) return p;
        const newScores = { ...p.scores };
        Object.keys(newScores).forEach(type => {
          newScores[type as PyramidType] += 1;
        });
        return { ...p, scores: newScores };
      }));
      setGameMessage(t('pyramidQuiz.board.bonus'));
      setTimeout(nextPlayer, 1500);
    } else if (square.type === 'finish') {
      const result = Object.entries(player.scores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as PyramidType;
      setPlayers(prev => prev.map((p, idx) => 
        idx === playerIdx ? { ...p, result } : p
      ));
      
      // Check if all players finished
      const updatedPlayers = players.map((p, idx) => 
        idx === playerIdx ? { ...p, result, position } : p
      );
      if (updatedPlayers.every(p => p.position >= 24)) {
        setGameFinished(true);
      } else {
        setTimeout(nextPlayer, 1500);
      }
    } else {
      setTimeout(nextPlayer, 1000);
    }
  };

  const handleMultiplayerAnswer = (optionScores: Partial<Record<PyramidType, number>>) => {
    setPlayers(prev => prev.map((p, idx) => {
      if (idx !== currentPlayerIndex) return p;
      const newScores = { ...p.scores };
      Object.entries(optionScores).forEach(([type, score]) => {
        newScores[type as PyramidType] += score || 0;
      });
      return { ...p, scores: newScores };
    }));
    setMultiplayerQuestion(null);
    setGameMessage(t('pyramidQuiz.board.answeredQuestion'));
    setTimeout(nextPlayer, 1000);
  };

  const nextPlayer = () => {
    // Find next player who hasn't finished
    let nextIdx = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;
    while (players[nextIdx]?.position >= 24 && attempts < players.length) {
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

  const resetGame = () => {
    setCurrentQuestion(0);
    setScores(createEmptyScores());
    setQuizResult(null);
    setPlayerPosition(0);
    setBoardScores(createEmptyScores());
    setDiceValue(null);
    setBoardQuestion(null);
    setBoardResult(null);
    setGameMessage('');
    setMode(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setGameStarted(false);
    setMultiplayerQuestion(null);
    setGameFinished(false);
    setIsMoving(false);
    setDiceRotation(0);
  };

  // Mode selection
  if (!mode) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-4xl font-bold mb-4">{t('pyramidQuiz.title')}</h1>
            <p className="text-xl text-muted-foreground">{t('pyramidQuiz.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Online Quiz Mode */}
            <button
              onClick={() => setMode('online')}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Gamepad2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('pyramidQuiz.modes.online.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('pyramidQuiz.modes.online.description')}</p>
              <div className="flex items-center gap-2 text-primary font-medium">
                {t('pyramidQuiz.modes.online.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>

            {/* Board Game Mode */}
            <button
              onClick={() => setMode('board')}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <LayoutGrid className="w-8 h-8 text-accent-foreground" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('pyramidQuiz.modes.board.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('pyramidQuiz.modes.board.description')}</p>
              <div className="flex items-center gap-2 text-primary font-medium">
                {t('pyramidQuiz.modes.board.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>

            {/* Multiplayer Mode */}
            <button
              onClick={() => setMode('multiplayer')}
              className="glass-card rounded-2xl p-8 text-left hover:border-primary/50 hover:scale-105 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
                  <UserPlus className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="font-display text-xl font-semibold">{t('pyramidQuiz.modes.multiplayer.title')}</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">{t('pyramidQuiz.modes.multiplayer.description')}</p>
              <div className="flex items-center gap-2 text-primary font-medium">
                {t('pyramidQuiz.modes.multiplayer.cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>
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

          {/* Back button */}
          <Button onClick={resetGame} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('pyramidQuiz.back')}
          </Button>
        </div>
      </div>
    );
  }

  // Board Game Mode
  if (mode === 'board') {
    const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;

    if (boardResult) {
      const info = PYRAMID_TYPE_INFO[boardResult];
      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12 animate-scale-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">{t('pyramidQuiz.board.victory')}</h1>
            </div>

            <div className={cn(
              "glass-card rounded-2xl p-8 mb-8 border-2 animate-fade-in",
              PYRAMID_COLORS[boardResult]
            )}>
              <h2 className="font-display text-2xl font-bold mb-4">{info.label}</h2>
              <p className="text-muted-foreground">{info.description}</p>
            </div>

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

    // Board question modal
    if (boardQuestion !== null) {
      const question = QUIZ_QUESTIONS[boardQuestion];
      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
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
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-bold mb-2">{t('pyramidQuiz.modes.board.title')}</h1>
            <p className="text-muted-foreground">{t('pyramidQuiz.board.instructions')}</p>
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-5 md:grid-cols-7 gap-2 mb-8">
            {BOARD_SQUARES.map((square, index) => {
              const isPlayer = playerPosition === index;
              let squareClass = "aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs p-1 relative transition-all duration-300";
              
              if (square.type === 'start') squareClass += " bg-green-500/20 border-green-500";
              else if (square.type === 'finish') squareClass += " bg-yellow-500/20 border-yellow-500";
              else if (square.type === 'pyramid') squareClass += ` ${PYRAMID_COLORS[square.pyramid as PyramidType]}`;
              else if (square.type === 'chance') squareClass += " bg-blue-500/20 border-blue-500";
              else if (square.type === 'trap') squareClass += " bg-red-500/20 border-red-500";
              else if (square.type === 'bonus') squareClass += " bg-emerald-500/20 border-emerald-500";
              else if (square.type === 'question') squareClass += " bg-purple-500/20 border-purple-500";
              
              if (isPlayer) squareClass += " ring-4 ring-primary/50 scale-110";
              
              return (
                <div key={index} className={squareClass}>
                  <span className="text-[10px] opacity-60">{index}</span>
                  {square.type === 'pyramid' && (
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {PYRAMID_TYPE_INFO[square.pyramid as PyramidType].label.split(' ')[0]}
                    </span>
                  )}
                  {square.name && <span className="text-[10px] font-medium">{square.name}</span>}
                  {square.type === 'question' && <span className="text-lg">❓</span>}
                  {isPlayer && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50",
                        isMoving && "animate-bounce"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Game Message */}
          {gameMessage && (
            <div className="glass-card rounded-lg p-4 mb-6 text-center animate-fade-in">
              <p className="font-medium">{gameMessage}</p>
            </div>
          )}

          {/* Dice and Controls */}
          <div className="flex flex-col items-center gap-6">
            <button
              ref={diceRef}
              onClick={rollDice}
              disabled={isRolling || playerPosition >= 24 || isMoving}
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

            {/* Scores */}
            <div className="w-full max-w-md space-y-2">
              {Object.entries(boardScores)
                .filter(([, score]) => score > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([type, score]) => (
                  <div key={type} className="flex items-center gap-4 animate-fade-in">
                    <span className="text-sm w-32">{PYRAMID_TYPE_INFO[type as PyramidType].label}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", PYRAMID_COLORS[type as PyramidType].split(' ')[0])}
                        style={{ width: `${(score / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono w-6">{score}</span>
                  </div>
                ))}
            </div>
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

  // Multiplayer Mode
  if (mode === 'multiplayer') {
    // Setup screen
    if (!gameStarted) {
      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-md">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="font-display text-3xl font-bold mb-4">{t('pyramidQuiz.modes.multiplayer.title')}</h1>
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

              <Button onClick={startMultiplayerGame} className="w-full gap-2">
                {t('pyramidQuiz.multiplayer.startGame')}
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

    // Game finished screen
    if (gameFinished) {
      const sortedPlayers = [...players].sort((a, b) => {
        const aMax = Math.max(...Object.values(a.scores));
        const bMax = Math.max(...Object.values(b.scores));
        return bMax - aMax;
      });

      return (
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12 animate-scale-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 text-yellow-500 mb-6">
                <Crown className="w-10 h-10 animate-bounce" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">{t('pyramidQuiz.multiplayer.gameOver')}</h1>
            </div>

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
                  </div>
                  {player.result && (
                    <div className={cn("rounded-lg p-3", PYRAMID_COLORS[player.result])}>
                      <span className="font-medium">{PYRAMID_TYPE_INFO[player.result].label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

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

    // Multiplayer question
    if (multiplayerQuestion !== null) {
      const question = QUIZ_QUESTIONS[multiplayerQuestion];
      const currentPlayer = players[currentPlayerIndex];
      
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
                    onClick={() => handleMultiplayerAnswer(option.scores)}
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

    const DiceIcon = diceValue ? DICE_ICONS[diceValue - 1] : Dice1;
    const currentPlayer = players[currentPlayerIndex];

    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Current Player Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
            <div className={cn("w-8 h-8 rounded-full animate-pulse", currentPlayer?.color)} />
            <span className="font-display text-2xl font-bold">{currentPlayer?.name}</span>
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
                <span className="text-xs text-muted-foreground">#{player.position}</span>
              </div>
            ))}
          </div>

          {/* Game Board with multiple players */}
          <div className="grid grid-cols-5 md:grid-cols-7 gap-2 mb-8">
            {BOARD_SQUARES.map((square, index) => {
              const playersOnSquare = players.filter(p => p.position === index);
              let squareClass = "aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs p-1 relative transition-all duration-300";
              
              if (square.type === 'start') squareClass += " bg-green-500/20 border-green-500";
              else if (square.type === 'finish') squareClass += " bg-yellow-500/20 border-yellow-500";
              else if (square.type === 'pyramid') squareClass += ` ${PYRAMID_COLORS[square.pyramid as PyramidType]}`;
              else if (square.type === 'chance') squareClass += " bg-blue-500/20 border-blue-500";
              else if (square.type === 'trap') squareClass += " bg-red-500/20 border-red-500";
              else if (square.type === 'bonus') squareClass += " bg-emerald-500/20 border-emerald-500";
              else if (square.type === 'question') squareClass += " bg-purple-500/20 border-purple-500";
              
              if (playersOnSquare.length > 0) squareClass += " ring-2 ring-white/30";
              
              return (
                <div key={index} className={squareClass}>
                  <span className="text-[10px] opacity-60">{index}</span>
                  {square.type === 'pyramid' && (
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {PYRAMID_TYPE_INFO[square.pyramid as PyramidType].label.split(' ')[0]}
                    </span>
                  )}
                  {square.name && <span className="text-[10px] font-medium">{square.name}</span>}
                  {square.type === 'question' && <span className="text-lg">❓</span>}
                  
                  {/* Player tokens */}
                  {playersOnSquare.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {playersOnSquare.map(player => (
                          <div 
                            key={player.id} 
                            className={cn(
                              "w-4 h-4 rounded-full shadow-lg transition-all duration-300",
                              player.color,
                              player.id === currentPlayer?.id && isMoving && "animate-bounce"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Game Message */}
          {gameMessage && (
            <div className="glass-card rounded-lg p-4 mb-6 text-center animate-fade-in">
              <p className="font-medium">{gameMessage}</p>
            </div>
          )}

          {/* Dice */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={rollDiceMultiplayer}
              disabled={isRolling || isMoving}
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

  return null;
}
