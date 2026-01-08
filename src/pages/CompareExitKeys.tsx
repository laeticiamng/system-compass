import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Key, Plus, X, Clock, Target, 
  TrendingUp, AlertTriangle, CheckCircle, Shield,
  ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXIT_KEYS, ExitKey, findCompatibleKeys, UserContext } from '@/lib/exit-keys-engine';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { countries } from '@/lib/countries-data';
import { cn } from '@/lib/utils';

const difficultyColors = {
  easy: 'bg-emerald-500/20 text-emerald-400',
  moderate: 'bg-amber-500/20 text-amber-400',
  hard: 'bg-orange-500/20 text-orange-400',
  expert: 'bg-red-500/20 text-red-400',
};

const difficultyLabels = {
  easy: 'Facile',
  moderate: 'Modéré',
  hard: 'Difficile',
  expert: 'Expert',
};

export default function CompareExitKeys() {
  const { t } = useTranslation();
  const { profile } = useExitKeysProfile();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Build context from profile for compatibility calculation
  const userContext: UserContext | null = useMemo(() => {
    if (!profile) return null;
    const currentCountry = countries.find(c => c.id === profile.currentCountryId);
    const birthCountry = countries.find(c => c.id === profile.birthCountryId);
    const nationalityCountries = (profile.nationalityIds || []).map(id => countries.find(c => c.id === id)).filter(Boolean);
    if (!currentCountry) return null;
    
    const nationalities = nationalityCountries.length > 0 
      ? nationalityCountries.map(c => c!.pyramidType)
      : [birthCountry?.pyramidType || currentCountry.pyramidType];

    return {
      birthCountry: birthCountry?.pyramidType || currentCountry.pyramidType,
      nationalities,
      currentCountry: currentCountry.pyramidType,
      desiredLife: profile.desiredLife,
      motorProfile: profile.motorProfile,
      riskTolerance: profile.riskTolerance,
      timeHorizon: profile.timeHorizon,
      hasCapital: profile.hasCapital,
      hasCredentials: profile.hasCredentials,
      hasNetwork: profile.hasNetwork,
      isLGBTQ: profile.isLGBTQ,
      hasFamily: profile.hasFamily,
    };
  }, [profile]);

  // Get compatibility scores
  const compatibilityMap = useMemo(() => {
    if (!userContext) return {};
    const results = findCompatibleKeys(userContext);
    const map: Record<string, number> = {};
    results.forEach(r => {
      map[r.key.id] = r.compatibility;
    });
    return map;
  }, [userContext]);

  const selectedExitKeys = EXIT_KEYS.filter(k => selectedKeys.includes(k.id));
  const availableKeys = EXIT_KEYS.filter(k => !selectedKeys.includes(k.id));

  const addKey = (keyId: string) => {
    if (selectedKeys.length < 3) {
      setSelectedKeys([...selectedKeys, keyId]);
    }
  };

  const removeKey = (keyId: string) => {
    setSelectedKeys(selectedKeys.filter(id => id !== keyId));
  };

  const parseTimeframe = (timeframe: string): { min: number; max: number } => {
    const match = timeframe.match(/(\d+)-?(\d+)?/);
    if (!match) return { min: 5, max: 5 };
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2] || match[1]),
    };
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-500';
    if (rate >= 50) return 'text-amber-500';
    return 'text-orange-500';
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/exit-keys" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux Clés de Sortie
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Comparer les Stratégies
              </h1>
              <p className="text-muted-foreground">
                Analysez jusqu'à 3 clés de sortie côte à côte
              </p>
            </div>
          </div>
        </div>

        {/* Key Selector */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4">Sélectionner les stratégies à comparer</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Selected Keys */}
            {selectedExitKeys.map(key => (
              <div 
                key={key.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30"
              >
                <span className="text-xl">{key.icon}</span>
                <span className="font-medium">{key.name}</span>
                <button
                  onClick={() => removeKey(key.id)}
                  className="ml-2 p-1 hover:bg-destructive/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}

            {/* Add Key Selector */}
            {selectedKeys.length < 3 && (
              <Select onValueChange={addKey}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder={
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter une stratégie
                    </span>
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableKeys.map(key => (
                    <SelectItem key={key.id} value={key.id}>
                      <span className="flex items-center gap-2">
                        <span>{key.icon}</span>
                        <span>{key.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedExitKeys.length > 0 ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className={cn(
              "grid gap-6",
              selectedExitKeys.length === 1 && "grid-cols-1",
              selectedExitKeys.length === 2 && "grid-cols-1 md:grid-cols-2",
              selectedExitKeys.length === 3 && "grid-cols-1 md:grid-cols-3",
            )}>
              {selectedExitKeys.map(key => (
                <div key={key.id} className="glass-card rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{key.icon}</span>
                    <div>
                      <h3 className="font-display text-xl font-bold">{key.name}</h3>
                      <Badge className={difficultyColors[key.difficulty]}>
                        {difficultyLabels[key.difficulty]}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {key.description}
                  </p>

                  {/* Compatibility */}
                  {userContext && compatibilityMap[key.id] !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Compatibilité</span>
                        <span className="font-semibold text-primary">{compatibilityMap[key.id]}%</span>
                      </div>
                      <Progress value={compatibilityMap[key.id]} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Detailed Comparison */}
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-semibold bg-muted/30">Critère</th>
                    {selectedExitKeys.map(key => (
                      <th key={key.id} className="text-left p-4 font-semibold bg-muted/30">
                        <span className="flex items-center gap-2">
                          <span>{key.icon}</span>
                          <span className="truncate">{key.name}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Difficulty */}
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">Difficulté</td>
                    {selectedExitKeys.map(key => (
                      <td key={key.id} className="p-4">
                        <Badge className={difficultyColors[key.difficulty]}>
                          {difficultyLabels[key.difficulty]}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Timeframe */}
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Durée
                      </span>
                    </td>
                    {selectedExitKeys.map(key => (
                      <td key={key.id} className="p-4">
                        {key.timeframe}
                      </td>
                    ))}
                  </tr>

                  {/* Success Rate */}
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        Taux de succès
                      </span>
                    </td>
                    {selectedExitKeys.map(key => (
                      <td key={key.id} className="p-4">
                        <span className={cn("font-semibold", getSuccessRateColor(key.successRate))}>
                          {key.successRate}%
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Number of Phases */}
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        Phases
                      </span>
                    </td>
                    {selectedExitKeys.map(key => (
                      <td key={key.id} className="p-4">
                        {key.steps.length} phases
                      </td>
                    ))}
                  </tr>

                  {/* Requirements Count */}
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">Prérequis</td>
                    {selectedExitKeys.map(key => (
                      <td key={key.id} className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {key.requirements.length} critères
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Risks Count */}
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        Risques
                      </span>
                    </td>
                    {selectedExitKeys.map(key => (
                      <td key={key.id} className="p-4">
                        <span className="text-destructive font-medium">
                          {key.risks.length} risques
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Requirements Comparison */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Prérequis Détaillés
              </h3>
              
              <div className={cn(
                "grid gap-6",
                selectedExitKeys.length === 1 && "grid-cols-1",
                selectedExitKeys.length === 2 && "grid-cols-1 md:grid-cols-2",
                selectedExitKeys.length === 3 && "grid-cols-1 md:grid-cols-3",
              )}>
                {selectedExitKeys.map(key => (
                  <div key={key.id}>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span>{key.icon}</span>
                      {key.name}
                    </h4>
                    <ul className="space-y-2">
                      {key.requirements.map((req, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks Comparison */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Risques à Considérer
              </h3>
              
              <div className={cn(
                "grid gap-6",
                selectedExitKeys.length === 1 && "grid-cols-1",
                selectedExitKeys.length === 2 && "grid-cols-1 md:grid-cols-2",
                selectedExitKeys.length === 3 && "grid-cols-1 md:grid-cols-3",
              )}>
                {selectedExitKeys.map(key => (
                  <div key={key.id}>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span>{key.icon}</span>
                      {key.name}
                    </h4>
                    <ul className="space-y-2">
                      {key.risks.map((risk, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                          <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Choice Recommendation */}
            {userContext && selectedExitKeys.length > 1 && (
              <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Recommandation pour Votre Profil
                </h3>
                
                {(() => {
                  const bestKey = selectedExitKeys.reduce((best, key) => {
                    const bestScore = compatibilityMap[best.id] || 0;
                    const currentScore = compatibilityMap[key.id] || 0;
                    return currentScore > bestScore ? key : best;
                  });
                  
                  return (
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{bestKey.icon}</span>
                      <div>
                        <p className="font-medium">
                          <span className="text-primary">{bestKey.name}</span> est la meilleure option pour vous
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avec {compatibilityMap[bestKey.id]}% de compatibilité et un taux de succès de {bestKey.successRate}%
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Sélectionnez des stratégies</h3>
            <p className="text-muted-foreground mb-6">
              Choisissez jusqu'à 3 clés de sortie pour les comparer côte à côte
            </p>
            <Link to="/exit-keys">
              <Button variant="outline" className="gap-2">
                <ChevronRight className="w-4 h-4" />
                Voir toutes les clés de sortie
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
