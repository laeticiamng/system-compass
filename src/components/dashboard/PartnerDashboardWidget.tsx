import { useTranslation } from 'react-i18next';
import { usePartnerProgram } from '@/hooks/usePartnerProgram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  Handshake, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';

export function PartnerDashboardWidget() {
  const { t } = useTranslation();
  const { applications, loading, isApprovedPartner } = usePartnerProgram();

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

  // Check if user is an approved partner
  const isPartner = isApprovedPartner('ambassador') || isApprovedPartner('b2b_partner');
  const pendingApplication = applications.find(app => app.status === 'pending');
  const approvedApplication = applications.find(app => app.status === 'approved');

  // If user is already a partner
  if (isPartner && approvedApplication) {
    return (
      <Card className="border-emerald-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-emerald-500" />
            {t('dashboard.partner.title', 'Programme Partenaire')}
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
              <Star className="w-3 h-3 mr-1" />
              {t('dashboard.partner.active', 'Actif')}
            </Badge>
          </CardTitle>
          <Link to="/partners">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-emerald-400">
                {t('dashboard.partner.welcomeBack', 'Bienvenue, partenaire !')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.partner.accessDashboard', 'Accédez à votre tableau de bord partenaire pour gérer vos clients et commissions.')}
            </p>
          </div>

          <Link to="/partners">
            <Button className="w-full gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.partner.viewDashboard', 'Tableau de bord partenaire')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // If application is pending
  if (pendingApplication) {
    return (
      <Card className="border-amber-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            {t('dashboard.partner.title', 'Programme Partenaire')}
            <Badge variant="outline" className="text-amber-500 border-amber-500/50">
              <Clock className="w-3 h-3 mr-1" />
              {t('dashboard.partner.pending', 'En attente')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-400">
                {t('dashboard.partner.underReview', 'Candidature en cours d\'examen')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.partner.reviewTime', 'Nous examinons votre candidature. Vous recevrez une réponse sous 48h.')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No application yet - show CTA
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="w-5 h-5" />
          {t('dashboard.partner.title', 'Programme Partenaire')}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-4">
        <Handshake className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          {t('dashboard.partner.joinUs', 'Rejoignez notre programme partenaire et gagnez des commissions.')}
        </p>
        <Link to="/partners">
          <Button className="gap-2" variant="outline">
            <Star className="w-4 h-4" />
            {t('dashboard.partner.learnMore', 'En savoir plus')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
