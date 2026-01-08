import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FamilyStatus, FAMILY_STATUS_LABELS, getFamilyConstraints } from '@/lib/family-system';
import { Home, Users, Heart, Baby, GraduationCap, Hospital, Globe, Sandwich, Sparkles } from 'lucide-react';

interface FamilyStatusSelectorProps {
  selectedStatus: FamilyStatus;
  onSelect: (status: FamilyStatus) => void;
}

const FAMILY_STATUS_OPTIONS: { status: FamilyStatus; icon: React.ReactNode }[] = [
  { status: 'single', icon: <Sparkles className="w-5 h-5" /> },
  { status: 'in_relationship', icon: <Heart className="w-5 h-5" /> },
  { status: 'married', icon: <Users className="w-5 h-5" /> },
  { status: 'parent_young', icon: <Baby className="w-5 h-5" /> },
  { status: 'parent_school', icon: <GraduationCap className="w-5 h-5" /> },
  { status: 'parent_adult', icon: <Home className="w-5 h-5" /> },
  { status: 'caregiver', icon: <Hospital className="w-5 h-5" /> },
  { status: 'sandwich', icon: <Sandwich className="w-5 h-5" /> },
  { status: 'diaspora', icon: <Globe className="w-5 h-5" /> },
];

export default function FamilyStatusSelector({ selectedStatus, onSelect }: FamilyStatusSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">{t('familyStatus.selectorTitle', 'Situation Familiale')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('familyStatus.selectorDescription', 'Votre situation familiale impacte votre mobilité et vos ressources')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {FAMILY_STATUS_OPTIONS.map(({ status, icon }) => {
          const label = FAMILY_STATUS_LABELS[status];
          const constraints = getFamilyConstraints(status);
          const mobilityPenalty = constraints.reduce((sum, c) => sum + c.mobilityPenalty, 0);
          const isSelected = selectedStatus === status;
          
          return (
            <button
              key={status}
              onClick={() => onSelect(status)}
              className={cn(
                "glass-card rounded-xl p-3 text-left transition-all duration-300",
                isSelected
                  ? "ring-2 ring-primary border-primary scale-[1.02]"
                  : "hover:border-primary/50 hover:scale-[1.01]"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{label?.icon}</span>
                <div className={cn(
                  "p-1.5 rounded-lg",
                  isSelected ? "bg-primary/20" : "bg-muted/50"
                )}>
                  {icon}
                </div>
              </div>
              <h4 className="font-medium text-sm mb-1">
                {t(label?.label || status, status)}
              </h4>
              <div className="flex items-center gap-2 text-xs">
                {mobilityPenalty > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded",
                    mobilityPenalty >= 4 ? "bg-rose-500/20 text-rose-400" :
                    mobilityPenalty >= 2 ? "bg-amber-500/20 text-amber-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  )}>
                    📍 -{mobilityPenalty}
                  </span>
                )}
                {status === 'single' && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    ✈️ Max
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected status details */}
      {selectedStatus && (
        <div className="glass-card rounded-xl p-4 mt-4 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{FAMILY_STATUS_LABELS[selectedStatus]?.icon}</span>
            <h4 className="font-semibold">{t(FAMILY_STATUS_LABELS[selectedStatus]?.label || '', selectedStatus)}</h4>
          </div>
          
          {getFamilyConstraints(selectedStatus).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('familyStatus.constraints', 'Contraintes:')}</p>
              {getFamilyConstraints(selectedStatus).map(constraint => (
                <div key={constraint.id} className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg p-2">
                  <span>{constraint.icon}</span>
                  <span>{t(constraint.label, constraint.id)}</span>
                  <span className="ml-auto text-rose-400">📍 -{constraint.mobilityPenalty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
