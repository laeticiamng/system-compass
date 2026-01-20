import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Link2,
  Bell,
  Calendar,
  Cloud,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { WorkflowMetrics } from './WorkflowMetrics';
import { AutoExportManager } from './AutoExportManager';
import { TraceOSWebhooks } from './TraceOSWebhooks';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'communication' | 'productivity' | 'storage' | 'automation';
  connected: boolean;
  lastSync?: string;
  features: string[];
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notified about decisions in your Slack channels',
    icon: '💬',
    category: 'communication',
    connected: false,
    features: ['New decision notifications', 'Approval requests', 'Weekly digests', 'Direct replies']
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Integrate with Teams for decision discussions',
    icon: '👥',
    category: 'communication',
    connected: false,
    features: ['Channel notifications', 'Meeting scheduling', 'Approval workflows']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync decisions to your Notion workspace',
    icon: '📝',
    category: 'productivity',
    connected: false,
    features: ['Two-way sync', 'Database integration', 'Auto-export']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Add decision deadlines to your calendar',
    icon: '📅',
    category: 'productivity',
    connected: false,
    features: ['Deadline reminders', 'Review meetings', 'Team scheduling']
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Store exported reports in Drive',
    icon: '📁',
    category: 'storage',
    connected: false,
    features: ['Auto-backup', 'Report storage', 'Sharing']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync exports to Dropbox',
    icon: '📦',
    category: 'storage',
    connected: false,
    features: ['Auto-sync', 'Version history', 'Team folders']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5,000+ apps via Zapier',
    icon: '⚡',
    category: 'automation',
    connected: false,
    features: ['Custom triggers', 'Multi-step workflows', '5,000+ apps']
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    description: 'Advanced automation workflows',
    icon: '🔄',
    category: 'automation',
    connected: false,
    features: ['Complex scenarios', 'Data transformation', 'Scheduled runs']
  }
];

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Link2 }> = {
  communication: { label: 'Communication', icon: Bell },
  productivity: { label: 'Productivity', icon: Calendar },
  storage: { label: 'Storage', icon: Cloud },
  automation: { label: 'Automation', icon: Zap }
};

