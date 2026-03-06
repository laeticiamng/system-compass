import { useTranslation } from 'react-i18next';
import { useOVISuggestions } from '@/hooks/useOVISuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LocalizedLink as Link } from '@/components/i18n';
import { 
  Eye, 
  ArrowRight,
  BookOpen,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

export function OVIDashboardWidget() {
  const { t } = useTranslation();
  const { getSuggestionsForSimulation, dismissedCount, loading } = useOVISuggestions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Get suggestions for different simulation types
  const exitKeySuggestions = getSuggestionsForSimulation('exit_key');
  const countryViewSuggestions = getSuggestionsForSimulation('country_view');
  const comparisonSuggestions = getSuggestionsForSimulation('comparison');
  
  const allSuggestions = [...exitKeySuggestions, ...countryViewSuggestions, ...comparisonSuggestions];
  const uniqueSuggestions = allSuggestions.filter((s, i, arr) => 
    arr.findIndex(x => x.id === s.id) === i
  );

  const frameworkCount = uniqueSuggestions.filter(s => s.type === 'framework').length;
  const gridCount = uniqueSuggestions.filter(s => s.type === 'grid').length;

  if (uniqueSuggestions.length === 0 && dismissedCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {t('dashboard.ovi.title', 'OVI - Observations')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.ovi.noSuggestions', 'Découvrez des articles et observations pour enrichir votre réflexion.')}
          </p>
          <Link to="/ovi">
            <Button className="gap-2" variant="outline">
              <Lightbulb className="w-4 h-4" />
              {t('dashboard.ovi.explore', 'Explorer OVI')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          {t('dashboard.ovi.title', 'OVI - Observations')}
        </CardTitle>
        <Link to="/ovi">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-purple-500/10">
            <div className="text-lg font-bold text-purple-500">{frameworkCount}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.ovi.frameworks', 'Cadres')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-500">{gridCount}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.ovi.grids', 'Grilles')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted">
            <div className="text-lg font-bold text-muted-foreground">{dismissedCount}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.ovi.dismissed', 'Vus')}</div>
          </div>
        </div>

        {/* Top suggestions */}
        {uniqueSuggestions.length > 0 && (
          <div className="space-y-2">
            {uniqueSuggestions.slice(0, 2).map(suggestion => (
              <Link
                key={suggestion.id}
                to="/ovi"
                className="block p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="font-medium text-sm truncate">{suggestion.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {suggestion.description || t('dashboard.ovi.readMore', 'Cliquez pour en savoir plus')}
                </p>
              </Link>
            ))}
          </div>
        )}

        {uniqueSuggestions.length === 0 && dismissedCount > 0 && (
          <div className="text-center py-2">
            <TrendingUp className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs text-muted-foreground">
              {t('dashboard.ovi.allRead', 'Toutes les suggestions ont été explorées !')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
