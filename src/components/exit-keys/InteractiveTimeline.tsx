import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Flag, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  phase: 'preparation' | 'execution' | 'installation' | 'integration';
  status: 'pending' | 'active' | 'completed';
  milestones?: string[];
}

interface InteractiveTimelineProps {
  countryName: string;
  profession?: string;
}

export function InteractiveTimeline({ countryName, profession }: InteractiveTimelineProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const timelineSteps: TimelineStep[] = [
    {
      id: 'research',
      title: t('exitKeys.timeline.research', 'Recherche & Préparation'),
      description: t('exitKeys.timeline.researchDesc', 'Analyse du marché, reconnaissance des opportunités, préparation documentaire'),
      duration: '1-3 mois',
      phase: 'preparation',
      status: 'completed',
      milestones: ['Dossier visa complet', 'Reconnaissance diplômes', 'Budget validé']
    },
    {
      id: 'admin',
      title: t('exitKeys.timeline.admin', 'Démarches Administratives'),
      description: t('exitKeys.timeline.adminDesc', 'Visa, permis de travail, ouverture compte bancaire, assurances'),
      duration: '2-6 mois',
      phase: 'preparation',
      status: 'active',
      milestones: ['Visa obtenu', 'Compte bancaire', 'Assurance santé']
    },
    {
      id: 'relocation',
      title: t('exitKeys.timeline.relocation', 'Déménagement'),
      description: t('exitKeys.timeline.relocationDesc', 'Logistique, logement temporaire, installation initiale'),
      duration: '1-2 mois',
      phase: 'execution',
      status: 'pending',
      milestones: ['Déménagement effectué', 'Logement trouvé', 'Utilities activées']
    },
    {
      id: 'integration',
      title: t('exitKeys.timeline.integration', 'Intégration Professionnelle'),
      description: t('exitKeys.timeline.integrationDesc', 'Prise de poste, adaptation culturelle, construction du réseau'),
      duration: '3-12 mois',
      phase: 'integration',
      status: 'pending',
      milestones: ['Premier emploi', 'Réseau local', 'Adaptation réussie']
    }
  ];

  const completedSteps = timelineSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / timelineSteps.length) * 100;

  const phaseColors = {
    preparation: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
    execution: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
    installation: 'bg-green-500/10 border-green-500/30 text-green-700',
    integration: 'bg-purple-500/10 border-purple-500/30 text-purple-700'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('exitKeys.timeline.title', 'Timeline de Relocalisation')}
          </CardTitle>
          <Badge variant="outline">
            <MapPin className="w-3 h-3 mr-1" />
            {countryName}
          </Badge>
        </div>
        {profession && (
          <p className="text-sm text-muted-foreground">
            {t('exitKeys.timeline.profession', 'Parcours pour')} {profession}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('exitKeys.timeline.progress', 'Progression')}</span>
            <span className="font-medium">{completedSteps}/{timelineSteps.length} étapes</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {timelineSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative pl-10 cursor-pointer transition-all ${
                  currentStep === index ? 'scale-[1.02]' : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                {/* Step Indicator */}
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  step.status === 'active' ? 'bg-primary border-primary text-primary-foreground' :
                  'bg-background border-muted-foreground/30'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className={`p-4 rounded-lg border ${phaseColors[step.phase]} ${
                  currentStep === index ? 'ring-2 ring-primary/20' : ''
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {step.duration}
                    </Badge>
                  </div>

                  {currentStep === index && step.milestones && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <div className="flex flex-wrap gap-2">
                        {step.milestones.map((milestone, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Flag className="w-3 h-3 mr-1" />
                            {milestone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('common.previous', 'Précédent')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.min(timelineSteps.length - 1, currentStep + 1))}
            disabled={currentStep === timelineSteps.length - 1}
          >
            {t('common.next', 'Suivant')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
