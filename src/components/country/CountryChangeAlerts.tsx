// Country Governance Change Alerts Component
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Bell, BellOff, Globe, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GovernanceChange {
  id: string;
  countryId: string;
  countryName: string;
  changeType: 'political' | 'economic' | 'legal' | 'social';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  detectedAt: string;
  source: string;
  isRead: boolean;
}

interface CountryChangeAlertsProps {
  countryId?: string;
  onAlertClick?: (alert: GovernanceChange) => void;
}

export function CountryChangeAlerts({ countryId, onAlertClick }: CountryChangeAlertsProps) {
  const { t } = useTranslation();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  
  // Mock data - would come from a real-time monitoring service
  const [alerts] = useState<GovernanceChange[]>([
    {
      id: '1',
      countryId: 'fr',
      countryName: 'France',
      changeType: 'legal',
      severity: 'medium',
      title: 'Réforme fiscale pour les non-résidents',
      description: 'Nouvelles règles de taxation pour les revenus de source française des non-résidents.',
      impact: 'Augmentation potentielle de 5-15% sur les revenus immobiliers.',
      detectedAt: new Date(Date.now() - 86400000).toISOString(),
      source: 'Journal Officiel',
      isRead: false,
    },
    {
      id: '2',
      countryId: 'de',
      countryName: 'Allemagne',
      changeType: 'political',
      severity: 'low',
      title: 'Élections régionales en Bavière',
      description: 'Changement de majorité au parlement régional.',
      impact: 'Impact limité sur les politiques fédérales.',
      detectedAt: new Date(Date.now() - 172800000).toISOString(),
      source: 'Reuters',
      isRead: true,
    },
    {
      id: '3',
      countryId: 'ch',
      countryName: 'Suisse',
      changeType: 'economic',
      severity: 'high',
      title: 'Hausse du taux directeur BNS',
      description: 'La Banque Nationale Suisse augmente son taux de 0.25%.',
      impact: 'Impact sur les prêts hypothécaires et le coût du crédit.',
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      source: 'BNS',
      isRead: false,
    },
  ]);

  const filteredAlerts = alerts.filter(alert => {
    if (countryId && alert.countryId !== countryId) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'political': return <Globe className="h-4 w-4" />;
      case 'economic': return <TrendingUp className="h-4 w-4" />;
      case 'legal': return <AlertCircle className="h-4 w-4" />;
      case 'social': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return t('common.justNow', 'À l\'instant');
    if (diffHours < 24) return t('common.hoursAgo', '{{count}}h', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('common.daysAgo', '{{count}}j', { count: diffDays });
  }, [t]);

  const unreadCount = filteredAlerts.filter(a => !a.isRead).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          {alertsEnabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {t('country.alerts.title', 'Alertes Gouvernance')}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="alerts-toggle" className="text-sm">
              {t('country.alerts.enabled', 'Activer')}
            </Label>
            <Switch
              id="alerts-toggle"
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Severity Filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
            <Button
              key={severity}
              variant={filterSeverity === severity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity(severity)}
            >
              {severity === 'all' ? t('common.all', 'Tous') : t(`severity.${severity}`, severity)}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        {!alertsEnabled ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('country.alerts.disabled', 'Les alertes sont désactivées')}</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>{t('country.alerts.noAlerts', 'Aucune alerte pour le moment')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                  !alert.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getChangeTypeIcon(alert.changeType)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.title}</span>
                        <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                          {t(`severity.${alert.severity}`, alert.severity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.countryName}</span>
                        <span>•</span>
                        <span>{alert.source}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(alert.detectedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {alert.severity === 'critical' && (
                    <TrendingDown className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </div>
                {alert.impact && (
                  <div className="mt-2 pl-7 text-sm">
                    <span className="font-medium text-orange-600">Impact: </span>
                    {alert.impact}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
