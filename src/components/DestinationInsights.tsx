import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Palmtree, Building2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

import { DestinationRecommendation, COUNTRY_NAMES } from '@/lib/nationality-advantages';
import { toast } from 'sonner';

interface DestinationInsightsProps {
  destination: DestinationRecommendation;
  nationalities: string[];
  aspiration: string;
  currentCountry: string;
  mode: 'vacation' | 'installation';
  onClose: () => void;
}

export function DestinationInsights({
  destination,
  nationalities,
  aspiration,
  currentCountry,
  mode,
  onClose,
}: DestinationInsightsProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      setContent('');

      try {
        const { data, error: fnError } = await supabase.functions.invoke('destination-insights', {
          body: {
            destination: {
              id: destination.countryId,
              name: destination.countryName,
              accessType: destination.accessType,
            },
            nationalities: nationalities.map(id => COUNTRY_NAMES[id]?.name || id),
            aspiration,
            mode,
            currentCountry: COUNTRY_NAMES[currentCountry]?.name || currentCountry,
          },
        });

        if (fnError) {
          const status = (fnError as any)?.status;
          if (status === 429) {
            const errorMsg = t('errors.rateLimited', 'Trop de requêtes. Veuillez réessayer dans quelques instants.');
            toast.error(errorMsg);
            throw new Error(errorMsg);
          }
          if (status === 402) {
            const errorMsg = t('errors.insufficientCredits', 'Crédits IA insuffisants.');
            toast.error(errorMsg);
            throw new Error(errorMsg);
          }
          throw new Error(t('errors.generationFailed', 'Erreur lors de la génération des insights.'));
        }

        // Handle streaming response or plain text
        if (typeof data === 'string') {
          setContent(data);
        } else if (data?.content) {
          setContent(data.content);
        } else if (data) {
          setContent(JSON.stringify(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [destination, nationalities, aspiration, currentCountry, mode, t]);

  // Auto-scroll
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{destination.flag}</span>
            <div>
              <h2 className="font-bold text-lg">{destination.countryName}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {mode === 'vacation' ? (
                  <><Palmtree className="w-4 h-4 text-emerald-500" /> {t('insights.vacationGuide', 'Guide Vacances')}</>
                ) : (
                  <><Building2 className="w-4 h-4 text-blue-500" /> {t('insights.installationGuide', 'Guide Installation')}</>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-auto p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                {t('common.close', 'Fermer')}
              </Button>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {isLoading && !content && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">{t('insights.generating', 'Génération des insights personnalisés...')}</span>
                </div>
              )}
              
              {content && (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {content.split('\n').map((line, i) => {
                    if (line.startsWith('## ') || line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={i} className="text-primary font-bold mt-6 mb-2 first:mt-0">
                          {line.replace(/^##\s*/, '').replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      return (
                        <li key={i} className="ml-4">
                          {line.slice(2)}
                        </li>
                      );
                    }
                    if (line.match(/^\d+\.\s/)) {
                      return (
                        <div key={i} className="font-semibold text-foreground mt-4 mb-2">
                          {line}
                        </div>
                      );
                    }
                    return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                  })}
                  {isLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t('insights.disclaimer', 'Conseils générés par IA • Vérifiez toujours les informations officielles')}
          </p>
          <Button variant="outline" onClick={onClose}>
            {t('common.close', 'Fermer')}
          </Button>
        </div>
      </div>
    </div>
  );
}
