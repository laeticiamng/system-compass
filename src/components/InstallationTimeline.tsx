import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Clock, CheckCircle, ChevronDown, ChevronUp,
  Plane, FileText,
  Building2, Users, MapPin, Flag, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DestinationRecommendation } from '@/lib/nationality-advantages';

interface InstallationTimelineProps {
  destination: DestinationRecommendation;
  aspiration: string;
  currentCountry: string;
  onClose?: () => void;
}

interface TimelinePhase {
  id: string;
  title: string;
  duration: string;
  icon: React.ElementType;
  color: string;
  steps: TimelineStep[];
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  documents?: string[];
  estimatedCost?: string;
  priority: 'critical' | 'important' | 'optional';
}

// Aspiration-specific additions to timeline
const ASPIRATION_FOCUS: Record<string, { phases: string[]; tips: string[] }> = {
  freedom: {
    phases: ['remote_work', 'digital_nomad'],
    tips: [
      'Privilégiez les pays avec visa digital nomad',
      'Ouvrez un compte bancaire multi-devises (Wise, Revolut)',
      'Assurez-vous d\'avoir une bonne couverture internet'
    ]
  },
  money: {
    phases: ['business_setup', 'investment'],
    tips: [
      'Étudiez la fiscalité locale avant de vous installer',
      'Consultez un avocat fiscaliste international',
      'Identifiez les secteurs en croissance'
    ]
  },
  meaning: {
    phases: ['community', 'volunteering'],
    tips: [
      'Rejoignez des associations locales',
      'Apprenez la langue locale pour une meilleure intégration',
      'Explorez les opportunités de bénévolat'
    ]
  },
  status: {
    phases: ['career', 'networking'],
    tips: [
      'Identifiez les quartiers prestigieux',
      'Rejoignez des clubs professionnels et sociaux',
      'Investissez dans votre image professionnelle locale'
    ]
  },
  family: {
    phases: ['education', 'healthcare'],
    tips: [
      'Recherchez les meilleures écoles internationales',
      'Vérifiez la couverture santé pour toute la famille',
      'Identifiez les quartiers familiaux sûrs'
    ]
  },
  calm: {
    phases: ['lifestyle', 'wellness'],
    tips: [
      'Privilégiez les zones calmes hors des centres urbains',
      'Recherchez les activités de bien-être locales',
      'Planifiez une transition progressive sans stress'
    ]
  }
};

