import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { useCountries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskBars } from '@/components/RiskBars';
import { RadarCompareChart } from '@/components/RadarCompareChart';
import { RiskStackedBarChart } from '@/components/RiskStackedBarChart';
import { TagsRadarCompare } from '@/components/TagsRadarCompare';
import { TagsCompareTable } from '@/components/TagsCompareTable';
import { ProfileCountryMatcher } from '@/components/ProfileCountryMatcher';
import { FinancialTrajectoryChart } from '@/components/FinancialTrajectoryChart';
import { useSavedComparisons } from '@/hooks/useSavedComparisons';
import { cn } from '@/lib/utils';
import { 
  Plus, X, Share2, Trash2, Save, Bookmark, FolderOpen,
  Plane, DollarSign, Heart, Wifi, TrendingUp, TrendingDown, Minus
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

const PYRAMID_TYPE_LABELS: Record<string, string> = {
  PROBLEM_RENT: 'pyramids.problemRent.label',
  STABILITY_REDIS: 'pyramids.stabilityRedis.label',
  COMPETENCE_TRUST: 'pyramids.competenceTrust.label',
  GROWTH_RISK: 'pyramids.growthRisk.label',
  HYBRID_TRANSITION: 'pyramids.hybridTransition.label',
  RESOURCE_EXTRACTION: 'pyramids.resourceExtraction.label',
};

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

function getVisaDifficultyScore(difficulty: string): number {
  const scores: Record<string, number> = {
    easy: 1,
    moderate: 2,
    difficult: 3,
    very_difficult: 4,
  };
  return scores[difficulty] || 3;
}

export default function MultiCompare() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Update URL when countries change
  useEffect(() => {
    if (selectedIds.length > 0) {
      setSearchParams({ countries: selectedIds.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedIds, setSearchParams]);

  const addCountry = (id: string) => {
    if (selectedIds.length < MAX_COUNTRIES && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeCountry = (id: string) => {
    setSelectedIds(selectedIds.filter(cid => cid !== id));
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
      toast.error('Failed to copy link');
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
    setSelectedIds(countryIds.slice(0, MAX_COUNTRIES));
    setLoadDialogOpen(false);
    toast.success(t('multiCompare.loaded', 'Comparison loaded!'));
  };

  const handleDeleteComparison = async (id: string) => {
    const success = await deleteComparison(id);
    if (success) {
      toast.success(t('multiCompare.deleted', 'Comparison deleted'));
    }
  };

  const availableCountries = countries.filter(c => !selectedIds.includes(c.id));

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
      <div className="flex items-center gap-2">
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

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-4">
            {t('multiCompare.title', 'Compare Multiple Countries')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('multiCompare.subtitle', 'Select up to 5 countries to compare side-by-side')}
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {selectedIds.length < MAX_COUNTRIES && (
            <Select onValueChange={addCountry}>
              <SelectTrigger className="w-64">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <SelectValue placeholder={t('multiCompare.addCountry', 'Add a country')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[country.pyramidType] || 'primary'}))` }}
                      />
                      {getFlagEmoji(country.iso2)} {country.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedIds.length >= 2 && isLoggedIn && (
            <>
              {/* Save Dialog */}
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Save className="w-4 h-4" />
                    {t('multiCompare.save', 'Save')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('multiCompare.saveComparison', 'Save Comparison')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder={t('multiCompare.comparisonName', 'Comparison name...')}
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
                      <Button variant="outline">{t('common.cancel', 'Cancel')}</Button>
                    </DialogClose>
                    <Button onClick={handleSaveComparison} disabled={!saveName.trim()}>
                      {t('common.save', 'Save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Load Dialog */}
              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {t('multiCompare.load', 'Load')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('multiCompare.savedComparisons', 'Saved Comparisons')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-80 overflow-y-auto py-4">
                    {comparisonsLoading ? (
                      <p className="text-muted-foreground text-center py-4">{t('common.loading', 'Loading...')}</p>
                    ) : comparisons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">{t('multiCompare.noSaved', 'No saved comparisons')}</p>
                    ) : (
                      comparisons.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{comp.name}</p>
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
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleLoadComparison(comp.country_ids)}>
                              {t('common.load', 'Load')}
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
              <Button variant="outline" className="gap-2">
                <Bookmark className="w-4 h-4" />
                {t('multiCompare.loginToSave', 'Login to save')}
              </Button>
            </Link>
          )}

          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" onClick={shareComparison} className="gap-2">
                <Share2 className="w-4 h-4" />
                {t('compare.shareComparison')}
              </Button>
              <Button variant="outline" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
                {t('multiCompare.clearAll', 'Clear All')}
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[country.pyramidType] || 'primary'}))` }}
                />
                <span>{getFlagEmoji(country.iso2)} {country.name}</span>
                <button
                  onClick={() => removeCountry(country.id)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Tables */}
        {selectedCountries.length >= 2 ? (
          <div className="space-y-8">
            {/* Financial Trajectory Chart */}
            <FinancialTrajectoryChart />
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <RadarCompareChart countries={selectedCountries} />
              
              {/* Risk Stacked Bar Chart */}
              <RiskStackedBarChart countries={selectedCountries} />
            </div>

            {/* Intelligence Tags Radar */}
            <TagsRadarCompare 
              countryIds={selectedIds}
              countryNames={Object.fromEntries(
                selectedCountries.map(c => [c.id, { name: c.name, iso2: c.iso2 }])
              )}
            />

            {/* Intelligence Tags Table */}
            <TagsCompareTable
              countryIds={selectedIds}
              countryNames={Object.fromEntries(
                selectedCountries.map(c => [c.id, { name: c.name, iso2: c.iso2 }])
              )}
            />

            {/* Key Metrics */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('compare.keyMetrics')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">{t('common.metric', 'Metric')}</TableHead>
                      {selectedCountries.map(c => (
                        <TableHead key={c.id} className="text-center min-w-32">
                          {getFlagEmoji(c.iso2)} {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('countryDetail.snapshot.gdpPerCapita')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
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
                      <TableCell className="font-medium">{t('countryDetail.snapshot.passportRank')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
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
                      <TableCell className="font-medium">{t('countryDetail.snapshot.corruptionIndex')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            100 - c.snapshot.corruptionIndex,
                            selectedCountries.map(x => 100 - x.snapshot.corruptionIndex),
                            false,
                            v => `${v}/100`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('countryDetail.snapshot.freedomIndex')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.snapshot.freedomIndex,
                            selectedCountries.map(x => x.snapshot.freedomIndex),
                            true,
                            v => `${v}/100`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Visa & Immigration */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  {t('compare.visaInfo')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">{t('common.metric', 'Metric')}</TableHead>
                      {selectedCountries.map(c => (
                        <TableHead key={c.id} className="text-center min-w-32">
                          {getFlagEmoji(c.iso2)} {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('visa.workVisa')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            getVisaDifficultyScore(c.visa.workVisa),
                            selectedCountries.map(x => getVisaDifficultyScore(x.visa.workVisa)),
                            false,
                            () => t(`visa.${c.visa.workVisa}`)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('visa.digitalNomadVisa')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          <span className={cn(
                            c.visa.digitalNomadVisa ? "text-risk-low" : "text-muted-foreground"
                          )}>
                            {c.visa.digitalNomadVisa ? t('visa.available') : t('visa.notAvailable')}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('visa.startupVisa')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          <span className={cn(
                            c.visa.startupVisa ? "text-risk-low" : "text-muted-foreground"
                          )}>
                            {c.visa.startupVisa ? t('visa.available') : t('visa.notAvailable')}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('visa.citizenshipYears')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.visa.citizenshipYears,
                            selectedCountries.map(x => x.visa.citizenshipYears),
                            false,
                            v => `${v} ${t('common.years')}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Cost of Living */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t('compare.costOfLiving')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">{t('common.metric', 'Metric')}</TableHead>
                      {selectedCountries.map(c => (
                        <TableHead key={c.id} className="text-center min-w-32">
                          {getFlagEmoji(c.iso2)} {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('costOfLiving.index')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
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
                      <TableCell className="font-medium">{t('costOfLiving.monthlyBudgetSingle')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.costOfLiving.monthlyBudgetSingle,
                            selectedCountries.map(x => x.costOfLiving.monthlyBudgetSingle),
                            false,
                            v => `$${v.toLocaleString()}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('costOfLiving.monthlyBudgetFamily')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.costOfLiving.monthlyBudgetFamily,
                            selectedCountries.map(x => x.costOfLiving.monthlyBudgetFamily),
                            false,
                            v => `$${v.toLocaleString()}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('costOfLiving.rentIndex')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.costOfLiving.rentIndex,
                            selectedCountries.map(x => x.costOfLiving.rentIndex),
                            false,
                            v => `${v}/100`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Quality of Life */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  {t('compare.qualityOfLife')}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">{t('common.metric', 'Metric')}</TableHead>
                      {selectedCountries.map(c => (
                        <TableHead key={c.id} className="text-center min-w-32">
                          {getFlagEmoji(c.iso2)} {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('qualityOfLife.healthcareRank')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.qualityOfLife.healthcareRank,
                            selectedCountries.map(x => x.qualityOfLife.healthcareRank),
                            false,
                            v => `#${v}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('qualityOfLife.safetyIndex')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
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
                      <TableCell className="font-medium">{t('qualityOfLife.workLifeBalance')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {renderValueCell(
                            c.qualityOfLife.workLifeBalance,
                            selectedCountries.map(x => x.qualityOfLife.workLifeBalance),
                            true,
                            v => `${v}/10`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('qualityOfLife.internetSpeed')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
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

            {/* System Types */}
            <section className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold">{t('compare.systemType')}</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">{t('common.country', 'Country')}</TableHead>
                      {selectedCountries.map(c => (
                        <TableHead key={c.id} className="text-center min-w-32">
                          {getFlagEmoji(c.iso2)} {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t('compare.systemType')}</TableCell>
                      {selectedCountries.map(c => (
                        <TableCell key={c.id} className="text-center">
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `hsl(var(--${PYRAMID_TYPE_COLORS[c.pyramidType] || 'primary'}) / 0.2)`,
                              color: `hsl(var(--${PYRAMID_TYPE_COLORS[c.pyramidType] || 'primary'}))`
                            }}
                          >
                            {t(PYRAMID_TYPE_LABELS[c.pyramidType])}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* Profile Country Matcher */}
            <ProfileCountryMatcher />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Show Profile Matcher even without countries selected */}
            <ProfileCountryMatcher />
            
            <div className="text-center py-8 glass-card rounded-xl">
              <p className="text-muted-foreground text-lg">
                {t('multiCompare.selectAtLeast', 'Select at least 2 countries to compare')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
