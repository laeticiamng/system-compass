// Governance Regulatory Alerts - Track regulatory changes
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  
  Scale
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RegulatoryAlert {
  id: string;
  country: string;
  countryCode: string;
  category: 'tax' | 'visa' | 'business' | 'labor' | 'compliance' | 'general';
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  effectiveDate?: string;
  source?: string;
  sourceUrl?: string;
  createdAt: string;
  read: boolean;
  impact?: 'positive' | 'negative' | 'neutral';
}

interface AlertPreferences {
  countries: string[];
  categories: string[];
  minSeverity: 'low' | 'medium' | 'high';
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface RegulatoryAlertsProps {
  alerts: RegulatoryAlert[];
  preferences: AlertPreferences;
  onPreferencesChange: (prefs: AlertPreferences) => void;
  onMarkRead: (alertId: string) => void;
  onMarkAllRead: () => void;
  availableCountries: Array<{ id: string; name: string }>;
}

export function RegulatoryAlerts({
  alerts,
  preferences,
  onPreferencesChange,
  onMarkRead,
  onMarkAllRead,
  availableCountries: _availableCountries
}: RegulatoryAlertsProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  
  const [activeTab, setActiveTab] = useState('alerts');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'tax', label: t('governance.alerts.category.tax', 'Fiscalité') },
    { id: 'visa', label: t('governance.alerts.category.visa', 'Visas') },
    { id: 'business', label: t('governance.alerts.category.business', 'Business') },
    { id: 'labor', label: t('governance.alerts.category.labor', 'Travail') },
    { id: 'compliance', label: t('governance.alerts.category.compliance', 'Conformité') },
    { id: 'general', label: t('governance.alerts.category.general', 'Général') }
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
      if (filterCategory !== 'all' && alert.category !== filterCategory) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [alerts, filterSeverity, filterCategory]);

  const unreadCount = useMemo(() => {
    return alerts.filter(a => !a.read).length;
  }, [alerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      high: 'bg-red-500/10 text-red-500 border-red-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      info: 'bg-muted text-muted-foreground'
    };
    return variants[severity] || variants.info;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tax':
        return '💰';
      case 'visa':
        return '🛂';
      case 'business':
        return '🏢';
      case 'labor':
        return '👷';
      case 'compliance':
        return '📋';
      default:
        return '📰';
    }
  };

  const getImpactIcon = (impact?: string) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('governance.alerts.title', 'Alertes réglementaires')}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {t('governance.alerts.subtitle', 'Suivez les changements réglementaires importants')}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllRead}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {t('governance.alerts.markAllRead', 'Tout marquer lu')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="alerts">
              {t('governance.alerts.tabAlerts', 'Alertes')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" />
              {t('governance.alerts.tabSettings', 'Paramètres')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="all">{t('governance.alerts.allSeverities', 'Toutes sévérités')}</option>
                <option value="high">{t('governance.alerts.high', 'Haute')}</option>
                <option value="medium">{t('governance.alerts.medium', 'Moyenne')}</option>
                <option value="low">{t('governance.alerts.low', 'Basse')}</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="all">{t('governance.alerts.allCategories', 'Toutes catégories')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Alerts List */}
            <ScrollArea className="h-[400px]">
              {filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p>{t('governance.alerts.noAlerts', 'Aucune alerte')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all cursor-pointer",
                        !alert.read && "bg-primary/5 border-primary/20",
                        "hover:bg-accent/50"
                      )}
                      onClick={() => !alert.read && onMarkRead(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-lg">{getCategoryIcon(alert.category)}</span>
                            <Badge variant="outline">
                              {alert.country}
                            </Badge>
                            <Badge variant="outline" className={getSeverityBadge(alert.severity)}>
                              {t(`governance.alerts.severity.${alert.severity}`, alert.severity)}
                            </Badge>
                            {getImpactIcon(alert.impact)}
                            {!alert.read && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>

                          <h4 className="font-medium mb-1">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(alert.createdAt), {
                                addSuffix: true,
                                locale: dateLocale
                              })}
                            </span>
                            {alert.effectiveDate && (
                              <span className="flex items-center gap-1">
                                <Scale className="h-3 w-3" />
                                {t('governance.alerts.effective', 'Effectif')}: {format(new Date(alert.effectiveDate), 'PP', { locale: dateLocale })}
                              </span>
                            )}
                            {alert.sourceUrl && (
                              <a
                                href={alert.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                                {alert.source || t('governance.alerts.source', 'Source')}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            {/* Notification Settings */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('governance.alerts.notifications', 'Notifications')}
              </h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('governance.alerts.emailNotif', 'Notifications email')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('governance.alerts.emailNotifDesc', 'Recevoir les alertes par email')}
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    onPreferencesChange({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('governance.alerts.pushNotif', 'Notifications push')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('governance.alerts.pushNotifDesc', 'Recevoir les alertes en temps réel')}
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => 
                    onPreferencesChange({ ...preferences, pushNotifications: checked })
                  }
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2">
              <Label>{t('governance.alerts.minSeverity', 'Sévérité minimum')}</Label>
              <select
                value={preferences.minSeverity}
                onChange={(e) => 
                  onPreferencesChange({ 
                    ...preferences, 
                    minSeverity: e.target.value as 'low' | 'medium' | 'high'
                  })
                }
                className="w-full border rounded px-3 py-2 bg-background"
              >
                <option value="low">{t('governance.alerts.low', 'Basse')} - {t('governance.alerts.allAlerts', 'Toutes les alertes')}</option>
                <option value="medium">{t('governance.alerts.medium', 'Moyenne')} - {t('governance.alerts.importantOnly', 'Importantes uniquement')}</option>
                <option value="high">{t('governance.alerts.high', 'Haute')} - {t('governance.alerts.criticalOnly', 'Critiques uniquement')}</option>
              </select>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>{t('governance.alerts.categories', 'Catégories suivies')}</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const isSelected = preferences.categories.includes(cat.id);
                  return (
                    <Badge
                      key={cat.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const newCategories = isSelected
                          ? preferences.categories.filter(c => c !== cat.id)
                          : [...preferences.categories, cat.id];
                        onPreferencesChange({ ...preferences, categories: newCategories });
                      }}
                    >
                      {getCategoryIcon(cat.id)} {cat.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
