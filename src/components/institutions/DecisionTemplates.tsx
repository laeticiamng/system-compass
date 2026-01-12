import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Monitor, 
  Target, 
  DollarSign, 
  Scale, 
  Building2,
  Briefcase,
  Shield,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface DecisionTemplate {
  id: string;
  category: 'rh' | 'it' | 'strategy' | 'finance' | 'legal' | 'operations';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  template: {
    title: string;
    context: string;
    mainHypothesis: string;
    alternativeHypotheses: string[];
    constraints: string[];
    scope: string;
  };
}

type TraceOSTemplateRow = Database['public']['Tables']['traceos_templates']['Row'];

interface LocalizedItem {
  key: string | null;
  fallback: string | null;
}

const iconMap: Record<string, DecisionTemplate['icon']> = {
  Users,
  Monitor,
  Target,
  DollarSign,
  Scale,
  Building2,
  Briefcase,
  Shield,
  FileText
};

const resolveText = (
  key: string | null,
  fallback: string | null,
  t: ReturnType<typeof useTranslation>['t']
) => {
  if (key) {
    return t(key, fallback ?? '');
  }
  return fallback ?? '';
};

const parseLocalizedItem = (value: Json): LocalizedItem | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, Json>;
  const key = typeof record.key === 'string' ? record.key : null;
  const fallback = typeof record.default === 'string' ? record.default : null;
  if (!key && !fallback) {
    return null;
  }
  return { key, fallback };
};

const resolveList = (
  value: Json | null,
  t: ReturnType<typeof useTranslation>['t']
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => parseLocalizedItem(item))
    .filter((item): item is LocalizedItem => Boolean(item))
    .map((item) => resolveText(item.key, item.fallback, t))
    .filter((item) => item.trim().length > 0);
};

const categoryColors: Record<string, string> = {
  rh: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  it: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  strategy: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  finance: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  legal: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  operations: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
};

const getCategoryLabel = (category: string, t: ReturnType<typeof useTranslation>['t']): string => {
  const labels: Record<string, string> = {
    rh: t('traceos.templates.categories.rh', 'RH'),
    it: t('traceos.templates.categories.it', 'IT'),
    strategy: t('traceos.templates.categories.strategy', 'Stratégie'),
    finance: t('traceos.templates.categories.finance', 'Finance'),
    legal: t('traceos.templates.categories.legal', 'Juridique'),
    operations: t('traceos.templates.categories.operations', 'Opérations')
  };
  return labels[category] || category;
};

interface DecisionTemplatesProps {
  onSelectTemplate: (template: DecisionTemplate['template']) => void;
}

export function DecisionTemplates({ onSelectTemplate }: DecisionTemplatesProps) {
  const { t, i18n } = useTranslation();
  const [templates, setTemplates] = useState<TraceOSTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('traceos_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (!mounted) {
        return;
      }

      if (error) {
        console.error('Error fetching TraceOS templates:', error);
        toast.error(t('traceos.templates.error', 'Erreur lors du chargement des templates'));
        setTemplates([]);
      } else {
        setTemplates(data ?? []);
      }
      setLoading(false);
    };

    fetchTemplates();

    return () => {
      mounted = false;
    };
  }, [t]);

  const displayTemplates = useMemo(() => {
    return templates.map<DecisionTemplate>((template) => {
      const icon = iconMap[template.icon] ?? FileText;
      return {
        id: template.template_key,
        category: template.category as DecisionTemplate['category'],
        icon,
        title: resolveText(template.title_key, template.title_default, t),
        description: resolveText(template.description_key, template.description_default, t),
        template: {
          title: resolveText(template.template_title_key, template.template_title_default, t),
          context: resolveText(template.context_key, template.context_default, t),
          mainHypothesis: resolveText(template.main_hypothesis_key, template.main_hypothesis_default, t),
          alternativeHypotheses: resolveList(template.alternative_hypotheses, t),
          constraints: resolveList(template.constraints, t),
          scope: resolveText(template.scope_key, template.scope_default, t)
        }
      };
    });
  }, [i18n.language, t, templates]);

  const groupedTemplates = displayTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DecisionTemplate[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('traceos.templates.title', 'Templates de décision')}
        </CardTitle>
        <CardDescription>
          {t('traceos.templates.description', 'Utilisez un template pour accélérer la création de votre décision')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t('traceos.templates.loading', 'Chargement des templates...')}
            </div>
          ) : displayTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t('traceos.templates.empty', 'Aucun template disponible pour le moment.')}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={categoryColors[category]}>
                      {getCategoryLabel(category, t)}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {categoryTemplates.map((template) => (
                      <Card 
                        key={template.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => onSelectTemplate(template.template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                              <template.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{template.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              {t('traceos.templates.use', 'Utiliser')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export type { DecisionTemplate };
