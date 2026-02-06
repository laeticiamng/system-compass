/**
 * SecuritySettings - User security preferences
 * Manage 2FA, password changes, security alerts, and account deletion
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteAccountSection } from './DeleteAccountSection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key,
  Bell,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecuritySettingsProps {
  twoFactorEnabled?: boolean;
  emailAlertsEnabled?: boolean;
  loginNotificationsEnabled?: boolean;
  lastPasswordChange?: string;
  onToggle2FA?: (enabled: boolean) => Promise<void>;
  onToggleEmailAlerts?: (enabled: boolean) => Promise<void>;
  onToggleLoginNotifications?: (enabled: boolean) => Promise<void>;
  onChangePassword?: () => void;
}

export function SecuritySettings({
  twoFactorEnabled = false,
  emailAlertsEnabled = true,
  loginNotificationsEnabled = true,
  lastPasswordChange,
  onToggle2FA,
  onToggleEmailAlerts,
  onToggleLoginNotifications,
  onChangePassword
}: SecuritySettingsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleToggle = async (
    setting: string, 
    value: boolean, 
    handler?: (v: boolean) => Promise<void>
  ) => {
    if (!handler) return;
    
    setLoading(setting);
    try {
      await handler(value);
      toast({
        title: t('settings.security.settingUpdated', 'Paramètre mis à jour'),
        description: `${setting} ${value ? t('settings.security.enabled', 'activé') : t('settings.security.disabled', 'désactivé')}.`,
      });
    } catch {
      toast({
        title: t('common.error', 'Erreur'),
        description: t('settings.security.updateError', 'Impossible de mettre à jour le paramètre.'),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const daysSincePasswordChange = lastPasswordChange
    ? Math.floor((Date.now() - new Date(lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const passwordNeedsUpdate = daysSincePasswordChange && daysSincePasswordChange > 90;

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Mot de passe
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mot de passe actuel</p>
              {lastPasswordChange ? (
                <p className="text-sm text-muted-foreground">
                  Modifié il y a {daysSincePasswordChange} jours
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Date de modification inconnue
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {passwordNeedsUpdate ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  À mettre à jour
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  OK
                </Badge>
              )}
              <Button variant="outline" onClick={onChangePassword}>
                Modifier
              </Button>
            </div>
          </div>

          {passwordNeedsUpdate && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              Votre mot de passe n'a pas été changé depuis plus de 90 jours. 
              Nous recommandons de le mettre à jour régulièrement.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Authentification à deux facteurs
          </CardTitle>
          <CardDescription>
            Ajoutez une couche de sécurité supplémentaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="2fa" className="font-medium">
                Activer la 2FA
              </Label>
              <p className="text-sm text-muted-foreground">
                Utilisez une application d'authentification
              </p>
            </div>
            <Switch
              id="2fa"
              checked={twoFactorEnabled}
              onCheckedChange={(v) => handleToggle('2FA', v, onToggle2FA)}
              disabled={loading === '2FA'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alertes de sécurité
          </CardTitle>
          <CardDescription>
            Configurez vos notifications de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-alerts" className="font-medium">
                Alertes par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevez un email pour les activités suspectes
              </p>
            </div>
            <Switch
              id="email-alerts"
              checked={emailAlertsEnabled}
              onCheckedChange={(v) => handleToggle('Alertes email', v, onToggleEmailAlerts)}
              disabled={loading === 'Alertes email'}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="login-notifs" className="font-medium">
                Notifications de connexion
              </Label>
              <p className="text-sm text-muted-foreground">
                Soyez averti de chaque nouvelle connexion
              </p>
            </div>
            <Switch
              id="login-notifs"
              checked={loginNotificationsEnabled}
              onCheckedChange={(v) => handleToggle('Notifications connexion', v, onToggleLoginNotifications)}
              disabled={loading === 'Notifications connexion'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-2">Conseils de sécurité</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Utilisez un mot de passe unique d'au moins 12 caractères</li>
                <li>Activez l'authentification à deux facteurs</li>
                <li>Vérifiez régulièrement vos sessions actives</li>
                <li>Ne partagez jamais vos identifiants</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Account Deletion - RGPD Art. 17 */}
      <DeleteAccountSection />
    </div>
  );
}
