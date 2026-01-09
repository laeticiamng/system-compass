import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTagLabel } from '@/lib/intelligence-translations';
import { Radar as RadarIcon } from 'lucide-react';

interface CountryTags {
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

interface CountryData {
  countryId: string;
  countryName: string;
  iso2: string;
  tags: CountryTags;
  color: string;
}

interface Props {
  countries: CountryData[];
  compact?: boolean;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(220, 70%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(160, 70%, 50%)',
  'hsl(45, 80%, 50%)',
];

type TagKey = 'network_weight' | 'diploma_weight' | 'risk_tolerance' | 'admin_speed' | 
  'authority_verticality' | 'mental_friction' | 'social_mobility' | 'predictability' |
  'reputation_requirement' | 'compliance_sensitivity';

export function TagsCompareChart({ countries, compact = false }: Props) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const tagKeys: TagKey[] = [
      'social_mobility',
      'predictability',
      'admin_speed',
      'risk_tolerance',
      'network_weight',
      'diploma_weight',
      'authority_verticality',
      'mental_friction',
    ];

    return tagKeys.map((key) => {
      const point: Record<string, string | number> = {
        subject: getTagLabel(key),
        fullMark: 5,
      };

      countries.forEach((country, idx) => {
        point[country.countryId] = country.tags[key] || 0;
      });

      return point;
    });
  }, [countries]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}/5
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (countries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-muted-foreground">
          {t('compare.selectCountries', 'Sélectionnez des pays pour comparer')}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
            />
            {countries.map((country, idx) => (
              <Radar
                key={country.countryId}
                name={country.countryName}
                dataKey={country.countryId}
                stroke={COLORS[idx % COLORS.length]}
                fill={COLORS[idx % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
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
          {t('compare.tagsRadarTitle', 'Comparaison des profils systémiques')}
        </CardTitle>
        <CardDescription className="text-xs">
          {t('compare.tagsRadarDesc', 'Indicateurs clés du fonctionnement systémique (1-5)')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
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
              {countries.map((country, idx) => (
                <Radar
                  key={country.countryId}
                  name={country.countryName}
                  dataKey={country.countryId}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with country flags */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {countries.map((country, idx) => (
            <div key={country.countryId} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span>{getFlagEmoji(country.iso2)}</span>
              <span>{country.countryName}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
