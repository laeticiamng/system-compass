import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Moon, 
  Plus, 
  Lock, 
  Info,
  Loader2,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLatentZones, ZoneStatus, TensionType, HistoryAction } from '@/hooks/useLatentZones';
import { useSubscription } from '@/hooks/useSubscription';
import { ZoneCard } from './ZoneCard';
import { CreateZoneForm } from './CreateZoneForm';
import { LatentOnboarding } from './LatentOnboarding';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { toast } from 'sonner';

export function Latent() {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const { 
    zones, 
    loading, 
    isLoggedIn,
    createZone,
    updateZoneStatus,
    addTension,
    removeTension,
    evolveZone,
    deleteZone
  } = useLatentZones();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ZoneStatus | 'all'>('all');

  const handleCreateZone = async (title: string, description?: string) => {
    setIsCreatingZone(true);
    const zone = await createZone(title, description);
    setIsCreatingZone(false);
    if (zone) {
      setIsCreating(false);
      toast.success(t('latent.toast.created'));
    }
  };

  const handleStatusChange = async (zoneId: string, status: ZoneStatus) => {
    const success = await updateZoneStatus(zoneId, status);
    if (success) {
      toast.success(t('latent.toast.statusUpdated'));
    }
  };

  const handleAddTension = async (zoneId: string, type: TensionType, content: string) => {
    const tension = await addTension(zoneId, type, content);
    if (tension) {
      toast.success(t('latent.toast.tensionAdded'));
    }
  };

  const handleRemoveTension = async (tensionId: string, zoneId: string) => {
    await removeTension(tensionId, zoneId);
  };

  const handleEvolve = async (zoneId: string, action: HistoryAction) => {
    const success = await evolveZone(zoneId, action);
    if (success) {
      toast.success(t(`latent.toast.${action}`));
    }
  };

  const handleDelete = async (zoneId: string) => {
    const success = await deleteZone(zoneId);
    if (success) {
      toast.success(t('latent.toast.deleted'));
    }
  };

  const filteredZones = statusFilter === 'all' 
    ? zones 
    : zones.filter(z => z.status === statusFilter);

  const zoneCounts = {
    all: zones.length,
    dormant: zones.filter(z => z.status === 'dormant').length,
    emergent: zones.filter(z => z.status === 'emergent').length,
    fragile: zones.filter(z => z.status === 'fragile').length,
    blocked: zones.filter(z => z.status === 'blocked').length
  };

  if (!canAccessPro) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-slate-500/20 to-purple-500/20 border-slate-500/30">
            <Moon className="w-3.5 h-3.5 mr-2" />
            LATENT
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {t('latent.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('latent.subtitle')}
          </p>
        </div>

        <PremiumPaywall 
          tier="pro"
          title={t('latent.paywall.title')}
          description={t('latent.paywall.description')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="px-3 py-1 bg-gradient-to-r from-slate-500/20 to-purple-500/20 border-slate-500/30">
              <Moon className="w-3.5 h-3.5 mr-2" />
              LATENT
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-700">
              <Lock className="w-3 h-3 mr-1" />
              B2B
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold">
            {t('latent.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('latent.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsCreating(true)} 
            className="gap-2" 
            disabled={!isLoggedIn}
          >
            <Plus className="w-4 h-4" />
            {t('latent.newZone')}
          </Button>
        </div>
      </div>

      {/* Login notice */}
      {!isLoggedIn && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
          <p className="text-sm text-amber-700">
            {t('latent.demoMode')}
          </p>
        </div>
      )}

      <Separator />

      <Tabs defaultValue="zones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="zones" className="gap-2">
            <Moon className="w-4 h-4" />
            {t('latent.tabs.zones')}
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <Info className="w-4 h-4" />
            {t('latent.tabs.philosophy')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as ZoneStatus | 'all')}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('latent.filter.all')} ({zoneCounts.all})
                </SelectItem>
                <SelectItem value="dormant">
                  {t('latent.status.dormant')} ({zoneCounts.dormant})
                </SelectItem>
                <SelectItem value="emergent">
                  {t('latent.status.emergent')} ({zoneCounts.emergent})
                </SelectItem>
                <SelectItem value="fragile">
                  {t('latent.status.fragile')} ({zoneCounts.fragile})
                </SelectItem>
                <SelectItem value="blocked">
                  {t('latent.status.blocked')} ({zoneCounts.blocked})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Form */}
          {isCreating && (
            <CreateZoneForm
              onSubmit={handleCreateZone}
              onCancel={() => setIsCreating(false)}
              isLoading={isCreatingZone}
            />
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Zones Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredZones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onStatusChange={handleStatusChange}
                  onAddTension={handleAddTension}
                  onRemoveTension={handleRemoveTension}
                  onEvolve={handleEvolve}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredZones.length === 0 && !isCreating && (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Moon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">{t('latent.empty.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('latent.empty.description')}
              </p>
              <Button onClick={() => setIsCreating(true)} disabled={!isLoggedIn}>
                <Plus className="w-4 h-4 mr-2" />
                {t('latent.empty.cta')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="onboarding">
          <LatentOnboarding />
        </TabsContent>
      </Tabs>
    </div>
  );
}