// Base timeline phases (generic)
const BASE_PHASES: TimelinePhase[] = [
  {
    id: 'preparation',
    title: 'Préparation',
    duration: '2-3 mois avant',
    icon: FileText,
    color: 'bg-blue-500',
    steps: [
      {
        id: 'research',
        title: 'Recherche approfondie',
        description: 'Étudiez le pays de destination en détail',
        tips: ['Rejoignez des groupes d\'expatriés', 'Lisez les blogs de résidents'],
        priority: 'critical'
      },
      {
        id: 'visa_research',
        title: 'Recherche visa/permis',
        description: 'Identifiez le type de visa adapté à votre situation',
        documents: ['Passeport valide 6+ mois', 'Photos d\'identité', 'Justificatifs financiers'],
        priority: 'critical'
      },
      {
        id: 'finances',
        title: 'Préparation financière',
        description: 'Constituez une épargne de sécurité (6-12 mois de dépenses)',
        estimatedCost: '10,000€ - 30,000€',
        priority: 'critical'
      },
      {
        id: 'language',
        title: 'Apprentissage de la langue',
        description: 'Commencez l\'apprentissage de la langue locale',
        tips: ['Duolingo, Babbel pour débuter', 'Cours intensifs si possible'],
        priority: 'important'
      }
    ]
  },
  {
    id: 'administrative',
    title: 'Démarches administratives',
    duration: '1-2 mois avant',
    icon: Building2,
    color: 'bg-amber-500',
    steps: [
      {
        id: 'visa_application',
        title: 'Demande de visa',
        description: 'Soumettez votre demande de visa/permis de séjour',
        documents: ['Formulaire de demande', 'Contrat de travail ou preuve de revenus', 'Casier judiciaire'],
        priority: 'critical'
      },
      {
        id: 'health_insurance',
        title: 'Assurance santé internationale',
        description: 'Souscrivez une assurance santé valide dans le pays',
        estimatedCost: '100€ - 500€/mois',
        priority: 'critical'
      },
      {
        id: 'bank_account',
        title: 'Compte bancaire',
        description: 'Ouvrez un compte multi-devises ou local',
        tips: ['Wise, Revolut pour commencer', 'Compte local après installation'],
        priority: 'important'
      },
      {
        id: 'tax_planning',
        title: 'Planification fiscale',
        description: 'Consultez un expert pour optimiser votre situation fiscale',
        priority: 'important'
      }
    ]
  },
  {
    id: 'logistics',
    title: 'Logistique',
    duration: '2-4 semaines avant',
    icon: Plane,
    color: 'bg-purple-500',
    steps: [
      {
        id: 'accommodation',
        title: 'Logement temporaire',
        description: 'Réservez un logement pour les premières semaines',
        tips: ['Airbnb pour 1-3 mois', 'Évitez les engagements long terme au début'],
        estimatedCost: '1,000€ - 3,000€/mois',
        priority: 'critical'
      },
      {
        id: 'flights',
        title: 'Billets d\'avion',
        description: 'Réservez vos vols et organisez le transport de vos affaires',
        tips: ['Vol aller simple si incertitude', 'Bagage important vs envoi séparé'],
        priority: 'critical'
      },
      {
        id: 'moving',
        title: 'Déménagement',
        description: 'Organisez le tri, la vente ou le stockage de vos affaires',
        tips: ['Vendez le maximum', 'Stockage temporaire si besoin'],
        priority: 'important'
      },
      {
        id: 'notify',
        title: 'Notifications officielles',
        description: 'Informez les organismes de votre départ',
        documents: ['Changement d\'adresse', 'Résiliation contrats', 'Notification impôts'],
        priority: 'important'
      }
    ]
  },
  {
    id: 'arrival',
    title: 'Arrivée et installation',
    duration: 'Semaine 1-4',
    icon: MapPin,
    color: 'bg-emerald-500',
    steps: [
      {
        id: 'registration',
        title: 'Enregistrement local',
        description: 'Inscrivez-vous auprès des autorités locales',
        documents: ['Passeport', 'Visa', 'Justificatif de domicile', 'Photos'],
        priority: 'critical'
      },
      {
        id: 'phone',
        title: 'Téléphone et internet',
        description: 'Obtenez une carte SIM locale et un abonnement internet',
        priority: 'critical'
      },
      {
        id: 'local_bank',
        title: 'Compte bancaire local',
        description: 'Ouvrez un compte dans une banque locale',
        documents: ['Passeport', 'Justificatif de domicile', 'Preuve de revenus'],
        priority: 'important'
      },
      {
        id: 'healthcare',
        title: 'Système de santé',
        description: 'Inscrivez-vous au système de santé local',
        tips: ['Trouvez un médecin généraliste', 'Identifiez les hôpitaux proches'],
        priority: 'important'
      }
    ]
  },
  {
    id: 'integration',
    title: 'Intégration',
    duration: 'Mois 2-6',
    icon: Users,
    color: 'bg-rose-500',
    steps: [
      {
        id: 'permanent_housing',
        title: 'Logement permanent',
        description: 'Trouvez un logement à long terme',
        tips: ['Visitez plusieurs quartiers', 'Négociez le bail'],
        priority: 'important'
      },
      {
        id: 'social_network',
        title: 'Réseau social',
        description: 'Construisez votre réseau local',
        tips: ['Meetups, événements locaux', 'Groupes d\'expatriés', 'Sports, hobbies'],
        priority: 'important'
      },
      {
        id: 'language_advanced',
        title: 'Perfectionnement linguistique',
        description: 'Continuez l\'apprentissage de la langue',
        tips: ['Cours intensifs', 'Échanges linguistiques', 'Immersion quotidienne'],
        priority: 'optional'
      },
      {
        id: 'career_development',
        title: 'Développement professionnel',
        description: 'Établissez votre carrière ou business local',
        priority: 'important'
      }
    ]
  },
  {
    id: 'establishment',
    title: 'Établissement',
    duration: 'Mois 6-12+',
    icon: Flag,
    color: 'bg-cyan-500',
    steps: [
      {
        id: 'residency',
        title: 'Résidence permanente',
        description: 'Demandez un statut de résident permanent si éligible',
        priority: 'optional'
      },
      {
        id: 'investment',
        title: 'Investissements locaux',
        description: 'Considérez des investissements immobiliers ou business',
        priority: 'optional'
      },
      {
        id: 'citizenship',
        title: 'Naturalisation',
        description: 'Explorez les options de citoyenneté à long terme',
        tips: ['Délais variables selon pays (3-10 ans)', 'Exigences de résidence et langue'],
        priority: 'optional'
      }
    ]
  }
];

