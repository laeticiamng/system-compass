import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lock, 
  Plus, 
  AlertTriangle,
  Loader2,
  Shield,
  Eye,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
import { useIrreversa, ThresholdStatus, ValidatorRole } from '@/hooks/useIrreversa';
import { useSubscription } from '@/hooks/useSubscription';
import { ThresholdCard } from './ThresholdCard';
import { CreateThresholdForm } from './CreateThresholdForm';
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
  const [statusFilter, setStatusFilter] = useState<ThresholdStatus | 'all'>('all');
  const [actionDialog, setActionDialog] = useState<ActionDialogType>(null);
  const [selectedThresholdId, setSelectedThresholdId] = useState<string | null>(null);
  const [actorName, setActorName] = useState('');
  const [actorRole, setActorRole] = useState<ValidatorRole>('director');
  const [validationStatement, setValidationStatement] = useState('');

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

  const filteredThresholds = statusFilter === 'all'
    ? thresholds
    : thresholds.filter(t => t.status === statusFilter);

  const counts = {
    all: thresholds.length,
    detected: thresholds.filter(t => t.status === 'detected').length,
    marked: thresholds.filter(t => t.status === 'marked').length,
    validated: thresholds.filter(t => t.status === 'validated').length,
    sealed: thresholds.filter(t => t.status === 'sealed').length,
  };

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['detected', 'marked', 'validated', 'sealed'] as const).map(status => {
          const icons = {
            detected: Eye,
            marked: AlertTriangle,
            validated: CheckCircle2,
            sealed: Lock
          };
          const Icon = icons[status];
          const colors = {
            detected: 'text-amber-500',
            marked: 'text-orange-500',
            validated: 'text-blue-500',
            sealed: 'text-red-500'
          };
          return (
            <div key={status} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
              <Icon className={`w-5 h-5 ${colors[status]}`} />
              <div>
                <p className="text-2xl font-bold">{counts[status]}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`irreversa.status.${status}`)}
                </p>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <p className="text-2xl font-bold">{counts.all}</p>
            <p className="text-xs text-muted-foreground">{t('common.total')}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select 
          value={statusFilter} 
          onValueChange={(v) => setStatusFilter(v as ThresholdStatus | 'all')}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')} ({counts.all})</SelectItem>
            <SelectItem value="detected">{t('irreversa.status.detected')} ({counts.detected})</SelectItem>
            <SelectItem value="marked">{t('irreversa.status.marked')} ({counts.marked})</SelectItem>
            <SelectItem value="validated">{t('irreversa.status.validated')} ({counts.validated})</SelectItem>
            <SelectItem value="sealed">{t('irreversa.status.sealed')} ({counts.sealed})</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              onSeal={(id) => openActionDialog('seal', id)}
            />
          ))}
        </div>
      )}

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
