import { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Key, ChevronRight, Sparkles, Bookmark, Eye, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Country } from '@/lib/types';
import { findCompatibleKeys, UserContext } from '@/lib/exit-keys-engine';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { useExitKeysHistory } from '@/hooks/useExitKeysHistory';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const { trackExitKey, updateStatus, isLoggedIn } = useExitKeysHistory();

  const exitKeyResults = useMemo(() => {
    if (!profile) return [];
    
    // Use actual profile data instead of country pyramidType
    const context: UserContext = {
      birthCountry: profile.birthCountryId ? 
        (country.pyramidType) : country.pyramidType,
      nationalities: profile.nationalityIds?.length > 0 
        ? [country.pyramidType] 
        : [country.pyramidType],
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

  const handleTrackKey = useCallback(async (keyId: string, compatibility: number) => {
    if (!isLoggedIn) {
      toast.info(t('exitKeys.loginToSave', 'Connectez-vous pour sauvegarder'));
      return;
    }
    await trackExitKey(keyId, country.id, compatibility);
    toast.success(t('exitKeys.keyTracked', 'Clé explorée enregistrée'));
  }, [isLoggedIn, trackExitKey, country.id, t]);

  const handleSaveKey = useCallback(async (keyId: string, compatibility: number) => {
    if (!isLoggedIn) {
      toast.info(t('exitKeys.loginToSave', 'Connectez-vous pour sauvegarder'));
      return;
    }
    const entry = await trackExitKey(keyId, country.id, compatibility);
    if (entry) {
      await updateStatus(entry.id, 'saved');
      toast.success(t('exitKeys.keySaved', 'Clé sauvegardée !'));
    }
  }, [isLoggedIn, trackExitKey, updateStatus, country.id, t]);

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
          {t('exitKeys.createProfilePrompt', 'Créez votre profil pour découvrir les stratégies adaptées à votre situation')}
        </p>
        <Link to="/exit-keys">
          <Button className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            {t('exitKeys.createProfile', 'Créer mon profil')}
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
        <div className="flex items-center gap-2">
          <Link 
            to="/compare-exit-keys"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t('exitKeys.compare', 'Comparer')}
          </Link>
          <Link 
            to="/exit-keys"
            className="text-xs text-primary hover:underline"
          >
            {t('exitKeys.seeAll', 'Voir tout')}
          </Link>
        </div>
      </div>

      {exitKeyResults.length > 0 ? (
        <div className="space-y-3">
          {exitKeyResults.map(({ key, compatibility }) => (
            <ExitKeyPreview 
              key={key.id} 
              exitKey={key} 
              compatibility={compatibility}
              onTrack={() => handleTrackKey(key.id, compatibility)}
              onSave={() => handleSaveKey(key.id, compatibility)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('exitKeys.noCompatibleStrategies', 'Aucune stratégie compatible trouvée depuis ce pays.')}
        </p>
      )}
    </div>
  );
}

function ExitKeyPreview({ 
  exitKey, 
  compatibility,
  onTrack,
  onSave,
}: {
  exitKey: { 
    id: string; 
    name: string; 
    unlocks: string;
    difficulty: 'accessible' | 'exigeant' | 'expert';
    timeframe: string;
  }; 
  compatibility: number;
  onTrack: () => void;
  onSave: () => void;
  isLoggedIn: boolean;
}) {
  const { t } = useTranslation();
  const difficulty = difficultyConfig[exitKey.difficulty];

  return (
    <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent/80 transition-colors group">
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
          
          {/* Action buttons - visible on hover */}
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onTrack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              title={t('exitKeys.markExplored', 'Marquer comme explorée')}
            >
              <Eye className="w-3 h-3" />
              {t('exitKeys.explored', 'Explorée')}
            </button>
            <button 
              onClick={onSave}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              title={t('exitKeys.saveKey', 'Sauvegarder')}
            >
              <Bookmark className="w-3 h-3" />
              {t('exitKeys.save', 'Sauvegarder')}
            </button>
            <Link 
              to={`/exit-keys?key=${exitKey.id}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <PlayCircle className="w-3 h-3" />
              {t('exitKeys.startKey', 'Démarrer')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
