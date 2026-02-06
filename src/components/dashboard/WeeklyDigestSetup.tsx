// Dashboard Weekly Digest Setup Component
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Mail, Calendar, Bell, Clock, CheckCircle, 
  Loader2, Settings, Send, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DigestSettings {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number; // 0-6, Sunday = 0
  timeOfDay: string; // HH:MM
  includeModules: {
    exitKeys: boolean;
    cases: boolean;
    latent: boolean;
    irreversa: boolean;
    risks: boolean;
    deadlines: boolean;
    analytics: boolean;
  };
}

const DEFAULT_SETTINGS: DigestSettings = {
  enabled: false,
  frequency: 'weekly',
  dayOfWeek: 1, // Monday
  timeOfDay: '09:00',
  includeModules: {
    exitKeys: true,
    cases: true,
    latent: true,
    irreversa: true,
    risks: true,
    deadlines: true,
    analytics: false,
  },
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function WeeklyDigestSetup() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [settings, setSettings] = useState<DigestSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('weekly_digest, deadline_reminder_days')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.weekly_digest) {
          setSettings(prev => ({
            ...prev,
            enabled: true,
          }));
        }
      } catch (error) {
        console.error('Failed to load digest settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error(t('dashboard.digest.loginRequired', 'Please log in to save settings'));
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          weekly_digest: settings.enabled,
          email_enabled: settings.enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast.success(t('dashboard.digest.saved', 'Digest settings saved'));
    } catch (error) {
      console.error('Failed to save digest settings:', error);
      toast.error(t('dashboard.digest.saveFailed', 'Failed to save settings'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) {
      toast.error(t('dashboard.digest.noEmail', 'No email address found'));
      return;
    }

    toast.info(t('dashboard.digest.testSent', 'Test digest will be sent to {{email}}', { email: user.email }));
  };

  const updateModule = (module: keyof DigestSettings['includeModules'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      includeModules: {
        ...prev.includeModules,
        [module]: value,
      },
    }));
  };

  const moduleLabels: Record<keyof DigestSettings['includeModules'], string> = {
    exitKeys: t('dashboard.digest.modules.exitKeys', 'Progression Stratégies'),
    cases: t('dashboard.digest.modules.cases', 'Active Cases'),
    latent: t('dashboard.digest.modules.latent', 'Latent Zones'),
    irreversa: t('dashboard.digest.modules.irreversa', 'Irreversa Thresholds'),
    risks: t('dashboard.digest.modules.risks', 'Risk Alerts'),
    deadlines: t('dashboard.digest.modules.deadlines', 'Upcoming Deadlines'),
    analytics: t('dashboard.digest.modules.analytics', 'Usage Analytics'),
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Mail className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            {t('dashboard.digest.loginRequired', 'Please log in to configure weekly digest')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t('dashboard.digest.title', 'Weekly Digest')}
          </CardTitle>
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled 
              ? t('dashboard.digest.active', 'Active') 
              : t('dashboard.digest.inactive', 'Inactive')
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{t('dashboard.digest.enable', 'Enable Weekly Digest')}</p>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.digest.enableDesc', 'Receive a summary of your activity by email')}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('dashboard.digest.schedule', 'Schedule')}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('dashboard.digest.frequency', 'Frequency')}</Label>
                  <Select
                    value={settings.frequency}
                    onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => 
                      setSettings(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{t('dashboard.digest.weekly', 'Weekly')}</SelectItem>
                      <SelectItem value="biweekly">{t('dashboard.digest.biweekly', 'Every 2 weeks')}</SelectItem>
                      <SelectItem value="monthly">{t('dashboard.digest.monthly', 'Monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('dashboard.digest.dayOfWeek', 'Day')}</Label>
                  <Select
                    value={settings.dayOfWeek.toString()}
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, dayOfWeek: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {t(`common.days.${day.label.toLowerCase()}`, day.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t('dashboard.digest.nextDelivery', 'Next delivery')}: 
                <span className="font-medium text-foreground">
                  {getNextDeliveryDate(settings)}
                </span>
              </div>
            </div>

            {/* Module Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('dashboard.digest.includeModules', 'Include in Digest')}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(settings.includeModules) as Array<keyof DigestSettings['includeModules']>).map(
                  (module) => (
                    <div key={module} className="flex items-center space-x-2">
                      <Checkbox
                        id={`module-${module}`}
                        checked={settings.includeModules[module]}
                        onCheckedChange={(checked) => updateModule(module, !!checked)}
                      />
                      <Label htmlFor={`module-${module}`} className="text-sm cursor-pointer">
                        {moduleLabels[module]}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Email preview */}
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('dashboard.digest.sendTo', 'Will be sent to')}: 
                <span className="font-medium text-foreground">{user.email}</span>
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {t('dashboard.digest.save', 'Save Settings')}
          </Button>
          
          {settings.enabled && (
            <Button variant="outline" onClick={handleTestEmail} className="gap-2">
              <Send className="w-4 h-4" />
              {t('dashboard.digest.test', 'Test')}
            </Button>
          )}
        </div>

        {/* Warning about email not being sent yet */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {t('dashboard.digest.betaWarning', 'Email delivery is in beta. Settings are saved but emails may not be sent yet.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getNextDeliveryDate(settings: DigestSettings): string {
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntilNext = settings.dayOfWeek - currentDay;
  
  if (daysUntilNext <= 0) {
    daysUntilNext += 7;
  }
  
  if (settings.frequency === 'biweekly') {
    daysUntilNext += 7;
  } else if (settings.frequency === 'monthly') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  const nextDate = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
  return nextDate.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
