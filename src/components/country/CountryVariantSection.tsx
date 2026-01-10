import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslatedVariants } from '@/hooks/useTranslatedVariants';
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
  Loader2,
  TrendingUp
} from 'lucide-react';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { Json } from '@/integrations/supabase/types';

interface CountryVariant {
  labor_market: string[];
  entrepreneurship: string[];
  daily_life: string[];
  institutions: string[];
  networks: string[];
  profiles_succeed: string[];
  profiles_struggle: string[];
  surprises: string[];
  example_trajectories: { profile: string; outcome: string }[];
  is_complete: boolean;
}

// Helper to safely parse JSONB data - handles both array and object formats
function parseToStringArray(data: Json | null): string[] {
  if (!data) return [];
  
  // If it's already an array
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        // Handle objects with profile/outcome structure
        const obj = item as Record<string, unknown>;
        if (obj.profile && obj.outcome) {
          return `${obj.profile}: ${obj.outcome}`;
        }
      }
      return String(item);
    });
  }
  
  // If it's an object with items array
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return obj.items.map(String);
    }
  }
  
  return [];
}

function parseTrajectories(data: Json | null): { profile: string; outcome: string }[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        profile: String(obj.profile || ''),
        outcome: String(obj.outcome || ''),
      };
    }
    return { profile: '', outcome: String(item) };
  }).filter(t => t.profile || t.outcome);
}

interface CountryVariantSectionProps {
  countryId: string;
  countryName: string;
}

export function CountryVariantSection({ countryId, countryName }: CountryVariantSectionProps) {
  const { t } = useTranslation();
  const { canAccessPremium, loading: subscriptionLoading } = useSubscription();
  const [originalVariant, setOriginalVariant] = useState<CountryVariant | null>(null);
  const [loading, setLoading] = useState(true);

  // Use translation hook
  const { translatedData: variant, isTranslating } = useTranslatedVariants(
    countryId,
    originalVariant
  );

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
          setOriginalVariant({
            institutions: parseToStringArray(data.institutions),
            networks: parseToStringArray(data.networks),
            labor_market: parseToStringArray(data.labor_market),
            entrepreneurship: parseToStringArray(data.entrepreneurship),
            daily_life: parseToStringArray(data.daily_life),
            surprises: parseToStringArray(data.surprises),
            profiles_succeed: parseToStringArray(data.profiles_succeed),
            profiles_struggle: parseToStringArray(data.profiles_struggle),
            example_trajectories: parseTrajectories(data.example_trajectories),
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

  if (loading || subscriptionLoading || isTranslating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        {isTranslating && (
          <span className="text-sm text-muted-foreground">
            {t('intelligence.translating', 'Traduction en cours...')}
          </span>
        )}
      </div>
    );
  }

  // If no variant data exists yet
  if (!originalVariant || !originalVariant.is_complete) {
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

  // Use translated data or fallback to original
  const displayData = variant || originalVariant;

  const sections = [
    { 
      icon: Building2, 
      title: t('countryDetail.variant.institutions', 'Institutions & Administration'),
      data: displayData.institutions,
      color: 'text-blue-500'
    },
    { 
      icon: Users, 
      title: t('countryDetail.variant.networks', 'Réseaux & Réputation'),
      data: displayData.networks,
      color: 'text-purple-500'
    },
    { 
      icon: Briefcase, 
      title: t('countryDetail.variant.laborMarket', 'Marché du Travail'),
      data: displayData.labor_market,
      color: 'text-green-500'
    },
    { 
      icon: Rocket, 
      title: t('countryDetail.variant.entrepreneurship', 'Entrepreneuriat'),
      data: displayData.entrepreneurship,
      color: 'text-orange-500'
    },
    { 
      icon: Coffee, 
      title: t('countryDetail.variant.dailyLife', 'Vie Quotidienne'),
      data: displayData.daily_life,
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
            <ul className="space-y-1.5 text-sm">
              {data.map((item, i) => (
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
      {displayData.surprises.length > 0 && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-amber-500">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            {t('countryDetail.variant.surprises', 'Ce qui surprend souvent les nouveaux arrivants')}
          </h3>
          <ul className="grid md:grid-cols-2 gap-2">
            {displayData.surprises.map((item, i) => (
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
        {displayData.profiles_succeed.length > 0 && (
          <div className="glass-card rounded-xl p-5 border-l-4 border-green-500">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <UserCheck className="w-5 h-5" />
              {t('countryDetail.variant.profilesSucceed', 'Profils qui réussissent souvent ici')}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 italic">
              {t('countryDetail.variant.noJudgment', '(tendances observées, pas de garantie)')}
            </p>
            <ul className="space-y-2">
              {displayData.profiles_succeed.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profiles that struggle */}
        {displayData.profiles_struggle.length > 0 && (
          <div className="glass-card rounded-xl p-5 border-l-4 border-red-500">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
              <UserX className="w-5 h-5" />
              {t('countryDetail.variant.profilesStruggle', 'Profils qui rencontrent souvent des difficultés')}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 italic">
              {t('countryDetail.variant.noJudgment', '(tendances observées, pas de garantie)')}
            </p>
            <ul className="space-y-2">
              {displayData.profiles_struggle.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">⚠</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Example Trajectories */}
      {displayData.example_trajectories && displayData.example_trajectories.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('countryDetail.variant.trajectories', 'Exemples de trajectoires')}
          </h3>
          <div className="space-y-4">
            {displayData.example_trajectories.map((trajectory, i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg">
                <div className="font-medium text-sm text-primary mb-1">
                  {trajectory.profile}
                </div>
                <p className="text-sm text-muted-foreground">
                  {trajectory.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <SimulationDisclaimer variant="contextual" context="results" />
    </div>
  );
}
