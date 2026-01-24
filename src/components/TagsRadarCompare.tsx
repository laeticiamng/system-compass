import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface CountryTag {
  country_id: string;
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

interface TagsRadarCompareProps {
  countryIds: string[];
  countryNames: Record<string, { name: string; iso2: string }>;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function TagsRadarCompare({ countryIds, countryNames }: TagsRadarCompareProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<CountryTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTags() {
      if (countryIds.length === 0) {
        setTags([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('country_tags')
        .select('*')
        .in('country_id', countryIds);

      if (!error && data) {
        setTags(data as CountryTag[]);
      }
      setLoading(false);
    }

    fetchTags();
  }, [countryIds]);

  const chartData = useMemo(() => {
    if (tags.length === 0) return [];

    const metrics = [
      { key: 'network_weight', label: t('tags.networkWeight', 'Network Weight') },
      { key: 'diploma_weight', label: t('tags.diplomaWeight', 'Diploma Weight') },
      { key: 'risk_tolerance', label: t('tags.riskTolerance', 'Risk Tolerance') },
      { key: 'admin_speed', label: t('tags.adminSpeed', 'Admin Speed') },
      { key: 'authority_verticality', label: t('tags.authorityVerticality', 'Authority Verticality') },
      { key: 'mental_friction', label: t('tags.mentalFriction', 'Mental Friction') },
      { key: 'social_mobility', label: t('tags.socialMobility', 'Social Mobility') },
      { key: 'predictability', label: t('tags.predictability', 'Predictability') },
      { key: 'reputation_requirement', label: t('tags.reputationRequirement', 'Reputation Req.') },
      { key: 'compliance_sensitivity', label: t('tags.complianceSensitivity', 'Compliance Sens.') },
    ];

    return metrics.map(metric => {
      const dataPoint: Record<string, string | number> = {
        metric: metric.label,
      };

      tags.forEach((tag, index) => {
        const value = tag[metric.key as keyof CountryTag] as number;
        // Normalize 1-5 to 0-100 for radar display
        dataPoint[`country${index}`] = (value / 5) * 100;
        dataPoint[`country${index}Raw`] = value;
        dataPoint[`country${index}Id`] = tag.country_id;
      });

      return dataPoint;
    });
  }, [tags, t]);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tags.length < 2) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4 text-center">
          {t('multiCompare.tagsRadar', 'Intelligence Tags Comparison')}
        </h3>
        <p className="text-muted-foreground text-center py-8">
          {t('multiCompare.noTagsData', 'Intelligence tags data not available for selected countries. Available for 29 countries including: Argentina, Australia, Austria, Belgium, Brazil, Canada, Chile, China, Colombia, Cuba, Denmark, France, Germany, India, Italy, Japan, Mexico, Netherlands, Peru, Poland, Portugal, Singapore, South Africa, Spain, Sweden, Switzerland, UAE, UK, USA.')}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-4 text-center">
        {t('multiCompare.tagsRadar', 'Intelligence Tags Comparison')}
      </h3>
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
              axisLine={false}
              tickCount={6}
            />
            {tags.map((tag, index) => {
              const countryInfo = countryNames[tag.country_id];
              const displayName = countryInfo 
                ? `${getFlagEmoji(countryInfo.iso2)} ${countryInfo.name}` 
                : tag.country_id;

              return (
                <Radar
                  key={tag.country_id}
                  name={displayName}
                  dataKey={`country${index}`}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              );
            })}
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(_value: number, name: string, props: any) => {
                // Find the raw value
                const dataIndex = parseInt(name.replace('country', '').replace(/\D/g, '')) || 0;
                const rawKey = `country${dataIndex}Raw`;
                const rawValue = props.payload[rawKey];
                return [`${rawValue}/5`, name];
              }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: 'hsl(var(--foreground))',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('multiCompare.tagsNote', 'Tags scored 1-5. Higher values indicate stronger presence of the characteristic.')}
      </p>

      {/* Tags Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div className="p-2 bg-secondary/50 rounded">
          <span className="font-medium">{t('tags.networkWeight', 'Network Weight')}</span>
          <p className="text-muted-foreground">{t('tags.networkWeightDesc', 'Importance of connections')}</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <span className="font-medium">{t('tags.diplomaWeight', 'Diploma Weight')}</span>
          <p className="text-muted-foreground">{t('tags.diplomaWeightDesc', 'Importance of credentials')}</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <span className="font-medium">{t('tags.riskTolerance', 'Risk Tolerance')}</span>
          <p className="text-muted-foreground">{t('tags.riskToleranceDesc', 'Acceptance of risk-taking')}</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <span className="font-medium">{t('tags.adminSpeed', 'Admin Speed')}</span>
          <p className="text-muted-foreground">{t('tags.adminSpeedDesc', 'Bureaucracy efficiency')}</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <span className="font-medium">{t('tags.socialMobility', 'Social Mobility')}</span>
          <p className="text-muted-foreground">{t('tags.socialMobilityDesc', 'Ease of upward movement')}</p>
        </div>
      </div>
    </div>
  );
}
