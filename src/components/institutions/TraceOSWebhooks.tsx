import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Link2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTraceOSWebhooks, Webhook, WebhookEvent, WebhookPlatform } from '@/hooks/useTraceOSWebhooks';
import { toast } from 'sonner';

const EVENT_LABELS: Record<WebhookEvent, string> = {
  decision_created: 'Création',
  decision_updated: 'Mise à jour',
  decision_validated: 'Validation',
  decision_abandoned: 'Abandon',
};

const PLATFORM_LABELS: Record<WebhookPlatform, string> = {
  slack: 'Slack',
  teams: 'Microsoft Teams',
  notion: 'Notion',
  custom: 'Custom',
};

interface HeaderRow {
  key: string;
  value: string;
}

const emptyForm = {
  name: '',
  url: '',
  platform: 'custom' as WebhookPlatform,
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

  const eventOptions = useMemo(() => (
    Object.entries(EVENT_LABELS) as Array<[WebhookEvent, string]>
  ), []);

  const platformOptions = useMemo(() => (
    Object.entries(PLATFORM_LABELS) as Array<[WebhookPlatform, string]>
  ), []);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t('traceOS.webhooks.title', 'Webhooks TraceOS')}
          </CardTitle>
          <CardDescription>
            {t('traceOS.webhooks.desc', 'Configurez les notifications automatiques pour vos décisions.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="traceos-webhook-name">
                {t('traceOS.webhooks.name', 'Nom du webhook')}
              </Label>
              <Input
                id="traceos-webhook-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Slack #traceos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="traceos-webhook-url">
                {t('traceOS.webhooks.url', 'URL de réception')}
              </Label>
              <Input
                id="traceos-webhook-url"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                placeholder="https://hooks.slack.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>{t('traceOS.webhooks.platform', 'Plateforme')}</Label>
              <Select
                value={form.platform}
                onValueChange={(value) => setForm({ ...form, platform: value as WebhookPlatform })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('traceOS.webhooks.platformPlaceholder', 'Sélectionner')} />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('traceOS.webhooks.events', 'Événements')}
              </Label>
              <div className="grid gap-2 md:grid-cols-2">
                {eventOptions.map(([event, label]) => (
                  <label key={event} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.events.includes(event)}
                      onCheckedChange={() => handleToggleEvent(event)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('traceOS.webhooks.headers', 'Headers personnalisés')}</Label>
              <Button variant="outline" size="sm" onClick={handleAddHeader} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('traceOS.webhooks.addHeader', 'Ajouter un header')}
              </Button>
            </div>
            {form.headers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('traceOS.webhooks.headersEmpty', 'Aucun header ajouté pour le moment.')}
              </p>
            )}
            <div className="space-y-2">
              {form.headers.map((header, index) => (
                <div key={`${header.key}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <Input
                    value={header.key}
                    onChange={(event) => handleHeaderChange(index, 'key', event.target.value)}
                    placeholder="X-Token"
                  />
                  <Input
                    value={header.value}
                    onChange={(event) => handleHeaderChange(index, 'value', event.target.value)}
                    placeholder="secret"
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
          </div>

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
          {webhooks.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">
              {t('traceOS.webhooks.empty', 'Aucun webhook configuré pour le moment.')}
            </p>
          )}
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{webhook.name}</h4>
                    <Badge variant="outline">{PLATFORM_LABELS[webhook.platform]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground break-all">{webhook.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhook.is_active}
                    onCheckedChange={() => handleToggleActive(webhook)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {webhook.is_active
                      ? t('traceOS.webhooks.active', 'Actif')
                      : t('traceOS.webhooks.inactive', 'Inactif')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {webhook.events.map((event) => (
                  <Badge key={event} variant="secondary">
                    {EVENT_LABELS[event]}
                  </Badge>
                ))}
              </div>

              {webhook.last_triggered_at && (
                <p className="text-xs text-muted-foreground">
                  {t('traceOS.webhooks.lastTrigger', 'Dernier envoi')}: {new Date(webhook.last_triggered_at).toLocaleString()}
                </p>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testWebhook(webhook.id)}
                >
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
                  className="text-destructive"
                  onClick={() => deleteWebhook(webhook.id)}
                >
                  {t('traceOS.webhooks.delete', 'Supprimer')}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
