import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface TagsCompareTableProps {
  countryIds: string[];
  countryNames: Record<string, { name: string; iso2: string }>;
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const TAG_KEYS = [
  'network_weight',
  'diploma_weight', 
  'risk_tolerance',
  'admin_speed',
  'authority_verticality',
  'mental_friction',
  'social_mobility',
  'predictability',
  'reputation_requirement',
  'compliance_sensitivity',
] as const;

type TagKey = typeof TAG_KEYS[number];

// Which tags are "higher is better" for the user
const HIGHER_IS_BETTER: Record<TagKey, boolean> = {
  network_weight: false, // Lower means less reliance on connections
  diploma_weight: false, // Lower means more flexibility
  risk_tolerance: true, // Higher means more opportunity
  admin_speed: true, // Higher means faster processes
  authority_verticality: false, // Lower means more horizontal
  mental_friction: false, // Lower is better
  social_mobility: true, // Higher is better
  predictability: true, // Higher means more stable
  reputation_requirement: false, // Lower means easier entry
  compliance_sensitivity: false, // Lower means more flexibility
};

export function TagsCompareTable({ countryIds, countryNames }: TagsCompareTableProps) {
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

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tags.length < 2) {
    return null;
  }

  const getTagLabel = (key: TagKey): string => {
    const labels: Record<TagKey, string> = {
      network_weight: t('tags.networkWeight', 'Network Weight'),
      diploma_weight: t('tags.diplomaWeight', 'Diploma Weight'),
      risk_tolerance: t('tags.riskTolerance', 'Risk Tolerance'),
      admin_speed: t('tags.adminSpeed', 'Admin Speed'),
      authority_verticality: t('tags.authorityVerticality', 'Authority Verticality'),
      mental_friction: t('tags.mentalFriction', 'Mental Friction'),
      social_mobility: t('tags.socialMobility', 'Social Mobility'),
      predictability: t('tags.predictability', 'Predictability'),
      reputation_requirement: t('tags.reputationRequirement', 'Reputation Req.'),
      compliance_sensitivity: t('tags.complianceSensitivity', 'Compliance Sens.'),
    };
    return labels[key];
  };

  const getBestValue = (values: number[], higherIsBetter: boolean) => {
    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  const getWorstValue = (values: number[], higherIsBetter: boolean) => {
    if (values.length === 0) return null;
    return higherIsBetter ? Math.min(...values) : Math.max(...values);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          {t('multiCompare.tagsTable', 'Intelligence Tags Table')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('multiCompare.tagsTableNote', 'Detailed comparison of systemic characteristics')}
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">{t('common.metric', 'Metric')}</TableHead>
              {tags.map(tag => {
                const countryInfo = countryNames[tag.country_id];
                return (
                  <TableHead key={tag.country_id} className="text-center min-w-36">
                    {countryInfo ? `${getFlagEmoji(countryInfo.iso2)} ${countryInfo.name}` : tag.country_id}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {TAG_KEYS.map(key => {
              const values = tags.map(t => t[key]);
              const higherIsBetter = HIGHER_IS_BETTER[key];
              const best = getBestValue(values, higherIsBetter);
              const worst = getWorstValue(values, higherIsBetter);

              return (
                <TableRow key={key}>
                  <TableCell className="font-medium">
                    {getTagLabel(key)}
                  </TableCell>
                  {tags.map(tag => {
                    const value = tag[key];
                    const isBest = value === best && values.filter(v => v === best).length === 1;
                    const isWorst = value === worst && values.filter(v => v === worst).length === 1;

                    return (
                      <TableCell key={tag.country_id} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "font-medium",
                              isBest && "text-risk-low",
                              isWorst && "text-risk-high"
                            )}>
                              {value}/5
                            </span>
                            {isBest && <TrendingUp className="w-3 h-3 text-risk-low" />}
                            {isWorst && <TrendingDown className="w-3 h-3 text-risk-high" />}
                          </div>
                          <Progress 
                            value={(value / 5) * 100} 
                            className={cn(
                              "h-2 w-20",
                              isBest && "[&>div]:bg-risk-low",
                              isWorst && "[&>div]:bg-risk-high"
                            )}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          {t('multiCompare.tagsNote', 'Tags scored 1-5. Green indicates best value, red indicates area of attention.')}
        </p>
      </div>
    </div>
  );
}