// Country-specific adjustments
const COUNTRY_SPECIFICS: Record<string, { fastTrack?: string[]; warnings?: string[]; specificSteps?: Partial<TimelineStep>[] }> = {
  portugal: {
    fastTrack: ['Golden Visa disponible', 'NHR tax regime avantageux (10 ans)'],
    specificSteps: [{ id: 'nif', title: 'Obtenir NIF', description: 'Numéro fiscal portugais obligatoire' }]
  },
  spain: {
    fastTrack: ['Visa non-lucratif accessible', 'Programme startup visa'],
    warnings: ['NIE obligatoire pour toute démarche']
  },
  germany: {
    fastTrack: ['Freelance visa accessible', 'Blue Card EU pour qualifiés'],
    specificSteps: [{ id: 'anmeldung', title: 'Anmeldung', description: 'Enregistrement obligatoire sous 14 jours' }]
  },
  netherlands: {
    fastTrack: ['30% ruling fiscal', 'Startup visa DAFT pour américains'],
  },
  japan: {
    warnings: ['Processus administratif long', 'Maîtrise du japonais importante'],
    specificSteps: [{ id: 'hanko', title: 'Obtenir un Hanko', description: 'Sceau personnel pour documents officiels' }]
  },
  singapore: {
    fastTrack: ['EntrePass pour entrepreneurs', 'Fiscalité attractive'],
    warnings: ['Coût de vie très élevé', 'Logement compétitif']
  },
  canada: {
    fastTrack: ['Express Entry pour qualifiés', 'PVT pour -35 ans'],
    specificSteps: [{ id: 'sin', title: 'Obtenir SIN', description: 'Social Insurance Number obligatoire' }]
  },
  usa: {
    warnings: ['Processus visa complexe', 'Délais longs'],
    specificSteps: [{ id: 'ssn', title: 'Obtenir SSN', description: 'Social Security Number obligatoire' }]
  },
  thailand: {
    fastTrack: ['Visa retraité facile', 'Thailand Elite Visa disponible'],
    warnings: ['Pas de visa travail facile', 'Renouvellements fréquents']
  },
  uae: {
    fastTrack: ['Golden Visa disponible', 'Pas d\'impôt sur le revenu'],
    warnings: ['Coût de vie élevé', 'Été très chaud']
  }
};

