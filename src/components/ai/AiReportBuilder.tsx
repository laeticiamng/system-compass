import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Loader2, 
  Check, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Building2,
  User,
  Target,
  MapPin,
  Clock,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReportBuilderProps {
  context: {
    profile?: any;
    trajectories?: any[];
    countries?: string[];
    dossier?: any;
  };
  onComplete?: (report: any) => void;
}

interface ReportSection {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  content?: any;
}

export function AiReportBuilder({ context, onComplete }: ReportBuilderProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const [sections, setSections] = useState<ReportSection[]>([
    { id: 'executive', title: t('report.sections.executive', 'Résumé exécutif'), status: 'pending' },
    { id: 'profile', title: t('report.sections.profile', 'Profil client'), status: 'pending' },
    { id: 'analysis', title: t('report.sections.analysis', 'Analyse comparative'), status: 'pending' },
    { id: 'risks', title: t('report.sections.risks', 'Points d\'attention'), status: 'pending' },
    { id: 'next_steps', title: t('report.sections.nextSteps', 'Prochaines étapes'), status: 'pending' },
    { id: 'compliance', title: t('report.sections.compliance', 'Vérification conformité'), status: 'pending' },
  ]);

  const progress = (currentStep / sections.length) * 100;

  const generateReport = async () => {
    if (!user) {
      toast.error(t('common.loginRequired', 'Connexion requise'));
      return;
    }

    setIsGenerating(true);
    setCurrentStep(0);

    try {
      // Step 1-5: Generate each section
      for (let i = 0; i < sections.length; i++) {
        setCurrentStep(i + 1);
        setSections(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'processing' } : s
        ));

        // Small delay for visual feedback
        await new Promise(r => setTimeout(r, 500));

        // Call AI for report generation
        if (i === sections.length - 1) {
          // Final step: generate complete report
          const { data, error } = await supabase.functions.invoke('ai-assist', {
            body: {
              action: 'build-report',
              context: {
                ...context,
                module: 'report-builder',
              },
              userId: user.id,
              sessionId: crypto.randomUUID(),
            },
          });

          if (error) throw error;

          setReport(data.result);
          setSections(prev => prev.map(s => ({ ...s, status: 'completed' })));
        } else {
          setSections(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'completed' } : s
          ));
        }
      }

      toast.success(t('report.generated', 'Rapport généré avec succès'));
      if (onComplete && report) {
        onComplete(report);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(t('report.error', 'Erreur lors de la génération'));
      setSections(prev => prev.map((s, idx) => 
        idx === currentStep - 1 ? { ...s, status: 'error' } : s
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPdf = () => {
    // For now, we'll use a simple print dialog
    // In production, you'd use jspdf or similar
    window.print();
    toast.success(t('report.exported', 'Export PDF lancé'));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {t('report.title', 'Générateur de Rapport B2B')}
            </CardTitle>
            <CardDescription>
              {t('report.description', 'Générez un rapport structuré et exportable pour vos clients')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30">
            <Building2 className="w-3 h-3 mr-1" />
            B2B
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Progress */}
        {isGenerating && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t('report.generating', 'Génération en cours...')}
              </span>
              <span className="text-sm text-muted-foreground">
                {currentStep}/{sections.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2 mb-6">
          {sections.map((section, idx) => (
            <div 
              key={section.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                section.status === 'completed' ? 'bg-green-500/10' :
                section.status === 'processing' ? 'bg-primary/10' :
                section.status === 'error' ? 'bg-destructive/10' :
                'bg-muted/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                section.status === 'completed' ? 'bg-green-500 text-white' :
                section.status === 'processing' ? 'bg-primary text-primary-foreground' :
                section.status === 'error' ? 'bg-destructive text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {section.status === 'completed' ? <Check className="w-3 h-3" /> :
                 section.status === 'processing' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                 section.status === 'error' ? <AlertTriangle className="w-3 h-3" /> :
                 idx + 1}
              </div>
              <span className={`text-sm font-medium ${
                section.status === 'completed' ? 'text-green-700' :
                section.status === 'processing' ? 'text-primary' :
                section.status === 'error' ? 'text-destructive' :
                'text-muted-foreground'
              }`}>
                {section.title}
              </span>
            </div>
          ))}
        </div>

        {/* Report Preview */}
        {report && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('report.preview', 'Aperçu du rapport')}
              </h3>
              
              <ScrollArea className="h-[300px] rounded-lg border p-4">
                {/* Executive Summary */}
                {report.resume_executif && (
                  <Collapsible open={expandedSections.includes('exec')}>
                    <CollapsibleTrigger 
                      onClick={() => toggleSection('exec')}
                      className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded"
                    >
                      <span className="font-medium">Résumé exécutif</span>
                      {expandedSections.includes('exec') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 bg-muted/20 rounded mt-1">
                      <p className="text-sm">{report.resume_executif}</p>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Profile */}
                {report.profil && (
                  <Collapsible open={expandedSections.includes('profile')}>
                    <CollapsibleTrigger 
                      onClick={() => toggleSection('profile')}
                      className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded"
                    >
                      <span className="font-medium">Profil client</span>
                      {expandedSections.includes('profile') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 bg-muted/20 rounded mt-1">
                      <div className="text-sm space-y-2">
                        {report.profil.points_cles?.map((point: string, i: number) => (
                          <p key={i} className="flex items-start gap-2">
                            <User className="w-3 h-3 mt-1 text-primary" />
                            {point}
                          </p>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Options */}
                {report.options_identifiees && (
                  <Collapsible open={expandedSections.includes('options')}>
                    <CollapsibleTrigger 
                      onClick={() => toggleSection('options')}
                      className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded"
                    >
                      <span className="font-medium">Options identifiées</span>
                      {expandedSections.includes('options') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 bg-muted/20 rounded mt-1">
                      <ul className="text-sm space-y-1">
                        {report.options_identifiees.map((opt: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <Target className="w-3 h-3 mt-1 text-primary" />
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Vigilance Points */}
                {report.points_vigilance && (
                  <Collapsible open={expandedSections.includes('vigilance')}>
                    <CollapsibleTrigger 
                      onClick={() => toggleSection('vigilance')}
                      className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded"
                    >
                      <span className="font-medium">Points de vigilance</span>
                      {expandedSections.includes('vigilance') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 bg-muted/20 rounded mt-1">
                      <ul className="text-sm space-y-1">
                        {report.points_vigilance.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 mt-1 text-amber-500" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </ScrollArea>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                {t('report.disclaimer', 'Ce rapport est un outil d\'analyse. Il ne constitue pas un conseil juridique, financier ou fiscal.')}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {!report ? (
            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('report.generating', 'Génération en cours...')}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  {t('report.generate', 'Générer le rapport')}
                </>
              )}
            </Button>
          ) : (
            <>
              <Button onClick={exportToPdf} className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                {t('report.exportPdf', 'Exporter PDF')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setReport(null); setSections(s => s.map(sec => ({ ...sec, status: 'pending' }))); }}
              >
                {t('report.regenerate', 'Régénérer')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
