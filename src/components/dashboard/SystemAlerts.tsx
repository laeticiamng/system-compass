import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, Bell, CheckCircle, Clock, 
  ChevronRight, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  dismissible: boolean;
}

const MOCK_ALERTS: SystemAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Visa D7 expire bientôt',
    message: 'Votre visa D7 Portugal expire dans 45 jours. Pensez à entamer les démarches de renouvellement.',
    timestamp: new Date(Date.now() - 3600000),
    actionUrl: '/exit-keys',
    actionLabel: 'Voir mes démarches',
    dismissible: true,
  },
  {
    id: '2',
    type: 'info',
    title: 'Nouvelle réglementation fiscale',
    message: 'Le Portugal a modifié ses règles NHR. Consultez les impacts sur votre situation.',
    timestamp: new Date(Date.now() - 86400000),
    actionUrl: '/fiscal-calculator',
    actionLabel: 'Simulateur fiscal',
    dismissible: true,
  },
  {
    id: '3',
    type: 'success',
    title: 'Objectif atteint !',
    message: 'Félicitations ! Vous avez complété 75% de votre checklist déménagement.',
    timestamp: new Date(Date.now() - 7200000),
    dismissible: true,
  },
  {
    id: '4',
    type: 'error',
    title: 'Action requise',
    message: 'Votre document "Casier judiciaire" a expiré. Veuillez le mettre à jour.',
    timestamp: new Date(Date.now() - 1800000),
    actionUrl: '/dashboard',
    actionLabel: 'Mettre à jour',
    dismissible: false,
  },
];

const ALERT_CONFIG = {
  info: {
    icon: Bell,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
  },
  error: {
    icon: AlertTriangle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-500',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-500',
  },
};

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [expanded, setExpanded] = useState(false);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const displayedAlerts = expanded ? alerts : alerts.slice(0, 3);
  const hiddenCount = alerts.length - 3;

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Alertes Système
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          {alerts.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Réduire' : `+${hiddenCount} autres`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayedAlerts.map(alert => {
          const config = ALERT_CONFIG[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`
                p-3 rounded-lg border transition-all
                ${config.bgColor} ${config.borderColor}
              `}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    {alert.dismissible && (
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: fr })}
                    </span>

                    {alert.actionUrl && (
                      <Button size="sm" variant="ghost" className="h-6 text-xs" asChild>
                        <a href={alert.actionUrl}>
                          {alert.actionLabel}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
