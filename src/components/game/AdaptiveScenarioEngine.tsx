import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Target,
  Brain, 
  Award,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface ScenarioEvent {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'economic' | 'political' | 'social' | 'personal';
  choices: {
    id: string;
    label: string;
    outcome: {
      wealth: number;
      health: number;
      network: number;
      stress: number;
    };
    feedback: string;
  }[];
}

interface PlayerStats {
  level: number;
  experience: number;
  correctDecisions: number;
  totalDecisions: number;
  preferredCategories: string[];
}

const SCENARIOS: Record<string, ScenarioEvent[]> = {
  easy: [
    {
      id: 'eco-1',
      title: 'Opportunité d\'investissement',
      description: 'Un ami vous propose d\'investir dans sa startup. L\'idée semble prometteuse mais risquée.',
      difficulty: 'easy',
      category: 'economic',
      choices: [
        {
          id: 'invest',
          label: 'Investir 10% de vos économies',
          outcome: { wealth: -10, health: 0, network: 5, stress: 5 },
          feedback: 'Prise de risque calculée. Le réseau s\'élargit.',
        },
        {
          id: 'decline',
          label: 'Refuser poliment',
          outcome: { wealth: 0, health: 0, network: -2, stress: 0 },
          feedback: 'Prudence avant tout. Légère tension relationnelle.',
        },
        {
          id: 'negotiate',
          label: 'Proposer un montant plus petit',
          outcome: { wealth: -3, health: 0, network: 3, stress: 2 },
          feedback: 'Compromis intelligent. Relation préservée.',
        },
      ],
    },
  ],
  medium: [
    {
      id: 'pol-1',
      title: 'Changement réglementaire',
      description: 'Une nouvelle loi affecte votre activité professionnelle. Vous devez vous adapter.',
      difficulty: 'medium',
      category: 'political',
      choices: [
        {
          id: 'adapt-fast',
          label: 'S\'adapter immédiatement',
          outcome: { wealth: -15, health: -5, network: 0, stress: 10 },
          feedback: 'Conformité rapide mais coûteuse.',
        },
        {
          id: 'wait',
          label: 'Attendre des clarifications',
          outcome: { wealth: 0, health: 0, network: 0, stress: 5 },
          feedback: 'Position attentiste. Risque de retard.',
        },
        {
          id: 'lobby',
          label: 'Rejoindre un groupe de pression',
          outcome: { wealth: -5, health: 0, network: 10, stress: 3 },
          feedback: 'Action collective. Réseau étendu.',
        },
      ],
    },
  ],
  hard: [
    {
      id: 'social-1',
      title: 'Dilemme éthique',
      description: 'Vous découvrez une irrégularité dans votre entreprise. Que faites-vous ?',
      difficulty: 'hard',
      category: 'social',
      choices: [
        {
          id: 'report',
          label: 'Signaler aux autorités',
          outcome: { wealth: -20, health: -10, network: -15, stress: 25 },
          feedback: 'Courage éthique. Conséquences lourdes.',
        },
        {
          id: 'internal',
          label: 'Escalader en interne',
          outcome: { wealth: -5, health: -5, network: 5, stress: 15 },
          feedback: 'Approche diplomatique. Résultat incertain.',
        },
        {
          id: 'ignore',
          label: 'Ne rien faire',
          outcome: { wealth: 5, health: -15, network: 0, stress: 20 },
          feedback: 'Court terme préservé. Poids sur la conscience.',
        },
      ],
    },
  ],
  expert: [
    {
      id: 'personal-1',
      title: 'Crossroads international',
      description: 'Trois opportunités s\'offrent à vous : poste senior dans un pays instable, création d\'entreprise locale, ou retour au pays.',
      difficulty: 'expert',
      category: 'personal',
      choices: [
        {
          id: 'unstable',
          label: 'Accepter le poste risqué',
          outcome: { wealth: 30, health: -15, network: 20, stress: 25 },
          feedback: 'Haut risque, haute récompense.',
        },
        {
          id: 'entrepreneur',
          label: 'Lancer l\'entreprise',
          outcome: { wealth: -20, health: -10, network: 15, stress: 30 },
          feedback: 'Liberté et incertitude.',
        },
        {
          id: 'return',
          label: 'Rentrer au pays',
          outcome: { wealth: 0, health: 10, network: -10, stress: -15 },
          feedback: 'Stabilité retrouvée.',
        },
      ],
    },
  ],
};

interface AdaptiveScenarioEngineProps {
  onComplete?: (stats: PlayerStats) => void;
}

