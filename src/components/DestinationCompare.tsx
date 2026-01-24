import { useState } from 'react';
import { X, Scale, Palmtree, Building2, CheckCircle, XCircle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DestinationRecommendation } from '@/lib/nationality-advantages';

interface DestinationCompareProps {
  dest1: DestinationRecommendation;
  dest2: DestinationRecommendation;
  nationalities: string[];
  aspiration: string;
  currentCountry: string;
  onClose: () => void;
}

// Données statiques de comparaison (basées sur les données existantes)
const COMPARISON_DATA: Record<string, {
  costOfLiving: number; // 1-5, 1=cheap
  quality: number; // 1-5
  safety: number; // 1-5
  healthcare: number; // 1-5
  climate: string;
  language: string;
  timezone: string;
  vacationBest: string;
  installationTime: string;
}> = {
  france: { costOfLiving: 4, quality: 4, safety: 4, healthcare: 5, climate: 'Tempéré', language: 'Français', timezone: 'UTC+1', vacationBest: 'Mai-Sept', installationTime: '3-6 mois' },
  germany: { costOfLiving: 3, quality: 5, safety: 5, healthcare: 5, climate: 'Continental', language: 'Allemand', timezone: 'UTC+1', vacationBest: 'Juin-Sept', installationTime: '2-4 mois' },
  switzerland: { costOfLiving: 5, quality: 5, safety: 5, healthcare: 5, climate: 'Alpin', language: 'Multi', timezone: 'UTC+1', vacationBest: 'Juin-Sept', installationTime: '3-6 mois' },
  spain: { costOfLiving: 2, quality: 4, safety: 4, healthcare: 4, climate: 'Méditerranéen', language: 'Espagnol', timezone: 'UTC+1', vacationBest: 'Avril-Oct', installationTime: '2-3 mois' },
  portugal: { costOfLiving: 2, quality: 4, safety: 5, healthcare: 4, climate: 'Méditerranéen', language: 'Portugais', timezone: 'UTC', vacationBest: 'Mai-Oct', installationTime: '2-4 mois' },
  italy: { costOfLiving: 3, quality: 4, safety: 4, healthcare: 4, climate: 'Méditerranéen', language: 'Italien', timezone: 'UTC+1', vacationBest: 'Avril-Oct', installationTime: '3-6 mois' },
  netherlands: { costOfLiving: 4, quality: 5, safety: 5, healthcare: 5, climate: 'Océanique', language: 'Néerlandais', timezone: 'UTC+1', vacationBest: 'Mai-Sept', installationTime: '1-3 mois' },
  uk: { costOfLiving: 4, quality: 4, safety: 4, healthcare: 4, climate: 'Océanique', language: 'Anglais', timezone: 'UTC', vacationBest: 'Juin-Août', installationTime: '2-6 mois' },
  ireland: { costOfLiving: 4, quality: 4, safety: 5, healthcare: 4, climate: 'Océanique', language: 'Anglais', timezone: 'UTC', vacationBest: 'Juin-Août', installationTime: '1-3 mois' },
  usa: { costOfLiving: 4, quality: 4, safety: 3, healthcare: 3, climate: 'Varié', language: 'Anglais', timezone: 'Multi', vacationBest: 'Variable', installationTime: '6-12 mois' },
  canada: { costOfLiving: 3, quality: 5, safety: 5, healthcare: 4, climate: 'Continental', language: 'EN/FR', timezone: 'Multi', vacationBest: 'Juin-Sept', installationTime: '6-12 mois' },
  japan: { costOfLiving: 3, quality: 5, safety: 5, healthcare: 5, climate: 'Tempéré', language: 'Japonais', timezone: 'UTC+9', vacationBest: 'Mars-Mai, Oct-Nov', installationTime: '3-6 mois' },
  south_korea: { costOfLiving: 3, quality: 4, safety: 5, healthcare: 5, climate: 'Continental', language: 'Coréen', timezone: 'UTC+9', vacationBest: 'Avril-Mai, Sept-Oct', installationTime: '2-4 mois' },
  singapore: { costOfLiving: 5, quality: 5, safety: 5, healthcare: 5, climate: 'Tropical', language: 'Anglais', timezone: 'UTC+8', vacationBest: 'Fév-Avril', installationTime: '1-3 mois' },
  thailand: { costOfLiving: 1, quality: 3, safety: 3, healthcare: 3, climate: 'Tropical', language: 'Thaï', timezone: 'UTC+7', vacationBest: 'Nov-Fév', installationTime: '1-2 mois' },
  australia: { costOfLiving: 4, quality: 5, safety: 5, healthcare: 5, climate: 'Varié', language: 'Anglais', timezone: 'Multi', vacationBest: 'Sept-Nov', installationTime: '3-6 mois' },
  new_zealand: { costOfLiving: 3, quality: 5, safety: 5, healthcare: 4, climate: 'Tempéré', language: 'Anglais', timezone: 'UTC+12', vacationBest: 'Déc-Fév', installationTime: '2-4 mois' },
};

