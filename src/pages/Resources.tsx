import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Wallet, 
  GraduationCap, 
  Globe, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Download,
  Clock,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const categoryIcons = {
  financial: Wallet,
  skills: GraduationCap,
  mobility: Globe,
  security: Shield,
};

const categoryColors = {
  financial: 'text-emerald-500 bg-emerald-500/10',
  skills: 'text-blue-500 bg-blue-500/10',
  mobility: 'text-amber-500 bg-amber-500/10',
  security: 'text-red-500 bg-red-500/10',
};

const categoryKeys = ['financial', 'skills', 'mobility', 'security'] as const;

const resourceItemDetails: Record<string, Record<string, { difficulty: 'easy' | 'medium' | 'hard'; time: string; priority: 'high' | 'medium' | 'low' }>> = {
  financial: {
    emergencyFund: { difficulty: 'easy', time: '3-6 mois', priority: 'high' },
    multipleIncome: { difficulty: 'hard', time: '6-12 mois', priority: 'high' },
    offshoreBanking: { difficulty: 'medium', time: '1-3 mois', priority: 'medium' },
    taxOptimization: { difficulty: 'hard', time: '3-6 mois', priority: 'medium' },
  },
  skills: {
    remote: { difficulty: 'medium', time: '2-6 mois', priority: 'high' },
    certifications: { difficulty: 'medium', time: '3-12 mois', priority: 'medium' },
    languages: { difficulty: 'hard', time: '6-24 mois', priority: 'high' },
    digitalPresence: { difficulty: 'easy', time: '1-2 mois', priority: 'medium' },
  },
  mobility: {
    documents: { difficulty: 'easy', time: '1-3 mois', priority: 'high' },
    visaStrategy: { difficulty: 'medium', time: '3-6 mois', priority: 'high' },
    secondResidency: { difficulty: 'hard', time: '6-24 mois', priority: 'low' },
    digitalNomad: { difficulty: 'medium', time: '1-3 mois', priority: 'medium' },
  },
  security: {
    opsec: { difficulty: 'medium', time: '1-2 mois', priority: 'high' },
    digitalPrivacy: { difficulty: 'easy', time: '1-4 semaines', priority: 'high' },
    assetProtection: { difficulty: 'hard', time: '3-12 mois', priority: 'medium' },
    networkSafety: { difficulty: 'easy', time: '1-2 semaines', priority: 'medium' },
  },
};

const resourceItemKeys = {
  financial: ['emergencyFund', 'multipleIncome', 'offshoreBanking', 'taxOptimization'],
  skills: ['remote', 'certifications', 'languages', 'digitalPresence'],
  mobility: ['documents', 'visaStrategy', 'secondResidency', 'digitalNomad'],
  security: ['opsec', 'digitalPrivacy', 'assetProtection', 'networkSafety'],
};

