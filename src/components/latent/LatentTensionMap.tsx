// Latent Tension Map Component - Visual tension intensity scoring
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Map, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Activity, Target, Flame, Snowflake
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatentTension {
  id: string;
  zone_id: string;
  zone_title: string;
  tension_type: string;
  content: string;
  intensity: number; // 0-100
  trend: 'rising' | 'stable' | 'declining';
  created_at: string;
}

interface LatentTensionMapProps {
  tensions: LatentTension[];
  onZoneClick?: (zoneId: string) => void;
}

export function LatentTensionMap({ tensions, onZoneClick }: LatentTensionMapProps) {
  const { t } = useTranslation();

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-blue-400';
    return 'bg-green-500';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 80) return t('latent.intensity.critical', 'Critical');
    if (intensity >= 60) return t('latent.intensity.high', 'High');
    if (intensity >= 40) return t('latent.intensity.medium', 'Medium');
    if (intensity >= 20) return t('latent.intensity.low', 'Low');
    return t('latent.intensity.minimal', 'Minimal');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'declining': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conflict': return Flame;
      case 'opportunity': return Target;
      case 'risk': return AlertTriangle;
      case 'dormant': return Snowflake;
      default: return Activity;
    }
  };

  // Group by zone
  const tensionsByZone = tensions.reduce((acc, tension) => {
    if (!acc[tension.zone_id]) {
      acc[tension.zone_id] = {
        zone_title: tension.zone_title,
        tensions: [],
        avgIntensity: 0,
      };
    }
    acc[tension.zone_id].tensions.push(tension);
    return acc;
  }, {} as Record<string, { zone_title: string; tensions: LatentTension[]; avgIntensity: number }>);

  // Calculate average intensity per zone
  Object.values(tensionsByZone).forEach((zone) => {
    zone.avgIntensity = Math.round(
      zone.tensions.reduce((sum, t) => sum + t.intensity, 0) / zone.tensions.length
    );
  });

  // Sort zones by intensity
  const sortedZones = Object.entries(tensionsByZone).sort(
    ([, a], [, b]) => b.avgIntensity - a.avgIntensity
  );

  if (tensions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Map className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>{t('latent.noTensions', 'No tensions mapped yet')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="w-5 h-5" />
            {t('latent.tensionMap', 'Tension Map')}
          </CardTitle>
          <Badge variant="outline">
            {tensions.length} {t('latent.activeTensions', 'active tensions')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Intensity Legend */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground">{t('latent.intensity', 'Intensity')}:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs">{t('latent.minimal', 'Min')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs">{t('latent.medium', 'Med')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs">{t('latent.critical', 'Crit')}</span>
          </div>
        </div>

        {/* Zone Cards */}
        <div className="space-y-3">
          {sortedZones.map(([zoneId, zone]) => (
            <div
              key={zoneId}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                zone.avgIntensity >= 80 && "border-red-500/50 bg-red-500/5",
                zone.avgIntensity >= 60 && zone.avgIntensity < 80 && "border-orange-500/50 bg-orange-500/5"
              )}
              onClick={() => onZoneClick?.(zoneId)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    getIntensityColor(zone.avgIntensity)
                  )} />
                  <span className="font-medium">{zone.zone_title}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getIntensityLabel(zone.avgIntensity)}
                </Badge>
              </div>

              <Progress value={zone.avgIntensity} className="h-2 mb-3" />

              {/* Tensions in zone */}
              <div className="space-y-2">
                {zone.tensions.slice(0, 3).map((tension) => {
                  const TypeIcon = getTypeIcon(tension.tension_type);
                  return (
                    <div 
                      key={tension.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TypeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm truncate">{tension.content}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{tension.content}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getTrendIcon(tension.trend)}
                        <span className="text-xs font-medium">{tension.intensity}%</span>
                      </div>
                    </div>
                  );
                })}
                {zone.tensions.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{zone.tensions.length - 3} {t('latent.more', 'more')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Alert for critical zones */}
        {sortedZones.some(([, zone]) => zone.avgIntensity >= 80) && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {t('latent.criticalAlert', 'Critical Tension Detected')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('latent.criticalAdvice', 'Review high-intensity zones and consider proactive interventions.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
