import { useTranslation } from 'react-i18next';
import { 
  Moon, 
  Sunrise, 
  Wind, 
  Lock,
  Calendar,
  Sparkles,
  Shield,
  Leaf,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LatentZone, ZoneStatus, TensionType } from '@/hooks/useLatentZones';

interface ZoneDetailDialogProps {
  zone: LatentZone | null;
  isOpen: boolean;
  onClose: () => void;
}

type ZoneTension = NonNullable<LatentZone['tensions']>[number];

const STATUS_CONFIG: Record<ZoneStatus, { icon: typeof Moon; color: string; bgColor: string }> = {
  dormant: { icon: Moon, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  emergent: { icon: Sunrise, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  fragile: { icon: Wind, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  blocked: { icon: Lock, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950' }
};

const TENSION_CONFIG: Record<TensionType, { icon: typeof Sparkles; color: string }> = {
  nourishing: { icon: Sparkles, color: 'text-green-600' },
  blocking: { icon: Shield, color: 'text-red-600' },
  fragility: { icon: Leaf, color: 'text-amber-600' },
  premature_crushing: { icon: AlertTriangle, color: 'text-purple-600' }
};

export function ZoneDetailDialog({ zone, isOpen, onClose }: ZoneDetailDialogProps) {
  const { t } = useTranslation();

  if (!zone) return null;

  const StatusIcon = STATUS_CONFIG[zone.status].icon;
  const statusColor = STATUS_CONFIG[zone.status].color;
  const statusBgColor = STATUS_CONFIG[zone.status].bgColor;

  const groupedTensions = (zone.tensions ?? []).reduce<Record<TensionType, ZoneTension[]>>((acc, tension) => {
    if (!acc[tension.tension_type]) acc[tension.tension_type] = [];
    acc[tension.tension_type].push(tension);
    return acc;
  }, {} as Record<TensionType, ZoneTension[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {zone.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${statusBgColor} ${statusColor} border-0 gap-1`}
            >
              <StatusIcon className="w-3 h-3" />
              {t(`latent.status.${zone.status}`)}
            </Badge>
          </div>

          {/* Description */}
          {zone.description && (
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm italic text-muted-foreground">
                {zone.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('latent.detail.createdAt')}</p>
                <p className="font-medium">{new Date(zone.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('latent.detail.updatedAt')}</p>
                <p className="font-medium">{new Date(zone.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tensions */}
          <div>
            <h4 className="font-medium mb-3">
              {t('latent.tensions.title')} ({zone.tensions?.length || 0})
            </h4>
            
            {Object.entries(groupedTensions).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedTensions).map(([type, tensions]) => {
                  const config = TENSION_CONFIG[type as TensionType];
                  const Icon = config.icon;
                  return (
                    <div key={type}>
                      <div className={`flex items-center gap-1 text-xs font-medium mb-2 ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {t(`latent.tension.${type === 'premature_crushing' ? 'prematureCrushing' : type}`)}
                        <span className="text-muted-foreground">({tensions?.length})</span>
                      </div>
                      <ul className="space-y-1 pl-4">
                        {tensions?.map(tension => (
                          <li key={tension.id} className="text-sm p-2 rounded bg-muted/50">
                            {tension.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('latent.merge.noTensions')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
