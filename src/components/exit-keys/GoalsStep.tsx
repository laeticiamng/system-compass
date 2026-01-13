import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import { LIFE_MOTOR_PROFILES, type LifeMotorProfile, type LifePriority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GoalsStepProps {
  desiredLife: LifePriority;
  onDesiredLifeChange: (priority: LifePriority) => void;
  birthCountryName?: string;
  currentCountryName?: string;
  motorProfile: LifeMotorProfile;
}

const priorityOptions: { value: LifePriority; labelKey: string; icon: string }[] = [
  { value: 'freedom', labelKey: 'exitKeys.priorities.freedom', icon: '🦅' },
  { value: 'money', labelKey: 'exitKeys.priorities.money', icon: '💰' },
  { value: 'meaning', labelKey: 'exitKeys.priorities.meaning', icon: '💫' },
  { value: 'status', labelKey: 'exitKeys.priorities.status', icon: '👔' },
  { value: 'family', labelKey: 'exitKeys.priorities.family', icon: '👨‍👩‍👧' },
  { value: 'calm', labelKey: 'exitKeys.priorities.calm', icon: '🧘' },
];

export function GoalsStep({
  desiredLife,
  onDesiredLifeChange,
  birthCountryName,
  currentCountryName,
  motorProfile,
}: GoalsStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('exitKeys.goals.title', 'Que recherchez-vous ?')}</h2>
        <p className="text-muted-foreground">
          {t('exitKeys.goals.subtitle', 'Votre priorité de vie oriente la destination idéale')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {priorityOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onDesiredLifeChange(option.value)}
            className={cn(
              "p-6 rounded-xl border text-center transition-all",
              desiredLife === option.value 
                ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-4xl block mb-2">{option.icon}</span>
            <span className="font-medium">{t(option.labelKey)}</span>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6 mt-8">
        <h3 className="font-semibold mb-4">{t('exitKeys.goals.summary', 'Résumé de votre profil')}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('exitKeys.goals.origin', 'Origine')}:</span>
            <span className="ml-2 font-medium">{birthCountryName || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('exitKeys.goals.current', 'Actuel')}:</span>
            <span className="ml-2 font-medium">{currentCountryName || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('exitKeys.goals.profile', 'Profil')}:</span>
            <span className="ml-2 font-medium">{LIFE_MOTOR_PROFILES[motorProfile].icon}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('exitKeys.goals.priority', 'Priorité')}:</span>
            <span className="ml-2 font-medium">
              {priorityOptions.find(p => p.value === desiredLife)?.icon}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}