import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Briefcase,
  GraduationCap, 
  Heart, 
  Building2, 
  Plane,
  Users,
  Rocket,
  Plus
} from 'lucide-react';

interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  prefilledData: {
    title: string;
    description: string;
    objectives: string[];
    milestones: string[];
    risks: string[];
  };
}

const TEMPLATES: CaseTemplate[] = [
  {
    id: 'relocation-job',
    name: 'Expatriation professionnelle',
    description: 'Mutation ou nouveau poste à l\'étranger',
    icon: <Briefcase className="w-5 h-5" />,
    category: 'Carrière',
    prefilledData: {
      title: 'Expatriation - [Pays]',
      description: 'Projet de relocalisation professionnelle',
      objectives: [
        'Obtenir le visa de travail',
        'Sécuriser un logement',
        'Transférer la couverture sociale',
        'Organiser le déménagement',
      ],
      milestones: [
        'Signature du contrat (J0)',
        'Dépôt visa (J+30)',
        'Obtention visa (J+90)',
        'Départ (J+120)',
      ],
      risks: [
        'Refus de visa',
        'Retard administratif',
        'Coût de la vie supérieur au prévu',
      ],
    },
  },
  {
    id: 'study-abroad',
    name: 'Études à l\'étranger',
    description: 'Master, doctorat ou programme d\'échange',
    icon: <GraduationCap className="w-5 h-5" />,
    category: 'Formation',
    prefilledData: {
      title: 'Études - [Université/Pays]',
      description: 'Projet d\'études internationales',
      objectives: [
        'Valider l\'admission',
        'Obtenir le visa étudiant',
        'Trouver un hébergement',
        'Organiser le financement',
      ],
      milestones: [
        'Candidature (J0)',
        'Réponse admission (J+60)',
        'Demande visa (J+90)',
        'Rentrée (J+180)',
      ],
      risks: [
        'Refus d\'admission',
        'Financement insuffisant',
        'Barrière linguistique',
      ],
    },
  },
  {
    id: 'retirement-abroad',
    name: 'Retraite à l\'étranger',
    description: 'Installation pour la retraite',
    icon: <Heart className="w-5 h-5" />,
    category: 'Vie personnelle',
    prefilledData: {
      title: 'Retraite - [Pays]',
      description: 'Projet de retraite à l\'étranger',
      objectives: [
        'Choisir la destination finale',
        'Transférer la pension',
        'Organiser la couverture santé',
        'Vendre/louer le bien actuel',
      ],
      milestones: [
        'Voyage exploratoire (J0)',
        'Décision finale (J+90)',
        'Achat/location (J+180)',
        'Installation (J+365)',
      ],
      risks: [
        'Système de santé inadapté',
        'Isolement social',
        'Fluctuation des taux de change',
      ],
    },
  },
  {
    id: 'business-expansion',
    name: 'Expansion internationale',
    description: 'Ouverture d\'une filiale ou bureau',
    icon: <Building2 className="w-5 h-5" />,
    category: 'Business',
    prefilledData: {
      title: 'Expansion - [Marché cible]',
      description: 'Projet d\'expansion internationale',
      objectives: [
        'Étude de marché approfondie',
        'Créer la structure juridique',
        'Recruter l\'équipe locale',
        'Lancer les opérations',
      ],
      milestones: [
        'Validation du business plan (J0)',
        'Création entité (J+60)',
        'Premiers recrutements (J+120)',
        'Lancement (J+180)',
      ],
      risks: [
        'Barrières réglementaires',
        'Concurrence locale établie',
        'Difficultés de recrutement',
      ],
    },
  },
  {
    id: 'digital-nomad',
    name: 'Nomadisme digital',
    description: 'Travail à distance multi-pays',
    icon: <Plane className="w-5 h-5" />,
    category: 'Lifestyle',
    prefilledData: {
      title: 'Nomadisme digital - Phase 1',
      description: 'Transition vers le travail nomade',
      objectives: [
        'Négocier le télétravail complet',
        'Optimiser la fiscalité',
        'Sélectionner les premiers pays',
        'Organiser l\'assurance voyage',
      ],
      milestones: [
        'Accord employeur (J0)',
        'Premier départ (J+30)',
        'Bilan 3 mois (J+90)',
        'Ajustement stratégie (J+120)',
      ],
      risks: [
        'Problèmes de connectivité',
        'Complexité fiscale',
        'Burnout/isolement',
      ],
    },
  },
  {
    id: 'family-move',
    name: 'Déménagement familial',
    description: 'Installation avec conjoint et enfants',
    icon: <Users className="w-5 h-5" />,
    category: 'Famille',
    prefilledData: {
      title: 'Installation familiale - [Pays]',
      description: 'Projet de relocalisation familiale',
      objectives: [
        'Trouver une école pour les enfants',
        'Organiser le travail du conjoint',
        'Sécuriser un logement adapté',
        'Préparer la transition culturelle',
      ],
      milestones: [
        'Visite exploratoire famille (J0)',
        'Inscription scolaire (J+60)',
        'Déménagement (J+120)',
        'Rentrée enfants (J+150)',
      ],
      risks: [
        'Adaptation difficile des enfants',
        'Emploi du conjoint',
        'Éloignement familial',
      ],
    },
  },
  {
    id: 'startup-launch',
    name: 'Lancement startup',
    description: 'Création d\'entreprise à l\'étranger',
    icon: <Rocket className="w-5 h-5" />,
    category: 'Business',
    prefilledData: {
      title: 'Startup - [Nom/Pays]',
      description: 'Création d\'entreprise internationale',
      objectives: [
        'Valider le product-market fit',
        'Créer la structure juridique',
        'Lever les premiers fonds',
        'Constituer l\'équipe fondatrice',
      ],
      milestones: [
        'MVP validé (J0)',
        'Incorporation (J+30)',
        'Seed round (J+120)',
        'Launch (J+180)',
      ],
      risks: [
        'Visa entrepreneur refusé',
        'Échec levée de fonds',
        'Réglementation locale restrictive',
      ],
    },
  },
];

interface CasePrefillTemplatesProps {
  onSelectTemplate: (template: CaseTemplate) => void;
}

export function CasePrefillTemplates({ onSelectTemplate }: CasePrefillTemplatesProps) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleSelect = (template: CaseTemplate) => {
    setSelectedTemplate(template);
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setShowDialog(false);
    }
  };

  const categories = [...new Set(TEMPLATES.map(t => t.category))];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            {t('dashboard.templates.title', 'Modèles de dossiers')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.templates.subtitle', 'Démarrez rapidement avec un dossier pré-configuré.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TEMPLATES.filter(t => t.category === category).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {template.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.icon}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('dashboard.templates.objectives', 'Objectifs pré-définis')}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedTemplate.prefilledData.objectives.map((obj, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('dashboard.templates.milestones', 'Jalons suggérés')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.prefilledData.milestones.map((ms, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ms}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  {t('dashboard.templates.risks', 'Risques identifiés')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.prefilledData.risks.map((risk, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button onClick={handleConfirm} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('dashboard.templates.create', 'Créer ce dossier')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
