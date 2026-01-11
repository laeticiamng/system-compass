import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  ChevronLeft,
  Save,
  Loader2,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    settings, 
    loading, 
    saving, 
    updateSettings, 
    requestPushPermission,
    refetch,
    isLoggedIn 
  } = useNotificationSettings();

  const [localSettings, setLocalSettings] = useState({
    email_enabled: settings?.email_enabled ?? true,
    push_enabled: settings?.push_enabled ?? false,
    slack_webhook_url: settings?.slack_webhook_url ?? '',
    deadline_reminder_days: settings?.deadline_reminder_days ?? 3,
    weekly_digest: settings?.weekly_digest ?? true,
  });

  // Sync local state when settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        email_enabled: settings.email_enabled ?? true,
        push_enabled: settings.push_enabled ?? false,
        slack_webhook_url: settings.slack_webhook_url ?? '',
        deadline_reminder_days: settings.deadline_reminder_days ?? 3,
        weekly_digest: settings.weekly_digest ?? true,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const success = await updateSettings(localSettings);
    if (success) {
      await refetch();
      toast.success(t('notifications.saved', 'Paramètres sauvegardés'));
    } else {
      toast.error(t('notifications.error', 'Erreur lors de la sauvegarde'));
    }
  };

  const handleEnablePush = async () => {
    const success = await requestPushPermission();
    if (success) {
      setLocalSettings(prev => ({ ...prev, push_enabled: true }));
      toast.success(t('notifications.pushEnabled', 'Notifications push activées'));
    } else {
      toast.error(t('notifications.pushDenied', 'Permission refusée'));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {t('notifications.loginRequired', 'Connectez-vous pour gérer vos notifications')}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Link to="/auth">
              <Button>{t('common.signIn', 'Se connecter')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            {t('notifications.title', 'Paramètres de notifications')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('notifications.subtitle', 'Gérez comment et quand vous recevez des alertes')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t('notifications.email.title', 'Notifications par email')}
              </CardTitle>
              <CardDescription>
                {t('notifications.email.description', 'Recevez des rappels par email')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('notifications.email.enable', 'Activer les emails')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <Switch
                  checked={localSettings.email_enabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, email_enabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('notifications.digest.title', 'Digest hebdomadaire')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.digest.description', 'Résumé de votre progression chaque semaine')}
                  </p>
                </div>
                <Switch
                  checked={localSettings.weekly_digest}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, weekly_digest: checked }))
                  }
                  disabled={!localSettings.email_enabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                {t('notifications.push.title', 'Notifications push')}
              </CardTitle>
              <CardDescription>
                {t('notifications.push.description', 'Alertes en temps réel dans le navigateur')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('notifications.push.enable', 'Activer les push')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {localSettings.push_enabled 
                      ? t('notifications.push.enabled', 'Activées')
                      : t('notifications.push.disabled', 'Désactivées')
                    }
                  </p>
                </div>
                {localSettings.push_enabled ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-600/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('common.active', 'Actif')}
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEnablePush}>
                    {t('notifications.push.activate', 'Activer')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deadline Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('notifications.deadlines.title', 'Rappels d\'échéances')}
              </CardTitle>
              <CardDescription>
                {t('notifications.deadlines.description', 'Quand recevoir les rappels avant une échéance')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label className="flex-1">
                  {t('notifications.deadlines.daysBefore', 'Jours avant l\'échéance')}
                </Label>
                <Select
                  value={String(localSettings.deadline_reminder_days)}
                  onValueChange={(value) => 
                    setLocalSettings(prev => ({ ...prev, deadline_reminder_days: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 {t('common.day', 'jour')}</SelectItem>
                    <SelectItem value="2">2 {t('common.days', 'jours')}</SelectItem>
                    <SelectItem value="3">3 {t('common.days', 'jours')}</SelectItem>
                    <SelectItem value="5">5 {t('common.days', 'jours')}</SelectItem>
                    <SelectItem value="7">7 {t('common.days', 'jours')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('notifications.slack.title', 'Intégration Slack')}
                <Badge variant="secondary" className="text-xs">
                  {t('common.optional', 'Optionnel')}
                </Badge>
              </CardTitle>
              <CardDescription>
                {t('notifications.slack.description', 'Recevez des notifications dans un canal Slack')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">
                  {t('notifications.slack.webhookUrl', 'URL du Webhook')}
                </Label>
                <Input
                  id="slack-webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={localSettings.slack_webhook_url}
                  onChange={(e) => 
                    setLocalSettings(prev => ({ ...prev, slack_webhook_url: e.target.value }))
                  }
                />
              </div>
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  {t('notifications.slack.help', 'Créez un webhook entrant dans les paramètres de votre espace Slack pour obtenir l\'URL.')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Link to="/dashboard">
              <Button variant="outline">
                {t('common.cancel', 'Annuler')}
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('common.save', 'Sauvegarder')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
