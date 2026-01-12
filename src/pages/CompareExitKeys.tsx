import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Key, Plus, X, Clock, Target, 
  AlertTriangle, CheckCircle, Shield,
  Zap, Unlock, Crosshair, AlertOctagon
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
import { useCountries } from '@/lib/countries-data';
import type { Country } from '@/lib/types';
import { cn } from '@/lib/utils';

const difficultyConfig = {
  accessible: { label: 'Accessible', color: 'bg-emerald-500/20 text-emerald-400' },
  exigeant: { label: 'Exigeant', color: 'bg-amber-500/20 text-amber-400' },
  expert: { label: 'Expert', color: 'bg-rose-500/20 text-rose-400' },
};

export default function CompareExitKeys() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { profile } = useExitKeysProfile();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const userContext: UserContext | null = useMemo(() => {
    if (!profile) return null;
    const currentCountry = countries.find(c => c.id === profile.currentCountryId);
    const birthCountry = countries.find(c => c.id === profile.birthCountryId);
    const nationalityCountries = (profile.nationalityIds || [])
      .map(id => countries.find(c => c.id === id))
      .filter(Boolean) as Country[];
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

  const compatibilityMap = useMemo(() => {
    if (!userContext) return {};
    const results = findCompatibleKeys(userContext);
    const map: Record<string, number> = {};
    results.forEach(r => { map[r.key.id] = r.compatibility; });
    return map;
  }, [userContext]);

  const selectedExitKeys = EXIT_KEYS.filter(k => selectedKeys.includes(k.id));
  const availableKeys = EXIT_KEYS.filter(k => !selectedKeys.includes(k.id));

  const addKey = (keyId: string) => {
    if (selectedKeys.length < 3) setSelectedKeys([...selectedKeys, keyId]);
  };
  const removeKey = (keyId: string) => {
    setSelectedKeys(selectedKeys.filter(id => id !== keyId));
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link to="/exit-keys" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('exitKeys.compare.backToKeys', 'Retour aux Clés de Sortie')}
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{t('exitKeys.compare.title', 'Comparer les Stratégies')}</h1>
              <p className="text-muted-foreground">{t('exitKeys.compare.subtitle', "Analysez jusqu'à 3 clés de sortie côte à côte")}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4">{t('exitKeys.compare.selectStrategies', 'Sélectionner les stratégies à comparer')}</h2>
          <div className="flex flex-wrap gap-4">
            {selectedExitKeys.map(key => (
              <div key={key.id} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                <Key className="w-4 h-4 text-primary" />
                <span className="font-medium">{key.name}</span>
                <button onClick={() => removeKey(key.id)} className="ml-2 p-1 hover:bg-destructive/20 rounded-full transition-colors">
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
            {selectedKeys.length < 3 && (
              <Select onValueChange={addKey}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder={<span className="flex items-center gap-2"><Plus className="w-4 h-4" />{t('exitKeys.compare.addStrategy', 'Ajouter une stratégie')}</span>} />
                </SelectTrigger>
                <SelectContent>
                  {availableKeys.map(key => (
                    <SelectItem key={key.id} value={key.id}>{key.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {selectedExitKeys.length > 0 ? (
          <div className="space-y-6">
            <div className={cn("grid gap-6", selectedExitKeys.length === 1 && "grid-cols-1", selectedExitKeys.length === 2 && "grid-cols-1 md:grid-cols-2", selectedExitKeys.length === 3 && "grid-cols-1 md:grid-cols-3")}>
              {selectedExitKeys.map(key => {
                const diff = difficultyConfig[key.difficulty];
                return (
                  <div key={key.id} className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Key className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-display text-xl font-bold">{key.name}</h3>
                        <Badge className={diff.color}>{diff.label}</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2"><Unlock className="w-4 h-4 text-emerald-500 mt-0.5" /><span>{key.unlocks}</span></div>
                      <div className="flex items-start gap-2"><Crosshair className="w-4 h-4 text-primary mt-0.5" /><span>{key.successCondition}</span></div>
                      <div className="flex items-start gap-2"><AlertOctagon className="w-4 h-4 text-rose-500 mt-0.5" /><span>{key.mainRisk}</span></div>
                    </div>
                    {userContext && compatibilityMap[key.id] !== undefined && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{t('exitKeys.compare.compatibility', 'Compatibilité')}</span>
                          <span className="font-semibold text-primary">{compatibilityMap[key.id]}%</span>
                        </div>
                        <Progress value={compatibilityMap[key.id]} className="h-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-semibold bg-muted/30">{t('exitKeys.compare.criterion', 'Critère')}</th>
                    {selectedExitKeys.map(key => (<th key={key.id} className="text-left p-4 font-semibold bg-muted/30">{key.name}</th>))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">{t('exitKeys.compare.difficulty', 'Difficulté')}</td>
                    {selectedExitKeys.map(key => (<td key={key.id} className="p-4"><Badge className={difficultyConfig[key.difficulty].color}>{difficultyConfig[key.difficulty].label}</Badge></td>))}
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium"><Clock className="w-4 h-4 inline mr-2" />{t('exitKeys.compare.duration', 'Durée')}</td>
                    {selectedExitKeys.map(key => (<td key={key.id} className="p-4">{key.timeframe}</td>))}
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium"><Target className="w-4 h-4 inline mr-2" />{t('exitKeys.compare.phases', 'Phases')}</td>
                    {selectedExitKeys.map(key => (<td key={key.id} className="p-4">{t('exitKeys.compare.phasesCount', '{{count}} phases', { count: key.steps.length })}</td>))}
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="p-4 font-medium">{t('exitKeys.compare.prerequisites', 'Prérequis')}</td>
                    {selectedExitKeys.map(key => (<td key={key.id} className="p-4">{t('exitKeys.compare.criteriaCount', '{{count}} critères', { count: key.requirements.length })}</td>))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" />{t('exitKeys.compare.detailedPrerequisites', 'Prérequis Détaillés')}</h3>
              <div className={cn("grid gap-6", selectedExitKeys.length === 1 && "grid-cols-1", selectedExitKeys.length >= 2 && "grid-cols-1 md:grid-cols-2", selectedExitKeys.length === 3 && "md:grid-cols-3")}>
                {selectedExitKeys.map(key => (
                  <div key={key.id}>
                    <h4 className="font-medium mb-3">{key.name}</h4>
                    <ul className="space-y-2">
                      {key.requirements.map((req, i) => (<li key={i} className="text-sm flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{req}</li>))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {userContext && selectedExitKeys.length > 1 && (
              <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />{t('exitKeys.compare.recommendationTitle', 'Recommandation pour Votre Profil')}</h3>
                {(() => {
                  const bestKey = selectedExitKeys.reduce((best, key) => (compatibilityMap[key.id] || 0) > (compatibilityMap[best.id] || 0) ? key : best);
                  return (
                    <div className="flex items-center gap-4">
                      <Key className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium"><span className="text-primary">{bestKey.name}</span> {t('exitKeys.compare.bestOption', '{{name}} est la meilleure option pour vous', { name: '' }).replace('{{name}}', '')}</p>
                        <p className="text-sm text-muted-foreground">{t('exitKeys.compare.withCompatibility', 'Avec {{percent}}% de compatibilité', { percent: compatibilityMap[bestKey.id] })}</p>
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
            <h3 className="text-xl font-semibold mb-2">{t('exitKeys.compare.selectStrategiesToCompare', 'Sélectionnez des stratégies')}</h3>
            <p className="text-muted-foreground mb-6">{t('exitKeys.compare.chooseUpTo3', "Choisissez jusqu'à 3 clés de sortie pour les comparer")}</p>
            <Link to="/exit-keys"><Button variant="outline" className="gap-2">{t('exitKeys.compare.viewAllKeys', 'Voir toutes les clés')}</Button></Link>
          </div>
        )}
      </div>
    </main>
  );
}
