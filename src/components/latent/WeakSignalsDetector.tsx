import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Radio,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Zap,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LatentZone, TensionType } from '@/hooks/useLatentZones';

interface WeakSignal {
  id: string;
  type: 'emerging' | 'stabilizing' | 'escalating' | 'dormant';
  title: string;
  description: string;
  relatedZones: string[];
  intensity: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  detectedAt: Date;
  suggestedAction?: string;
}

interface WeakSignalsDetectorProps {
  zones: LatentZone[];
  onZoneClick?: (zoneId: string) => void;
}

export function WeakSignalsDetector({ zones, onZoneClick }: WeakSignalsDetectorProps) {
  const { t } = useTranslation();

  // Detect weak signals from zone patterns
  const signals = useMemo<WeakSignal[]>(() => {
    const detected: WeakSignal[] = [];

    // Pattern 1: Multiple dormant zones with similar tension types (emerging pattern)
    const dormantZones = zones.filter(z => z.status === 'dormant');
    const tensionTypeCounts: Record<TensionType, string[]> = {
      nourishing: [],
      blocking: [],
      fragility: [],
      premature_crushing: []
    };
    
    dormantZones.forEach(zone => {
      (zone.tensions || []).forEach(tension => {
        tensionTypeCounts[tension.tension_type].push(zone.id);
      });
    });

    Object.entries(tensionTypeCounts).forEach(([type, zoneIds]) => {
      if (zoneIds.length >= 2) {
        detected.push({
          id: `pattern-${type}`,
          type: 'emerging',
          title: t(`latent.signals.${type}Pattern`, `Pattern ${type} émergent`),
          description: t('latent.signals.multipleZones', '{{count}} zones dormantes partagent cette dynamique', { count: zoneIds.length }),
          relatedZones: zoneIds,
          intensity: Math.min(100, zoneIds.length * 25),
          trend: 'up',
          detectedAt: new Date(),
          suggestedAction: t('latent.signals.suggestMonitor', 'Surveiller l\'évolution conjointe')
        });
      }
    });

    // Pattern 2: Fragile zones with high tension count (escalating)
    const fragileHighTension = zones.filter(z => 
      z.status === 'fragile' && (z.tensions || []).length >= 3
    );
    
    fragileHighTension.forEach(zone => {
      detected.push({
        id: `escalating-${zone.id}`,
        type: 'escalating',
        title: t('latent.signals.escalatingZone', 'Zone en escalade potentielle'),
        description: `"${zone.title}" - ${t('latent.signals.multipleTensions', 'Accumulation de tensions')}`,
        relatedZones: [zone.id],
        intensity: Math.min(100, (zone.tensions || []).length * 20 + 40),
        trend: 'up',
        detectedAt: new Date(),
        suggestedAction: t('latent.signals.suggestIntervene', 'Intervention préventive recommandée')
      });
    });

    // Pattern 3: Blocked zones (stabilizing or stuck)
    const blockedZones = zones.filter(z => z.status === 'blocked');
    blockedZones.forEach(zone => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(zone.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      detected.push({
        id: `blocked-${zone.id}`,
        type: daysSinceUpdate > 30 ? 'dormant' : 'stabilizing',
        title: daysSinceUpdate > 30 
          ? t('latent.signals.stuckZone', 'Zone bloquée depuis longtemps')
          : t('latent.signals.stabilizingZone', 'Zone en stabilisation'),
        description: `"${zone.title}" - ${daysSinceUpdate} ${t('common.days', 'jours')}`,
        relatedZones: [zone.id],
        intensity: Math.min(100, daysSinceUpdate * 2),
        trend: 'stable',
        detectedAt: new Date(zone.updated_at),
        suggestedAction: daysSinceUpdate > 30 
          ? t('latent.signals.suggestReview', 'Revoir la pertinence de cette zone')
          : undefined
      });
    });

    // Pattern 4: Emergent zones with nourishing tensions (positive signal)
    const emergentNourishing = zones.filter(z => 
      z.status === 'emergent' && 
      (z.tensions || []).some(t => t.tension_type === 'nourishing')
    );
    
    emergentNourishing.forEach(zone => {
      detected.push({
        id: `positive-${zone.id}`,
        type: 'emerging',
        title: t('latent.signals.positiveEmergent', 'Émergence positive détectée'),
        description: `"${zone.title}" - ${t('latent.signals.nourishingDynamic', 'Dynamique nourricière')}`,
        relatedZones: [zone.id],
        intensity: 30,
        trend: 'up',
        detectedAt: new Date(),
        suggestedAction: t('latent.signals.suggestAmplify', 'Amplifier cette dynamique')
      });
    });

    // Sort by intensity (highest first)
    return detected.sort((a, b) => b.intensity - a.intensity);
  }, [zones, t]);

  const typeConfig: Record<string, { color: string; icon: typeof Radio; bgColor: string }> = {
    emerging: { color: 'text-amber-600', icon: Zap, bgColor: 'bg-amber-500/10' },
    stabilizing: { color: 'text-blue-600', icon: Minus, bgColor: 'bg-blue-500/10' },
    escalating: { color: 'text-red-600', icon: AlertTriangle, bgColor: 'bg-red-500/10' },
    dormant: { color: 'text-gray-500', icon: Clock, bgColor: 'bg-gray-500/10' },
  };

  const trendIcons: Record<string, typeof TrendingUp> = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  if (signals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Radio className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>{t('latent.signals.noSignals', 'Aucun signal faible détecté')}</p>
          <p className="text-xs mt-1">{t('latent.signals.addZones', 'Ajoutez plus de zones pour activer la détection')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="w-5 h-5 text-amber-600" />
          {t('latent.signals.title', 'Signaux faibles détectés')}
          <Badge variant="outline" className="ml-auto border-amber-500/30 text-amber-600">
            {signals.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('latent.signals.subtitle', 'Patterns et corrélations entre vos zones')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {signals.slice(0, 5).map(signal => {
          const config = typeConfig[signal.type];
          const Icon = config.icon;
          const TrendIcon = trendIcons[signal.trend];

          return (
            <div 
              key={signal.id} 
              className={`p-4 rounded-lg ${config.bgColor} space-y-3`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
                  <div>
                    <h4 className="font-medium text-sm">{signal.title}</h4>
                    <p className="text-xs text-muted-foreground">{signal.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-4 h-4 ${
                    signal.trend === 'up' ? 'text-red-500' : 
                    signal.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`} />
                  <Badge variant="outline" className="text-xs">
                    {signal.intensity}%
                  </Badge>
                </div>
              </div>

              <Progress value={signal.intensity} className="h-1.5" />

              {signal.suggestedAction && (
                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {signal.suggestedAction}
                </p>
              )}

              {signal.relatedZones.length > 0 && onZoneClick && (
                <div className="flex gap-2 flex-wrap">
                  {signal.relatedZones.map(zoneId => {
                    const zone = zones.find(z => z.id === zoneId);
                    if (!zone) return null;
                    return (
                      <Button
                        key={zoneId}
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => onZoneClick(zoneId)}
                      >
                        <MapPin className="w-3 h-3" />
                        {zone.title.slice(0, 20)}...
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {signals.length > 5 && (
          <p className="text-xs text-center text-muted-foreground">
            {t('latent.signals.moreSignals', '+{{count}} autres signaux', { count: signals.length - 5 })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
