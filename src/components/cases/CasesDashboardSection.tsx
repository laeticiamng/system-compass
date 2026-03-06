import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useUserCases, isDeepMode } from '@/hooks/useUserCases';
import { CreateCaseDialog } from './CreateCaseDialog';
import { useCountries } from '@/lib/countries-data';
import { getExtendedCountryMeta } from '@/lib/countries-extended';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Briefcase, Home, FolderOpen, ChevronRight,
  Plus, Clock, Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface CasesDashboardSectionProps {
  countryId?: string;
  limit?: number;
}

export function CasesDashboardSection({ countryId, limit = 5 }: CasesDashboardSectionProps) {
  const { t, i18n } = useTranslation();
  const navigate = useLocalizedNavigate();
  const { cases, isLoading } = useUserCases();
  const { countries } = useCountries();

  const filteredCases = countryId 
    ? cases.filter(c => c.country_id === countryId)
    : cases;
  
  const displayedCases = limit ? filteredCases.slice(0, limit) : filteredCases;

  const getProgress = (caseData: typeof cases[0]) => {
    const isDeep = isDeepMode(caseData.intention);
    if (isDeep) {
      const milestonesTotal = caseData.milestones.length;
      const milestonesDone = caseData.milestones.filter(m => m.completed).length;
      return milestonesTotal > 0 ? Math.round((milestonesDone / milestonesTotal) * 100) : 0;
    } else {
      const total = caseData.clarifications_done.length + caseData.clarifications_pending.length;
      return total > 0 ? Math.round((caseData.clarifications_done.length / total) * 100) : 0;
    }
  };

  const getPendingCount = (caseData: typeof cases[0]) => {
    const isDeep = isDeepMode(caseData.intention);
    return isDeep
      ? caseData.milestones.filter(m => !m.completed).length
      : caseData.clarifications_pending.length;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            {t('dashboard.cases.title', 'Mes dossiers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              {t('dashboard.cases.title', 'Mes dossiers')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.cases.description', 'Vos projets d\'installation ou d\'implantation')}
            </CardDescription>
          </div>
          <CreateCaseDialog 
            countryId="france"
            countryName="France"
            trigger={
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                {t('cases.create', 'Nouveau')}
              </Button>
            }
            onSuccess={(id) => navigate(`/cases/${id}`)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {displayedCases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('cases.empty', 'Aucun dossier créé')}</p>
            <p className="text-sm">{t('cases.emptyHint', 'Créez un dossier depuis une page pays')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedCases.map(caseData => {
              const isDeep = isDeepMode(caseData.intention);
              const progress = getProgress(caseData);
              const pendingCount = getPendingCount(caseData);
              const country = countries.find(item => item.id === caseData.country_id);
              const extendedMeta = !country ? getExtendedCountryMeta(caseData.country_id) : null;
              const countryIso2 = country?.iso2 || extendedMeta?.iso2 || '';

              return (
                <div
                  key={caseData.id}
                  onClick={() => navigate(`/cases/${caseData.id}`)}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  {/* Flag */}
                  {countryIso2 && (
                    <span className="text-2xl">{getFlagEmoji(countryIso2)}</span>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{caseData.title}</span>
                      <Badge variant={isDeep ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {isDeep ? <Briefcase className="w-3 h-3 mr-1" /> : <Home className="w-3 h-3 mr-1" />}
                        {isDeep ? 'B2B' : 'B2C'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(caseData.updated_at), { 
                          addSuffix: true,
                          locale: i18n.language === 'fr' ? fr : undefined 
                        })}
                      </span>
                      {pendingCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {pendingCount} {isDeep ? 'jalons' : 'clarifications'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-10">{progress}%</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredCases.length > limit && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard?tab=cases')}
          >
            {t('cases.seeAll', 'Voir tous les dossiers')} ({filteredCases.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
