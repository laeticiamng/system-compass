import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, ChevronRight, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserCases, CaseIntention, CaseStatus } from '@/hooks/useUserCases';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CasesListProps {
  countryId?: string;
  limit?: number;
  showCreateButton?: boolean;
}

export function CasesList({ countryId, limit, showCreateButton = true }: CasesListProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cases, isLoading } = useUserCases();

  const filteredCases = countryId 
    ? cases.filter(c => c.country_id === countryId)
    : cases;
  
  const displayedCases = limit ? filteredCases.slice(0, limit) : filteredCases;

  const getIntentionIcon = (intention: CaseIntention) => {
    return intention === 'relocation' 
      ? <Home className="w-4 h-4" />
      : <Building2 className="w-4 h-4" />;
  };

  const getStatusBadge = (status: CaseStatus) => {
    const variants: Record<CaseStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
      draft: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
      active: { variant: 'default', icon: <ChevronRight className="w-3 h-3" /> },
      archived: { variant: 'secondary', icon: null },
      completed: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {t(`cases.status.${status}`, status)}
      </Badge>
    );
  };

  const getProgress = (caseData: typeof cases[0]) => {
    if (caseData.intention === 'relocation') {
      const total = caseData.clarifications_done.length + caseData.clarifications_pending.length;
      return total > 0 ? Math.round((caseData.clarifications_done.length / total) * 100) : 0;
    } else {
      const milestonesDone = caseData.milestones.filter(m => m.completed).length;
      return caseData.milestones.length > 0 
        ? Math.round((milestonesDone / caseData.milestones.length) * 100) 
        : 0;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (displayedCases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Home className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>{t('cases.empty', 'Aucun dossier créé')}</p>
        <p className="text-sm mt-2">{t('cases.emptyHint', 'Créez un dossier pour suivre votre projet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedCases.map(caseData => {
        const progress = getProgress(caseData);
        const hasRedFlags = caseData.red_flags_acknowledged.length > 0;
        const pendingCount = caseData.intention === 'relocation'
          ? caseData.clarifications_pending.length
          : caseData.milestones.filter(m => !m.completed).length;

        return (
          <Card 
            key={caseData.id}
            className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
            onClick={() => navigate(`/cases/${caseData.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${caseData.intention === 'entrepreneurship' ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
                    {getIntentionIcon(caseData.intention)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{caseData.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(caseData.updated_at), { 
                        addSuffix: true,
                        locale: i18n.language === 'fr' ? fr : undefined 
                      })}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasRedFlags && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {caseData.red_flags_acknowledged.length}
                    </Badge>
                  )}
                  {getStatusBadge(caseData.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {caseData.intention === 'relocation' 
                      ? t('cases.clarifications', '{{count}} clarifications', { count: pendingCount })
                      : t('cases.milestones', '{{count}} jalons restants', { count: pendingCount })
                    }
                  </span>
                  <Badge variant="outline">
                    {caseData.intention === 'relocation' 
                      ? t('cases.depth.light', 'Essentiel')
                      : t('cases.depth.deep', 'Complet')
                    }
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {limit && filteredCases.length > limit && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/dashboard')}
        >
          {t('cases.seeAll', 'Voir tous les dossiers')} ({filteredCases.length})
        </Button>
      )}
    </div>
  );
}
