/**
 * PushNotificationToggle - UI component for enabling/disabling push notifications
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, BellRing, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PushNotificationToggleProps {
  compact?: boolean;
  className?: string;
}

export function PushNotificationToggle({ compact = false, className }: PushNotificationToggleProps) {
  const { t } = useTranslation();
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
            <p className="text-sm font-medium">{t('pushToggle.notSupported', 'Notifications non supportées')}</p>
            <p className="text-xs text-muted-foreground">
              {t('pushToggle.notSupportedDesc', 'Votre navigateur ne supporte pas les notifications push')}
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
          <span className="text-sm">{t('pushToggle.label', 'Notifications push')}</span>
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
              <CardTitle className="text-base">{t('pushToggle.title', 'Notifications Push')}</CardTitle>
              <CardDescription className="text-sm">
                {t('pushToggle.description', 'Recevez des alertes pour les événements importants')}
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
              {t('pushToggle.granted', 'Autorisées')}
            </Badge>
          ) : permission === 'denied' ? (
            <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
              <XCircle className="w-3 h-3" />
              {t('pushToggle.denied', 'Bloquées')}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              {t('pushToggle.notConfigured', 'Non configurées')}
            </Badge>
          )}
        </div>

        {/* Notification Types */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('pushToggle.notifiedFor', 'Vous serez notifié pour :')}
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {t('pushToggle.communityReminders', "Rappels d'événements communautaires")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {t('pushToggle.deadlines', "Échéances de votre plan d'action")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {t('pushToggle.expertMessages', "Nouveaux messages d'experts")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {t('pushToggle.countryAlerts', 'Alertes pays personnalisées')}
            </li>
          </ul>
        </div>

        {/* Action Button for denied permission */}
        {permission === 'denied' && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-sm text-muted-foreground mb-2">
              {t('pushToggle.blockedInstructions', 'Les notifications sont bloquées. Pour les réactiver :')}
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>{t('pushToggle.step1', "Cliquez sur l'icône 🔒 dans la barre d'adresse")}</li>
              <li>{t('pushToggle.step2', 'Trouvez "Notifications"')}</li>
              <li>{t('pushToggle.step3', 'Changez en "Autoriser"')}</li>
              <li>{t('pushToggle.step4', 'Rechargez la page')}</li>
            </ol>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('pushToggle.loading', 'Chargement...')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
