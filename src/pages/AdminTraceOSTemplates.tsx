import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Save, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = ['rh', 'it', 'strategy', 'finance', 'legal', 'operations'] as const;
const ICON_OPTIONS = [
  'Users',
  'Monitor',
  'Target',
  'DollarSign',
  'Scale',
  'Building2',
  'Briefcase',
  'Shield',
  'FileText'
] as const;

type TraceOSTemplateRow = Database['public']['Tables']['traceos_templates']['Row'];

type LocalizedItem = {
  key: string;
  fallback: string;
};

type TemplateFormState = {
  templateKey: string;
  category: string;
  icon: string;
  titleKey: string;
  titleDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  templateTitleKey: string;
  templateTitleDefault: string;
  contextKey: string;
  contextDefault: string;
  mainHypothesisKey: string;
  mainHypothesisDefault: string;
  scopeKey: string;
  scopeDefault: string;
  alternativeHypotheses: LocalizedItem[];
  constraints: LocalizedItem[];
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: TemplateFormState = {
  templateKey: '',
  category: 'rh',
  icon: 'Users',
  titleKey: '',
  titleDefault: '',
  descriptionKey: '',
  descriptionDefault: '',
  templateTitleKey: '',
  templateTitleDefault: '',
  contextKey: '',
  contextDefault: '',
  mainHypothesisKey: '',
  mainHypothesisDefault: '',
  scopeKey: '',
  scopeDefault: '',
  alternativeHypotheses: [{ key: '', fallback: '' }],
  constraints: [{ key: '', fallback: '' }],
  sortOrder: 0,
  isActive: true
};

const parseLocalizedItem = (value: Json): LocalizedItem | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, Json>;
  const key = typeof record.key === 'string' ? record.key : '';
  const fallback = typeof record.default === 'string' ? record.default : '';
  if (!key && !fallback) {
    return null;
  }
  return { key, fallback };
};

const parseLocalizedList = (value: Json | null): LocalizedItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => parseLocalizedItem(item))
    .filter((item): item is LocalizedItem => Boolean(item));
};

const toJsonList = (items: LocalizedItem[]) =>
  items
    .map((item) => ({
      key: item.key.trim(),
      default: item.fallback.trim()
    }))
    .filter((item) => item.key.length > 0 || item.default.length > 0);

const toFormState = (template: TraceOSTemplateRow): TemplateFormState => ({
  templateKey: template.template_key,
  category: template.category,
  icon: template.icon,
  titleKey: template.title_key,
  titleDefault: template.title_default,
  descriptionKey: template.description_key,
  descriptionDefault: template.description_default,
  templateTitleKey: template.template_title_key,
  templateTitleDefault: template.template_title_default,
  contextKey: template.context_key,
  contextDefault: template.context_default,
  mainHypothesisKey: template.main_hypothesis_key,
  mainHypothesisDefault: template.main_hypothesis_default,
  scopeKey: template.scope_key,
  scopeDefault: template.scope_default,
  alternativeHypotheses: parseLocalizedList(template.alternative_hypotheses),
  constraints: parseLocalizedList(template.constraints),
  sortOrder: template.sort_order ?? 0,
  isActive: template.is_active ?? true
});