const DEFAULT_DATA = { costOfLiving: 3, quality: 3, safety: 3, healthcare: 3, climate: 'Variable', language: 'Local', timezone: 'Variable', vacationBest: 'Variable', installationTime: '3-6 mois' };

export function DestinationCompare({
  dest1,
  dest2,
  onClose,
}: DestinationCompareProps) {
  const [viewMode, setViewMode] = useState<'vacation' | 'installation'>('vacation');
  
  const data1 = COMPARISON_DATA[dest1.countryId] || DEFAULT_DATA;
  const data2 = COMPARISON_DATA[dest2.countryId] || DEFAULT_DATA;

  const renderBar = (value: number, isReverse: boolean = false) => {
    const percentage = (value / 5) * 100;
    const color = isReverse
      ? value <= 2 ? 'bg-emerald-500' : value >= 4 ? 'bg-orange-500' : 'bg-amber-500'
      : value >= 4 ? 'bg-emerald-500' : value <= 2 ? 'bg-orange-500' : 'bg-amber-500';
    
    return (
      <div className="h-2 bg-muted rounded-full overflow-hidden w-24">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  const renderComparison = (val1: number, val2: number, isReverse: boolean = false) => {
    const better = isReverse ? (val1 < val2 ? 1 : val1 > val2 ? 2 : 0) : (val1 > val2 ? 1 : val1 < val2 ? 2 : 0);
    return { better, icon1: better === 1 ? CheckCircle : better === 2 ? XCircle : Minus, icon2: better === 2 ? CheckCircle : better === 1 ? XCircle : Minus };
  };

  const metrics = viewMode === 'vacation' ? [
    { label: 'Coût du séjour', key: 'costOfLiving', reverse: true },
    { label: 'Sécurité', key: 'safety', reverse: false },
    { label: 'Qualité de vie', key: 'quality', reverse: false },
  ] : [
    { label: 'Coût de vie', key: 'costOfLiving', reverse: true },
    { label: 'Qualité de vie', key: 'quality', reverse: false },
    { label: 'Santé', key: 'healthcare', reverse: false },
    { label: 'Sécurité', key: 'safety', reverse: false },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Comparaison détaillée</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg w-fit mx-auto">
            <Button
              variant={viewMode === 'vacation' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('vacation')}
              className="gap-2"
            >
              <Palmtree className="w-4 h-4" />
              Pour des vacances
            </Button>
            <Button
              variant={viewMode === 'installation' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('installation')}
              className="gap-2"
            >
              <Building2 className="w-4 h-4" />
              Pour s'installer
            </Button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Country Headers */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div />
            <div className="text-center p-4 bg-primary/10 rounded-xl">
              <span className="text-4xl block mb-2">{dest1.flag}</span>
              <h3 className="font-bold">{dest1.countryName}</h3>
              <span className="text-sm text-primary">{dest1.score}% match</span>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-xl">
              <span className="text-4xl block mb-2">{dest2.flag}</span>
              <h3 className="font-bold">{dest2.countryName}</h3>
              <span className="text-sm text-primary">{dest2.score}% match</span>
            </div>
          </div>

          {/* Access Type */}
          <div className="grid grid-cols-3 gap-4 items-center py-3 border-b">
            <span className="text-sm font-medium text-muted-foreground">Accès visa</span>
            <div className="text-center">
              <span className={cn(
                "text-xs px-3 py-1 rounded-full",
                dest1.accessType === 'visa_free' && "bg-emerald-500/20 text-emerald-500",
                dest1.accessType === 'easy_visa' && "bg-green-500/20 text-green-500",
                dest1.accessType === 'work_visa' && "bg-amber-500/20 text-amber-500",
                dest1.accessType === 'requires_visa' && "bg-orange-500/20 text-orange-500",
              )}>
                {dest1.accessType === 'visa_free' && 'Sans visa'}
                {dest1.accessType === 'easy_visa' && 'Visa facile'}
                {dest1.accessType === 'work_visa' && 'Visa travail'}
                {dest1.accessType === 'requires_visa' && 'Visa requis'}
              </span>
            </div>
            <div className="text-center">
              <span className={cn(
                "text-xs px-3 py-1 rounded-full",
                dest2.accessType === 'visa_free' && "bg-emerald-500/20 text-emerald-500",
                dest2.accessType === 'easy_visa' && "bg-green-500/20 text-green-500",
                dest2.accessType === 'work_visa' && "bg-amber-500/20 text-amber-500",
                dest2.accessType === 'requires_visa' && "bg-orange-500/20 text-orange-500",
              )}>
                {dest2.accessType === 'visa_free' && 'Sans visa'}
                {dest2.accessType === 'easy_visa' && 'Visa facile'}
                {dest2.accessType === 'work_visa' && 'Visa travail'}
                {dest2.accessType === 'requires_visa' && 'Visa requis'}
              </span>
            </div>
          </div>

          {/* Metrics */}
          {metrics.map(({ label, key, reverse }) => {
            const val1 = data1[key as keyof typeof data1] as number;
            const val2 = data2[key as keyof typeof data2] as number;
            const { better, icon1: Icon1, icon2: Icon2 } = renderComparison(val1, val2, reverse);
            
            return (
              <div key={key} className="grid grid-cols-3 gap-4 items-center py-3 border-b">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className="flex items-center justify-center gap-2">
                  {renderBar(val1, reverse)}
                  <Icon1 className={cn('w-4 h-4', better === 1 ? 'text-emerald-500' : better === 2 ? 'text-orange-500' : 'text-muted-foreground')} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  {renderBar(val2, reverse)}
                  <Icon2 className={cn('w-4 h-4', better === 2 ? 'text-emerald-500' : better === 1 ? 'text-orange-500' : 'text-muted-foreground')} />
                </div>
              </div>
            );
          })}

          {/* Text Comparisons */}
          <div className="grid grid-cols-3 gap-4 items-center py-3 border-b">
            <span className="text-sm font-medium text-muted-foreground">Climat</span>
            <div className="text-center text-sm">{data1.climate}</div>
            <div className="text-center text-sm">{data2.climate}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center py-3 border-b">
            <span className="text-sm font-medium text-muted-foreground">Langue</span>
            <div className="text-center text-sm">{data1.language}</div>
            <div className="text-center text-sm">{data2.language}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center py-3 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              {viewMode === 'vacation' ? 'Meilleure période' : 'Délai installation'}
            </span>
            <div className="text-center text-sm">{viewMode === 'vacation' ? data1.vacationBest : data1.installationTime}</div>
            <div className="text-center text-sm">{viewMode === 'vacation' ? data2.vacationBest : data2.installationTime}</div>
          </div>

          {/* Matched Advantages */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <span className="text-sm font-medium text-muted-foreground">Avantages nationalité</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {dest1.matchedAdvantages.slice(0, 3).map((adv, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">{adv}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {dest2.matchedAdvantages.slice(0, 3).map((adv, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">{adv}</span>
              ))}
            </div>
          </div>

          {/* Precautions for vacation mode */}
          {viewMode === 'vacation' && (
            <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <h4 className="font-semibold text-amber-500 mb-2">⚠️ Précautions générales</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Vérifiez les exigences de visa actuelles sur le site officiel</li>
                <li>• Consultez les conseils aux voyageurs de votre ministère des affaires étrangères</li>
                <li>• Souscrivez une assurance voyage adaptée</li>
                <li>• Gardez copies de vos documents importants</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