export function TraceOSIntegrations() {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState(AVAILABLE_INTEGRATIONS);
  const [autoNotifications, setAutoNotifications] = useState({
    newDecisions: true,
    statusChanges: true,
    approvalRequests: true,
    weeklyDigest: false
  });
  
  // Zapier integration state
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const [isTestingZapier, setIsTestingZapier] = useState(false);

  const handleToggleConnection = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.id === integrationId
          ? { ...i, connected: !i.connected, lastSync: i.connected ? undefined : new Date().toISOString() }
          : i
      )
    );
  };

  const handleTestZapierWebhook = async () => {
    if (!zapierWebhookUrl) {
      toast.error(t('traceOS.integrations.enterWebhookUrl', 'Veuillez entrer l\'URL du webhook'));
      return;
    }

    setIsTestingZapier(true);
    try {
      await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event: 'test',
          source: 'TraceOS',
          timestamp: new Date().toISOString(),
          message: 'Test de connexion Zapier depuis TraceOS',
          data: { 
            test: true,
            decision_sample: {
              title: 'Décision test',
              status: 'draft',
              author: 'Utilisateur TraceOS'
            }
          }
        })
      });
      
      toast.success(t('traceOS.integrations.webhookSent', 'Requête envoyée à Zapier. Vérifiez l\'historique de votre Zap.'));
      
      // Mark Zapier as connected
      setIntegrations(prev =>
        prev.map(i =>
          i.id === 'zapier'
            ? { ...i, connected: true, lastSync: new Date().toISOString() }
            : i
        )
      );
    } catch (error) {
      console.error('Zapier webhook error:', error);
      toast.error(t('traceOS.integrations.webhookError', 'Erreur lors de l\'envoi du webhook'));
    } finally {
      setIsTestingZapier(false);
    }
  };

  const handleSendToZapier = async (eventType: string, data: Record<string, unknown>) => {
    if (!zapierWebhookUrl) return false;
    
    try {
      await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event: eventType,
          source: 'TraceOS',
          timestamp: new Date().toISOString(),
          data
        })
      });
      return true;
    } catch (error) {
      console.error('Zapier send error:', error);
      return false;
    }
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available" className="gap-2">
            <Link2 className="w-4 h-4" />
            {t('traceOS.integrations.available', 'Available')}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Zap className="w-4 h-4" />
            {t('traceOS.integrations.webhooks', 'Webhooks')}
          </TabsTrigger>
          <TabsTrigger value="exports" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('traceOS.integrations.autoExports', 'Auto-Exports')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            {t('traceOS.integrations.notifications', 'Notifications')}
          </TabsTrigger>
        </TabsList>

        {/* Available Integrations */}
        <TabsContent value="available">
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('traceOS.integrations.connectedApps', 'Connected Apps')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('traceOS.integrations.connectedCount', '{{count}} of {{total}} integrations active', {
                        count: connectedCount,
                        total: integrations.length
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className={connectedCount > 0 ? 'bg-green-500/10 text-green-700' : ''}>
                    {connectedCount > 0 ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {connectedCount} {t('traceOS.integrations.active', 'active')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Integrations by Category */}
            {Object.entries(CATEGORY_LABELS).map(([category, config]) => {
              const categoryIntegrations = integrations.filter(i => i.category === category);
              const CategoryIcon = config.icon;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CategoryIcon className="w-5 h-5" />
                      {t(`traceOS.integrations.category.${category}`, config.label)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {categoryIntegrations.map(integration => (
                        <div
                          key={integration.id}
                          className={`p-4 rounded-lg border transition-all ${
                            integration.connected
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-muted hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{integration.icon}</div>
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={integration.connected ? 'bg-green-500/10 text-green-700' : ''}
                            >
                              {integration.connected
                                ? t('traceOS.integrations.connected', 'Connected')
                                : t('traceOS.integrations.notConnected', 'Not connected')
                              }
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {integration.features.slice(0, 3).map((feature, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {integration.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{integration.features.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            {integration.connected && integration.lastSync && (
                              <span className="text-xs text-muted-foreground">
                                {t('traceOS.integrations.lastSync', 'Last sync')}: {new Date(integration.lastSync).toLocaleString()}
                              </span>
                            )}
                            <div className="flex gap-2 ml-auto">
                              {integration.connected && (
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Settings className="w-4 h-4" />
                                  {t('traceOS.integrations.configure', 'Configure')}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={integration.connected ? 'outline' : 'default'}
                                onClick={() => handleToggleConnection(integration.id)}
                                className="gap-1"
                              >
                                {integration.connected ? (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    {t('traceOS.integrations.disconnect', 'Disconnect')}
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="w-4 h-4" />
                                    {t('traceOS.integrations.connect', 'Connect')}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Zapier Configuration Panel */}
                          {integration.id === 'zapier' && (
                            <div className="mt-4 pt-4 border-t border-muted space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="zapier-webhook" className="text-sm">
                                  {t('traceOS.integrations.zapierWebhookUrl', 'URL du Webhook Zapier')}
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="zapier-webhook"
                                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                                    value={zapierWebhookUrl}
                                    onChange={(e) => setZapierWebhookUrl(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={handleTestZapierWebhook}
                                    disabled={isTestingZapier || !zapierWebhookUrl}
                                  >
                                    {isTestingZapier ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      t('traceOS.integrations.testWebhook', 'Tester')
                                    )}
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {t('traceOS.integrations.zapierHelp', 'Créez un Zap avec un trigger "Webhooks by Zapier" et collez l\'URL ici.')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <TraceOSWebhooks />
        </TabsContent>

        {/* Auto-Exports */}
        <TabsContent value="exports">
          <div className="grid lg:grid-cols-2 gap-6">
            <WorkflowMetrics />
            <AutoExportManager />
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t('traceOS.integrations.notificationSettings', 'Notification Settings')}
              </CardTitle>
              <CardDescription>
                {t('traceOS.integrations.notificationDesc', 'Configure what notifications you receive')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{t('traceOS.integrations.newDecisions', 'New decisions')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('traceOS.integrations.newDecisionsDesc', 'Get notified when new decisions are created')}
                  </p>
                </div>
                <Switch
                  checked={autoNotifications.newDecisions}
                  onCheckedChange={(v) => setAutoNotifications(prev => ({ ...prev, newDecisions: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{t('traceOS.integrations.statusChanges', 'Status changes')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('traceOS.integrations.statusChangesDesc', 'Get notified when decision status changes')}
                  </p>
                </div>
                <Switch
                  checked={autoNotifications.statusChanges}
                  onCheckedChange={(v) => setAutoNotifications(prev => ({ ...prev, statusChanges: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{t('traceOS.integrations.approvalRequests', 'Approval requests')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('traceOS.integrations.approvalRequestsDesc', 'Get notified when approval is needed')}
                  </p>
                </div>
                <Switch
                  checked={autoNotifications.approvalRequests}
                  onCheckedChange={(v) => setAutoNotifications(prev => ({ ...prev, approvalRequests: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{t('traceOS.integrations.weeklyDigest', 'Weekly digest')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('traceOS.integrations.weeklyDigestDesc', 'Receive a weekly summary of all activity')}
                  </p>
                </div>
                <Switch
                  checked={autoNotifications.weeklyDigest}
                  onCheckedChange={(v) => setAutoNotifications(prev => ({ ...prev, weeklyDigest: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