export default function AdminTraceOSTemplates() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useUserRoles();
  const [templates, setTemplates] = useState<TraceOSTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('traceos_templates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching TraceOS templates:', error);
      toast.error(t('traceos.templates.admin.fetchError', 'Erreur lors du chargement des templates.'));
    }

    setTemplates(data ?? []);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, [fetchTemplates, isAdmin, user]);

  const templateList = useMemo(() => {
    return templates.map((template) => ({
      id: template.id,
      templateKey: template.template_key,
      title: template.title_default,
      category: template.category
    }));
  }, [templates]);

  const handleSelectTemplate = (template: TraceOSTemplateRow) => {
    setSelectedTemplateId(template.id);
    setForm(toFormState(template));
  };

  const handleNewTemplate = () => {
    setSelectedTemplateId(null);
    setForm(EMPTY_FORM);
  };

  const updateFormField = (field: keyof TemplateFormState, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateListItem = (
    field: 'alternativeHypotheses' | 'constraints',
    index: number,
    key: 'key' | 'fallback',
    value: string
  ) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field: 'alternativeHypotheses' | 'constraints') => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], { key: '', fallback: '' }]
    }));
  };

  const removeListItem = (field: 'alternativeHypotheses' | 'constraints', index: number) => {
    setForm((prev) => {
      const list = prev[field].filter((_, idx) => idx !== index);
      return { ...prev, [field]: list.length ? list : [{ key: '', fallback: '' }] };
    });
  };

  const handleSave = async () => {
    if (!form.templateKey.trim()) {
      toast.error(t('traceos.templates.admin.validation.key', 'Le template_key est requis.'));
      return;
    }

    setSaving(true);
    const payload = {
      template_key: form.templateKey.trim(),
      category: form.category,
      icon: form.icon,
      title_key: form.titleKey.trim(),
      title_default: form.titleDefault.trim(),
      description_key: form.descriptionKey.trim(),
      description_default: form.descriptionDefault.trim(),
      template_title_key: form.templateTitleKey.trim(),
      template_title_default: form.templateTitleDefault.trim(),
      context_key: form.contextKey.trim(),
      context_default: form.contextDefault.trim(),
      main_hypothesis_key: form.mainHypothesisKey.trim(),
      main_hypothesis_default: form.mainHypothesisDefault.trim(),
      scope_key: form.scopeKey.trim(),
      scope_default: form.scopeDefault.trim(),
      alternative_hypotheses: toJsonList(form.alternativeHypotheses),
      constraints: toJsonList(form.constraints),
      sort_order: Number(form.sortOrder) || 0,
      is_active: form.isActive
    };

    const { error } = selectedTemplateId
      ? await supabase
          .from('traceos_templates')
          .update(payload)
          .eq('id', selectedTemplateId)
      : await supabase
          .from('traceos_templates')
          .insert(payload);

    if (error) {
      console.error('Error saving TraceOS template:', error);
      toast.error(t('traceos.templates.admin.saveError', 'Erreur lors de la sauvegarde.'));
    } else {
      toast.success(t('traceos.templates.admin.saved', 'Template enregistré.'));
      await fetchTemplates();
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedTemplateId) {
      return;
    }

    if (!window.confirm(t('traceos.templates.admin.confirmDelete', 'Supprimer ce template ?'))) {
      return;
    }

    const { error } = await supabase
      .from('traceos_templates')
      .delete()
      .eq('id', selectedTemplateId);

    if (error) {
      console.error('Error deleting TraceOS template:', error);
      toast.error(t('traceos.templates.admin.deleteError', 'Erreur lors de la suppression.'));
      return;
    }

    toast.success(t('traceos.templates.admin.deleted', 'Template supprimé.'));
    setSelectedTemplateId(null);
    setForm(EMPTY_FORM);
    await fetchTemplates();
  };

  if (rolesLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{t('traceos.templates.admin.noAccessTitle', 'Accès restreint')}</CardTitle>
            <CardDescription>
              {t(
                'traceos.templates.admin.noAccessDescription',
                'Vous devez être administrateur pour gérer les templates TraceOS.'
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {t('traceos.templates.admin.title', 'Templates TraceOS')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'traceos.templates.admin.description',
              'Créez et mettez à jour les templates utilisés dans TraceOS.'
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{t('traceos.templates.admin.listTitle', 'Templates existants')}</CardTitle>
                <CardDescription>
                  {t('traceos.templates.admin.listDescription', 'Sélectionnez un template pour le modifier.')}
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleNewTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('traceos.templates.admin.new', 'Nouveau')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {templateList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('traceos.templates.admin.empty', 'Aucun template enregistré.')}
                </p>
              ) : (
                templateList.map((template) => (
                  <Button
                    key={template.id}
                    variant={template.id === selectedTemplateId ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      const target = templates.find((item) => item.id === template.id);
                      if (target) {
                        handleSelectTemplate(target);
                      }
                    }}
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">{template.title || template.templateKey}</div>
                      <div className="text-xs text-muted-foreground">{template.category}</div>
                    </div>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('traceos.templates.admin.formTitle', 'Édition du template')}</CardTitle>
              <CardDescription>
                {t('traceos.templates.admin.formDescription', 'Remplissez les clés i18n et les valeurs par défaut.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="templateKey">{t('traceos.templates.admin.fields.key', 'Template key')}</Label>
                  <Input
                    id="templateKey"
                    value={form.templateKey}
                    onChange={(event) => updateFormField('templateKey', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('traceos.templates.admin.fields.category', 'Catégorie')}</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => updateFormField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('traceos.templates.admin.fields.icon', 'Icône')}</Label>
                  <Select
                    value={form.icon}
                    onValueChange={(value) => updateFormField('icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">{t('traceos.templates.admin.fields.sortOrder', 'Ordre')}</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => updateFormField('sortOrder', Number(event.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(value) => updateFormField('isActive', value)}
                    id="isActive"
                  />
                  <Label htmlFor="isActive">{t('traceos.templates.admin.fields.active', 'Actif')}</Label>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('traceos.templates.admin.fields.titleKey', 'Clé du titre')}</Label>
                  <Input
                    value={form.titleKey}
                    onChange={(event) => updateFormField('titleKey', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('traceos.templates.admin.fields.titleDefault', 'Titre (défaut)')}</Label>
                  <Input
                    value={form.titleDefault}
                    onChange={(event) => updateFormField('titleDefault', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('traceos.templates.admin.fields.descriptionKey', 'Clé description')}</Label>
                  <Input
                    value={form.descriptionKey}
                    onChange={(event) => updateFormField('descriptionKey', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('traceos.templates.admin.fields.descriptionDefault', 'Description (défaut)')}</Label>
                  <Input
                    value={form.descriptionDefault}
                    onChange={(event) => updateFormField('descriptionDefault', event.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.templateTitleKey', 'Clé titre template')}</Label>
                    <Input
                      value={form.templateTitleKey}
                      onChange={(event) => updateFormField('templateTitleKey', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.templateTitleDefault', 'Titre template (défaut)')}</Label>
                    <Input
                      value={form.templateTitleDefault}
                      onChange={(event) => updateFormField('templateTitleDefault', event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.contextKey', 'Clé contexte')}</Label>
                    <Input
                      value={form.contextKey}
                      onChange={(event) => updateFormField('contextKey', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.contextDefault', 'Contexte (défaut)')}</Label>
                    <Textarea
                      value={form.contextDefault}
                      onChange={(event) => updateFormField('contextDefault', event.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.mainHypothesisKey', 'Clé hypothèse')}</Label>
                    <Input
                      value={form.mainHypothesisKey}
                      onChange={(event) => updateFormField('mainHypothesisKey', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.mainHypothesisDefault', 'Hypothèse (défaut)')}</Label>
                    <Textarea
                      value={form.mainHypothesisDefault}
                      onChange={(event) => updateFormField('mainHypothesisDefault', event.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.scopeKey', 'Clé périmètre')}</Label>
                    <Input
                      value={form.scopeKey}
                      onChange={(event) => updateFormField('scopeKey', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('traceos.templates.admin.fields.scopeDefault', 'Périmètre (défaut)')}</Label>
                    <Input
                      value={form.scopeDefault}
                      onChange={(event) => updateFormField('scopeDefault', event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label className="text-base">
                    {t('traceos.templates.admin.fields.alternatives', 'Hypothèses alternatives')}
                  </Label>
                  <div className="space-y-3 mt-3">
                    {form.alternativeHypotheses.map((item, index) => (
                      <div key={`alt-${index}`} className="grid gap-2 md:grid-cols-[1fr,1fr,auto]">
                        <Input
                          placeholder={t('traceos.templates.admin.fields.keyPlaceholder', 'Clé i18n')}
                          value={item.key}
                          onChange={(event) =>
                            updateListItem('alternativeHypotheses', index, 'key', event.target.value)
                          }
                        />
                        <Input
                          placeholder={t('traceos.templates.admin.fields.defaultPlaceholder', 'Valeur par défaut')}
                          value={item.fallback}
                          onChange={(event) =>
                            updateListItem('alternativeHypotheses', index, 'fallback', event.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeListItem('alternativeHypotheses', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addListItem('alternativeHypotheses')}>
                      {t('traceos.templates.admin.fields.addAlternative', 'Ajouter une hypothèse')}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base">
                    {t('traceos.templates.admin.fields.constraints', 'Contraintes')}
                  </Label>
                  <div className="space-y-3 mt-3">
                    {form.constraints.map((item, index) => (
                      <div key={`constraint-${index}`} className="grid gap-2 md:grid-cols-[1fr,1fr,auto]">
                        <Input
                          placeholder={t('traceos.templates.admin.fields.keyPlaceholder', 'Clé i18n')}
                          value={item.key}
                          onChange={(event) => updateListItem('constraints', index, 'key', event.target.value)}
                        />
                        <Input
                          placeholder={t('traceos.templates.admin.fields.defaultPlaceholder', 'Valeur par défaut')}
                          value={item.fallback}
                          onChange={(event) =>
                            updateListItem('constraints', index, 'fallback', event.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeListItem('constraints', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addListItem('constraints')}>
                      {t('traceos.templates.admin.fields.addConstraint', 'Ajouter une contrainte')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {t('traceos.templates.admin.save', 'Enregistrer')}
                </Button>
                {selectedTemplateId && (
                  <Button variant="destructive" onClick={handleDelete} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('traceos.templates.admin.delete', 'Supprimer')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
