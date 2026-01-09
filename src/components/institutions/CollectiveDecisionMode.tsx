import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  UserCheck,
  Layers,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface Perspective {
  id: string;
  role: string;
  assumptions: string[];
  priorities: string[];
  concerns: string[];
}

export function CollectiveDecisionMode() {
  const { t } = useTranslation();
  const [perspectives, setPerspectives] = useState<Perspective[]>([
    {
      id: '1',
      role: t('institutions.collective.roles.direction', 'Direction générale'),
      assumptions: [t('institutions.collective.example.assumption1', 'Le marché va continuer à croître')],
      priorities: [t('institutions.collective.example.priority1', 'Rentabilité à court terme')],
      concerns: [t('institutions.collective.example.concern1', 'Pression des actionnaires')]
    },
    {
      id: '2',
      role: t('institutions.collective.roles.operations', 'Opérations'),
      assumptions: [t('institutions.collective.example.assumption2', 'Les équipes peuvent absorber la charge')],
      priorities: [t('institutions.collective.example.priority2', 'Stabilité des processus')],
      concerns: [t('institutions.collective.example.concern2', 'Fatigue des équipes')]
    }
  ]);
  const [newRole, setNewRole] = useState('');
  const [analysisStep, setAnalysisStep] = useState<'input' | 'analysis'>('input');

  const addPerspective = () => {
    if (newRole.trim()) {
      setPerspectives([
        ...perspectives,
        {
          id: Date.now().toString(),
          role: newRole,
          assumptions: [],
          priorities: [],
          concerns: []
        }
      ]);
      setNewRole('');
    }
  };

  const removePerspective = (id: string) => {
    setPerspectives(perspectives.filter(p => p.id !== id));
  };

  const updatePerspective = (id: string, field: keyof Perspective, value: string[]) => {
    setPerspectives(perspectives.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Mock analysis results
  const analysisResults = {
    consensus: [
      t('institutions.collective.analysis.consensus1', 'Besoin d\'agir rapidement'),
      t('institutions.collective.analysis.consensus2', 'Importance de la communication interne')
    ],
    divergences: [
      { 
        topic: t('institutions.collective.analysis.div1.topic', 'Horizon temporel'),
        perspectives: [
          { role: t('institutions.collective.roles.direction', 'Direction'), view: t('institutions.collective.analysis.div1.dir', 'Résultats trimestriels') },
          { role: t('institutions.collective.roles.operations', 'Opérations'), view: t('institutions.collective.analysis.div1.ops', 'Vision à 2-3 ans') }
        ]
      },
      { 
        topic: t('institutions.collective.analysis.div2.topic', 'Tolérance au risque'),
        perspectives: [
          { role: t('institutions.collective.roles.direction', 'Direction'), view: t('institutions.collective.analysis.div2.dir', 'Prêt à parier gros') },
          { role: t('institutions.collective.roles.operations', 'Opérations'), view: t('institutions.collective.analysis.div2.ops', 'Préférence pour la prudence') }
        ]
      }
    ],
    implicitAssumptions: [
      t('institutions.collective.analysis.implicit1', 'Tous supposent que les ressources actuelles suffiront'),
      t('institutions.collective.analysis.implicit2', 'Aucun n\'a mentionné les contraintes légales'),
      t('institutions.collective.analysis.implicit3', 'L\'impact client n\'a pas été explicitement discuté')
    ]
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          {t('institutions.collective.title', 'Mode "Décision collective"')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('institutions.collective.subtitle', 'Simuler une décision à plusieurs points de vue pour mettre en évidence divergences, consensus et hypothèses implicites.')}
        </p>
      </div>

      {/* Key Principle */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-blue-600">
            <MessageSquare className="w-5 h-5" />
            <p className="font-medium">
              {t('institutions.collective.principle', 'Outil d\'alignement cognitif, pas de vote. L\'objectif est de comprendre, pas de trancher.')}
            </p>
          </div>
        </CardContent>
      </Card>

      {analysisStep === 'input' ? (
        <>
          {/* Perspectives Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                {t('institutions.collective.perspectives.title', 'Points de vue à simuler')}
              </CardTitle>
              <CardDescription>
                {t('institutions.collective.perspectives.desc', 'Ajoutez les différents acteurs ou rôles impliqués dans la décision')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new perspective */}
              <div className="flex gap-2">
                <Input
                  placeholder={t('institutions.collective.addRole', 'Ajouter un rôle (ex: Finance, RH, Juridique...)')}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPerspective()}
                />
                <Button onClick={addPerspective} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Perspectives list */}
              <div className="space-y-4">
                {perspectives.map((perspective) => (
                  <Card key={perspective.id} className="border-dashed">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {perspective.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removePerspective(perspective.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t('institutions.collective.assumptions', 'Hypothèses de ce point de vue')}
                        </Label>
                        <Textarea
                          placeholder={t('institutions.collective.assumptionsPlaceholder', 'Quelles hypothèses ce rôle fait-il implicitement ?')}
                          className="mt-1 min-h-[60px]"
                          value={perspective.assumptions.join('\n')}
                          onChange={(e) => updatePerspective(perspective.id, 'assumptions', e.target.value.split('\n').filter(Boolean))}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {t('institutions.collective.priorities', 'Priorités')}
                          </Label>
                          <Textarea
                            placeholder={t('institutions.collective.prioritiesPlaceholder', 'Ce qui compte le plus pour ce rôle')}
                            className="mt-1 min-h-[60px]"
                            value={perspective.priorities.join('\n')}
                            onChange={(e) => updatePerspective(perspective.id, 'priorities', e.target.value.split('\n').filter(Boolean))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            {t('institutions.collective.concerns', 'Préoccupations')}
                          </Label>
                          <Textarea
                            placeholder={t('institutions.collective.concernsPlaceholder', 'Ce qui inquiète ce rôle')}
                            className="mt-1 min-h-[60px]"
                            value={perspective.concerns.join('\n')}
                            onChange={(e) => updatePerspective(perspective.id, 'concerns', e.target.value.split('\n').filter(Boolean))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {perspectives.length >= 2 && (
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => setAnalysisStep('analysis')}
                >
                  {t('institutions.collective.analyze', 'Analyser les perspectives')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Analysis Results */}
          <div className="space-y-6">
            {/* Consensus */}
            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  {t('institutions.collective.analysis.consensusTitle', 'Zones de consensus')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResults.consensus.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Divergences */}
            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  {t('institutions.collective.analysis.divergencesTitle', 'Divergences de perception')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResults.divergences.map((div, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium mb-3">{div.topic}</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {div.perspectives.map((p, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Badge variant="outline" className="flex-shrink-0">{p.role}</Badge>
                          <span className="text-sm text-muted-foreground">{p.view}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Implicit Assumptions */}
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Eye className="w-5 h-5" />
                  {t('institutions.collective.analysis.implicitTitle', 'Hypothèses implicites détectées')}
                </CardTitle>
                <CardDescription>
                  {t('institutions.collective.analysis.implicitDesc', 'Ce que personne n\'a explicitement mentionné mais qui sous-tend les positions')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResults.implicitAssumptions.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Reset */}
            <div className="text-center">
              <Button variant="outline" onClick={() => setAnalysisStep('input')}>
                {t('institutions.collective.newAnalysis', 'Nouvelle analyse')}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('institutions.collective.disclaimer', 'Cette analyse met en lumière des patterns. Elle n\'émet aucun jugement et ne recommande aucune position. L\'alignement final reste une décision humaine.')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
