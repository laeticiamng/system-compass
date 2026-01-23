import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Moon, 
  Plus, 
  Lock, 
  Info,
  Loader2,
  Filter,
  GitMerge,
  Link2,
  History,
  Search,
  ArrowUpDown,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLatentZones, ZoneStatus, TensionType, HistoryAction, LatentZone } from '@/hooks/useLatentZones';
import { useSubscription } from '@/hooks/useSubscription';
import { ZoneCard } from './ZoneCard';
import { CreateZoneForm } from './CreateZoneForm';
import { LatentOnboarding } from './LatentOnboarding';
import { ZoneInterconnections } from './ZoneInterconnections';
import { ZoneMergeDialog } from './ZoneMergeDialog';
import { ZoneHistoryTimeline } from './ZoneHistoryTimeline';
import { ZoneStatsBar } from './ZoneStatsBar';
import { WeakSignalsDetector } from './WeakSignalsDetector';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { toast } from 'sonner';

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'tensions';

export function Latent() {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const { 
    zones, 
    loading, 
    isLoggedIn,
    createZone,
    updateZone,
    updateZoneStatus,
    addTension,
    removeTension,
    evolveZone,
    deleteZone,
    duplicateZone,
    mergeZones
  } = useLatentZones();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ZoneStatus | 'all'>('all');
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [selectedZoneForHistory, setSelectedZoneForHistory] = useState<LatentZone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

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

  const handleDelete = async (zoneId: string): Promise<boolean> => {
    const success = await deleteZone(zoneId);
    if (success) {
      toast.success(t('latent.toast.deleted'));
    }
    return success;
  };

  const handleMerge = async (
    sourceZoneIds: string[], 
    newTitle: string, 
    newDescription: string, 
    tensionsToKeep: string[]
  ) => {
    const result = await mergeZones(sourceZoneIds, newTitle, newDescription, tensionsToKeep);
    return result !== null;
  };

  const handleEdit = async (zoneId: string, title: string, description?: string): Promise<boolean> => {
    const success = await updateZone(zoneId, title, description);
    if (success) {
      toast.success(t('latent.edit.success'));
    }
    return success;
  };

  const handleDuplicate = async (zoneId: string) => {
    const result = await duplicateZone(zoneId);
    if (result) {
      toast.success(t('latent.duplicate.success'));
    }
  };

  const handleSelectZoneForHistory = (zone: LatentZone) => {
    setSelectedZoneForHistory(zone);
  };

  // Filtered and sorted zones
  const filteredAndSortedZones = useMemo(() => {
    let result = zones;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(z => z.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(z => 
        z.title.toLowerCase().includes(query) ||
        (z.description?.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        return [...result].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      case 'oldest':
        return [...result].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
      case 'alphabetical':
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      case 'tensions':
        return [...result].sort((a, b) => (b.tensions?.length || 0) - (a.tensions?.length || 0));
      default:
        return result;
    }
  }, [zones, statusFilter, searchQuery, sortOption]);

  const zoneCounts = {
    all: zones.length,
    dormant: zones.filter(z => z.status === 'dormant').length,
    emergent: zones.filter(z => z.status === 'emergent').length,
    fragile: zones.filter(z => z.status === 'fragile').length,
    blocked: zones.filter(z => z.status === 'blocked').length
  };

  // Demo zones for preview mode
  const demoZones = [
    {
      id: 'demo-1',
      title: t('latent.demo.zone1.title', 'Tensions familiales non-dites'),
      description: t('latent.demo.zone1.desc', 'Désaccords latents sur les priorités de vie'),
      status: 'emergent' as ZoneStatus,
      tensions: [
        { id: 't1', content: 'Différences de vision sur l\'éducation des enfants', tension_type: 'relational' as TensionType, zone_id: 'demo-1', created_at: new Date().toISOString() },
        { id: 't2', content: 'Attentes implicites sur les finances', tension_type: 'financial' as TensionType, zone_id: 'demo-1', created_at: new Date().toISOString() },
      ],
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      title: t('latent.demo.zone2.title', 'Repositionnement professionnel'),
      description: t('latent.demo.zone2.desc', 'Envie de changement mais contraintes financières'),
      status: 'fragile' as ZoneStatus,
      tensions: [
        { id: 't3', content: 'Perte de sens au travail actuel', tension_type: 'existential' as TensionType, zone_id: 'demo-2', created_at: new Date().toISOString() },
      ],
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      title: t('latent.demo.zone3.title', 'Relation avec le pays d\'origine'),
      description: t('latent.demo.zone3.desc', 'Attentes familiales vs choix de vie'),
      status: 'dormant' as ZoneStatus,
      tensions: [],
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

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

        {/* Preview Mode Banner */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-slate-500/10 border border-purple-500/20 text-center">
          <Badge variant="outline" className="mb-2">
            <Eye className="w-3 h-3 mr-1" />
            {t('common.previewMode', 'Mode aperçu')}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {t('latent.preview.description', 'Découvrez le module Latent avec des exemples. Passez à Pro pour créer vos propres zones.')}
          </p>
        </div>

        {/* Demo Zones Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoZones.map(zone => (
            <Card key={zone.id} className="relative overflow-hidden opacity-80">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    zone.status === 'dormant' && "border-slate-500/30 text-slate-500",
                    zone.status === 'emergent' && "border-amber-500/30 text-amber-500",
                    zone.status === 'fragile' && "border-red-500/30 text-red-500"
                  )}>
                    {t(`latent.status.${zone.status}`)}
                  </Badge>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{zone.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {zone.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{zone.tensions.length} tensions</span>
                </div>
              </CardContent>
            </Card>
          ))}
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
          {zones.length >= 2 && (
            <Button 
              variant="outline"
              onClick={() => setIsMergeOpen(true)} 
              className="gap-2" 
              disabled={!isLoggedIn}
            >
              <GitMerge className="w-4 h-4" />
              {t('latent.merge.button', 'Fusionner')}
            </Button>
          )}
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

      {/* Merge Dialog */}
      <ZoneMergeDialog
        zones={zones}
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        onMerge={handleMerge}
      />

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
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="zones" className="gap-2">
            <Moon className="w-4 h-4" />
            {t('latent.tabs.zones')}
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-2">
            <Link2 className="w-4 h-4" />
            {t('latent.tabs.graph', 'Graphe')}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            {t('latent.tabs.history', 'Historique')}
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <Info className="w-4 h-4" />
            {t('latent.tabs.philosophy')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          {/* Stats Bar */}
          <ZoneStatsBar zones={zones} />

          {/* Weak Signals Detector - shows patterns across zones */}
          {zones.length >= 2 && (
            <WeakSignalsDetector 
              zones={zones} 
              onZoneClick={(zoneId) => {
                const zone = zones.find(z => z.id === zoneId);
                if (zone) handleSelectZoneForHistory(zone);
              }}
            />
          )}

          {/* Search, Filter, Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('latent.search.placeholder')}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select 
                value={statusFilter} 
                onValueChange={(v) => setStatusFilter(v as ZoneStatus | 'all')}
              >
                <SelectTrigger className="w-40">
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

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select 
                value={sortOption} 
                onValueChange={(v) => setSortOption(v as SortOption)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('latent.sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('latent.sort.oldest')}</SelectItem>
                  <SelectItem value="alphabetical">{t('latent.sort.alphabetical')}</SelectItem>
                  <SelectItem value="tensions">{t('latent.sort.tensions')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {filteredAndSortedZones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onStatusChange={handleStatusChange}
                  onAddTension={handleAddTension}
                  onRemoveTension={handleRemoveTension}
                  onEvolve={handleEvolve}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAndSortedZones.length === 0 && !isCreating && (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Moon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">
                {searchQuery ? t('latent.search.noResults') : t('latent.empty.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {!searchQuery && t('latent.empty.description')}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreating(true)} disabled={!isLoggedIn}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('latent.empty.cta')}
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graph">
          <ZoneInterconnections 
            zones={zones} 
            onSelectZone={handleSelectZoneForHistory}
          />
        </TabsContent>

        <TabsContent value="history">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <Select 
                  value={selectedZoneForHistory?.id || ''} 
                  onValueChange={(v) => {
                    const zone = zones.find(z => z.id === v);
                    setSelectedZoneForHistory(zone || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('latent.history.selectZone', 'Sélectionner une zone')} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zone cards list for quick selection */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {zones.map(zone => (
                  <div 
                    key={zone.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedZoneForHistory?.id === zone.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedZoneForHistory(zone)}
                  >
                    <p className="font-medium text-sm">{zone.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {t(`latent.status.${zone.status}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(zone.tensions?.length || 0)} tensions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {selectedZoneForHistory ? (
              <ZoneHistoryTimeline zone={selectedZoneForHistory} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  {t('latent.history.selectToView', 'Sélectionnez une zone pour voir son historique')}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <LatentOnboarding />
        </TabsContent>
      </Tabs>
    </div>
  );
}
