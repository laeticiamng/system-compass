import { useTranslation } from 'react-i18next';
import { useUserCases } from '@/hooks/useUserCases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LocalizedLink as Link } from '@/components/i18n';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Plus, 
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export function CasesDashboardWidget() {
  const { t } = useTranslation();
  const { cases, isLoading } = useUserCases();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeCases = cases.filter(c => c.status === 'active');
  const draftCases = cases.filter(c => c.status === 'draft');
  const completedCases = cases.filter(c => c.status === 'completed');

  if (cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {t('dashboard.cases.title', 'Mes Dossiers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.cases.noCases', "Aucun dossier créé. Créez un dossier pour suivre un projet de relocalisation ou d'entrepreneuriat.")}
          </p>
          <Link to="/cases">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('dashboard.cases.create', 'Créer un dossier')}
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
          <Briefcase className="w-5 h-5" />
          {t('dashboard.cases.title', 'Mes Dossiers')}
        </CardTitle>
        <Link to="/cases">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowRight className="w-3 h-3" />
            {t('dashboard.cases.viewAll', 'Voir tout')}
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-blue-500/10">
            <div className="text-lg font-bold text-blue-500">{activeCases.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.cases.active', 'Actifs')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <div className="text-lg font-bold text-amber-500">{draftCases.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.cases.draft', 'Brouillons')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-500">{completedCases.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.cases.completed', 'Terminés')}</div>
          </div>
        </div>

        {/* Recent cases */}
        <div className="space-y-2">
          {cases.slice(0, 3).map(caseItem => (
            <Link 
              key={caseItem.id} 
              to={`/cases/${caseItem.id}`}
              className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {caseItem.intention === 'relocation' ? (
                    <MapPin className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Building2 className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{caseItem.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`cases.intention.${caseItem.intention}`, caseItem.intention)}
                  </p>
                </div>
                <Badge 
                  variant={caseItem.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {caseItem.status === 'active' ? (
                    <Clock className="w-3 h-3 mr-1" />
                  ) : caseItem.status === 'completed' ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : null}
                  {t(`cases.status.${caseItem.status}`, caseItem.status)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
