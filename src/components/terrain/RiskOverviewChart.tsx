import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HeartPulse, Scale, ShieldAlert, Building2, BarChart3 } from 'lucide-react';
import { TerrainRealitiesResult } from '@/hooks/useTerrainRealities';

interface RiskOverviewChartProps {
  data: TerrainRealitiesResult;
}

export function RiskOverviewChart({ data }: RiskOverviewChartProps) {
  const { t } = useTranslation();

  const riskToScore = (level: 'high' | 'medium' | 'low'): number => {
    switch (level) {
      case 'high': return 90;
      case 'medium': return 50;
      case 'low': return 20;
      default: return 50;
    }
  };

  const riskToColor = (level: 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const sections = [
    {
      key: 'healthcare',
      label: t('terrainRealities.healthcare'),
      icon: HeartPulse,
      level: data.healthcare_realities.risk_level,
      color: 'text-red-400'
    },
    {
      key: 'justice',
      label: t('terrainRealities.justice'),
      icon: Scale,
      level: data.justice_realities.risk_level,
      color: 'text-blue-400'
    },
    {
      key: 'security',
      label: t('terrainRealities.security'),
      icon: ShieldAlert,
      level: data.security_realities.risk_level,
      color: 'text-orange-400'
    },
    {
      key: 'administration',
      label: t('terrainRealities.administration'),
      icon: Building2,
      level: data.administration_realities.risk_level,
      color: 'text-purple-400'
    }
  ];

  return (
    <Card className="bg-card/30 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {t('terrainRealities.riskOverview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const score = riskToScore(section.level);
          return (
            <div key={section.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${section.color}`} />
                  <span>{section.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  section.level === 'high' ? 'bg-red-500/20 text-red-300' :
                  section.level === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {t(`terrainRealities.risk${section.level.charAt(0).toUpperCase() + section.level.slice(1)}`)}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={score} 
                  className="h-2"
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${riskToColor(section.level)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {/* Overall score */}
        <div className="pt-2 mt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{t('terrainRealities.overallRisk')}</span>
            <span className={`px-2 py-0.5 rounded ${
              data.overall_risk_level === 'high' ? 'bg-red-500/20 text-red-300' :
              data.overall_risk_level === 'medium' ? 'bg-amber-500/20 text-amber-300' :
              'bg-green-500/20 text-green-300'
            }`}>
              {t(`terrainRealities.risk${data.overall_risk_level.charAt(0).toUpperCase() + data.overall_risk_level.slice(1)}`)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}