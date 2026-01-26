import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslationsSync, SeedResult } from '@/hooks/useTranslationsSync';
import { useTranslationGenerator } from '@/hooks/useTranslationGenerator';
import { Database, Upload, Trash2, RefreshCw, CheckCircle, XCircle, Clock, Sparkles, Languages } from 'lucide-react';
import { format } from 'date-fns';

interface TranslationStat {
  language: string;
  namespace: string;
  updated_at: string;
}

export default function AdminTranslationsSync() {
  useTranslation();
  const { seedTranslations, getTranslationsStats, clearTranslations, isSeeding, progress, error } = useTranslationsSync();
  const { 
    generateMissingTranslations, 
    getCoverageStats, 
    isGenerating, 
    progress: genProgress, 
    error: genError,
    SECONDARY_LANGUAGES,
    SECTIONS_TO_TRANSLATE
  } = useTranslationGenerator();
  
  const [stats, setStats] = useState<TranslationStat[]>([]);
  const [coverageStats, setCoverageStats] = useState<Record<string, { total: number; translated: number; percentage: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastResults, setLastResults] = useState<SeedResult[] | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [data, coverage] = await Promise.all([
        getTranslationsStats(),
        getCoverageStats()
      ]);
      setStats(data);
      setCoverageStats(coverage);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSeedAll = async () => {
    try {
      const results = await seedTranslations({ namespace: 'all' });
      setLastResults(results);
      await loadStats();
    } catch (err) {
      console.error('Seeding failed:', err);
    }
  };

  const handleSeedMain = async () => {
    try {
      const results = await seedTranslations({ namespace: 'translation' });
      setLastResults(results);
      await loadStats();
    } catch (err) {
      console.error('Seeding failed:', err);
    }
  };

  const handleSeedPositivePoints = async () => {
    try {
      const results = await seedTranslations({ namespace: 'positive-points' });
      setLastResults(results);
      await loadStats();
    } catch (err) {
      console.error('Seeding failed:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all translations from the database?')) return;
    try {
      await clearTranslations();
      await loadStats();
      setLastResults(null);
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  const handleGenerateMissing = async () => {
    try {
      await generateMissingTranslations();
      await loadStats();
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const mainTranslations = stats.filter(s => s.namespace === 'translation');
  const positivePoints = stats.filter(s => s.namespace === 'positive-points');

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translations Sync</h1>
          <p className="text-muted-foreground">
            Manage UI translations in the database
          </p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Seed Translations
          </CardTitle>
          <CardDescription>
            Upload local translation files to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSeedAll} disabled={isSeeding}>
              <Database className="h-4 w-4 mr-2" />
              Seed All (13 languages + 7 positive points)
            </Button>
            <Button variant="secondary" onClick={handleSeedMain} disabled={isSeeding}>
              Seed Main Translations Only
            </Button>
            <Button variant="secondary" onClick={handleSeedPositivePoints} disabled={isSeeding}>
              Seed Positive Points Only
            </Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={isSeeding}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          {isSeeding && progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Seeding: {progress.currentLanguage}</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>
          )}

          {lastResults && !isSeeding && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Last Seed Results</h4>
              <div className="flex flex-wrap gap-2">
                {lastResults.map((r, i) => (
                  <Badge 
                    key={i} 
                    variant={r.status === 'success' ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {r.status === 'success' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {r.language} ({r.namespace})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Translation Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Translation Generator
          </CardTitle>
          <CardDescription>
            Generate missing translations for all 11 secondary languages using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleGenerateMissing} 
              disabled={isGenerating || isSeeding}
              variant="default"
            >
              <Languages className="h-4 w-4 mr-2" />
              Generate Missing Translations (All Languages)
            </Button>
          </div>

          {/* Coverage Stats - Grid for all 11 languages */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2 pt-4">
            {SECONDARY_LANGUAGES.map(lang => {
              const langStats = coverageStats[lang];
              const pct = langStats?.percentage ?? 0;
              const bgColor = pct >= 95 ? 'bg-green-100 dark:bg-green-900/30' : 
                              pct >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                              'bg-red-100 dark:bg-red-900/30';
              return (
                <div key={lang} className={`text-center p-2 rounded-lg ${bgColor}`}>
                  <div className="font-bold text-sm">{lang.toUpperCase()}</div>
                  <div className="text-xl font-mono">
                    {pct}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {langStats?.translated ?? 0}/{langStats?.total ?? 0}
                  </div>
                </div>
              );
            })}
          </div>

          {isGenerating && genProgress && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>
                  Generating: {genProgress.currentLanguage} / {genProgress.currentSection}
                </span>
                <span>{genProgress.current} / {genProgress.total}</span>
              </div>
              <Progress value={(genProgress.current / genProgress.total) * 100} />
            </div>
          )}

          {genProgress && genProgress.results.length > 0 && !isGenerating && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Generation Results</h4>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {genProgress.results.map((r, i) => (
                  <Badge 
                    key={i} 
                    variant={r.status === 'success' ? 'default' : r.status === 'skipped' ? 'secondary' : 'destructive'}
                    className="gap-1"
                  >
                    {r.status === 'success' ? <CheckCircle className="h-3 w-3" /> : 
                     r.status === 'skipped' ? <Clock className="h-3 w-3" /> : 
                     <XCircle className="h-3 w-3" />}
                    {r.language.toUpperCase()}/{r.section}
                    {r.keysTranslated && ` (${r.keysTranslated} keys)`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {genError && (
            <Alert variant="destructive">
              <AlertDescription>{genError}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground pt-2">
            <strong>{SECTIONS_TO_TRANSLATE.length} sections:</strong> {SECTIONS_TO_TRANSLATE.slice(0, 10).join(', ')}...
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Main Translations</CardTitle>
            <CardDescription>{mainTranslations.length} languages in database</CardDescription>
          </CardHeader>
          <CardContent>
            {mainTranslations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No translations in database yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mainTranslations.map(stat => (
                    <TableRow key={stat.language}>
                      <TableCell className="font-medium">{stat.language.toUpperCase()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(stat.updated_at), 'PPp')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Positive Points</CardTitle>
            <CardDescription>{positivePoints.length} languages in database</CardDescription>
          </CardHeader>
          <CardContent>
            {positivePoints.length === 0 ? (
              <p className="text-muted-foreground text-sm">No positive points in database yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positivePoints.map(stat => (
                    <TableRow key={stat.language}>
                      <TableCell className="font-medium">{stat.language.toUpperCase()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(stat.updated_at), 'PPp')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
