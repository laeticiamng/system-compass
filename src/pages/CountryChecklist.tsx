/**
 * Country Administrative Checklist Page
 * Interactive checklist per country for expatriation preparation
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useCountries } from '@/lib/countries-data';
import {
  CHECKLIST_CATEGORIES,
  getChecklistStorageKey,
} from '@/lib/country-checklist-data';
import { loadChecklistState, saveChecklistState } from '@/lib/checklist-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClipboardList,
  Shield,
  Landmark,
  Home,
  FileText,
  Users,
  Plane,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  visa: Plane,
  banking: Landmark,
  insurance: Shield,
  housing: Home,
  admin: FileText,
  family: Users,
};

export default function CountryChecklist() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('visa');

  // All items flat
  const allItems = useMemo(
    () => CHECKLIST_CATEGORIES.flatMap((c) => c.items),
    []
  );

  const storageKey = selectedCountry
    ? getChecklistStorageKey(selectedCountry)
    : '';

  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

  // Load state when country changes
  useEffect(() => {
    if (storageKey) {
      setCheckedItems(loadChecklistState(storageKey, allItems.length));
    } else {
      setCheckedItems(new Array(allItems.length).fill(false));
    }
  }, [storageKey, allItems.length]);

  const handleToggle = (flatIndex: number) => {
    const next = [...checkedItems];
    next[flatIndex] = !next[flatIndex];
    setCheckedItems(next);
    if (storageKey) {
      saveChecklistState(storageKey, next);
    }
  };

  const completedCount = checkedItems.filter(Boolean).length;
  const overallProgress =
    allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;

  // Get flat index for an item id
  const getFlatIndex = (itemId: string) =>
    allItems.findIndex((i) => i.id === itemId);

  // Sorted countries
  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );

  return (
    <>
      <Helmet>
        <title>{t('checklist.seoTitle', 'Checklist d\'expatriation par pays | Compass')}</title>
        <meta
          name="description"
          content={t('checklist.seoDesc', 'Checklist administrative complète pour votre expatriation : visa, banque, assurance, logement. Suivez votre progression par pays.')}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-14 sm:py-18 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="outline" className="mb-4 gap-2">
                <ClipboardList className="w-3.5 h-3.5" />
                {t('checklist.badge', '6 catégories • 40+ tâches')}
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="block text-foreground">{t('checklist.heroTitle1', 'Checklist administrative')}</span>
                <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  {t('checklist.heroTitle2', 'par pays de destination.')}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('checklist.heroSubtitle', 'Visa, banque, assurance, logement — ne rien oublier avant, pendant et après votre départ.')}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 max-w-4xl">
          {/* Country selector */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t('checklist.selectCountry', 'Pays de destination')}
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder={t('checklist.selectPlaceholder', 'Choisir un pays...')} />
                </SelectTrigger>
                <SelectContent>
                  {sortedCountries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Progress overview */}
          {selectedCountry && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-muted-foreground">
                      {t('checklist.progress', 'Progression globale')}
                    </span>
                    <span className="font-semibold">
                      {completedCount}/{allItems.length} ({overallProgress}%)
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-2.5" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Categories */}
          {selectedCountry && (
            <div className="space-y-4">
              {CHECKLIST_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id] || FileText;
                const catItems = cat.items;
                const catCompleted = catItems.filter(
                  (item) => checkedItems[getFlatIndex(item.id)]
                ).length;
                const catProgress =
                  catItems.length > 0
                    ? Math.round((catCompleted / catItems.length) * 100)
                    : 0;
                const isExpanded = expandedCategory === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={cn(
                        'transition-all duration-200',
                        isExpanded && 'ring-1 ring-primary/20'
                      )}
                    >
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : cat.id)
                        }
                        className="w-full text-left"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Icon className="w-4.5 h-4.5 text-primary" />
                              {t(cat.labelKey, cat.labelFallback)}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {catProgress === 100 ? (
                                <Badge className="bg-emerald-500/20 text-emerald-600 border-0 gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {t('checklist.done', 'Complet')}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {catCompleted}/{catItems.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Progress value={catProgress} className="h-1.5 mt-2" />
                        </CardHeader>
                      </button>

                      {isExpanded && (
                        <CardContent className="pt-0 pb-4">
                          <div className="space-y-2">
                            {catItems.map((item) => {
                              const flatIdx = getFlatIndex(item.id);
                              const isChecked = checkedItems[flatIdx] || false;

                              return (
                                <label
                                  key={item.id}
                                  className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                                    'hover:bg-muted/50',
                                    isChecked && 'bg-muted/30'
                                  )}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => handleToggle(flatIdx)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className={cn(
                                        'text-sm',
                                        isChecked &&
                                          'line-through text-muted-foreground'
                                      )}
                                    >
                                      {item.label}
                                    </span>
                                    {item.critical && !isChecked && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                          {t('checklist.critical', 'Étape critique')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!selectedCountry && (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">
                {t('checklist.emptyTitle', 'Sélectionnez un pays pour commencer')}
              </p>
              <p className="text-sm mt-1">
                {t('checklist.emptyDesc', 'Votre progression sera sauvegardée automatiquement pour chaque pays.')}
              </p>
            </div>
          )}

          {/* Bottom disclaimer */}
          {selectedCountry && (
            <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                {t('checklist.disclaimer', 'Progression sauvegardée localement. Liste générique — consultez un professionnel pour les spécificités de votre pays.')}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
