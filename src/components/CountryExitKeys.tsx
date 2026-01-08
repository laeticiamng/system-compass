import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Key, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Country } from '@/lib/types';
import { findCompatibleKeys, ExitKeyResult, UserContext } from '@/lib/exit-keys-engine';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { cn } from '@/lib/utils';

interface CountryExitKeysProps {
  country: Country;
}

export function CountryExitKeys({ country }: CountryExitKeysProps) {
  const { t } = useTranslation();
  const { profile, loading } = useExitKeysProfile();

  // Build context from saved profile, using this country as current
  const exitKeyResults = useMemo(() => {
    if (!profile) return [];
    
    const context: UserContext = {
      birthCountry: profile.birthCountryId ? country.pyramidType : country.pyramidType,
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500';
      case 'moderate': return 'text-amber-500';
      case 'hard': return 'text-orange-500';
      case 'expert': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'moderate': return 'Modéré';
      case 'hard': return 'Difficile';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

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

  // No profile saved - show CTA to create one
  if (!profile) {
    return (
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold">{t('exitKeys.title', 'Clés de Sortie')}</h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Découvrez les stratégies de sortie optimales pour ce pays, personnalisées selon votre profil.
        </p>
        
        <Link to="/exit-keys">
          <Button className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            Créer mon profil Exit Keys
          </Button>
        </Link>
      </div>
    );
  }

  // Show personalized exit keys for this country
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold">{t('exitKeys.title', 'Clés de Sortie')}</h3>
            <p className="text-xs text-muted-foreground">Personnalisées pour votre profil</p>
          </div>
        </div>
        <Link to="/exit-keys">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Voir tout
            <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {exitKeyResults.length > 0 ? (
        <div className="space-y-3">
          {exitKeyResults.map((result) => (
            <ExitKeyMiniCard key={result.key.id} result={result} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune stratégie compatible trouvée pour ce pays.
        </p>
      )}
    </div>
  );
}

function ExitKeyMiniCard({ result }: { result: ExitKeyResult }) {
  const { key, compatibility } = result;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500 bg-emerald-500/10';
      case 'moderate': return 'text-amber-500 bg-amber-500/10';
      case 'hard': return 'text-orange-500 bg-orange-500/10';
      case 'expert': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent/80 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{key.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{key.name}</h4>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              getDifficultyColor(key.difficulty)
            )}>
              {key.difficulty === 'easy' ? 'Facile' : 
               key.difficulty === 'moderate' ? 'Modéré' : 
               key.difficulty === 'hard' ? 'Difficile' : 'Expert'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {key.description}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={compatibility} className="h-1.5" />
            </div>
            <span className="text-xs font-medium text-primary">{compatibility}%</span>
            <span className="text-xs text-muted-foreground">{key.timeframe}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