// Interactive checklists with completion tracking
function InteractiveChecklist({ 
  titleKey, 
  items, 
  storageKey 
}: { 
  titleKey: string; 
  items: string[]; 
  storageKey: string;
}) {
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : new Array(items.length).fill(false);
  });

  const toggleItem = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    localStorage.setItem(storageKey, JSON.stringify(newChecked));
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t(titleKey)}</CardTitle>
          <Badge variant={progress === 100 ? 'default' : 'outline'} className={cn(progress === 100 && 'bg-emerald-500')}>
            {completedCount}/{items.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t('resources.noItems', 'Éléments à venir...')}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li 
                key={i} 
                onClick={() => toggleItem(i)}
                className={cn(
                  "flex items-center gap-3 text-sm p-2 rounded-lg cursor-pointer transition-all",
                  checkedItems[i] 
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                    : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  checkedItems[i] 
                    ? "border-emerald-500 bg-emerald-500 text-white" 
                    : "border-muted-foreground"
                )}>
                  {checkedItems[i] && <CheckCircle className="w-3 h-3" />}
                </div>
                <span className={cn(checkedItems[i] && "line-through opacity-70")}>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const config = {
    easy: { label: 'Facile', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    medium: { label: 'Modéré', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    hard: { label: 'Difficile', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  };
  return (
    <Badge variant="outline" className={cn('text-xs', config[difficulty].color)}>
      {config[difficulty].label}
    </Badge>
  );
}

function PriorityIndicator({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { color: 'bg-red-500', label: 'Priorité haute' },
    medium: { color: 'bg-amber-500', label: 'Priorité moyenne' },
    low: { color: 'bg-blue-500', label: 'Priorité basse' },
  };
  return (
    <div className="flex items-center gap-1.5" title={config[priority].label}>
      <div className={cn('w-2 h-2 rounded-full', config[priority].color)} />
    </div>
  );
}

export default function Resources() {
  const { t } = useTranslation();

  const survival30ItemsRaw = t('resources.checklists.survival30.items', { returnObjects: true });
  const preMoveItemsRaw = t('resources.checklists.preMove.items', { returnObjects: true });
  
  const survival30Items = Array.isArray(survival30ItemsRaw) ? survival30ItemsRaw : [];
  const preMoveItems = Array.isArray(preMoveItemsRaw) ? preMoveItemsRaw : [];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <Badge className="mb-4 px-3 py-1" variant="outline">
            <BookOpen className="w-3 h-3 mr-2" />
            {t('resources.badge', 'Ressources & Guides')}
          </Badge>
          <h1 className="font-display text-4xl font-bold mb-4">{t('resources.title')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('resources.subtitle')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categoryKeys.map((catKey) => {
            const Icon = categoryIcons[catKey];
            const itemCount = resourceItemKeys[catKey].length;
            return (
              <Card key={catKey} className="text-center">
                <CardContent className="pt-6">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3', categoryColors[catKey])}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-display text-2xl font-bold">{itemCount}</div>
                  <div className="text-sm text-muted-foreground">{t(`resources.categories.${catKey}.title`)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resource Categories with Accordion */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {t('resources.categoriesTitle', 'Catégories de ressources')}
          </h2>
          
          <Accordion type="multiple" className="space-y-4">
            {categoryKeys.map((catKey) => {
              const Icon = categoryIcons[catKey];
              return (
                <AccordionItem 
                  key={catKey} 
                  value={catKey}
                  className="glass-card rounded-xl border px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', categoryColors[catKey])}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-display font-semibold">{t(`resources.categories.${catKey}.title`)}</h3>
                        <p className="text-sm text-muted-foreground">{t(`resources.categories.${catKey}.description`)}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid gap-3 mt-2">
                      {resourceItemKeys[catKey].map((itemKey) => {
                        const details = resourceItemDetails[catKey][itemKey];
                        return (
                          <div
                            key={itemKey}
                            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <PriorityIndicator priority={details.priority} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{t(`resources.categories.${catKey}.items.${itemKey}.name`)}</span>
                                <DifficultyBadge difficulty={details.difficulty} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {t(`resources.categories.${catKey}.items.${itemKey}.description`)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{details.time}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Interactive Checklists */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            {t('resources.checklists.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('resources.checklists.subtitle', 'Cochez les éléments au fur et à mesure de votre progression. Votre avancement est sauvegardé automatiquement.')}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <InteractiveChecklist 
              titleKey="resources.checklists.survival30.title" 
              items={survival30Items} 
              storageKey="checklist-survival30" 
            />
            <InteractiveChecklist 
              titleKey="resources.checklists.preMove.title" 
              items={preMoveItems} 
              storageKey="checklist-premove" 
            />
          </div>
        </div>

        {/* Related Tools */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            {t('resources.relatedTools', 'Outils complémentaires')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/exit-keys">
              <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{t('resources.tools.exitKeys', 'Clés de Sortie')}</h4>
                    <p className="text-sm text-muted-foreground">{t('resources.tools.exitKeysDesc', 'Plans personnalisés')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/prevention-filter">
              <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <Shield className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{t('resources.tools.filter', 'Filtre de Prévention')}</h4>
                    <p className="text-sm text-muted-foreground">{t('resources.tools.filterDesc', 'Analyser une décision')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/errors-illusions">
              <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{t('resources.tools.errors', 'Erreurs & Illusions')}</h4>
                    <p className="text-sm text-muted-foreground">{t('resources.tools.errorsDesc', 'Éviter les pièges')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="border-l-4 border-primary">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-semibold mb-2">{t('resources.disclaimer.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('resources.disclaimer.text')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}