import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { 
  AlertTriangle, 
  Shield, 
  Award, 
  TrendingUp, 
  Shuffle, 
  Gem,
  ArrowRight
} from 'lucide-react';
import { PyramidType } from '@/lib/types';

interface PyramidTypeConfig {
  key: string;
  type: PyramidType;
  color: string;
  icon: React.ElementType;
  examples: string[];
  characteristics: string[];
}

const PYRAMID_CONFIGS: PyramidTypeConfig[] = [
  {
    key: 'problemRent',
    type: 'PROBLEM_RENT',
    color: 'pyramid-rent',
    icon: AlertTriangle,
    examples: ['cameroon', 'nigeria', 'venezuela'],
    characteristics: ['corruption', 'informality', 'networks'],
  },
  {
    key: 'stabilityRedis',
    type: 'STABILITY_REDIS',
    color: 'pyramid-stability',
    icon: Shield,
    examples: ['france', 'belgium', 'italy'],
    characteristics: ['bureaucracy', 'protection', 'redistribution'],
  },
  {
    key: 'competenceTrust',
    type: 'COMPETENCE_TRUST',
    color: 'pyramid-competence',
    icon: Award,
    examples: ['switzerland', 'germany', 'netherlands'],
    characteristics: ['precision', 'credentials', 'trust'],
  },
  {
    key: 'growthRisk',
    type: 'GROWTH_RISK',
    color: 'pyramid-growth',
    icon: TrendingUp,
    examples: ['usa', 'uk', 'singapore'],
    characteristics: ['speed', 'capital', 'scalability'],
  },
  {
    key: 'hybridTransition',
    type: 'HYBRID_TRANSITION',
    color: 'pyramid-hybrid',
    icon: Shuffle,
    examples: ['china', 'russia', 'brazil', 'india', 'turkey'],
    characteristics: ['contradictions', 'change', 'adaptation'],
  },
  {
    key: 'resourceExtraction',
    type: 'RESOURCE_EXTRACTION',
    color: 'pyramid-resource',
    icon: Gem,
    examples: ['norway', 'qatar', 'saudi-arabia'],
    characteristics: ['resources', 'proximity', 'distribution'],
  },
];

export function PyramidTypesShowcase() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {PYRAMID_CONFIGS.map((config) => {
        const Icon = config.icon;
        
        return (
          <div
            key={config.key}
            className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group cursor-pointer"
            onClick={() => navigate(`/pyramid-types#${config.type.toLowerCase()}`)}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `hsl(var(--${config.color}) / 0.2)` }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: `hsl(var(--${config.color}))` }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg mb-1">
                  {t(`pyramids.${config.key}.label`)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {t(`pyramids.${config.key}.description`)}
                </p>
              </div>
            </div>

            {/* Characteristics */}
            <div className="flex flex-wrap gap-2 mb-4">
              {config.characteristics.map((char) => (
                <span
                  key={char}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `hsl(var(--${config.color}) / 0.1)`,
                    color: `hsl(var(--${config.color}))`
                  }}
                >
                  {t(`pyramids.characteristics.${char}`, char)}
                </span>
              ))}
            </div>

            {/* Example Countries */}
            <div className="border-t border-border pt-4">
              <div className="text-xs text-muted-foreground mb-2">
                {t('pyramids.examples', 'Examples')}:
              </div>
              <div className="flex items-center gap-2">
                {config.examples.slice(0, 3).map((countryId) => (
                  <CountryFlag key={countryId} countryId={countryId} />
                ))}
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CountryFlag({ countryId }: { countryId: string }) {
  const countryIso: Record<string, string> = {
    cameroon: 'CM',
    nigeria: 'NG',
    venezuela: 'VE',
    france: 'FR',
    belgium: 'BE',
    italy: 'IT',
    switzerland: 'CH',
    germany: 'DE',
    netherlands: 'NL',
    usa: 'US',
    uk: 'GB',
    singapore: 'SG',
    china: 'CN',
    russia: 'RU',
    brazil: 'BR',
    norway: 'NO',
    qatar: 'QA',
    saudi: 'SA',
  };

  const iso = countryIso[countryId] || 'XX';
  const flag = getFlagEmoji(iso);

  return (
    <span className="text-xl" title={countryId}>
      {flag}
    </span>
  );
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
