import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, 
  CheckCircle2, 
  ClipboardCheck, 
  ExternalLink, 
  HelpCircle, 
  Link2, 
  Plus, 
  RefreshCcw, 
  Trash2,
  Zap 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTraceOSWebhooks, Webhook, WebhookEvent, WebhookPlatform } from '@/hooks/useTraceOSWebhooks';
import { toast } from 'sonner';

const EVENT_LABELS: Record<WebhookEvent, { label: string; description: string }> = {
  decision_created: { 
    label: 'Création', 
    description: 'Quand une nouvelle décision est créée' 
  },
  decision_updated: { 
    label: 'Mise à jour', 
    description: 'Quand une décision est modifiée' 
  },
  decision_validated: { 
    label: 'Validation', 
    description: 'Quand une décision passe en statut validé' 
  },
  decision_abandoned: { 
    label: 'Abandon', 
    description: 'Quand une décision est abandonnée' 
  },
};

const PLATFORM_CONFIG: Record<WebhookPlatform, { 
  label: string; 
  icon: string;
  urlPlaceholder: string;
  helpUrl: string;
  instructions: string[];
}> = {
  slack: {
    label: 'Slack',
    icon: '💬',
    urlPlaceholder: 'https://hooks.slack.com/services/T00.../B00.../xxx',
    helpUrl: 'https://api.slack.com/messaging/webhooks',
    instructions: [
      'Créez une app Slack sur api.slack.com/apps',
      'Activez "Incoming Webhooks"',
      'Ajoutez un webhook vers un channel',
      'Copiez l\'URL générée ici'
    ]
  },
  teams: {
    label: 'Microsoft Teams',
    icon: '👥',
    urlPlaceholder: 'https://outlook.office.com/webhook/...',
    helpUrl: 'https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook',
    instructions: [
      'Dans Teams, cliquez sur "..." à côté du channel',
      'Sélectionnez "Connecteurs" puis "Incoming Webhook"',
      'Nommez le webhook et copiez l\'URL générée'
    ]
  },
  notion: {
    label: 'Notion',
    icon: '📝',
    urlPlaceholder: 'Utilisez Zapier/Make pour connecter Notion',
    helpUrl: 'https://www.notion.so/help/guides/connect-tools-to-notion',
    instructions: [
      'Notion n\'a pas de webhooks natifs',
      'Utilisez Zapier ou Make comme intermédiaire',
      'Créez un Zap: Webhook → Notion',
      'Collez l\'URL du webhook Zapier ici'
    ]
  },
  custom: {
    label: 'Personnalisé',
    icon: '🔧',
    urlPlaceholder: 'https://votre-serveur.com/webhook',
    helpUrl: '',
    instructions: [
      'Configurez un endpoint HTTP POST sur votre serveur',
      'Le payload JSON contient: event, timestamp, decision',
      'Retournez un status 200 pour confirmer la réception'
    ]
  }
};

interface HeaderRow {
  key: string;
  value: string;
}

const emptyForm = {
  name: '',
  url: '',
  platform: 'slack' as WebhookPlatform,
  events: [] as WebhookEvent[],
  headers: [] as HeaderRow[],
};

