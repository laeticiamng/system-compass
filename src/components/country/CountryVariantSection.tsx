import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Rocket, 
  Coffee,
  Lightbulb,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { Json } from '@/integrations/supabase/types';

interface VariantSection {
  items: string[];
  summary: string;
}

interface CountryVariant {
  institutions: VariantSection;
  networks: VariantSection;
  labor_market: VariantSection;
  entrepreneurship: VariantSection;
  daily_life: VariantSection;
  surprises: string[];
  profiles_succeed: string[];
  profiles_struggle: string[];
  is_complete: boolean;
}

// Helper to safely parse JSONB data
function parseVariantSection(data: Json | null): VariantSection {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { items: [], summary: '' };
  }
  const obj = data as Record<string, unknown>;
  return {
    items: Array.isArray(obj.items) ? obj.items.map(String) : [],
    summary: typeof obj.summary === 'string' ? obj.summary : '',
  };
}

function parseStringArray(data: Json | null): string[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(String);
}

interface CountryVariantSectionProps {
  countryId: string;
  countryName: string;
}

export function CountryVariantSection({ countryId, countryName }: CountryVariantSectionProps) {
  const { t } = useTranslation();
  const { canAccessPremium, loading: subscriptionLoading } = useSubscription();
  const [variant, setVariant] = useState<CountryVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVariant() {
      if (!canAccessPremium) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('country_variants')
          .select('*')
          .eq('country_id', countryId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setVariant({
            institutions: parseVariantSection(data.institutions),
            networks: parseVariantSection(data.networks),
            labor_market: parseVariantSection(data.labor_market),
            entrepreneurship: parseVariantSection(data.entrepreneurship),
            daily_life: parseVariantSection(data.daily_life),
            surprises: parseStringArray(data.surprises),
            profiles_succeed: parseStringArray(data.profiles_succeed),
            profiles_struggle: parseStringArray(data.profiles_struggle),
            is_complete: data.is_complete,
          });
        }
      } catch (err) {
        console.error('Failed to fetch country variant:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVariant();
  }, [countryId, canAccessPremium]);

  // Show paywall if not subscribed
  if (!canAccessPremium) {
    return (
      <PremiumPaywall
        title={t('countryDetail.variant.paywallTitle', 'Variante Pays')}
        description={t('countryDetail.variant.paywallDesc', `Débloquez les spécificités locales de ${countryName} : institutions, réseaux, marché du travail, entrepreneuriat, et plus encore.`)}
        tier="premium"
      />
    );
  }

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no variant data exists yet
  if (!variant || !variant.is_complete) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold mb-2">
          {t('countryDetail.variant.comingSoon', 'Contenu en cours de rédaction')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('countryDetail.variant.comingSoonDesc', `Les données spécifiques pour ${countryName} sont en cours de préparation. Revenez bientôt pour découvrir les insights locaux.`)}
        </p>
      </div>
    );
  }

  const sections = [
    { 
      icon: Building2, 
      title: t('countryDetail.variant.institutions', 'Institutions & Administration'),
      data: variant.institutions,
      color: 'text-blue-500'
    },
    { 
      icon: Users, 
      title: t('countryDetail.variant.networks', 'Réseaux & Réputation'),
      data: variant.networks,
      color: 'text-purple-500'
    },
    { 
      icon: Briefcase, 
      title: t('countryDetail.variant.laborMarket', 'Marché du Travail'),
      data: variant.labor_market,
      color: 'text-green-500'
    },
    { 
      icon: Rocket, 
      title: t('countryDetail.variant.entrepreneurship', 'Entrepreneuriat'),
      data: variant.entrepreneurship,
      color: 'text-orange-500'
    },
    { 
      icon: Coffee, 
      title: t('countryDetail.variant.dailyLife', 'Vie Quotidienne'),
      data: variant.daily_life,
      color: 'text-pink-500'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Premium Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
          ⭐ {t('countryDetail.variant.badge', 'Variante Pays — Premium')}
        </span>
      </div>

      {/* Sections Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ icon: Icon, title, data, color }) => (
          <div key={title} className="glass-card rounded-xl p-5">
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${color}`}>
              <Icon className="w-5 h-5" />
              {title}
            </h3>
            {data.summary && (
              <p className="text-sm text-muted-foreground mb-3">{data.summary}</p>
            )}
            <ul className="space-y-1.5 text-sm">
              {data.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className={color}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* What surprises newcomers */}
      {variant.surprises.length > 0 && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-amber-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            {t('countryDetail.variant.surprises', 'Ce qui surprend souvent les nouveaux arrivants')}
          </h3>
          <ul className="grid md:grid-cols-2 gap-2">
            {variant.surprises.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-amber-500">💡</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Profiles that succeed/struggle */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Profiles that succeed */}
        {variant.profiles_succeed.length > 0 && (
          <div className="glass-card rounded-xl p-5 border-l-4 border-green-500">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <UserCheck className="w-5 h-5" />
              {t('countryDetail.variant.profilesSucceed', 'Profils qui réussissent souvent ici')}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 italic">
              {t('countryDetail.variant.noJudgment', '(tendances observées, pas de garantie)')}
            </p>
            <ul className="space-y-2">
              {variant.profiles_succeed.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profiles that struggle */}
        {variant.profiles_struggle.length > 0 && (
          <div className="glass-card rounded-xl p-5 border-l-4 border-red-500">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
              <UserX className="w-5 h-5" />
              {t('countryDetail.variant.profilesStruggle', 'Profils qui rencontrent souvent des difficultés')}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 italic">
              {t('countryDetail.variant.noJudgment', '(tendances observées, pas de garantie)')}
            </p>
            <ul className="space-y-2">
              {variant.profiles_struggle.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">⚠</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <SimulationDisclaimer variant="contextual" context="results" />
    </div>
  );
}
