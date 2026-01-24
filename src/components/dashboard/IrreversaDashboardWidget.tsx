import { useTranslation } from 'react-i18next';
import { useIrreversa } from '@/hooks/useIrreversa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  Plus, 
  ArrowRight,
  AlertTriangle,
  Shield
} from 'lucide-react';

export function IrreversaDashboardWidget() {
  const { t } = useTranslation();
  const { thresholds, loading } = useIrreversa();

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

  const detectedThresholds = thresholds.filter(t => t.status === 'detected' || t.status === 'marked');
  const validatedThresholds = thresholds.filter(t => t.status === 'validated');
  const sealedThresholds = thresholds.filter(t => t.status === 'sealed');

  if (thresholds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t('dashboard.irreversa.title', 'Seuils Irréversibles')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.irreversa.noThresholds', 'Documentez les décisions irréversibles pour prévenir les regrets.')}
          </p>
          <Link to="/irreversa">
            <Button className="gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              {t('dashboard.irreversa.explore', 'Explorer le module')}
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
          <Lock className="w-5 h-5" />
          {t('dashboard.irreversa.title', 'Seuils Irréversibles')}
        </CardTitle>
        <Link to="/irreversa">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <div className="text-lg font-bold text-amber-500">{detectedThresholds.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.irreversa.detected', 'Détectés')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <div className="text-lg font-bold text-emerald-500">{validatedThresholds.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.irreversa.validated', 'Validés')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/10">
            <div className="text-lg font-bold text-blue-500">{sealedThresholds.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.irreversa.sealed', 'Scellés')}</div>
          </div>
        </div>

        {/* Detected thresholds requiring attention */}
        {detectedThresholds.length > 0 && (
          <div className="space-y-2">
            {detectedThresholds.slice(0, 2).map(threshold => (
              <div 
                key={threshold.id}
                className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-sm truncate">{threshold.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard.irreversa.needsValidation', 'En attente de validation')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
