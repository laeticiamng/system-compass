/**
 * Destination Quests - Country-specific challenges and missions
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Star, 
  CheckCircle2, 
  Trophy,
  ChevronRight,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quest {
  id: string;
  title: string;
  description: string;
  countryId: string;
  countryName: string;
  countryFlag: string;
  xpReward: number;
  badgeReward?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  steps: QuestStep[];
  timeLimit?: string; // e.g., "7 days"
  participants?: number;
}

interface QuestStep {
  id: string;
  title: string;
  description: string;
  type: 'explore' | 'compare' | 'calculator' | 'quiz' | 'community' | 'expert';
  completed: boolean;
}

const DESTINATION_QUESTS: Quest[] = [
  {
    id: 'portugal-explorer',
    title: 'Explorateur du Portugal',
    description: 'Découvrez tout sur le régime NHR et la vie au Portugal',
    countryId: 'portugal',
    countryName: 'Portugal',
    countryFlag: '🇵🇹',
    xpReward: 500,
    badgeReward: 'portugal-expert',
    difficulty: 'medium',
    timeLimit: '14 jours',
    participants: 234,
    steps: [
      { id: 'pt-1', title: 'Lire la fiche pays', description: 'Explorez la page complète du Portugal', type: 'explore', completed: false },
      { id: 'pt-2', title: 'Simuler votre salaire', description: 'Utilisez le calculateur fiscal pour le Portugal', type: 'calculator', completed: false },
      { id: 'pt-3', title: 'Comparer avec la France', description: 'Faites une comparaison Portugal vs France', type: 'compare', completed: false },
      { id: 'pt-4', title: 'Quiz régime NHR', description: 'Testez vos connaissances sur le NHR', type: 'quiz', completed: false },
      { id: 'pt-5', title: 'Rejoindre la communauté', description: 'Rejoignez le channel Discord Portugal', type: 'community', completed: false },
    ],
  },
  {
    id: 'switzerland-master',
    title: 'Maître de la Suisse',
    description: 'Maîtrisez la fiscalité et les permis suisses',
    countryId: 'switzerland',
    countryName: 'Suisse',
    countryFlag: '🇨🇭',
    xpReward: 750,
    badgeReward: 'switzerland-expert',
    difficulty: 'hard',
    timeLimit: '21 jours',
    participants: 156,
    steps: [
      { id: 'ch-1', title: 'Étudier les cantons', description: 'Comprenez les différences fiscales par canton', type: 'explore', completed: false },
      { id: 'ch-2', title: 'Simulation multi-cantons', description: 'Comparez Zurich, Genève et Zoug', type: 'calculator', completed: false },
      { id: 'ch-3', title: 'Comprendre les permis', description: 'Lisez le guide des permis B, C, L', type: 'explore', completed: false },
      { id: 'ch-4', title: 'Consulter un expert', description: 'Prenez contact avec un expert Suisse', type: 'expert', completed: false },
      { id: 'ch-5', title: 'Quiz permis suisses', description: 'Validez vos connaissances', type: 'quiz', completed: false },
      { id: 'ch-6', title: 'Créer votre Exit Key', description: 'Finalisez votre stratégie Suisse', type: 'explore', completed: false },
    ],
  },
  {
    id: 'uae-nomad',
    title: 'Nomade des Émirats',
    description: 'Découvrez la vie sans impôt à Dubaï',
    countryId: 'uae',
    countryName: 'Émirats Arabes Unis',
    countryFlag: '🇦🇪',
    xpReward: 600,
    badgeReward: 'dubai-expert',
    difficulty: 'medium',
    participants: 412,
    steps: [
      { id: 'ae-1', title: 'Découvrir Dubaï', description: 'Lisez la fiche complète Émirats', type: 'explore', completed: false },
      { id: 'ae-2', title: 'Simuler 0% impôt', description: 'Calculez votre net sans impôt', type: 'calculator', completed: false },
      { id: 'ae-3', title: 'Comprendre les coûts', description: 'Analysez le coût de vie réel', type: 'explore', completed: false },
      { id: 'ae-4', title: 'Quiz visa Émirats', description: 'Testez vos connaissances visa', type: 'quiz', completed: false },
    ],
  },
  {
    id: 'spain-beckham',
    title: 'Loi Beckham Décryptée',
    description: 'Comprenez et optimisez avec le régime Beckham',
    countryId: 'spain',
    countryName: 'Espagne',
    countryFlag: '🇪🇸',
    xpReward: 550,
    difficulty: 'medium',
    participants: 189,
    steps: [
      { id: 'es-1', title: 'Comprendre Beckham', description: 'Lisez le guide complet loi Beckham', type: 'explore', completed: false },
      { id: 'es-2', title: 'Éligibilité', description: 'Vérifiez si vous êtes éligible', type: 'quiz', completed: false },
      { id: 'es-3', title: 'Simulation fiscale', description: 'Calculez votre taux effectif', type: 'calculator', completed: false },
      { id: 'es-4', title: 'Comparer régimes', description: 'Beckham vs régime normal', type: 'compare', completed: false },
    ],
  },
];

const WEEKLY_DESTINATION_CHALLENGES = [
  {
    id: 'weekly-asia',
    title: 'Semaine Asie',
    description: 'Explorez 3 pays asiatiques',
    countries: ['🇸🇬 Singapour', '🇹🇭 Thaïlande', '🇯🇵 Japon'],
    xpReward: 200,
    endDate: 'Dimanche 23:59',
    progress: 1,
    total: 3,
  },
  {
    id: 'weekly-tax-haven',
    title: 'Paradis fiscaux',
    description: 'Comparez 3 pays à fiscalité avantageuse',
    countries: ['🇦🇪 EAU', '🇲🇨 Monaco', '🇨🇭 Suisse'],
    xpReward: 250,
    endDate: 'Dimanche 23:59',
    progress: 0,
    total: 3,
  },
];

export function DestinationQuests() {
  const { t } = useTranslation();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeQuests, setActiveQuests] = useState<string[]>(['portugal-explorer']); // Mock active quests

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-500';
      case 'medium': return 'bg-amber-500/20 text-amber-500';
      case 'hard': return 'bg-orange-500/20 text-orange-500';
      case 'expert': return 'bg-red-500/20 text-red-500';
    }
  };

  const getQuestProgress = (quest: Quest) => {
    const completed = quest.steps.filter(s => s.completed).length;
    return { completed, total: quest.steps.length, percentage: (completed / quest.steps.length) * 100 };
  };

  const handleStartQuest = (quest: Quest) => {
    if (!activeQuests.includes(quest.id)) {
      setActiveQuests([...activeQuests, quest.id]);
    }
    setSelectedQuest(quest);
  };

  return (
    <div className="space-y-6">
      {/* Weekly Challenges */}
      <Card className="glass-card bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('gamification.weeklyDestination', 'Défis destination de la semaine')}
          </CardTitle>
          <CardDescription>
            Relevez ces défis avant dimanche pour gagner des XP bonus !
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {WEEKLY_DESTINATION_CHALLENGES.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 rounded-lg bg-background/50 border border-border"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="secondary">
                  +{challenge.xpReward} XP
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {challenge.countries.map((country, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {country}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{challenge.progress}/{challenge.total} pays</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {challenge.endDate}
                  </span>
                </div>
                <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Destination Quests Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {DESTINATION_QUESTS.map((quest) => {
          const progress = getQuestProgress(quest);
          const isActive = activeQuests.includes(quest.id);
          
          return (
            <Card
              key={quest.id}
              className={cn(
                "glass-card cursor-pointer transition-all hover:shadow-lg",
                isActive && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedQuest(quest)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{quest.countryFlag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{quest.title}</h3>
                      {isActive && (
                        <Badge className="bg-primary/20 text-primary text-xs">
                          En cours
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {quest.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={cn("text-xs", getDifficultyColor(quest.difficulty))}>
                        {quest.difficulty === 'easy' ? 'Facile' :
                         quest.difficulty === 'medium' ? 'Moyen' :
                         quest.difficulty === 'hard' ? 'Difficile' : 'Expert'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        +{quest.xpReward} XP
                      </Badge>
                      {quest.badgeReward && (
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          Badge
                        </Badge>
                      )}
                      {quest.participants && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {quest.participants}
                        </Badge>
                      )}
                    </div>

                    {isActive && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{progress.completed}/{progress.total} étapes</span>
                          <span>{progress.percentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress.percentage} className="h-2" />
                      </div>
                    )}

                    {!isActive && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartQuest(quest);
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Démarrer la quête
                      </Button>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <Card className="glass-card-elevated mt-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{selectedQuest.countryFlag}</div>
              <div>
                <CardTitle>{selectedQuest.title}</CardTitle>
                <CardDescription>{selectedQuest.description}</CardDescription>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge className={getDifficultyColor(selectedQuest.difficulty)}>
                  {selectedQuest.difficulty}
                </Badge>
                <Badge variant="secondary">
                  +{selectedQuest.xpReward} XP
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedQuest.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-all",
                    step.completed 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-secondary/30 border-border"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    step.completed 
                      ? "bg-emerald-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {!step.completed && (
                    <Button size="sm">
                      Faire
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setSelectedQuest(null)}>
                Fermer
              </Button>
              {!activeQuests.includes(selectedQuest.id) && (
                <Button onClick={() => handleStartQuest(selectedQuest)}>
                  <Target className="h-4 w-4 mr-2" />
                  Commencer cette quête
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
