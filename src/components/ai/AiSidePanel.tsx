import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Loader2, Check, Edit, XCircle, ChevronDown, ChevronUp, Eye, EyeOff, History, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface AiAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

export interface AiContext {
  module: string;
  profile?: any;
  objective?: string;
  trajectory?: any;
  countries?: string[];
  country?: any;
  progress?: any;
  dossier?: any;
  additionalInfo?: string;
}

interface AiSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actions: AiAction[];
  context: AiContext;
  onAccept?: (result: any, action: string) => void;
  onModify?: (result: any, action: string, modifications: string) => void;
}

interface AiResult {
  action: string;
  result: any;
  policyWarnings?: string[];
  meta?: {
    processingTime: number;
    tokensUsed: number;
  };
}

interface HistoryEntry {
  id: string;
  action_type: string;
  created_at: string;
  status: string;
  user_decision: string | null;
}

export function AiSidePanel({
  isOpen,
  onClose,
  title,
  actions,
  context,
  onAccept,
  onModify,
}: AiSidePanelProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [editableContext, setEditableContext] = useState<string>('');
  const [modifications, setModifications] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('ai_activity_log')
      .select('id, action_type, created_at, status, user_decision')
      .eq('user_id', user.id)
      .eq('module', context.module)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setHistory(data);
    }
  }, [user, context.module]);

  // Execute AI action
  const executeAction = async (actionId: string) => {
    setSelectedAction(actionId);
    setLoading(true);
    setResult(null);
    setIsEditing(false);

    try {
      // Parse editable context if modified
      let finalContext = context;
      if (editableContext) {
        try {
          finalContext = { ...context, ...JSON.parse(editableContext) };
        } catch {
          // Keep original context if parse fails
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: actionId,
          context: finalContext,
          userId: user?.id,
          sessionId: crypto.randomUUID(),
        },
      });

      if (error) throw error;

      setResult(data);
      
      if (data.policyWarnings?.length > 0) {
        toast.warning(t('ai.policyWarning', 'Contenu ajusté pour conformité'));
      }
    } catch (error) {
      console.error('AI action error:', error);
      toast.error(t('ai.error', 'Erreur lors de la génération'));
    } finally {
      setLoading(false);
    }
  };

  // Handle accept
  const handleAccept = async () => {
    if (!result) return;

    // Update log with user decision
    if (user) {
      await supabase
        .from('ai_activity_log')
        .update({ user_decision: 'accepted' })
        .eq('user_id', user.id)
        .eq('action_type', result.action)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    onAccept?.(result.result, result.action);
    toast.success(t('ai.accepted', 'Proposition acceptée'));
    setResult(null);
    setSelectedAction(null);
  };

  // Handle modify
  const handleModify = async () => {
    if (!result || !modifications.trim()) return;

    // Update log with user decision
    if (user) {
      await supabase
        .from('ai_activity_log')
        .update({ user_decision: 'modified' })
        .eq('user_id', user.id)
        .eq('action_type', result.action)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    onModify?.(result.result, result.action, modifications);
    toast.success(t('ai.modified', 'Proposition modifiée et acceptée'));
    setResult(null);
    setSelectedAction(null);
    setModifications('');
    setIsEditing(false);
  };

  // Handle reject
  const handleReject = async () => {
    if (!result) return;

    // Update log with user decision
    if (user) {
      await supabase
        .from('ai_activity_log')
        .update({ user_decision: 'rejected' })
        .eq('user_id', user.id)
        .eq('action_type', result.action)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    toast.info(t('ai.rejected', 'Proposition refusée'));
    setResult(null);
    setSelectedAction(null);
  };

  // Initialize editable context
  const initEditableContext = () => {
    setEditableContext(JSON.stringify(context, null, 2));
    setShowContext(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-background border-l shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground">
              {t('ai.motto', "L'IA propose, vous validez")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={fetchHistory}>
                <History className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('ai.history', 'Historique IA')}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px]">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('ai.noHistory', 'Aucun historique')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <div key={entry.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{entry.action_type}</span>
                          <Badge variant={
                            entry.user_decision === 'accepted' ? 'default' :
                            entry.user_decision === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {entry.user_decision || entry.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(entry.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {/* Context Preview */}
        <Collapsible open={showContext} onOpenChange={setShowContext}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between mb-4" onClick={initEditableContext}>
              <span className="flex items-center gap-2 text-sm">
                {showContext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {t('ai.viewContext', 'Voir le contexte envoyé')}
              </span>
              {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mb-4 border-dashed">
              <CardContent className="p-3">
                <Textarea
                  value={editableContext}
                  onChange={(e) => setEditableContext(e.target.value)}
                  className="font-mono text-xs min-h-[150px]"
                  placeholder={t('ai.contextPlaceholder', 'Contexte JSON modifiable...')}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('ai.contextInfo', 'Vous pouvez modifier ce contexte avant de lancer une action')}
                </p>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        {!result && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {t('ai.chooseAction', 'Choisissez une action')}
            </h3>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  "w-full justify-start h-auto py-3 px-4",
                  selectedAction === action.id && loading && "border-primary"
                )}
                onClick={() => executeAction(action.id)}
                disabled={loading}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="shrink-0 mt-0.5">
                    {selectedAction === action.id && loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      action.icon
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Policy warnings */}
            {result.policyWarnings && result.policyWarnings.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      {t('ai.contentAdjusted', 'Contenu ajusté')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('ai.contentAdjustedDesc', 'Le contenu a été modifié pour respecter nos règles de neutralité.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t('ai.proposal', 'Proposition IA')}
                </CardTitle>
                {result.meta && (
                  <p className="text-xs text-muted-foreground">
                    {t('ai.generatedIn', 'Généré en')} {result.meta.processingTime}ms
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ResultDisplay result={result.result} />
              </CardContent>
            </Card>

            {/* Modification area */}
            {isEditing && (
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <Textarea
                    value={modifications}
                    onChange={(e) => setModifications(e.target.value)}
                    placeholder={t('ai.modifyPlaceholder', 'Décrivez vos modifications...')}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                className="flex-1 gap-2"
                variant="default"
              >
                <Check className="w-4 h-4" />
                {t('ai.accept', 'Accepter')}
              </Button>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Edit className="w-4 h-4" />
                {t('ai.modify', 'Modifier')}
              </Button>
              <Button
                onClick={handleReject}
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <XCircle className="w-4 h-4" />
                {t('ai.reject', 'Refuser')}
              </Button>
            </div>

            {isEditing && modifications.trim() && (
              <Button onClick={handleModify} className="w-full">
                {t('ai.applyModifications', 'Appliquer les modifications')}
              </Button>
            )}

            {/* New action button */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setResult(null);
                setSelectedAction(null);
              }}
            >
              {t('ai.newAction', 'Nouvelle action')}
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          {t('ai.disclaimer', 'Outil d\'analyse uniquement. Vérifiez toujours les informations officielles.')}
        </p>
      </div>
    </div>
  );
}

// Result display component
function ResultDisplay({ result }: { result: any }) {
  if (typeof result === 'string') {
    return <p className="text-sm whitespace-pre-wrap">{result}</p>;
  }

  if (result.error) {
    return (
      <div className="text-destructive text-sm">
        {result.error}
      </div>
    );
  }

  // Render structured result
  return (
    <div className="space-y-4 text-sm">
      {Object.entries(result).map(([key, value]) => {
        if (key === 'disclaimer') {
          return (
            <p key={key} className="text-xs text-muted-foreground italic border-t pt-3 mt-3">
              {String(value)}
            </p>
          );
        }

        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <h4 className="font-medium capitalize mb-2">
                {key.replace(/_/g, ' ')}
              </h4>
              <ul className="space-y-1.5">
                {value.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key}>
              <h4 className="font-medium capitalize mb-2">
                {key.replace(/_/g, ' ')}
              </h4>
              <div className="pl-3 border-l-2 border-primary/20">
                <ResultDisplay result={value} />
              </div>
            </div>
          );
        }

        return (
          <div key={key}>
            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
            <span className="text-muted-foreground">{String(value)}</span>
          </div>
        );
      })}
    </div>
  );
}
