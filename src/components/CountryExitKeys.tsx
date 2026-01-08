import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Key, ChevronRight, Sparkles, Unlock, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Country } from '@/lib/types';
import { findCompatibleKeys, ExitKeyResult, UserContext } from '@/lib/exit-keys-engine';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { cn } from '@/lib/utils';

interface CountryExitKeysProps {
  country: Country;
}

const difficultyConfig = {
  accessible: { label: 'Accessible', color: 'text-emerald-500 bg-emerald-500/10' },
  exigeant: { label: 'Exigeant', color: 'text-amber-500 bg-amber-500/10' },
  expert: { label: 'Expert', color: 'text-rose-500 bg-rose-500/10' },
};

export function CountryExitKeys({ country }: CountryExitKeysProps) {
  const { t } = useTranslation();
  const { profile, loading } = useExitKeysProfile();

  const exitKeyResults = useMemo(() => {
    if (!profile) return [];
    
    const context: UserContext = {
      birthCountry: profile.birthCountryId ? country.pyramidType : country.pyramidType,
      nationalities: profile.nationalityIds?.length > 0 ? [country.pyramidType] : [country.pyramidType],
      currentCountry: country.pyramidType,
      desiredLife: profile.desiredLife || 'freedom',
      motorProfile: profile.motorProfile || 'BUILDER',
      riskTolerance: profile.riskTolerance || 'medium',
      timeHorizon: profile.timeHorizon || 'medium',
      hasCapital: profile.hasCapital || false,
      hasCredentials: profile.hasCredentials || false,
      hasNetwork: profile.hasNetwork || false,
      isLGBTQ: profile.isLGBTQ || false,
      hasFamily: profile.hasFamily || false,
    };

    return findCompatibleKeys(context).slice(0, 3);
  }, [profile, country]);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">{t('exitKeys.title', 'Clés de Sortie')}</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">{t('exitKeys.title', 'Clés de Sortie')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Créez votre profil pour découvrir les stratégies adaptées à votre situation
        </p>
        <Link to="/exit-keys">
          <Button className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Créer mon profil
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">{t('exitKeys.title', 'Clés de Sortie')}</h3>
        </div>
        <Link 
          to="/exit-keys"
          className="text-xs text-primary hover:underline"
        >
          Voir tout
        </Link>
      </div>

      {exitKeyResults.length > 0 ? (
        <div className="space-y-3">
          {exitKeyResults.map(({ key, compatibility }) => (
            <ExitKeyPreview key={key.id} exitKey={key} compatibility={compatibility} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune stratégie compatible trouvée depuis ce pays.
        </p>
      )}
    </div>
  );
}

function ExitKeyPreview({ 
  exitKey, 
  compatibility 
}: { 
  exitKey: { 
    id: string; 
    name: string; 
    unlocks: string;
    difficulty: 'accessible' | 'exigeant' | 'expert';
    timeframe: string;
  }; 
  compatibility: number;
}) {
  const difficulty = difficultyConfig[exitKey.difficulty];

  return (
    <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent/80 transition-colors">
      <div className="flex items-start gap-3">
        <Key className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{exitKey.name}</h4>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              difficulty.color
            )}>
              {difficulty.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {exitKey.unlocks}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={compatibility} className="h-1.5" />
            </div>
            <span className="text-xs font-medium text-primary">{compatibility}%</span>
            <span className="text-xs text-muted-foreground">{exitKey.timeframe}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
