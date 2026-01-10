import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Shield,
  Clock,
  Building,
  FileText,
  Users,
  Stamp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  IrreversaThreshold, 
  ThresholdStatus,
  ThresholdDomain 
} from '@/hooks/useIrreversa';
import { ThresholdDetailDialog } from './ThresholdDetailDialog';

interface ThresholdCardProps {
  threshold: IrreversaThreshold;
  onMark: (id: string) => void;
  onValidate: (id: string) => void;
  onSeal: (id: string) => void;
}

const STATUS_CONFIG: Record<ThresholdStatus, { 
  icon: typeof Lock; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  detected: { 
    icon: Eye, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    label: 'irreversa.status.detected'
  },
  marked: { 
    icon: AlertTriangle, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    label: 'irreversa.status.marked'
  },
  validated: { 
    icon: CheckCircle2, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    label: 'irreversa.status.validated'
  },
  sealed: { 
    icon: Lock, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-950',
    label: 'irreversa.status.sealed'
  }
};

const DOMAIN_CONFIG: Record<ThresholdDomain, { icon: typeof Shield; color: string }> = {
  strategic: { icon: Shield, color: 'text-purple-600' },
  financial: { icon: Building, color: 'text-green-600' },
  organizational: { icon: Users, color: 'text-blue-600' },
  legal: { icon: FileText, color: 'text-amber-600' },
  ethical: { icon: AlertTriangle, color: 'text-red-600' }
};

export function ThresholdCard({ threshold, onMark, onValidate, onSeal }: ThresholdCardProps) {
  const { t } = useTranslation();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const statusConfig = STATUS_CONFIG[threshold.status];
  const StatusIcon = statusConfig.icon;
  const domainConfig = DOMAIN_CONFIG[threshold.domain];
  const DomainIcon = domainConfig.icon;

  const getNextAction = () => {
    switch (threshold.status) {
      case 'detected':
        return { label: t('irreversa.actions.mark'), action: () => onMark(threshold.id) };
      case 'marked':
        return { label: t('irreversa.actions.validate'), action: () => onValidate(threshold.id) };
      case 'validated':
        return { label: t('irreversa.actions.seal'), action: () => onSeal(threshold.id) };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <>
      <Card className={`transition-all duration-300 border-l-4 ${
        threshold.status === 'sealed' 
          ? 'border-l-red-500 opacity-90' 
          : threshold.status === 'validated'
          ? 'border-l-blue-500'
          : threshold.status === 'marked'
          ? 'border-l-orange-500'
          : 'border-l-amber-500'
      } ${threshold.status === 'sealed' ? 'bg-muted/30' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`${statusConfig.bgColor} ${statusConfig.color} border-0 gap-1`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {t(statusConfig.label)}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <DomainIcon className={`w-3 h-3 ${domainConfig.color}`} />
                  {t(`irreversa.domain.${threshold.domain}`)}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold leading-tight">
                {threshold.title}
              </CardTitle>
              {threshold.organization_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Building className="w-3 h-3 inline mr-1" />
                  {threshold.organization_name}
                </p>
              )}
            </div>
            
            {threshold.status === 'sealed' && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {threshold.context}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(threshold.detection_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Stamp className="w-3 h-3" />
              {threshold.validated_by}
            </span>
          </div>

          {threshold.status === 'sealed' && threshold.sealed_at && (
            <div className="p-2 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {t('irreversa.sealed.notice')} {new Date(threshold.sealed_at).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setIsDetailOpen(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {t('irreversa.actions.view')}
            </Button>
            
            {nextAction && (
              <Button 
                size="sm" 
                className={`flex-1 ${
                  threshold.status === 'validated' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : ''
                }`}
                onClick={nextAction.action}
              >
                {nextAction.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ThresholdDetailDialog
        threshold={threshold}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
