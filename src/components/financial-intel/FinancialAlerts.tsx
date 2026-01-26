/**
 * Financial Intelligence Alerts Component
 * 
 * Provides automated alerts for financial risks and opportunities.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, TrendingUp, Bell, BellOff,
  Shield, DollarSign, Clock, X, Check
} from 'lucide-react';

interface FinancialAlert {
  id: string;
  type: 'risk' | 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  country?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source?: string;
  dismissed?: boolean;
}

interface FinancialAlertsProps {
  country: string;
  onAlertDismiss?: (alertId: string) => void;
  maxAlerts?: number;
}

// Simulated alert generation based on country patterns
function generateAlerts(country: string): FinancialAlert[] {
  const now = new Date();
  const alerts: FinancialAlert[] = [];

  // Generic alerts that could apply to many countries
  const genericAlerts: Omit<FinancialAlert, 'id' | 'timestamp'>[] = [
    {
      type: 'warning',
      title: 'Volatilité des taux de change',
      description: 'La devise locale montre des signes de volatilité accrue. Considérez des stratégies de couverture.',
      severity: 'medium',
      source: 'Market Analysis',
    },
    {
      type: 'risk',
      title: 'Délais administratifs signalés',
      description: 'Des retards inhabituels dans les procédures bancaires ont été rapportés par la communauté.',
      severity: 'low',
      source: 'Community Reports',
    },
    {
      type: 'opportunity',
      title: 'Incitations fiscales disponibles',
      description: 'De nouvelles incitations pour les entrepreneurs étrangers sont en vigueur.',
      severity: 'low',
      source: 'Government Update',
    },
    {
      type: 'info',
      title: 'Mise à jour réglementaire',
      description: 'Nouvelles exigences de documentation pour les transferts internationaux.',
      severity: 'low',
      source: 'Regulatory Update',
    },
  ];

  // Country-specific patterns (simplified)
  const countryPatterns: Record<string, Omit<FinancialAlert, 'id' | 'timestamp'>[]> = {
    Argentina: [
      {
        type: 'risk',
        title: 'Contrôle des changes actif',
        description: 'Le "cepo" limite les achats de devises étrangères. Planifiez vos transferts.',
        severity: 'high',
        country: 'Argentina',
        source: 'BCRA',
      },
    ],
    Venezuela: [
      {
        type: 'risk',
        title: 'Hyperinflation en cours',
        description: 'L\'inflation dépasse les projections. Évitez de conserver des fonds en devise locale.',
        severity: 'critical',
        country: 'Venezuela',
        source: 'IMF Data',
      },
    ],
    Switzerland: [
      {
        type: 'info',
        title: 'Stabilité financière',
        description: 'Le franc suisse reste une valeur refuge. Taux d\'intérêt négatifs en vigueur.',
        severity: 'low',
        country: 'Switzerland',
        source: 'SNB',
      },
    ],
  };

  // Add country-specific alerts
  const countrySpecific = countryPatterns[country] || [];
  for (const alert of countrySpecific) {
    alerts.push({
      ...alert,
      id: `alert-${country}-${alerts.length}`,
      timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
    });
  }

  // Add some generic alerts
  const selectedGeneric = genericAlerts.slice(0, 2);
  for (const alert of selectedGeneric) {
    alerts.push({
      ...alert,
      id: `alert-generic-${alerts.length}`,
      timestamp: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000),
      country,
    });
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function FinancialAlerts({
  country,
  onAlertDismiss,
  maxAlerts = 5,
}: FinancialAlertsProps) {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    setAlerts(generateAlerts(country));
  }, [country]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    onAlertDismiss?.(alertId);
  };

  const getAlertIcon = (type: FinancialAlert['type']) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'warning': return <Shield className="w-4 h-4 text-amber-500" />;
      default: return <DollarSign className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Il y a moins d\'une heure';
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  const visibleAlerts = alerts.slice(0, maxAlerts);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {t('financialIntel.alerts.title', 'Alertes Financières')}
          {alerts.length > 0 && (
            <Badge variant="secondary">{alerts.length}</Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          title={notificationsEnabled ? 'Désactiver les alertes' : 'Activer les alertes'}
        >
          {notificationsEnabled ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>{t('financialIntel.alerts.noAlerts', 'Aucune alerte active')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group"
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge className={getSeverityColor(alert.severity)} variant="outline">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                    {alert.source && (
                      <>
                        <span>•</span>
                        <span>{alert.source}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {alerts.length > maxAlerts && (
              <p className="text-center text-sm text-muted-foreground pt-2">
                +{alerts.length - maxAlerts} autres alertes
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
