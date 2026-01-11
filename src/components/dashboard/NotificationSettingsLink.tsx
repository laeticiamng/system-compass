import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

interface NotificationSettingsLinkProps {
  variant?: 'button' | 'icon' | 'card';
}

export function NotificationSettingsLink({ variant = 'button' }: NotificationSettingsLinkProps) {
  const { t } = useTranslation();
  const { settings, isLoggedIn } = useNotificationSettings();

  // Count active notification channels
  const activeChannels = [
    settings?.email_enabled,
    settings?.push_enabled,
    settings?.slack_webhook_url
  ].filter(Boolean).length;

  if (variant === 'icon') {
    return (
      <Link to="/settings/notifications" title={t('notifications.title', 'Paramètres de notifications')}>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {isLoggedIn && activeChannels > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
              {activeChannels}
            </span>
          )}
        </Button>
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <Link to="/settings/notifications" className="block">
        <div className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{t('notifications.title', 'Notifications')}</h4>
              <p className="text-sm text-muted-foreground">
                {activeChannels > 0 
                  ? t('notifications.activeChannels', '{{count}} canaux actifs', { count: activeChannels })
                  : t('notifications.noChannels', 'Aucun canal configuré')
                }
              </p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/settings/notifications">
      <Button variant="outline" size="sm" className="gap-2">
        <Bell className="w-4 h-4" />
        {t('notifications.settings', 'Notifications')}
        {isLoggedIn && activeChannels > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeChannels}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
