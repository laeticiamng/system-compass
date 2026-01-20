import { useTranslation } from 'react-i18next';
import { Briefcase, Plane, GraduationCap, Palmtree, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';

interface IntentionStepProps {
  intention: ProjectIntention | undefined;
  onIntentionChange: (intention: ProjectIntention) => void;
  age?: number;
  onAgeChange: (age: number) => void;
}

const INTENTIONS: { value: ProjectIntention; icon: React.ReactNode; labelKey: string; descKey: string; color: string }[] = [
  { 
    value: 'installation', 
    icon: <Briefcase className="w-8 h-8" />, 
    labelKey: 'exitKeys.intention.installation', 
    descKey: 'exitKeys.intention.installationDesc',
    color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
  },
  { 
    value: 'vacation', 
    icon: <Plane className="w-8 h-8" />, 
    labelKey: 'exitKeys.intention.vacation', 
    descKey: 'exitKeys.intention.vacationDesc',
    color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
  },
  { 
    value: 'internship', 
    icon: <GraduationCap className="w-8 h-8" />, 
    labelKey: 'exitKeys.intention.internship', 
    descKey: 'exitKeys.intention.internshipDesc',
    color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
  },
  { 
    value: 'retirement', 
    icon: <Palmtree className="w-8 h-8" />, 
    labelKey: 'exitKeys.intention.retirement', 
    descKey: 'exitKeys.intention.retirementDesc',
    color: 'from-rose-500/20 to-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
  },
  { 
    value: 'digital_nomad', 
    icon: <Laptop className="w-8 h-8" />, 
    labelKey: 'exitKeys.intention.digitalNomad', 
    descKey: 'exitKeys.intention.digitalNomadDesc',
    color: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50'
  },
];

export function IntentionStep({ intention, onIntentionChange, age, onAgeChange }: IntentionStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
          <Briefcase className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t('exitKeys.intention.title', 'Quel est votre projet ?')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('exitKeys.intention.subtitle', 'Votre intention détermine les destinations et stratégies recommandées')}
        </p>
      </div>

      {/* Age input */}
      <div className="max-w-xs mx-auto">
        <label className="block text-sm font-medium mb-2 text-center">
          {t('exitKeys.intention.yourAge', 'Votre âge')}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={18}
            max={80}
            value={age || 30}
            onChange={(e) => onAgeChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-2xl font-bold w-16 text-center">{age || 30}</span>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {t('exitKeys.intention.ageExplain', "L'âge influence les opportunités et démarches disponibles")}
        </p>
      </div>

      {/* Intention cards */}
      <div className="grid gap-4">
        {INTENTIONS.map((item) => {
          const isSelected = intention === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onIntentionChange(item.value)}
              className={cn(
                "relative p-6 rounded-2xl border-2 text-left transition-all duration-300",
                "bg-gradient-to-br",
                item.color,
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50"
                )}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {t(item.labelKey, item.value)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(item.descKey, '')}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