export function AdaptiveScenarioEngine({ onComplete }: AdaptiveScenarioEngineProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlayerStats>({
    level: 1,
    experience: 0,
    correctDecisions: 0,
    totalDecisions: 0,
    preferredCategories: [],
  });
  
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('easy');
  const [currentScenario, setCurrentScenario] = useState<ScenarioEvent | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const experienceToNextLevel = stats.level * 100;
  const progressPercent = (stats.experience / experienceToNextLevel) * 100;

  useEffect(() => {
    selectNextScenario();
  }, []);

  const selectNextScenario = () => {
    const scenarios = SCENARIOS[currentDifficulty] || SCENARIOS.easy;
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setCurrentScenario(scenarios[randomIndex]);
    setFeedback(null);
  };

  const handleChoice = (choiceId: string) => {
    if (!currentScenario) return;

    const choice = currentScenario.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // Calculate experience based on difficulty
    const expGain = {
      easy: 20,
      medium: 40,
      hard: 70,
      expert: 100,
    }[currentScenario.difficulty];

    const newExp = stats.experience + expGain;
    let newLevel = stats.level;
    let remainingExp = newExp;

    // Level up logic
    while (remainingExp >= newLevel * 100) {
      remainingExp -= newLevel * 100;
      newLevel++;
    }

    // Adjust difficulty based on level
    let newDifficulty = currentDifficulty;
    if (newLevel >= 5 && currentDifficulty !== 'expert') {
      newDifficulty = 'expert';
    } else if (newLevel >= 3 && currentDifficulty === 'easy') {
      newDifficulty = 'medium';
    } else if (newLevel >= 4 && currentDifficulty === 'medium') {
      newDifficulty = 'hard';
    }

    setStats({
      ...stats,
      level: newLevel,
      experience: remainingExp,
      totalDecisions: stats.totalDecisions + 1,
      correctDecisions: choice.outcome.wealth > 0 ? stats.correctDecisions + 1 : stats.correctDecisions,
      preferredCategories: [...stats.preferredCategories, currentScenario.category].slice(-10),
    });

    setCurrentDifficulty(newDifficulty);
    setFeedback(choice.feedback);

    // Check for game completion
    if (stats.totalDecisions >= 9) {
      setGameComplete(true);
      onComplete?.(stats);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      case 'hard': return 'bg-orange-500/10 text-orange-700 border-orange-500/30';
      case 'expert': return 'bg-red-500/10 text-red-700 border-red-500/30';
      default: return '';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'economic': return '💰';
      case 'political': return '🏛️';
      case 'social': return '👥';
      case 'personal': return '🎯';
      default: return '❓';
    }
  };

  if (gameComplete) {
    return (
      <Card className="border-primary/30">
        <CardHeader className="text-center bg-primary/5">
          <Award className="w-16 h-16 mx-auto text-primary mb-4" />
          <CardTitle>{t('game.adaptive.complete', 'Session terminée !')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold text-primary">{stats.level}</div>
              <div className="text-sm text-muted-foreground">{t('game.adaptive.finalLevel', 'Niveau final')}</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {Math.round((stats.correctDecisions / stats.totalDecisions) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">{t('game.adaptive.accuracy', 'Précision')}</div>
            </div>
          </div>
          
          <Button onClick={() => {
            setStats({ level: 1, experience: 0, correctDecisions: 0, totalDecisions: 0, preferredCategories: [] });
            setCurrentDifficulty('easy');
            setGameComplete(false);
            selectNextScenario();
          }} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            {t('game.adaptive.playAgain', 'Rejouer')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {t('game.adaptive.title', 'Scénarios adaptatifs')}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getDifficultyColor(currentDifficulty)}>
              {currentDifficulty.toUpperCase()}
            </Badge>
            <Badge className="bg-primary">
              Nv. {stats.level}
            </Badge>
          </div>
        </div>
        
        {/* Experience bar */}
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('game.adaptive.experience', 'Expérience')}</span>
            <span>{stats.experience} / {experienceToNextLevel}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentScenario && !feedback && (
          <>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getCategoryIcon(currentScenario.category)}</span>
                <span className="font-medium">{currentScenario.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentScenario.description}
              </p>
            </div>

            <div className="space-y-2">
              {currentScenario.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => handleChoice(choice.id)}
                >
                  <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-left">{choice.label}</span>
                </Button>
              ))}
            </div>
          </>
        )}

        {feedback && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-medium">{t('game.adaptive.feedback', 'Retour')}</span>
              </div>
              <p className="text-sm">{feedback}</p>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('game.adaptive.progress', 'Progression')}: {stats.totalDecisions}/10</span>
              <span>{t('game.adaptive.accuracy', 'Précision')}: {stats.totalDecisions > 0 ? Math.round((stats.correctDecisions / stats.totalDecisions) * 100) : 0}%</span>
            </div>

            <Button onClick={selectNextScenario} className="w-full gap-2">
              <Target className="w-4 h-4" />
              {t('game.adaptive.next', 'Scénario suivant')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
