import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  FileText,
  Eye,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  Bookmark
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SimulationRecord {
  id: string;
  date: Date;
  title: string;
  type: 'strategic' | 'hr' | 'project' | 'crisis' | 'longterm';
  participants: string[];
  hypotheses: string[];
  scenariosExplored: string[];
  blindSpotsIdentified: string[];
  status: 'draft' | 'reviewed' | 'archived';
}

export function DecisionTraceability() {
  const { t } = useTranslation();
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  // Mock simulation history
  const simulationHistory: SimulationRecord[] = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      title: t('institutions.traceability.example1.title', 'Expansion marché APAC'),
      type: 'strategic',
      participants: ['Direction générale', 'Finance', 'Commercial'],
      hypotheses: [
        t('institutions.traceability.example1.hyp1', 'Croissance du marché asiatique de 8%/an'),
        t('institutions.traceability.example1.hyp2', 'Capacité de recrutement local disponible'),
        t('institutions.traceability.example1.hyp3', 'Partenaire distributeur fiable identifié')
      ],
      scenariosExplored: [
        t('institutions.traceability.example1.scen1', 'Entrée via filiale'),
        t('institutions.traceability.example1.scen2', 'Entrée via joint-venture'),
        t('institutions.traceability.example1.scen3', 'Entrée via acquisition')
      ],
      blindSpotsIdentified: [
        t('institutions.traceability.example1.blind1', 'Risques géopolitiques non quantifiés'),
        t('institutions.traceability.example1.blind2', 'Barrières culturelles sous-estimées')
      ],
      status: 'reviewed'
    },
    {
      id: '2',
      date: new Date('2024-01-10'),
      title: t('institutions.traceability.example2.title', 'Réorganisation équipe produit'),
      type: 'hr',
      participants: ['RH', 'Direction produit', 'Tech'],
      hypotheses: [
        t('institutions.traceability.example2.hyp1', 'Pas de départs volontaires majeurs'),
        t('institutions.traceability.example2.hyp2', 'Formation interne suffisante')
      ],
      scenariosExplored: [
        t('institutions.traceability.example2.scen1', 'Fusion des équipes'),
        t('institutions.traceability.example2.scen2', 'Création d\'une équipe transverse')
      ],
      blindSpotsIdentified: [
        t('institutions.traceability.example2.blind1', 'Impact sur la motivation non mesuré')
      ],
      status: 'draft'
    }
  ];

  const typeColors: Record<string, { bg: string; text: string }> = {
    strategic: { bg: 'bg-primary/10', text: 'text-primary' },
    hr: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
    project: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    crisis: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
    longterm: { bg: 'bg-purple-500/10', text: 'text-purple-600' }
  };

  const typeLabels: Record<string, string> = {
    strategic: t('institutions.useCases.strategic.title', 'Arbitrage stratégique'),
    hr: t('institutions.useCases.hr.title', 'Décisions RH'),
    project: t('institutions.useCases.project.title', 'Projets'),
    crisis: t('institutions.useCases.crisis.title', 'Gestion de crise'),
    longterm: t('institutions.useCases.longterm.title', 'Orientation long terme')
  };

  const statusConfig = {
    draft: { label: t('institutions.traceability.status.draft', 'Brouillon'), color: 'bg-muted text-muted-foreground' },
    reviewed: { label: t('institutions.traceability.status.reviewed', 'Validé'), color: 'bg-emerald-500/10 text-emerald-600' },
    archived: { label: t('institutions.traceability.status.archived', 'Archivé'), color: 'bg-gray-500/10 text-gray-600' }
  };

  const selectedSimulation = simulationHistory.find(s => s.id === selectedRecord);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
          <History className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          {t('institutions.traceability.title', 'Traçabilité & Prévention')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('institutions.traceability.subtitle', 'Historique des simulations et visualisation des hypothèses retenues pour éviter les biais rétrospectifs.')}
        </p>
      </div>

      {/* Purpose Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="border-purple-500/20">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                {t('institutions.traceability.purpose1.title', 'Éviter les biais rétrospectifs')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('institutions.traceability.purpose1.desc', 'Documenter ce qui était connu au moment de la décision, pas après coup.')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                {t('institutions.traceability.purpose2.title', 'Documenter le raisonnement')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('institutions.traceability.purpose2.desc', 'Tracer le processus de réflexion, pas seulement la décision finale.')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Simulation List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            {t('institutions.traceability.history', 'Historique des simulations')}
          </h3>
          
          <div className="space-y-2">
            {simulationHistory.map((sim) => {
              const colors = typeColors[sim.type];
              const status = statusConfig[sim.status];
              const isSelected = selectedRecord === sim.id;
              
              return (
                <Card 
                  key={sim.id}
                  className={`cursor-pointer transition-all hover:border-primary/30 ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`}
                  onClick={() => setSelectedRecord(sim.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                        {typeLabels[sim.type]}
                      </Badge>
                      <Badge variant="outline" className={`${status.color} text-xs`}>
                        {status.label}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{sim.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(sim.date, 'dd MMM yyyy', { locale: fr })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {simulationHistory.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('institutions.traceability.noHistory', 'Aucune simulation enregistrée')}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Simulation Detail */}
        <div className="lg:col-span-2">
          {selectedSimulation ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedSimulation.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(selectedSimulation.date, 'EEEE dd MMMM yyyy', { locale: fr })}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-3 h-3" />
                    {t('institutions.traceability.export', 'Exporter')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Participants */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('institutions.traceability.participants', 'Participants')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSimulation.participants.map((p, i) => (
                      <Badge key={i} variant="secondary">{p}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Hypotheses */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t('institutions.traceability.hypotheses', 'Hypothèses retenues')}
                  </h4>
                  <ul className="space-y-2">
                    {selectedSimulation.hypotheses.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Scenarios */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    {t('institutions.traceability.scenarios', 'Scénarios explorés')}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedSimulation.scenariosExplored.map((s, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Blind Spots */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {t('institutions.traceability.blindSpots', 'Angles morts identifiés')}
                  </h4>
                  <ul className="space-y-2">
                    {selectedSimulation.blindSpotsIdentified.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-600">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
              <CardContent className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>{t('institutions.traceability.selectSimulation', 'Sélectionnez une simulation pour voir les détails')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('institutions.traceability.disclaimer', 'L\'historique documente le raisonnement, pas la décision. Il permet de comprendre le contexte initial sans jugement rétrospectif.')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
