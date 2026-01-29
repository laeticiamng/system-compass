/**
 * Tax Calendar Widget - Important tax deadlines and reminders
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaxDeadline {
  id: string;
  title: string;
  date: Date;
  country: string;
  type: 'declaration' | 'payment' | 'document' | 'registration';
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

interface TaxCalendarWidgetProps {
  deadlines?: TaxDeadline[];
  onToggleComplete?: (id: string) => void;
  onSetReminder?: (id: string) => void;
}

const DEFAULT_DEADLINES: TaxDeadline[] = [
  {
    id: '1',
    title: 'Déclaration de revenus',
    date: new Date(new Date().getFullYear(), 4, 25), // May 25
    country: 'FR',
    type: 'declaration',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Paiement acompte IS',
    date: new Date(new Date().getFullYear(), 2, 15), // March 15
    country: 'FR',
    type: 'payment',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Déclaration TVA',
    date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20),
    country: 'FR',
    type: 'declaration',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Mise à jour registre bénéficiaires',
    date: new Date(new Date().getFullYear(), 11, 31), // December 31
    country: 'FR',
    type: 'document',
    priority: 'low',
  },
];

const typeConfig = {
  declaration: { label: 'Déclaration', color: 'bg-blue-500/20 text-blue-500' },
  payment: { label: 'Paiement', color: 'bg-red-500/20 text-red-500' },
  document: { label: 'Document', color: 'bg-amber-500/20 text-amber-500' },
  registration: { label: 'Enregistrement', color: 'bg-purple-500/20 text-purple-500' },
};

const priorityConfig = {
  high: { icon: AlertTriangle, color: 'text-red-500' },
  medium: { icon: Clock, color: 'text-amber-500' },
  low: { icon: Clock, color: 'text-muted-foreground' },
};

export function TaxCalendarWidget({ 
  deadlines = DEFAULT_DEADLINES,
  onToggleComplete,
  onSetReminder,
}: TaxCalendarWidgetProps) {
  const now = new Date();
  
  // Sort by date and filter upcoming
  const upcomingDeadlines = [...deadlines]
    .filter(d => !d.completed && d.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const getDaysUntil = (date: Date): number => {
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Échéances fiscales
          </div>
          <Badge variant="outline" className="gap-1">
            {upcomingDeadlines.length} à venir
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <p>Toutes les échéances sont à jour !</p>
          </div>
        ) : (
          upcomingDeadlines.map((deadline, index) => {
            const daysUntil = getDaysUntil(deadline.date);
            const PriorityIcon = priorityConfig[deadline.priority].icon;
            const isUrgent = daysUntil <= 7;

            return (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${
                  isUrgent 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-secondary/30 border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityIcon className={`w-4 h-4 ${priorityConfig[deadline.priority].color}`} />
                      <span className="font-medium text-sm">{deadline.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={typeConfig[deadline.type].color}>
                        {typeConfig[deadline.type].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(deadline.date)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isUrgent ? 'text-red-500' : ''}`}>
                      {daysUntil === 0 
                        ? 'Aujourd\'hui !' 
                        : daysUntil === 1 
                          ? 'Demain' 
                          : `${daysUntil} jours`}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {onSetReminder && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onSetReminder(deadline.id)}
                        >
                          <Bell className="w-3 h-3" />
                        </Button>
                      )}
                      {onToggleComplete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onToggleComplete(deadline.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
