/**
 * Push Notification Manager - Request permission and manage push subscriptions
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Globe,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: 'essential' | 'updates' | 'marketing';
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  {
    id: 'threshold-alerts',
    label: 'Alertes seuils Irreversa',
    description: 'Notifications lors de l\'approche de seuils critiques',
    enabled: true,
    category: 'essential',
  },
  {
    id: 'challenge-complete',
    label: 'Défis complétés',
    description: 'Notification quand vous terminez un défi',
    enabled: true,
    category: 'updates',
  },
  {
    id: 'badge-unlock',
    label: 'Badges débloqués',
    description: 'Notification lors du déblocage d\'un badge',
    enabled: true,
    category: 'updates',
  },
  {
    id: 'expert-response',
    label: 'Réponses experts',
    description: 'Quand un expert répond à votre demande',
    enabled: true,
    category: 'essential',
  },
  {
    id: 'weekly-digest',
    label: 'Résumé hebdomadaire',
    description: 'Synthèse de votre activité chaque semaine',
    enabled: false,
    category: 'updates',
  },
  {
    id: 'country-updates',
    label: 'Mises à jour pays',
    description: 'Changements fiscaux/visa pour vos pays favoris',
    enabled: true,
    category: 'essential',
  },
  {
    id: 'community-mentions',
    label: 'Mentions communauté',
    description: 'Quand on vous mentionne sur le forum',
    enabled: true,
    category: 'updates',
  },
  {
    id: 'promotions',
    label: 'Offres et promotions',
    description: 'Réductions et offres exclusives',
    enabled: false,
    category: 'marketing',
  },
];

type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

function getPermissionStatus(): PermissionStatus {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as PermissionStatus;
}

export function PushNotificationManager() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('default');
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_PREFERENCES);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setPermissionStatus(getPermissionStatus());
    
    // Load saved preferences
    const saved = localStorage.getItem('push-notification-prefs');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }

    // Check if subscribed
    const subscribed = localStorage.getItem('push-subscribed') === 'true';
    setIsSubscribed(subscribed);
  }, []);

  const savePreferences = useCallback((newPrefs: NotificationPreference[]) => {
    setPreferences(newPrefs);
    localStorage.setItem('push-notification-prefs', JSON.stringify(newPrefs));
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Les notifications ne sont pas supportées par votre navigateur');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result as PermissionStatus);

      if (result === 'granted') {
        setIsSubscribed(true);
        localStorage.setItem('push-subscribed', 'true');
        toast.success('Notifications activées !');

        // Show test notification
        new Notification('System Compass', {
          body: 'Les notifications sont maintenant activées !',
          icon: '/favicon.ico',
        });
      } else if (result === 'denied') {
        toast.error('Notifications refusées. Vous pouvez les réactiver dans les paramètres du navigateur.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erreur lors de la demande de permission');
    }
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    localStorage.setItem('push-subscribed', 'false');
    toast.success('Notifications désactivées');
  };

  const handleTogglePreference = (prefId: string) => {
    const updated = preferences.map(p =>
      p.id === prefId ? { ...p, enabled: !p.enabled } : p
    );
    savePreferences(updated);
  };

  const handleEnableAll = (category: 'essential' | 'updates' | 'marketing') => {
    const updated = preferences.map(p =>
      p.category === category ? { ...p, enabled: true } : p
    );
    savePreferences(updated);
    toast.success('Préférences mises à jour');
  };

  const essentialPrefs = preferences.filter(p => p.category === 'essential');
  const updatePrefs = preferences.filter(p => p.category === 'updates');
  const marketingPrefs = preferences.filter(p => p.category === 'marketing');

  const StatusBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Activées
          </Badge>
        );
      case 'denied':
        return (
          <Badge className="bg-red-500/20 text-red-400">
            <BellOff className="h-3 w-3 mr-1" />
            Bloquées
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Non supportées
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Bell className="h-3 w-3 mr-1" />
            Non configurées
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={cn(
        'glass-card',
        permissionStatus === 'granted' && 'border-emerald-500/30',
        permissionStatus === 'denied' && 'border-red-500/30'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-xl',
                permissionStatus === 'granted' ? 'bg-emerald-500/10' :
                permissionStatus === 'denied' ? 'bg-red-500/10' : 'bg-secondary'
              )}>
                {permissionStatus === 'granted' ? (
                  <BellRing className="h-6 w-6 text-emerald-500" />
                ) : permissionStatus === 'denied' ? (
                  <BellOff className="h-6 w-6 text-red-500" />
                ) : (
                  <Bell className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle>Notifications Push</CardTitle>
                <CardDescription>
                  Recevez des alertes même quand l'app est fermée
                </CardDescription>
              </div>
            </div>
            <StatusBadge />
          </div>
        </CardHeader>
        <CardContent>
          {permissionStatus === 'default' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Activez les notifications push pour ne rien manquer : alertes de seuils, 
                défis complétés, réponses d'experts...
              </p>
              <Button onClick={handleRequestPermission} className="w-full gap-2">
                <Bell className="h-4 w-4" />
                Activer les notifications
              </Button>
            </div>
          )}

          {permissionStatus === 'granted' && isSubscribed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Notifications actives sur cet appareil</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleUnsubscribe}>
                Désactiver
              </Button>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="p-4 bg-red-500/10 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Notifications bloquées</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous avez bloqué les notifications. Pour les réactiver, accédez aux 
                    paramètres de votre navigateur et autorisez les notifications pour ce site.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences - only show if granted */}
      {permissionStatus === 'granted' && (
        <>
          {/* Essential Notifications */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Notifications essentielles
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEnableAll('essential')}
                >
                  Tout activer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {essentialPrefs.map(pref => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={pref.id}>{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => handleTogglePreference(pref.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Update Notifications */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Mises à jour & activité
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEnableAll('updates')}
                >
                  Tout activer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {updatePrefs.map(pref => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={pref.id}>{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => handleTogglePreference(pref.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Marketing Notifications */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Offres & promotions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketingPrefs.map(pref => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={pref.id}>{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => handleTogglePreference(pref.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
