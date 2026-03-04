import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Send,
  Loader2,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeeklyDigestData {
  tasksCompleted: number;
  tasksTotal: number;
  upcomingDeadlines: number;
  risksIdentified: number;
  progressPercentage: number;
  highlights: string[];
}

interface WeeklyDigestGeneratorProps {
  digestData?: WeeklyDigestData;
}

export function WeeklyDigestGenerator({ digestData }: WeeklyDigestGeneratorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { settings, updateSettings } = useNotificationSettings();
  const [sending, setSending] = useState(false);
  const [digestDay, setDigestDay] = useState('monday');

  const defaultData: WeeklyDigestData = {
    tasksCompleted: 5,
    tasksTotal: 12,
    upcomingDeadlines: 3,
    risksIdentified: 2,
    progressPercentage: 42,
    highlights: [
      'Profil stratégique complété',
      'Nouveau pays ajouté à la comparaison',
      'Première zone latente documentée'
    ]
  };

  const data = digestData || defaultData;

  const handleToggleDigest = async (enabled: boolean) => {
    await updateSettings({ weekly_digest: enabled });
    toast.success(enabled 
      ? t('dashboard.digest.enabled', 'Synthèse hebdomadaire activée')
      : t('dashboard.digest.disabled', 'Synthèse hebdomadaire désactivée')
    );
  };

  const handleSendTestDigest = async () => {
    if (!user?.email) {
      toast.error(t('dashboard.digest.noEmail', 'Aucun email configuré'));
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('weekly-digest', {
        body: {
          userId: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || '',
          isTest: true,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const stats = data?.stats;
      toast.success(
        t('dashboard.digest.testSent', 'Synthèse envoyée à {{email}}', { email: user.email }),
        {
          description: stats
            ? `${stats.geoAlerts} alertes · ${stats.regChanges} changements · ${stats.watchedCountries} pays suivis`
            : undefined,
        }
      );
    } catch (error) {
      console.error('[WeeklyDigest] Error:', error);
      toast.error(t('dashboard.digest.error', "Erreur lors de l'envoi"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t('dashboard.digest.title', 'Synthèse Hebdomadaire')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.digest.description', 'Recevez un résumé de votre progression chaque semaine')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="weekly-digest"
              checked={settings?.weekly_digest ?? false}
              onCheckedChange={handleToggleDigest}
            />
            <Label htmlFor="weekly-digest" className="text-sm">
              {settings?.weekly_digest 
                ? t('dashboard.digest.active', 'Actif')
                : t('dashboard.digest.inactive', 'Inactif')
              }
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('dashboard.digest.preview', 'Aperçu de la prochaine synthèse')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-background">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-xl font-bold">{data.tasksCompleted}/{data.tasksTotal}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.digest.tasks', 'Tâches')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-xl font-bold">{data.upcomingDeadlines}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.digest.deadlines', 'Échéances')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="text-xl font-bold">{data.risksIdentified}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.digest.risks', 'Risques')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold">{data.progressPercentage}%</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.digest.progress', 'Progrès')}</div>
            </div>
          </div>

          {data.highlights.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t('dashboard.digest.highlights', 'Points clés :')}</p>
              <div className="flex flex-wrap gap-2">
                {data.highlights.map((highlight, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{t('dashboard.digest.sendDay', 'Jour d\'envoi :')}</span>
            <Select value={digestDay} onValueChange={setDigestDay}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">{t('days.monday', 'Lundi')}</SelectItem>
                <SelectItem value="tuesday">{t('days.tuesday', 'Mardi')}</SelectItem>
                <SelectItem value="wednesday">{t('days.wednesday', 'Mercredi')}</SelectItem>
                <SelectItem value="thursday">{t('days.thursday', 'Jeudi')}</SelectItem>
                <SelectItem value="friday">{t('days.friday', 'Vendredi')}</SelectItem>
                <SelectItem value="saturday">{t('days.saturday', 'Samedi')}</SelectItem>
                <SelectItem value="sunday">{t('days.sunday', 'Dimanche')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTestDigest}
            disabled={sending || !user?.email}
            className="gap-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {t('dashboard.digest.sendTest', 'Envoyer un test')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
