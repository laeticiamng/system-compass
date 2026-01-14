import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslationsSync, SeedResult } from '@/hooks/useTranslationsSync';
import { Database, Upload, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TranslationStat {
  language: string;
  namespace: string;
  updated_at: string;
}

export default function AdminTranslationsSync() {
  const { t } = useTranslation();
  const { seedTranslations, getTranslationsStats, clearTranslations, isSeeding, progress, error } = useTranslationsSync();
  const [stats, setStats] = useState<TranslationStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastResults, setLastResults] = useState<SeedResult[] | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getTranslationsStats();
      setStats(data);
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
