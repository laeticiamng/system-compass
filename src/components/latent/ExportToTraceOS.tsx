import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LatentZone } from '@/hooks/useLatentZones';
import { useTraceOSDecisions } from '@/hooks/useTraceOSDecisions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExportToTraceOSProps {
  zone: LatentZone;
  onExported?: () => void;
}

export function ExportToTraceOS({ zone, onExported }: ExportToTraceOSProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createDecision } = useTraceOSDecisions();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  const handleExport = async () => {
    if (!user) {
      toast.error(t('common.loginRequired', 'Connexion requise'));
      return;
    }

    setIsExporting(true);

    try {
      // Build context from zone data
      const tensionsSummary = (zone.tensions || [])
        .map(t => `- [${t.tension_type}] ${t.content}`)
        .join('\n');

      const context = `
**Zone de Potentiel LATENT exportée**

${zone.description || ''}

**Statut au moment de l'export:** ${zone.status}

${tensionsSummary ? `**Champs de tension identifiés:**\n${tensionsSummary}` : ''}

${additionalContext ? `**Contexte additionnel:**\n${additionalContext}` : ''}
      `.trim();

      const newDecision = {
        title: `[LATENT] ${zone.title}`,
        context,
        mainHypothesis: t('latent.export.hypothesis', 'Cette zone de potentiel est prête à être explorée en tant que décision potentielle.'),
        alternativeHypotheses: [
          t('latent.export.alt1', 'Maintenir en zone de potentiel pour observation continue'),
          t('latent.export.alt2', 'Fusionner avec d\'autres zones connexes avant de décider')
        ],
        constraints: [
          t('latent.export.constraint1', 'Préserver la réflexion sans cristallisation prématurée'),
          t('latent.export.constraint2', 'Respecter le temps de maturation')
        ],
        decision: t('latent.export.pendingDecision', 'En attente de formulation - exporté depuis LATENT'),
        date: new Date().toISOString().split('T')[0],
        author: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Utilisateur',
        scope: 'Exploratoire',
        status: 'pending' as const,
        abandonedBranches: []
      };

      await createDecision(newDecision);
      
      toast.success(t('latent.export.success'));
      setIsOpen(false);
      setAdditionalContext('');
      onExported?.();
    } catch (error) {
      console.error('Error exporting to TraceOS:', error);
      toast.error(t('common.error', 'Une erreur est survenue'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GitBranch className="w-4 h-4" />
          TraceOS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            {t('latent.export.title')}
          </DialogTitle>
          <DialogDescription>
            {t('latent.export.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Zone Preview */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-medium text-sm">{zone.title}</p>
            {zone.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {zone.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                {t(`latent.status.${zone.status}`)}
              </span>
              {(zone.tensions?.length || 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {zone.tensions?.length} {t('latent.tensions.title').toLowerCase()}
                </span>
              )}
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additional-context">
              {t('latent.export.additionalContext', 'Contexte additionnel (optionnel)')}
            </Label>
            <Textarea
              id="additional-context"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder={t('latent.export.contextPlaceholder', 'Ajoutez du contexte pour l\'équipe décisionnelle...')}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Export Notice */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t('latent.export.notice', 'La zone sera exportée comme brouillon de décision dans TraceOS. Les tensions identifiées seront incluses dans le contexte.')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {t('latent.export.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
