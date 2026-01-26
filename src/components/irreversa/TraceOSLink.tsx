import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { IrreversaThreshold } from '@/hooks/useIrreversa';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface TraceOSLinkProps {
  threshold: IrreversaThreshold;
}

export function TraceOSLink({ threshold }: TraceOSLinkProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkedDecisionId, setLinkedDecisionId] = useState<string | null>(null);

  const handleLinkToTraceOS = async () => {
    setIsLinking(true);
    
    try {
      // Create a new TraceOS decision linked to this threshold
      const { data: decision, error } = await supabase
        .from('traceos_decisions')
        .insert([{
          user_id: threshold.user_id,
          author: threshold.validated_by,
          title: `[Irreversa] ${threshold.title}`,
          context: threshold.context,
          status: 'documented',
          decision: `Seuil irréversible documenté: ${threshold.irreversibility_reason}`,
          main_hypothesis: threshold.context,
          scope: threshold.organization_name || 'Organisation',
          constraints: [{
            type: 'irreversa_link',
            threshold_id: threshold.id,
            threshold_status: threshold.status,
            sealed_at: threshold.sealed_at
          }]
        }])
        .select()
        .single();

      if (error) throw error;

      // Add audit entry for the link
      await supabase.from('irreversa_audit_log').insert({
        threshold_id: threshold.id,
        action: 'traceos_linked',
        actor_name: 'System',
        actor_role: 'integration',
        details: { 
          traceos_decision_id: decision.id,
          linked_at: new Date().toISOString()
        }
      });

      setLinkedDecisionId(decision.id);
      toast.success(t('irreversa.traceos.linked', 'Seuil lié à TraceOS avec succès'));
    } catch (err) {
      console.error('Error linking to TraceOS:', err);
      toast.error(t('irreversa.traceos.linkError', 'Erreur lors de la liaison'));
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link2 className="w-4 h-4" />
          TraceOS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t('irreversa.traceos.title', 'Lier à TraceOS')}
          </DialogTitle>
          <DialogDescription>
            {t('irreversa.traceos.description', 'Créez une décision TraceOS liée à ce seuil irréversible pour une traçabilité complète.')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="font-medium">{threshold.title}</p>
            <p className="text-sm text-muted-foreground">
              Statut: <span className="font-medium">{threshold.status}</span>
            </p>
            {threshold.sealed_at && (
              <p className="text-sm text-destructive">
                Scellé le: {new Date(threshold.sealed_at).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          {linkedDecisionId && (
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{t('irreversa.traceos.success', 'Liaison créée avec succès')}</span>
              </div>
              <Link 
                to="/institutions" 
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {t('irreversa.traceos.viewDecision', 'Voir dans TraceOS')}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t('irreversa.traceos.warning', 'Cette action créera une nouvelle décision dans TraceOS avec un lien permanent vers ce seuil.')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button 
            onClick={handleLinkToTraceOS}
            disabled={isLinking || !!linkedDecisionId}
          >
            {isLinking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.loading', 'Chargement...')}
              </>
            ) : linkedDecisionId ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('irreversa.traceos.done', 'Lié')}
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                {t('irreversa.traceos.link', 'Créer la liaison')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