export function TraceOSWebhooks() {
  const { t } = useTranslation();
  const {
    webhooks,
    loading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  } = useTraceOSWebhooks();
  const [form, setForm] = useState(emptyForm);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const eventOptions = useMemo(() => (
    Object.entries(EVENT_LABELS) as Array<[WebhookEvent, { label: string; description: string }]>
  ), []);

  const platformOptions = useMemo(() => (
    Object.entries(PLATFORM_CONFIG) as Array<[WebhookPlatform, typeof PLATFORM_CONFIG[WebhookPlatform]]>
  ), []);

  const currentPlatform = PLATFORM_CONFIG[form.platform];

  const resetForm = () => {
    setForm(emptyForm);
    setEditingWebhook(null);
  };

  const handleToggleEvent = (event: WebhookEvent) => {
    setForm((current) => {
      const selected = current.events.includes(event)
        ? current.events.filter((e) => e !== event)
        : [...current.events, event];
      return { ...current, events: selected };
    });
  };

  const handleHeaderChange = (index: number, field: keyof HeaderRow, value: string) => {
    setForm((current) => {
      const nextHeaders = [...current.headers];
      nextHeaders[index] = { ...nextHeaders[index], [field]: value };
      return { ...current, headers: nextHeaders };
    });
  };

  const handleAddHeader = () => {
    setForm((current) => ({
      ...current,
      headers: [...current.headers, { key: '', value: '' }],
    }));
  };

  const handleRemoveHeader = (index: number) => {
    setForm((current) => ({
      ...current,
      headers: current.headers.filter((_, idx) => idx !== index),
    }));
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setForm({
      name: webhook.name,
      url: webhook.url,
      platform: webhook.platform,
      events: webhook.events,
      headers: Object.entries(webhook.headers || {}).map(([key, value]) => ({
        key,
        value,
      })),
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.url || form.events.length === 0) {
      toast.error(t('traceOS.webhooks.required', 'Nom, URL et événements sont obligatoires.'));
      return;
    }

    const headers = form.headers.reduce<Record<string, string>>((acc, header) => {
      if (header.key.trim()) {
        acc[header.key.trim()] = header.value;
      }
      return acc;
    }, {});

    if (editingWebhook) {
      const success = await updateWebhook(editingWebhook.id, {
        name: form.name,
        url: form.url,
        platform: form.platform,
        events: form.events,
        headers,
      });
      if (success) resetForm();
      return;
    }

    const created = await createWebhook(
      form.name,
      form.url,
      form.platform,
      form.events,
      headers
    );

    if (created) resetForm();
  };

  const handleToggleActive = async (webhook: Webhook) => {
    await updateWebhook(webhook.id, { is_active: !webhook.is_active });
  };

  const activeWebhooks = webhooks.filter(w => w.is_active).length;

  return (
    <div className="space-y-6">
      {/* Onboarding Card */}
      {webhooks.length === 0 && !editingWebhook && (
        <Alert className="border-primary/30 bg-primary/5">
          <Zap className="h-4 w-4" />
          <AlertTitle>Connectez TraceOS à vos outils</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-3">
              Les webhooks permettent d'envoyer automatiquement les événements TraceOS 
              (création, validation, abandon de décisions) vers vos outils favoris.
            </p>
            <div className="flex flex-wrap gap-3">
              {platformOptions.slice(0, 3).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5 text-sm">
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </div>
              ))}
              <span className="text-sm text-muted-foreground">et plus...</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Summary */}
      {webhooks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${activeWebhooks > 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                  {activeWebhooks > 0 ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {activeWebhooks > 0 
                      ? `${activeWebhooks} webhook${activeWebhooks > 1 ? 's' : ''} actif${activeWebhooks > 1 ? 's' : ''}`
                      : 'Aucun webhook actif'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {webhooks.length} configuré{webhooks.length > 1 ? 's' : ''} au total
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {webhooks.map(w => (
                  <Badge 
                    key={w.id} 
                    variant="outline" 
                    className={w.is_active ? 'bg-green-500/10 border-green-500/30' : ''}
                  >
                    {PLATFORM_CONFIG[w.platform].icon} {w.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {editingWebhook 
              ? t('traceOS.webhooks.editTitle', 'Modifier le webhook')
              : t('traceOS.webhooks.title', 'Nouveau webhook')
            }
          </CardTitle>
          <CardDescription>
            {t('traceOS.webhooks.desc', 'Configurez les notifications automatiques pour vos décisions.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection with Visual Cards */}
          <div className="space-y-3">
            <Label>{t('traceOS.webhooks.platform', 'Plateforme')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platformOptions.map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, platform: key })}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                    form.platform === key 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted'
                  }`}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className="font-medium text-sm">{config.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions Collapsible */}
          <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
                Comment configurer {currentPlatform.label} ?
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <ol className="space-y-2 text-sm">
                  {currentPlatform.instructions.map((instruction, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
                {currentPlatform.helpUrl && (
                  <a 
                    href={currentPlatform.helpUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Documentation officielle
                  </a>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="traceos-webhook-name">
                {t('traceOS.webhooks.name', 'Nom du webhook')}
              </Label>
              <Input
                id="traceos-webhook-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder={`${currentPlatform.label} #traceos`}
              />
              <p className="text-xs text-muted-foreground">
                Un nom pour identifier ce webhook (ex: "Slack équipe produit")
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="traceos-webhook-url">
                {t('traceOS.webhooks.url', 'URL du webhook')}
              </Label>
              <Input
                id="traceos-webhook-url"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                placeholder={currentPlatform.urlPlaceholder}
              />
              <p className="text-xs text-muted-foreground">
                L'URL fournie par {currentPlatform.label}
              </p>
            </div>
          </div>

          {/* Events Selection */}
          <div className="space-y-3">
            <Label>{t('traceOS.webhooks.events', 'Événements à notifier')}</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {eventOptions.map(([event, config]) => (
                <label 
                  key={event} 
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/30 ${
                    form.events.includes(event) ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <Checkbox
                    checked={form.events.includes(event)}
                    onCheckedChange={() => handleToggleEvent(event)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-sm">{config.label}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Headers (collapsed by default) */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                {t('traceOS.webhooks.advancedOptions', 'Options avancées (headers)')}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('traceOS.webhooks.headers', 'Headers HTTP personnalisés')}</Label>
                <Button variant="outline" size="sm" onClick={handleAddHeader} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
              {form.headers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('traceOS.webhooks.headersEmpty', 'Optionnel: ajoutez des headers pour l\'authentification.')}
                </p>
              )}
              <div className="space-y-2">
                {form.headers.map((header, index) => (
                  <div key={`${header.key}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <Input
                      value={header.key}
                      onChange={(event) => handleHeaderChange(index, 'key', event.target.value)}
                      placeholder="X-Auth-Token"
                    />
                    <Input
                      value={header.value}
                      onChange={(event) => handleHeaderChange(index, 'value', event.target.value)}
                      placeholder="votre-token"
                      type="password"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveHeader(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSubmit} className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              {editingWebhook
                ? t('traceOS.webhooks.update', 'Mettre à jour')
                : t('traceOS.webhooks.create', 'Créer le webhook')}
            </Button>
            {editingWebhook && (
              <Button variant="ghost" onClick={resetForm}>
                {t('traceOS.webhooks.cancel', 'Annuler')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configured Webhooks List */}
      {webhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {t('traceOS.webhooks.listTitle', 'Webhooks configurés')}
            </CardTitle>
            <CardDescription>
              {t('traceOS.webhooks.listDesc', 'Activez, testez ou modifiez les webhooks existants.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhooks.map((webhook) => {
              const platform = PLATFORM_CONFIG[webhook.platform];
              return (
                <div 
                  key={webhook.id} 
                  className={`rounded-lg border p-4 space-y-3 transition-all ${
                    webhook.is_active 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-muted opacity-60'
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{platform.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{webhook.name}</h4>
                          <Badge variant="outline">{platform.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all max-w-md truncate">
                          {webhook.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={() => handleToggleActive(webhook)}
                      />
                      <span className={`text-sm font-medium ${webhook.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {webhook.is_active
                          ? t('traceOS.webhooks.active', 'Actif')
                          : t('traceOS.webhooks.inactive', 'Inactif')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary">
                        {EVENT_LABELS[event].label}
                      </Badge>
                    ))}
                  </div>

                  {webhook.last_triggered_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                      {t('traceOS.webhooks.lastTrigger', 'Dernier envoi')}: {new Date(webhook.last_triggered_at).toLocaleString()}
                    </p>
                  )}

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testWebhook(webhook.id)}
                      className="gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      {t('traceOS.webhooks.test', 'Tester')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditWebhook(webhook)}
                    >
                      {t('traceOS.webhooks.edit', 'Modifier')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t('traceOS.webhooks.delete', 'Supprimer')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
