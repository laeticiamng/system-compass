/**
 * PushNotificationToggle - UI component for enabling/disabling push notifications
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, BellRing, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

interface PushNotificationToggleProps {
  compact?: boolean;
  className?: string;
}

export function PushNotificationToggle({ compact = false, className }: PushNotificationToggleProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    if (compact) return null;
    
    return (
      <Card className={cn('border-muted', className)}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <BellOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Notifications non supportées</p>
            <p className="text-xs text-muted-foreground">
              Votre navigateur ne supporte pas les notifications push
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="w-4 h-4 text-primary" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm">Notifications push</span>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading || permission === 'denied'}
        />
      </div>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              isSubscribed ? 'bg-primary/10' : 'bg-muted'
            )}>
              {isSubscribed ? (
                <BellRing className="w-5 h-5 text-primary" />
              ) : (
                <Bell className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Notifications Push</CardTitle>
              <CardDescription className="text-sm">
                Recevez des alertes pour les événements importants
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Permission Status */}
        <div className="flex items-center gap-2 mb-4">
          {permission === 'granted' ? (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-600/30">
              <CheckCircle2 className="w-3 h-3" />
              Autorisées
            </Badge>
          ) : permission === 'denied' ? (
            <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
              <XCircle className="w-3 h-3" />
              Bloquées
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              Non configurées
            </Badge>
          )}
        </div>

        {/* Notification Types */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Vous serez notifié pour :
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Rappels d'événements communautaires
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Échéances de votre plan d'action
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Nouveaux messages d'experts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Alertes pays personnalisées
            </li>
          </ul>
        </div>

        {/* Action Button for denied permission */}
        {permission === 'denied' && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-sm text-muted-foreground mb-2">
              Les notifications sont bloquées. Pour les réactiver :
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Cliquez sur l'icône 🔒 dans la barre d'adresse</li>
              <li>Trouvez "Notifications"</li>
              <li>Changez en "Autoriser"</li>
              <li>Rechargez la page</li>
            </ol>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
