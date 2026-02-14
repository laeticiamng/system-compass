import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, Link, StickyNote, Gavel, Quote,
  ExternalLink, Shield, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';

interface AiCitationsDisplayProps {
  caseId: string;
  responseId?: string;
  showAllCitations?: boolean;
}

interface Citation {
  id: string;
  confidence_score: number | null;
  citation_text: string | null;
  evidence: {
    id: string;
    title: string;
    evidence_type: string;
    content: string | null;
    url: string | null;
    source_name: string | null;
    source_date: string | null;
    reliability: string;
    is_verified: boolean;
  } | null;
}

const EVIDENCE_TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="w-4 h-4" />,
  link: <Link className="w-4 h-4" />,
  note: <StickyNote className="w-4 h-4" />,
  decision: <Gavel className="w-4 h-4" />,
  extract: <Quote className="w-4 h-4" />,
};

const RELIABILITY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  high: {
    label: 'pmo.citations.reliabilityHigh',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: <CheckCircle className="w-3 h-3" />
  },
  medium: {
    label: 'pmo.citations.reliabilityMedium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: <Shield className="w-3 h-3" />
  },
  low: {
    label: 'pmo.citations.reliabilityLow',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: <AlertTriangle className="w-3 h-3" />
  },
  unverified: {
    label: 'pmo.citations.reliabilityUnverified',
    color: 'bg-muted text-muted-foreground',
    icon: <AlertTriangle className="w-3 h-3" />
  },
};

export function AiCitationsDisplay({ caseId, responseId, showAllCitations = false }: AiCitationsDisplayProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedEvidence, setSelectedEvidence] = useState<Citation['evidence'] | null>(null);

  // Fetch citations with joined evidence
  const { data: citations, isLoading } = useQuery({
    queryKey: ['pmo-ai-citations', caseId, responseId],
    queryFn: async () => {
      if (!caseId || !user) return [];

      let query = supabase
        .from('pmo_ai_citations')
        .select(`
          id,
          confidence_score,
          citation_text,
          evidence:pmo_evidence_vault(
            id,
            title,
            evidence_type,
            content,
            url,
            source_name,
            source_date,
            reliability,
            is_verified
          )
        `)
        .eq('case_id', caseId)
        .order('confidence_score', { ascending: false });

      if (responseId && !showAllCitations) {
        query = query.eq('response_id', responseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Citation[];
    },
    enabled: !!caseId && !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!citations || citations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center">
          <Quote className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('pmo.citations.empty', 'Aucune source citée pour cette réponse')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Quote className="w-4 h-4" />
          {t('pmo.citations.title', 'Sources utilisées')}
        </CardTitle>
        <CardDescription>
          {t('pmo.citations.subtitle', 'Références pour cette analyse')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {citations.map((citation) => (
              <div 
                key={citation.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div className="mt-0.5 text-muted-foreground">
                  {EVIDENCE_TYPE_ICONS[citation.evidence?.evidence_type || 'note']}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {citation.evidence?.title || t('pmo.citations.unknownSource', 'Source inconnue')}
                    </span>
                    {citation.evidence?.is_verified && citation.evidence.is_verified && (
                      <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
                    )}
                  </div>
                  
                  {citation.citation_text && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      "{citation.citation_text}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    {citation.evidence?.reliability && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${RELIABILITY_CONFIG[citation.evidence.reliability]?.color}`}
                      >
                        {RELIABILITY_CONFIG[citation.evidence.reliability]?.icon}
                        <span className="ml-1">
                          {t(RELIABILITY_CONFIG[citation.evidence.reliability]?.label, RELIABILITY_CONFIG[citation.evidence.reliability]?.label)}
                        </span>
                      </Badge>
                    )}
                    
                    {citation.confidence_score && (
                      <span className={`text-xs ${getConfidenceColor(citation.confidence_score)}`}>
                        {Math.round(citation.confidence_score * 100)}% conf.
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {citation.evidence?.url && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => window.open(citation.evidence?.url || '', '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => setSelectedEvidence(citation.evidence)}
                      >
                        <FileText className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {EVIDENCE_TYPE_ICONS[selectedEvidence?.evidence_type || 'note']}
                          {selectedEvidence?.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {selectedEvidence?.source_name && (
                          <div>
                            <span className="text-sm font-medium">{t('pmo.citations.source', 'Source :')}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {selectedEvidence.source_name}
                            </span>
                          </div>
                        )}
                        {selectedEvidence?.source_date && (
                          <div>
                            <span className="text-sm font-medium">{t('pmo.citations.date', 'Date :')}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {new Date(selectedEvidence.source_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                        {selectedEvidence?.content && (
                          <div>
                            <span className="text-sm font-medium">{t('pmo.citations.content', 'Contenu :')}</span>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                              {selectedEvidence.content}
                            </p>
                          </div>
                        )}
                        {selectedEvidence?.url && (
                          <Button 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={() => window.open(selectedEvidence?.url || '', '_blank', 'noopener,noreferrer')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t('pmo.citations.openSource', 'Ouvrir la source')}
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Strict Mode Warning */}
        {citations.every(c => !c.evidence?.is_verified) && (
          <div className="mt-3 p-2 bg-destructive/10 rounded-lg border border-destructive/30">
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {t('pmo.citations.strictWarning', 'Aucune source vérifiée. En mode strict, cette analyse est indicative.')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