export function InstallationTimeline({
  destination,
  aspiration,
  currentCountry: _currentCountry,
  onClose
}: InstallationTimelineProps) {
  const { t } = useTranslation();
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['preparation']);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const aspirationFocus = ASPIRATION_FOCUS[aspiration] || ASPIRATION_FOCUS.freedom;
  const countrySpecifics = COUNTRY_SPECIFICS[destination.countryId] || {};

  const timeline = useMemo(() => {
    // Add country-specific steps
    let phases = [...BASE_PHASES];
    
    if (countrySpecifics.specificSteps) {
      phases = phases.map(phase => {
        if (phase.id === 'arrival') {
          return {
            ...phase,
            steps: [
              ...countrySpecifics.specificSteps!.map(s => ({
                id: s.id!,
                title: s.title!,
                description: s.description!,
                priority: 'critical' as const
              })),
              ...phase.steps
            ]
          };
        }
        return phase;
      });
    }

    return phases;
  }, [countrySpecifics]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const totalSteps = timeline.reduce((acc, phase) => acc + phase.steps.length, 0);
  const completedCount = completedSteps.length;
  const progressPercent = (completedCount / totalSteps) * 100;

  return (
    <div className="bg-background rounded-2xl border shadow-xl max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-emerald-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{destination.flag}</span>
            <div>
              <h2 className="text-xl font-bold">{t('installation.title', 'Installation Timeline')}</h2>
              <p className="text-muted-foreground">{destination.countryName}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('installation.overallProgress', 'Overall progress')}</span>
            <span className="font-medium">{t('installation.stepsCount', '{{completed}}/{{total}} steps', { completed: completedCount, total: totalSteps })}</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Aspiration Focus */}
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('installation.aspirationFocus', 'Focus for your aspiration')}</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {aspirationFocus.tips.slice(0, 2).map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>

        {/* Country Fast Track */}
        {countrySpecifics.fastTrack && (
          <div className="mt-3 flex flex-wrap gap-2">
            {countrySpecifics.fastTrack.map((item, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-full">
                ⚡ {item}
              </span>
            ))}
          </div>
        )}

        {/* Warnings */}
        {countrySpecifics.warnings && (
          <div className="mt-3 flex flex-wrap gap-2">
            {countrySpecifics.warnings.map((item, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-500 rounded-full">
                ⚠️ {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {timeline.map((phase) => {
            const isExpanded = expandedPhases.includes(phase.id);
            const phaseCompleted = phase.steps.every(step => completedSteps.includes(step.id));
            const PhaseIcon = phase.icon;

            return (
              <div key={phase.id} className="relative mb-6 last:mb-0">
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-muted/50",
                    isExpanded && "bg-muted/30"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 relative z-10",
                    phaseCompleted ? 'bg-emerald-500' : phase.color
                  )}>
                    {phaseCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <PhaseIcon className="w-6 h-6" />
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {phase.duration}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Steps */}
                {isExpanded && (
                  <div className="ml-16 mt-2 space-y-2 animate-in slide-in-from-top-2">
                    {phase.steps.map((step) => {
                      const isCompleted = completedSteps.includes(step.id);

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            isCompleted ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/20 border-border"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleStep(step.id)}
                              className={cn(
                                "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                isCompleted 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : "border-muted-foreground hover:border-primary"
                              )}
                            >
                              {isCompleted && <CheckCircle className="w-3 h-3" />}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "font-medium",
                                  isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {step.title}
                                </h4>
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full",
                                  step.priority === 'critical' && "bg-red-500/20 text-red-500",
                                  step.priority === 'important' && "bg-amber-500/20 text-amber-500",
                                  step.priority === 'optional' && "bg-blue-500/20 text-blue-500"
                                )}>
                                  {step.priority === 'critical' && 'Critique'}
                                  {step.priority === 'important' && 'Important'}
                                  {step.priority === 'optional' && 'Optionnel'}
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground mb-2">
                                {step.description}
                              </p>

                              {step.tips && (
                                <div className="text-xs text-muted-foreground mb-2">
                                  <span className="font-medium">💡 Conseils:</span>
                                  <ul className="ml-4 mt-1 space-y-0.5">
                                    {step.tips.map((tip, i) => (
                                      <li key={i}>• {tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {step.documents && (
                                <div className="text-xs text-muted-foreground mb-2">
                                  <span className="font-medium">📄 Documents:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {step.documents.map((doc, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-muted rounded">
                                        {doc}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.estimatedCost && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">💰 Coût estimé: </span>
                                  <span className="font-medium text-primary">{step.estimatedCost}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Cette timeline est indicative • Les délais varient selon votre situation personnelle
        </p>
      </div>
    </div>
  );
}
