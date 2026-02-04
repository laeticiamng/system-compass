import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, Calendar, CheckCircle, Clock, Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format, addMonths, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'visa' | 'finance' | 'housing' | 'career' | 'family' | 'admin';
  targetDate: Date;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  milestones: { id: string; title: string; completed: boolean }[];
}

const CATEGORY_CONFIG = {
  visa: { label: 'Visa/Immigration', color: 'bg-blue-500', icon: '🛂' },
  finance: { label: 'Finance', color: 'bg-green-500', icon: '💰' },
  housing: { label: 'Logement', color: 'bg-purple-500', icon: '🏠' },
  career: { label: 'Carrière', color: 'bg-amber-500', icon: '💼' },
  family: { label: 'Famille', color: 'bg-pink-500', icon: '👨‍👩‍👧' },
  admin: { label: 'Administratif', color: 'bg-slate-500', icon: '📋' },
};

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Obtenir le visa D7',
    description: 'Compléter le dossier et obtenir le visa résident Portugal',
    category: 'visa',
    targetDate: addMonths(new Date(), 4),
    progress: 60,
    status: 'in_progress',
    milestones: [
      { id: 'm1', title: 'Rassembler documents', completed: true },
      { id: 'm2', title: 'Traduire documents', completed: true },
      { id: 'm3', title: 'Prendre RDV consulat', completed: true },
      { id: 'm4', title: 'Soumettre dossier', completed: false },
      { id: 'm5', title: 'Entretien', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Épargne déménagement',
    description: 'Atteindre 15 000€ pour frais de déménagement',
    category: 'finance',
    targetDate: addMonths(new Date(), 3),
    progress: 75,
    status: 'in_progress',
    milestones: [
      { id: 'm1', title: '5 000€', completed: true },
      { id: 'm2', title: '10 000€', completed: true },
      { id: 'm3', title: '15 000€', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Trouver logement Lisbonne',
    description: 'Sécuriser un appartement dans le centre',
    category: 'housing',
    targetDate: addMonths(new Date(), 5),
    progress: 25,
    status: 'in_progress',
    milestones: [
      { id: 'm1', title: 'Définir budget', completed: true },
      { id: 'm2', title: 'Identifier quartiers', completed: false },
      { id: 'm3', title: 'Visites', completed: false },
      { id: 'm4', title: 'Signer bail', completed: false },
    ],
  },
];

export function GoalTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [filter, setFilter] = useState<string>('all');

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(g => g.category === filter);

  const getStatusBadge = (status: Goal['status'], targetDate: Date) => {
    if (isPast(targetDate) && status !== 'completed') {
      return <Badge variant="destructive">En retard</Badge>;
    }
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Terminé</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">En cours</Badge>;
      case 'delayed':
        return <Badge variant="destructive">Retardé</Badge>;
      default:
        return <Badge variant="outline">Non commencé</Badge>;
    }
  };

  const getDaysRemaining = (targetDate: Date) => {
    const days = differenceInDays(targetDate, new Date());
    if (days < 0) return `${Math.abs(days)}j de retard`;
    if (days === 0) return "Aujourd'hui";
    return `${days}j restants`;
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const updatedMilestones = goal.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);
      
      return {
        ...goal,
        milestones: updatedMilestones,
        progress,
        status: progress === 100 ? 'completed' : 'in_progress',
      };
    }));
  };

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  if (!user) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Connectez-vous pour suivre vos objectifs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Suivi des Objectifs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {goals.filter(g => g.status === 'completed').length} / {goals.length} objectifs terminés
          </p>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.map(goal => {
            const config = CATEGORY_CONFIG[goal.category];
            const daysText = getDaysRemaining(goal.targetDate);
            const isOverdue = isPast(goal.targetDate) && goal.status !== 'completed';

            return (
              <div
                key={goal.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color}/10`}>
                    <span className="text-lg">{config.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      </div>
                      {getStatusBadge(goal.status, goal.targetDate)}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-1.5" />
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(goal.targetDate, 'd MMM yyyy', { locale: fr })}
                      </span>
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                        <Clock className="h-3 w-3" />
                        {daysText}
                      </span>
                    </div>

                    {/* Milestones */}
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {goal.milestones.map(milestone => (
                        <button
                          key={milestone.id}
                          onClick={() => toggleMilestone(goal.id, milestone.id)}
                          className="flex items-center gap-2 w-full text-left text-sm hover:bg-muted/50 p-1 rounded transition-colors"
                        >
                          {milestone.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )}
                          <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                            {milestone.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGoals.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Aucun objectif dans cette catégorie
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
