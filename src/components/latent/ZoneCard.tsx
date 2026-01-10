import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Moon, 
  Sunrise, 
  Wind, 
  Lock,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Leaf,
  Shield,
  AlertTriangle,
  MoreVertical,
  Archive,
  Pause,
  GitMerge,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LatentZone, ZoneStatus, TensionType } from '@/hooks/useLatentZones';

interface ZoneCardProps {
  zone: LatentZone;
  onStatusChange: (zoneId: string, status: ZoneStatus) => void;
  onAddTension: (zoneId: string, type: TensionType, content: string) => void;
  onRemoveTension: (tensionId: string, zoneId: string) => void;
  onEvolve: (zoneId: string, action: 'archived' | 'put_to_sleep' | 'transformed' | 'merged') => void;
  onDelete: (zoneId: string) => void;
}

const STATUS_CONFIG: Record<ZoneStatus, { icon: typeof Moon; color: string; bgColor: string }> = {
  dormant: { icon: Moon, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  emergent: { icon: Sunrise, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  fragile: { icon: Wind, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  blocked: { icon: Lock, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950' }
};

const TENSION_CONFIG: Record<TensionType, { icon: typeof Sparkles; color: string; label: string }> = {
  nourishing: { icon: Sparkles, color: 'text-green-600', label: 'latent.tension.nourishing' },
  blocking: { icon: Shield, color: 'text-red-600', label: 'latent.tension.blocking' },
  fragility: { icon: Leaf, color: 'text-amber-600', label: 'latent.tension.fragility' },
  premature_crushing: { icon: AlertTriangle, color: 'text-purple-600', label: 'latent.tension.prematureCrushing' }
};

export function ZoneCard({
  zone,
  onStatusChange,
  onAddTension,
  onRemoveTension,
  onEvolve,
  onDelete
}: ZoneCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTensionType, setNewTensionType] = useState<TensionType>('nourishing');
  const [newTensionContent, setNewTensionContent] = useState('');
  const [isAddingTension, setIsAddingTension] = useState(false);

  const StatusIcon = STATUS_CONFIG[zone.status].icon;
  const statusColor = STATUS_CONFIG[zone.status].color;
  const statusBgColor = STATUS_CONFIG[zone.status].bgColor;

  const handleAddTension = () => {
    if (newTensionContent.trim()) {
      onAddTension(zone.id, newTensionType, newTensionContent.trim());
      setNewTensionContent('');
      setIsAddingTension(false);
    }
  };

  const groupedTensions = (zone.tensions || []).reduce((acc, tension) => {
    if (!acc[tension.tension_type]) acc[tension.tension_type] = [];
    acc[tension.tension_type].push(tension);
    return acc;
  }, {} as Record<TensionType, typeof zone.tensions>);

  return (
    <Card className={`transition-all duration-300 hover:shadow-md border-l-4 ${
      zone.status === 'dormant' ? 'border-l-slate-400' :
      zone.status === 'emergent' ? 'border-l-amber-400' :
      zone.status === 'fragile' ? 'border-l-blue-400' :
      'border-l-red-400'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-medium leading-tight mb-2">
              {zone.title}
            </CardTitle>
            {zone.description && (
              <p className="text-sm text-muted-foreground italic line-clamp-2">
                {zone.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge 
              variant="outline" 
              className={`${statusBgColor} ${statusColor} border-0 gap-1`}
            >
              <StatusIcon className="w-3 h-3" />
              {t(`latent.status.${zone.status}`)}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEvolve(zone.id, 'transformed')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('latent.actions.transform')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEvolve(zone.id, 'merged')}>
                  <GitMerge className="w-4 h-4 mr-2" />
                  {t('latent.actions.merge')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEvolve(zone.id, 'put_to_sleep')}>
                  <Pause className="w-4 h-4 mr-2" />
                  {t('latent.actions.sleep')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEvolve(zone.id, 'archived')}>
                  <Archive className="w-4 h-4 mr-2" />
                  {t('latent.actions.archive')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(zone.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status Selector */}
        <div className="mb-4">
          <Select 
            value={zone.status} 
            onValueChange={(value) => onStatusChange(zone.id, value as ZoneStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      {t(`latent.status.${status}`)}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Tensions Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-2 h-8">
              <span className="text-sm text-muted-foreground">
                {t('latent.tensions.title')} ({(zone.tensions || []).length})
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 pt-2">
            {/* Grouped Tensions */}
            {Object.entries(groupedTensions).map(([type, tensions]) => {
              const config = TENSION_CONFIG[type as TensionType];
              const Icon = config.icon;
              return (
                <div key={type} className="space-y-1">
                  <div className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    {t(config.label)}
                  </div>
                  <div className="space-y-1 pl-4">
                    {tensions?.map(tension => (
                      <div 
                        key={tension.id} 
                        className="flex items-start justify-between gap-2 text-sm py-1 px-2 rounded bg-muted/50"
                      >
                        <span className="flex-1">{tension.content}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 shrink-0"
                          onClick={() => onRemoveTension(tension.id, zone.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add Tension Form */}
            {isAddingTension ? (
              <div className="space-y-2 pt-2 border-t">
                <Select 
                  value={newTensionType} 
                  onValueChange={(v) => setNewTensionType(v as TensionType)}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TENSION_CONFIG).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            {t(config.label)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    value={newTensionContent}
                    onChange={(e) => setNewTensionContent(e.target.value)}
                    placeholder={t('latent.tensions.placeholder')}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTension()}
                  />
                  <Button size="sm" onClick={handleAddTension} className="h-8">
                    {t('common.save')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsAddingTension(false)}
                    className="h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8 text-xs"
                onClick={() => setIsAddingTension(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('latent.tensions.add')}
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
          {t('latent.updated')}: {new Date(zone.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
