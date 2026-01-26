// OVI TraceOS Link Component - Connect OVI insights to decisions
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Link2, Brain, AlertTriangle, CheckCircle, Loader2,
  ExternalLink, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TraceOSDecision {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'sealed' | 'archived';
  created_at: string;
}

interface OVIInsight {
  id: string;
  framework: string;
  bias_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface OVITraceOSLinkProps {
  insight: OVIInsight;
  decisions?: TraceOSDecision[];
  onLink?: (decisionId: string, note: string) => Promise<void>;
}

export function OVITraceOSLink({ insight, decisions = [], onLink }: OVITraceOSLinkProps) {
  const { t } = useTranslation();
  const [selectedDecision, setSelectedDecision] = useState<string>('');
  const [linkNote, setLinkNote] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-500/10';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10';
      case 'low': return 'text-green-600 bg-green-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const handleLink = async () => {
    if (!selectedDecision || !onLink) return;
    
    setIsLinking(true);
    try {
      await onLink(selectedDecision, linkNote);
      setIsLinked(true);
      toast.success(t('ovi.linkSuccess', 'Insight linked to decision'));
    } catch (error) {
      toast.error(t('ovi.linkError', 'Failed to link insight'));
    } finally {
      setIsLinking(false);
    }
  };

  const activeDecisions = decisions.filter(d => d.status === 'active' || d.status === 'draft');

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {t('ovi.linkToTraceOS', 'Link to TraceOS')}
          </CardTitle>
          {isLinked && (
            <Badge variant="outline" className="text-green-600 bg-green-500/10">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('ovi.linked', 'Linked')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insight Summary */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-sm">{insight.framework}</span>
            </div>
            <Badge className={cn("text-xs", getSeverityColor(insight.severity))}>
              {insight.severity}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          <Badge variant="secondary" className="mt-2 text-xs">
            {insight.bias_type}
          </Badge>
        </div>

        {!isLinked && (
          <>
            {/* Decision Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('ovi.selectDecision', 'Select Decision')}
              </label>
              {activeDecisions.length > 0 ? (
                <Select value={selectedDecision} onValueChange={setSelectedDecision}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ovi.chooseDecision', 'Choose a decision...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeDecisions.map((decision) => (
                      <SelectItem key={decision.id} value={decision.id}>
                        <div className="flex items-center gap-2">
                          <span>{decision.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {decision.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 text-center border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('ovi.noDecisions', 'No active decisions found')}
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-3 h-3" />
                    {t('ovi.createDecision', 'Create Decision')}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Link Note */}
            {selectedDecision && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('ovi.linkNote', 'Note (optional)')}
                </label>
                <Textarea
                  value={linkNote}
                  onChange={(e) => setLinkNote(e.target.value)}
                  placeholder={t('ovi.linkNotePlaceholder', 'How does this bias affect the decision?')}
                  rows={3}
                />
              </div>
            )}

            {/* Link Button */}
            {selectedDecision && (
              <Button
                onClick={handleLink}
                disabled={isLinking}
                className="w-full gap-2"
              >
                {isLinking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                {t('ovi.linkInsight', 'Link Insight to Decision')}
              </Button>
            )}
          </>
        )}

        {isLinked && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {t('ovi.insightLinked', 'This insight is now linked to your decision for bias awareness')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
