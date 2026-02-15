import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lock, 
  Plus, 
  AlertTriangle,
  Loader2,
  Shield,
  Eye,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useIrreversa, ThresholdStatus, ValidatorRole, IrreversaThreshold } from '@/hooks/useIrreversa';
import { useSubscription } from '@/hooks/useSubscription';
import { ThresholdCard } from './ThresholdCard';
import { CreateThresholdForm } from './CreateThresholdForm';
import { ThresholdSearchAndFilter, FilterOptions } from './ThresholdSearchAndFilter';
import { ThresholdStats } from './ThresholdStats';
import { SealConfirmationDialog } from './SealConfirmationDialog';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { toast } from 'sonner';

type ActionDialogType = 'mark' | 'validate' | 'seal' | null;

export function Irreversa() {
  const { t } = useTranslation();
  const { canAccessPro } = useSubscription();
  const { 
    thresholds, 
    loading, 
    isLoggedIn,
    createThreshold,
    markThreshold,
    validateThreshold,
    sealThreshold
  } = useIrreversa();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogType>(null);
  const [selectedThresholdId, setSelectedThresholdId] = useState<string | null>(null);
  const [actorName, setActorName] = useState('');
  const [actorRole, setActorRole] = useState<ValidatorRole>('director');
  const [validationStatement, setValidationStatement] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [sealConfirmOpen, setSealConfirmOpen] = useState(false);
  const [thresholdToSeal, setThresholdToSeal] = useState<IrreversaThreshold | null>(null);
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    domain: 'all',
    nature: 'all',
    sortField: 'created_at',
    sortOrder: 'desc'
  });

  const handleCreate = async (data: Parameters<typeof createThreshold>[0]) => {
    setIsSubmitting(true);
    const result = await createThreshold(data);
    setIsSubmitting(false);
    if (result) {
      toast.success(t('irreversa.toast.created'));
      return true;
    }
    return false;
  };

  const openActionDialog = (type: ActionDialogType, thresholdId: string) => {
    setSelectedThresholdId(thresholdId);
    setActionDialog(type);
    setActorName('');
    setValidationStatement('');
  };

  const handleAction = async () => {
    if (!selectedThresholdId || !actorName) return;

    setIsSubmitting(true);
    let success = false;

    switch (actionDialog) {
      case 'mark':
        success = await markThreshold(selectedThresholdId, actorName, actorRole);
        if (success) toast.success(t('irreversa.toast.marked'));
        break;
      case 'validate':
        success = await validateThreshold(selectedThresholdId, actorName, actorRole, validationStatement);
        if (success) toast.success(t('irreversa.toast.validated'));
        break;
      case 'seal':
        success = await sealThreshold(selectedThresholdId, actorName, actorRole);
        if (success) toast.success(t('irreversa.toast.sealed'));
        break;
    }

    setIsSubmitting(false);
    if (success) {
      setActionDialog(null);
      setSelectedThresholdId(null);
    }
  };

  const counts = useMemo(() => ({
    all: thresholds.length,
    detected: thresholds.filter(t => t.status === 'detected').length,
    marked: thresholds.filter(t => t.status === 'marked').length,
    validated: thresholds.filter(t => t.status === 'validated').length,
    sealed: thresholds.filter(t => t.status === 'sealed').length,
  }), [thresholds]);

  // Apply filters, search, and sorting
  const filteredThresholds = useMemo(() => {
    let result = [...thresholds];

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }

    // Domain filter
    if (filters.domain !== 'all') {
      result = result.filter(t => t.domain === filters.domain);
    }

    // Nature filter
    if (filters.nature !== 'all') {
      result = result.filter(t => t.threshold_nature === filters.nature);
    }

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.context.toLowerCase().includes(searchLower) ||
        t.irreversibility_reason.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'detection_date':
          comparison = new Date(a.detection_date).getTime() - new Date(b.detection_date).getTime();
          break;
        case 'status': {
          const statusOrder = { detected: 0, marked: 1, validated: 2, sealed: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [thresholds, filters]);

  // Handle seal with confirmation dialog
  const handleSealRequest = (id: string) => {
    const threshold = thresholds.find(t => t.id === id);
    if (threshold) {
      setThresholdToSeal(threshold);
      setSealConfirmOpen(true);
    }
  };

  const handleSealConfirm = async () => {
    if (!thresholdToSeal) return;
    
    setIsSubmitting(true);
    const success = await sealThreshold(thresholdToSeal.id, actorName || 'Système', actorRole);
    setIsSubmitting(false);
    
    if (success) {
      toast.success(t('irreversa.toast.sealed'));
      setSealConfirmOpen(false);
      setThresholdToSeal(null);
    }
  };

  // Demo thresholds for preview mode
  const demoThresholds = [
    {
      id: 'demo-1',
      title: t('irreversa.demo.threshold1.title', 'Décision de licenciement collectif'),
      context: t('irreversa.demo.threshold1.context', 'Restructuration suite à perte de marché majeur'),
      threshold_nature: 'organizational',
      domain: 'hr',
      status: 'validated' as ThresholdStatus,
      irreversibility_reason: 'Engagements légaux et communication externe',
      detection_source: 'comex',
      detection_date: new Date().toISOString(),
      validated_by: 'DRH',
      validator_role: 'director' as ValidatorRole,
      alternatives_before: ['Chômage partiel', 'Redéploiement interne'],
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      title: t('irreversa.demo.threshold2.title', 'Cession de filiale stratégique'),
      context: t('irreversa.demo.threshold2.context', 'Recentrage sur le cœur de métier'),
      threshold_nature: 'strategic',
      domain: 'finance',
      status: 'sealed' as ThresholdStatus,
      irreversibility_reason: 'Contrat de vente signé, annonce publique faite',
      detection_source: 'board',
      detection_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      validated_by: 'CEO',
      validator_role: 'ceo' as ValidatorRole,
      alternatives_before: ['Joint-venture', 'Spin-off partiel'],
      sealed_at: new Date().toISOString(),
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      title: t('irreversa.demo.threshold3.title', 'Fermeture site de production'),
      context: t('irreversa.demo.threshold3.context', 'Délocalisation vers zone à moindre coût'),
      threshold_nature: 'operational',
      domain: 'operations',
      status: 'detected' as ThresholdStatus,
      irreversibility_reason: 'Bail non renouvelable, équipements vendus',
      detection_source: 'director',
      detection_date: new Date().toISOString(),
      validated_by: '',
      validator_role: 'director' as ValidatorRole,
      alternatives_before: ['Modernisation', 'Sous-traitance partielle'],
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  if (!canAccessPro) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-red-500/20 to-amber-500/20 border-red-500/30">
            <Lock className="w-3.5 h-3.5 mr-2" />
            IRREVERSA
          </Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {t('irreversa.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('irreversa.subtitle')}
          </p>
        </div>

        {/* Preview Mode Banner */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 text-center">
          <Badge variant="outline" className="mb-2">
            <Eye className="w-3 h-3 mr-1" />
            {t('common.previewMode', 'Mode aperçu')}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {t('irreversa.preview.description', 'Découvrez le module Irreversa avec des exemples. Passez à Pro pour documenter vos propres seuils.')}
          </p>
        </div>

        {/* Demo Thresholds Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoThresholds.map(threshold => {
            const statusIcons = {
              detected: Eye,
              marked: AlertTriangle,
              validated: CheckCircle2,
              sealed: Lock
            };
            const StatusIcon = statusIcons[threshold.status];
            const statusColors = {
              detected: 'text-amber-500 border-amber-500/30',
              marked: 'text-orange-500 border-orange-500/30',
              validated: 'text-blue-500 border-blue-500/30',
              sealed: 'text-red-500 border-red-500/30'
            };

            return (
              <Card key={threshold.id} className="relative overflow-hidden opacity-80">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs ${statusColors[threshold.status]}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {t(`irreversa.status.${threshold.status}`)}
                    </Badge>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{threshold.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {threshold.context}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {t(`irreversa.domain.${threshold.domain}`, threshold.domain)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <PremiumPaywall 
          tier="pro"
          title={t('irreversa.paywall.title')}
          description={t('irreversa.paywall.description')}
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
            <Badge className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-amber-500/20 border-red-500/30">
              <Lock className="w-3.5 h-3.5 mr-2" />
              IRREVERSA
            </Badge>
            <Badge variant="outline" className="border-amber-500/30 text-amber-700">
              <Shield className="w-3 h-3 mr-1" />
              B2B Enterprise
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold">
            {t('irreversa.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('irreversa.subtitle')}
          </p>
        </div>

        <Button 
          onClick={() => setIsCreating(true)} 
          className="gap-2 bg-amber-600 hover:bg-amber-700" 
          disabled={!isLoggedIn}
        >
          <AlertTriangle className="w-4 h-4" />
          {t('irreversa.actions.newThreshold')}
        </Button>
      </div>

      {/* Warning banner */}
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
              {t('irreversa.warning.title')}
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
              <li>❌ {t('irreversa.warning.noCancellation')}</li>
              <li>❌ {t('irreversa.warning.noEdit')}</li>
              <li>❌ {t('irreversa.warning.noScoring')}</li>
              <li>❌ {t('irreversa.warning.noRecommendation')}</li>
            </ul>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
          <p className="text-sm text-amber-700">
            {t('irreversa.demoMode')}
          </p>
        </div>
      )}

      <Separator />

      {/* Stats Section */}
      {showStats && thresholds.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <ChevronDown className="w-4 h-4" />
              {t('irreversa.stats.title', 'Statistiques')}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowStats(false)}>
              {t('common.hide', 'Masquer')}
            </Button>
          </div>
          <ThresholdStats thresholds={thresholds} />
        </div>
      )}

      {!showStats && thresholds.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setShowStats(true)}>
          {t('irreversa.stats.show', 'Afficher les statistiques')}
        </Button>
      )}

      {/* Search and Filter */}
      <ThresholdSearchAndFilter
        filters={filters}
        onFiltersChange={setFilters}
        counts={counts}
      />

      {/* Create Form */}
      {isCreating && (
        <CreateThresholdForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isLoading={isSubmitting}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Thresholds Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThresholds.map(threshold => (
            <ThresholdCard
              key={threshold.id}
              threshold={threshold}
              onMark={(id) => openActionDialog('mark', id)}
              onValidate={(id) => openActionDialog('validate', id)}
              onSeal={(id) => handleSealRequest(id)}
            />
          ))}
        </div>
      )}

      {/* Seal Confirmation Dialog */}
      <SealConfirmationDialog
        threshold={thresholdToSeal}
        isOpen={sealConfirmOpen}
        onClose={() => {
          setSealConfirmOpen(false);
          setThresholdToSeal(null);
        }}
        onConfirm={handleSealConfirm}
        isLoading={isSubmitting}
      />

      {/* Empty State */}
      {!loading && filteredThresholds.length === 0 && !isCreating && (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">{t('irreversa.empty.title')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('irreversa.empty.description')}
          </p>
          <Button onClick={() => setIsCreating(true)} disabled={!isLoggedIn}>
            <Plus className="w-4 h-4 mr-2" />
            {t('irreversa.actions.newThreshold')}
          </Button>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog === 'seal' && <Lock className="w-5 h-5 text-red-500" />}
              {actionDialog === 'validate' && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              {actionDialog === 'mark' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
              {t(`irreversa.dialog.${actionDialog}.title`)}
            </DialogTitle>
            <DialogDescription>
              {t(`irreversa.dialog.${actionDialog}.description`)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('irreversa.fields.actorName')} *</Label>
                <Input
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  placeholder={t('irreversa.placeholders.actorName')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('irreversa.fields.actorRole')} *</Label>
                <Select value={actorRole} onValueChange={(v) => setActorRole(v as ValidatorRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['ceo', 'board', 'founder', 'director', 'comex'].map(r => (
                      <SelectItem key={r} value={r}>
                        {t(`irreversa.role.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {actionDialog === 'validate' && (
              <div className="space-y-2">
                <Label>{t('irreversa.fields.validationStatement')} *</Label>
                <Textarea
                  value={validationStatement}
                  onChange={(e) => setValidationStatement(e.target.value)}
                  placeholder={t('irreversa.placeholders.validationStatement')}
                  rows={3}
                />
              </div>
            )}

            {actionDialog === 'seal' && (
              <div className="p-4 rounded-lg bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  ⚠️ {t('irreversa.dialog.seal.warning')}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={!actorName || (actionDialog === 'validate' && !validationStatement) || isSubmitting}
              className={actionDialog === 'seal' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t(`irreversa.actions.${actionDialog}`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
