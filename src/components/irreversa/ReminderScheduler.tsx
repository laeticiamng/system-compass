// Irreversa Reminder Scheduler Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, Calendar, Clock, CheckCircle, AlertTriangle, 
  Loader2, RefreshCw, Mail, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addWeeks, addMonths } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface ReminderSchedule {
  id: string;
  thresholdId: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  enabled: boolean;
  lastSent?: string;
  nextScheduled: string;
  message?: string;
  channels: {
    email: boolean;
    inApp: boolean;
  };
}

interface ReminderSchedulerProps {
  thresholdId: string;
  thresholdTitle: string;
  sealedAt?: string;
  onScheduleUpdate?: (schedule: ReminderSchedule) => void;
}

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'biweekly', label: 'Every 2 weeks', days: 14 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
] as const;

export function ReminderScheduler({ 
  thresholdId, 
  thresholdTitle,
  sealedAt,
  onScheduleUpdate 
}: ReminderSchedulerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;
  
  const [schedule, setSchedule] = useState<ReminderSchedule>({
    id: `reminder-${thresholdId}`,
    thresholdId,
    frequency: 'monthly',
    enabled: false,
    nextScheduled: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    channels: {
      email: true,
      inApp: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const calculateNextDate = (frequency: typeof FREQUENCIES[number]['value']): Date => {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return addWeeks(now, 1);
      case 'biweekly':
        return addWeeks(now, 2);
      case 'monthly':
        return addMonths(now, 1);
      case 'quarterly':
        return addMonths(now, 3);
    }
  };

  const handleFrequencyChange = (frequency: typeof FREQUENCIES[number]['value']) => {
    const nextDate = calculateNextDate(frequency);
    setSchedule(prev => ({
      ...prev,
      frequency,
      nextScheduled: format(nextDate, 'yyyy-MM-dd'),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedSchedule = {
        ...schedule,
        message: customMessage || undefined,
      };
      
      onScheduleUpdate?.(updatedSchedule);
      toast.success(t('irreversa.reminder.saved', 'Reminder schedule saved'));
    } catch (error) {
      toast.error(t('irreversa.reminder.saveFailed', 'Failed to save reminder'));
    } finally {
      setIsSaving(false);
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const frequency = FREQUENCIES.find(f => f.value === freq);
    return frequency ? t(`irreversa.reminder.frequency.${freq}`, frequency.label) : freq;
  };

  const daysSinceSealed = sealedAt 
    ? Math.floor((new Date().getTime() - new Date(sealedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t('irreversa.reminder.title', 'Periodic Check-in')}
          </CardTitle>
          <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
            {schedule.enabled 
              ? t('irreversa.reminder.active', 'Active')
              : t('irreversa.reminder.inactive', 'Inactive')
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Threshold Info */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium truncate">{thresholdTitle}</p>
          {sealedAt && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {t('irreversa.reminder.sealedAgo', 'Sealed {{days}} days ago', { days: daysSinceSealed })}
            </p>
          )}
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="reminder-enabled">{t('irreversa.reminder.enable', 'Enable reminders')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('irreversa.reminder.enableDesc', 'Periodic prompts to review consequences')}
            </p>
          </div>
          <Switch
            id="reminder-enabled"
            checked={schedule.enabled}
            onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, enabled: checked }))}
          />
        </div>

        {schedule.enabled && (
          <>
            {/* Frequency */}
            <div className="space-y-2">
              <Label>{t('irreversa.reminder.frequencyLabel', 'Reminder frequency')}</Label>
              <Select
                value={schedule.frequency}
                onValueChange={handleFrequencyChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {t(`irreversa.reminder.frequency.${freq.value}`, freq.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <Label>{t('irreversa.reminder.channels', 'Notification channels')}</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="channel-email"
                    checked={schedule.channels.email}
                    onCheckedChange={(checked) => 
                      setSchedule(prev => ({ 
                        ...prev, 
                        channels: { ...prev.channels, email: checked } 
                      }))
                    }
                  />
                  <Label htmlFor="channel-email" className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="channel-inapp"
                    checked={schedule.channels.inApp}
                    onCheckedChange={(checked) => 
                      setSchedule(prev => ({ 
                        ...prev, 
                        channels: { ...prev.channels, inApp: checked } 
                      }))
                    }
                  />
                  <Label htmlFor="channel-inapp" className="text-sm flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {t('irreversa.reminder.inApp', 'In-app')}
                  </Label>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label>{t('irreversa.reminder.customMessage', 'Custom reminder message (optional)')}</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t('irreversa.reminder.messagePlaceholder', 'What questions should you ask yourself?')}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Next scheduled */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {t('irreversa.reminder.nextReminder', 'Next reminder')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(schedule.nextScheduled), 'PPPP', { locale })}
                  </p>
                </div>
              </div>
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </div>
          </>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {t('irreversa.reminder.save', 'Save Schedule')}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <AlertTriangle className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {t('irreversa.reminder.info', 'Periodic reminders help you track the long-term consequences of irreversible decisions and validate your initial assessment.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
