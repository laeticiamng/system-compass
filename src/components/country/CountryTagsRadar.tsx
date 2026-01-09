import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTagLabel } from '@/lib/intelligence-translations';
import { Radar as RadarIcon } from 'lucide-react';

interface CountryTags {
  network_weight: number;
  diploma_weight: number;
  risk_tolerance: number;
  admin_speed: number;
  authority_verticality: number;
  mental_friction: number;
  social_mobility: number;
  predictability: number;
  reputation_requirement: number;
  compliance_sensitivity: number;
}

interface Props {
  tags: CountryTags;
  countryName?: string;
  compact?: boolean;
}

export function CountryTagsRadar({ tags, countryName, compact = false }: Props) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const tagEntries: { key: keyof CountryTags; positive: boolean }[] = [
      { key: 'social_mobility', positive: true },
      { key: 'predictability', positive: true },
      { key: 'admin_speed', positive: true },
      { key: 'risk_tolerance', positive: true },
      { key: 'network_weight', positive: false },
      { key: 'diploma_weight', positive: false },
      { key: 'authority_verticality', positive: false },
      { key: 'mental_friction', positive: false },
      { key: 'reputation_requirement', positive: false },
      { key: 'compliance_sensitivity', positive: false },
    ];

    return tagEntries.map(({ key, positive }) => ({
      subject: getTagLabel(key),
      value: tags[key],
      fullMark: 5,
      positive,
    }));
  }, [tags]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-2 shadow-lg">
          <p className="font-medium text-sm">{data.subject}</p>
          <p className="text-sm text-muted-foreground">
            {data.value}/5 {data.positive ? '(+)' : '(-)'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (compact) {
    return (
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name={countryName || 'Country'}
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <RadarIcon className="w-4 h-4" />
          {t('tags.radarTitle', 'Profil système')}
        </CardTitle>
        <CardDescription className="text-xs">
          {t('tags.radarDesc', 'Indicateurs clés du fonctionnement systémique (1-5)')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                name={countryName || 'Country'}
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-500">●</span>
            <span className="text-muted-foreground">
              {t('tags.positiveIndicators', 'Indicateurs positifs (mobilité, prévisibilité...)')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500">●</span>
            <span className="text-muted-foreground">
              {t('tags.frictionIndicators', 'Indicateurs de friction (autorité, conformité...)')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
