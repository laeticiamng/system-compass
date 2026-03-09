import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/i18n';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { useCountries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskBars } from '@/components/RiskBars';
import { RadarCompareChart } from '@/components/RadarCompareChart';
import { RiskStackedBarChart } from '@/components/RiskStackedBarChart';
import { FinancialTrajectoryChart } from '@/components/FinancialTrajectoryChart';
import { useSavedComparisons } from '@/hooks/useSavedComparisons';
import { OVISuggestions } from '@/components/ovi/OVISuggestions';
import { cn } from '@/lib/utils';
import {
  Plus, X, Share2, Trash2, Save, Bookmark, FolderOpen,
  TrendingUp, TrendingDown,
  ArrowLeftRight, Check, Scale, Users, User
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PremiumPageWrapper } from '@/components/PremiumPageWrapper';

const PYRAMID_TYPE_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'pyramid-rent',
  STABILITY_REDIS: 'pyramid-stability',
  COMPETENCE_TRUST: 'pyramid-competence',
  GROWTH_RISK: 'pyramid-growth',
  HYBRID_TRANSITION: 'pyramid-hybrid',
  RESOURCE_EXTRACTION: 'pyramid-resource',
};

const MAX_COUNTRIES = 5;

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function CompareUnified() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Determine mode from URL or default to 'duo'
  const initialMode = searchParams.get('mode') || 'duo';
  const [compareMode, setCompareMode] = useState<'duo' | 'multi'>(initialMode as 'duo' | 'multi');
  
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const ids = searchParams.get('countries')?.split(',').filter(Boolean) || [];
    return ids.slice(0, MAX_COUNTRIES);
  });
  
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  const { comparisons, loading: comparisonsLoading, isLoggedIn, saveComparison, deleteComparison } = useSavedComparisons();

  const selectedCountries = selectedIds
    .map(id => countries.find(c => c.id === id))
    .filter((c): c is Country => c !== undefined);

  // Update URL when countries or mode change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('mode', compareMode);
    if (selectedIds.length > 0) {
      params.set('countries', selectedIds.join(','));
    }
    setSearchParams(params, { replace: true });
  }, [selectedIds, compareMode, setSearchParams]);

  const addCountry = (id: string) => {
    const maxAllowed = compareMode === 'duo' ? 2 : MAX_COUNTRIES;
    if (selectedIds.length < maxAllowed && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeCountry = (id: string) => {
    setSelectedIds(selectedIds.filter(cid => cid !== id));
  };

  const swapCountries = () => {
    if (selectedIds.length === 2) {
      setSelectedIds([selectedIds[1], selectedIds[0]]);
    }
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  const shareComparison = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('compare.linkCopied'));
    } catch {
      toast.error(t('toast.error.copyLink', 'Failed to copy link'));
    }
  };

  const handleSaveComparison = async () => {
    if (!saveName.trim() || selectedIds.length < 2) return;
    const result = await saveComparison(saveName.trim(), selectedIds);
    if (result) {
      toast.success(t('multiCompare.saved', 'Comparison saved!'));
      setSaveName('');
      setSaveDialogOpen(false);
    } else {
      toast.error(t('multiCompare.saveError', 'Failed to save comparison'));
    }
  };

  const handleLoadComparison = (countryIds: string[]) => {
    const maxAllowed = compareMode === 'duo' ? 2 : MAX_COUNTRIES;
    setSelectedIds(countryIds.slice(0, maxAllowed));
    setLoadDialogOpen(false);
    toast.success(t('multiCompare.loaded', 'Comparison loaded!'));
  };

  const handleDeleteComparison = async (id: string) => {
    const success = await deleteComparison(id);
    if (success) {
      toast.success(t('multiCompare.deleted', 'Comparison deleted'));
    }
  };

  const handleModeChange = (mode: 'duo' | 'multi') => {
    setCompareMode(mode);
    if (mode === 'duo' && selectedIds.length > 2) {
      setSelectedIds(selectedIds.slice(0, 2));
    }
  };

  const availableCountries = countries.filter(c => !selectedIds.includes(c.id));
  const maxAllowed = compareMode === 'duo' ? 2 : MAX_COUNTRIES;

  // Helper to find best/worst values
  const getBestValue = (values: number[], higherIsBetter: boolean) => {
    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  const renderValueCell = (value: number, allValues: number[], higherIsBetter: boolean, format: (v: number) => string) => {
    const best = getBestValue(allValues, higherIsBetter);
    const worst = getBestValue(allValues, !higherIsBetter);
    const isBest = value === best && allValues.filter(v => v === best).length === 1;
    const isWorst = value === worst && allValues.filter(v => v === worst).length === 1;

    return (
      <div className="flex items-center gap-2 justify-center">
        <span className={cn(
          isBest && "text-risk-low font-semibold",
          isWorst && "text-risk-high"
        )}>
          {format(value)}
        </span>
        {isBest && <TrendingUp className="w-3 h-3 text-risk-low" />}
        {isWorst && <TrendingDown className="w-3 h-3 text-risk-high" />}
      </div>
    );
  };

  const previewContent = (
    <div className="min-h-[40vh] pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t('compare.title')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            {t('compare.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <PremiumPageWrapper
      title={t('subscription.compareTitle', 'Comparaison de Pays')}
      description={t('subscription.compareDesc', 'Comparez jusqu\'à 5 pays côte à côte pour prendre des décisions éclairées.')}
      previewContent={previewContent}
    >
    <div className="min-h-screen pt-20 pb-16">
      <Helmet>
        <title>Comparateur de Pays — Compass</title>
        <meta name="description" content="Comparez jusqu'à 5 pays côte à côte : fiscalité, coût de la vie, qualité de vie, risques." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Comparateur de Pays — Compass" />
        <meta property="og:description" content="Comparez jusqu'à 5 pays sur fiscalité, coût de la vie et qualité de vie." />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Comparateur de Pays — Compass" />
        <meta name="twitter:description" content="Comparez jusqu'à 5 pays sur fiscalité, coût de la vie et qualité de vie." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {t('compare.title')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            {t('compare.subtitle')}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 max-w-lg mx-auto">
            {t('common.disclaimer')}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => handleModeChange('duo')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                compareMode === 'duo'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Duo (2 pays)</span>
              <span className="sm:hidden">Duo</span>
            </button>
            <button
              onClick={() => handleModeChange('multi')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                compareMode === 'multi'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t('compare.multiUpTo5', "Multi (jusqu'à 5)")}</span>
              <span className="sm:hidden">Multi</span>
            </button>
          </div>
        </div>

        {/* Country Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
          {selectedIds.length < maxAllowed && (
            <Select onValueChange={addCountry}>
              <SelectTrigger className="w-full sm:w-64">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <SelectValue placeholder={t('multiCompare.addCountry', 'Ajouter un pays')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[country.pyramidType] || 'primary'}))` }}
                      />
                      {getFlagEmoji(country.iso2)} {country.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {compareMode === 'duo' && selectedIds.length === 2 && (
            <Button variant="outline" size="icon" onClick={swapCountries}>
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          )}

          {selectedIds.length >= 2 && isLoggedIn && (
            <>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('multiCompare.save', 'Sauver')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('multiCompare.saveComparison', 'Sauvegarder la comparaison')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder={t('multiCompare.comparisonName', 'Nom de la comparaison...')}
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      {selectedCountries.map(c => (
                        <span key={c.id} className="text-sm px-2 py-1 bg-secondary rounded">
                          {getFlagEmoji(c.iso2)} {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('common.cancel', 'Annuler')}</Button>
                    </DialogClose>
                    <Button onClick={handleSaveComparison} disabled={!saveName.trim()}>
                      {t('common.save', 'Sauver')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('multiCompare.load', 'Charger')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('multiCompare.savedComparisons', 'Comparaisons sauvées')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-80 overflow-y-auto py-4">
                    {comparisonsLoading ? (
                      <p className="text-muted-foreground text-center py-4">{t('common.loading', 'Chargement...')}</p>
                    ) : comparisons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">{t('multiCompare.noSaved', 'Aucune sauvegarde')}</p>
                    ) : (
                      comparisons.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{comp.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {comp.country_ids.map(id => {
                                const country = countries.find(c => c.id === id);
                                return country ? (
                                  <span key={id} className="text-xs text-muted-foreground">
                                    {getFlagEmoji(country.iso2)}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" onClick={() => handleLoadComparison(comp.country_ids)}>
                              {t('common.load', 'Charger')}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteComparison(comp.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {selectedIds.length >= 2 && !isLoggedIn && (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">{t('multiCompare.loginToSave', 'Connecte-toi')}</span>
              </Button>
            </Link>
          )}

          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={shareComparison} className="gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('compare.shareComparison')}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('multiCompare.clearAll', 'Effacer')}</span>
              </Button>
            </>
          )}
        </div>

        {/* Selected Countries Tags */}
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {selectedCountries.map((country) => (
              <div
                key={country.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
              >
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[country.pyramidType] || 'primary'}))` }}
                />
                <span className="truncate max-w-[100px] sm:max-w-none">{getFlagEmoji(country.iso2)} {country.name}</span>
                <button
                  onClick={() => removeCountry(country.id)}
                  className="hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Content */}
        {selectedCountries.length >= 2 ? (
          <div className="space-y-8">
            {/* Financial Chart - only in multi mode or always */}
            <FinancialTrajectoryChart />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarCompareChart countries={selectedCountries} />
              <RiskStackedBarChart countries={selectedCountries} />
            </div>

            {/* Comparison Table */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('compare.keyMetrics')}
                </h2>
              </div>
              <div className="overflow-x-auto mobile-scroll-x">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28 sm:w-40 md:w-48 text-xs md:text-sm whitespace-nowrap">{t('common.metric', 'Métrique')}</TableHead>
                      {selectedCountries.map(c => (
                        <TableHead key={c.id} className="text-center min-w-24 md:min-w-32 text-xs md:text-sm">
                          <span className="hidden md:inline">{getFlagEmoji(c.iso2)} {c.name}</span>
                          <span className="md:hidden">{getFlagEmoji(c.iso2)}</span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-xs md:text-sm">{t('countryDetail.snapshot.gdpPerCapita')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center text-xs md:text-sm">
                          {renderValueCell(
                            c.snapshot.gdpPerCapita,
                            selectedCountries.map(x => x.snapshot.gdpPerCapita),
                            true,
                            v => `$${v.toLocaleString()}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs md:text-sm">{t('countryDetail.snapshot.passportRank')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center text-xs md:text-sm">
                          {renderValueCell(
                            c.snapshot.passportRank,
                            selectedCountries.map(x => x.snapshot.passportRank),
                            false,
                            v => `#${v}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs md:text-sm">{t('costOfLiving.index')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center text-xs md:text-sm">
                          {renderValueCell(
                            c.costOfLiving.index,
                            selectedCountries.map(x => x.costOfLiving.index),
                            false,
                            v => `${v}/100`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs md:text-sm">{t('qualityOfLife.safetyIndex')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center text-xs md:text-sm">
                          {renderValueCell(
                            c.qualityOfLife.safetyIndex,
                            selectedCountries.map(x => x.qualityOfLife.safetyIndex),
                            true,
                            v => `${v}/100`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs md:text-sm">{t('visa.citizenshipYears')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center text-xs md:text-sm">
                          {renderValueCell(
                            c.visa.citizenshipYears,
                            selectedCountries.map(x => x.visa.citizenshipYears),
                            false,
                            v => `${v} ans`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs md:text-sm">{t('qualityOfLife.internetSpeed')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center text-xs md:text-sm">
                          {renderValueCell(
                            c.qualityOfLife.internetSpeed,
                            selectedCountries.map(x => x.qualityOfLife.internetSpeed),
                            true,
                            v => `${v} Mbps`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Risk Comparison */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold">{t('countryDetail.riskAssessment')}</h2>
              </div>
              <div className={cn(
                "grid gap-4 p-4",
                selectedCountries.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {selectedCountries.map(country => (
                  <div key={country.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{getFlagEmoji(country.iso2)}</span>
                      <span className="font-semibold">{country.name}</span>
                    </div>
                    <RiskBars risks={country.risks} />
                  </div>
                ))}
              </div>
            </section>

            {/* Strategies */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold">{t('compare.strategies')}</h2>
              </div>
              <div className={cn(
                "grid gap-4 p-4",
                selectedCountries.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {selectedCountries.map(country => (
                  <div key={country.id} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
                      <span className="font-semibold text-sm">{country.name}</span>
                    </div>
                    <div className="glass-card rounded-xl p-3">
                      <h4 className="font-semibold text-risk-low mb-2 flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" /> {t('playbook.do')}
                      </h4>
                      <ul className="space-y-1">
                        {country.playbook.do.slice(0, 2).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Check className="w-3 h-3 text-risk-low mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass-card rounded-xl p-3">
                      <h4 className="font-semibold text-risk-critical mb-2 flex items-center gap-2 text-sm">
                        <X className="w-4 h-4" /> {t('playbook.dont')}
                      </h4>
                      <ul className="space-y-1">
                        {country.playbook.dont.slice(0, 2).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <X className="w-3 h-3 text-risk-critical mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* OVI Suggestions */}
            <OVISuggestions context="compare" />
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-xl">
            <Scale className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {compareMode === 'duo' 
                ? t('compare.selectBoth', 'Sélectionne 2 pays à comparer')
                : t('multiCompare.selectAtLeast', 'Sélectionne au moins 2 pays')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {t('compare.helpText', 'Utilisez le menu ci-dessus pour ajouter des pays et comparer leur fiscalité, qualité de vie, risques et opportunités.')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 px-2">
              <p className="text-xs text-muted-foreground w-full mb-2">{t('compare.popularComparisons', 'Comparaisons populaires :')}</p>
              {[
                { label: '🇫🇷 France vs 🇵🇹 Portugal', ids: ['portugal', 'france'] },
                { label: '🇫🇷 France vs 🇦🇪 Émirats', ids: ['uae', 'france'] },
                { label: '🇨🇭 Suisse vs 🇸🇬 Singapour', ids: ['singapore', 'switzerland'] },
              ].map((suggestion) => (
                <Button
                  key={suggestion.label}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const validIds = suggestion.ids.filter(id => countries.some(c => c.id === id));
                    if (validIds.length >= 2) setSelectedIds(validIds);
                  }}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </PremiumPageWrapper>
  );
}
