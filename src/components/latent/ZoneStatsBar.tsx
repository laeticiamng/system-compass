import { useTranslation } from 'react-i18next';
import { Moon, Sunrise, Wind, Lock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LatentZone } from '@/hooks/useLatentZones';

interface ZoneStatsBarProps {
  zones: LatentZone[];
}

export function ZoneStatsBar({ zones }: ZoneStatsBarProps) {
  const { t } = useTranslation();

  const stats = {
    total: zones.length,
    dormant: zones.filter(z => z.status === 'dormant').length,
    emergent: zones.filter(z => z.status === 'emergent').length,
    fragile: zones.filter(z => z.status === 'fragile').length,
    blocked: zones.filter(z => z.status === 'blocked').length,
    avgTensions: zones.length > 0 
      ? (zones.reduce((sum, z) => sum + (z.tensions?.length || 0), 0) / zones.length).toFixed(1)
      : '0'
  };

  const statItems = [
    { key: 'total', value: stats.total, icon: TrendingUp, color: 'text-primary' },
    { key: 'dormant', value: stats.dormant, icon: Moon, color: 'text-slate-500' },
    { key: 'emergent', value: stats.emergent, icon: Sunrise, color: 'text-amber-500' },
    { key: 'fragile', value: stats.fragile, icon: Wind, color: 'text-blue-500' },
    { key: 'blocked', value: stats.blocked, icon: Lock, color: 'text-red-500' },
  ];

  if (zones.length === 0) return null;

  return (
    <Card className="bg-muted/30">
      <CardContent className="py-3">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {statItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`latent.stats.${item.key}`)}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 border-l pl-4">
            <span className="text-lg font-semibold">{stats.avgTensions}</span>
            <span className="text-xs text-muted-foreground">
              {t('latent.stats.avgTensions')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
