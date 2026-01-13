import { useTranslation } from 'react-i18next';
import { useLatentZones } from '@/hooks/useLatentZones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

export function LatentZonesDashboardWidget() {
  const { t } = useTranslation();
  const { zones, loading } = useLatentZones();

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

  const activeZones = zones.filter(z => z.status === 'active');
  const watchingZones = zones.filter(z => z.status === 'watching');
  const dormantZones = zones.filter(z => z.status === 'dormant');

  if (zones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            {t('dashboard.latent.title', 'Zones Latentes')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.latent.noZones', 'Identifiez les zones floues de votre projet pour mieux les comprendre.')}
          </p>
          <Link to="/latent">
            <Button className="gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              {t('dashboard.latent.explore', 'Explorer le module')}
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
          <Layers className="w-5 h-5" />
          {t('dashboard.latent.title', 'Zones Latentes')}
        </CardTitle>
        <Link to="/latent">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-rose-500/10">
            <div className="text-lg font-bold text-rose-500">{activeZones.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.latent.active', 'Actives')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <div className="text-lg font-bold text-amber-500">{watchingZones.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.latent.watching', 'Surveillance')}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted">
            <div className="text-lg font-bold text-muted-foreground">{dormantZones.length}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.latent.dormant', 'Dormantes')}</div>
          </div>
        </div>

        {/* Active zones list */}
        {activeZones.length > 0 && (
          <div className="space-y-2">
            {activeZones.slice(0, 2).map(zone => (
              <div 
                key={zone.id}
                className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="font-medium text-sm truncate">{zone.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {zone.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
