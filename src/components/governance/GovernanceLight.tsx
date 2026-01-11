import { useTranslation } from 'react-i18next';
import { Shield, Clock, AlertTriangle, CheckCircle2, HelpCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GovernanceScore } from '@/hooks/useCountryGovernance';

interface GovernanceLightProps {
  governance: GovernanceScore;
  onClarificationToggle?: (id: string, done: boolean) => void;
  clarificationsDone?: string[];
}

export function GovernanceLight({ governance, onClarificationToggle, clarificationsDone = [] }: GovernanceLightProps) {
  const { t } = useTranslation();

  // Scores simplifiés pour LIGHT (3 max)
  const lightScores = [
    {
      id: 'stability',
      label: t('terrainGovernance.light.stability', 'Prévisibilité'),
      value: governance.stability_score,
      description: t('terrainGovernance.light.stabilityDesc', 'Les règles sont-elles stables et appliquées ?'),
    },
    {
      id: 'friction',
      label: t('terrainGovernance.light.friction', 'Friction administrative'),
      value: 6 - governance.friction_score, // Inverser : friction élevée = score faible
      description: t('terrainGovernance.light.frictionDesc', 'Complexité des démarches quotidiennes'),
    },
    {
      id: 'timeline',
      label: t('terrainGovernance.light.timeline', 'Délais réels'),
      value: governance.operational_score,
      description: t('terrainGovernance.light.timelineDesc', 'Temps réel vs temps annoncé'),
    },
  ];

  // Red flags extraits de friction_risks
  const redFlags = governance.friction_risks?.redFlags?.filter(rf => rf.severity === 'high') || [];

  // Checklist simplifiée pour relocation
  const adminChecklist = [
    { id: 'visa', label: t('terrainGovernance.light.checklist.visa', 'Type de visa identifié'), checked: false },
    { id: 'housing', label: t('terrainGovernance.light.checklist.housing', 'Logement (avant arrivée ou sur place ?)'), checked: false },
    { id: 'bank', label: t('terrainGovernance.light.checklist.bank', 'Ouverture compte bancaire'), checked: false },
    { id: 'health', label: t('terrainGovernance.light.checklist.health', 'Couverture santé'), checked: false },
    { id: 'taxes', label: t('terrainGovernance.light.checklist.taxes', 'Résidence fiscale'), checked: false },
    { id: 'network', label: t('terrainGovernance.light.checklist.network', 'Premiers contacts sur place'), checked: false },
  ];

  // "Ce qu'on comprend trop tard" - tiré des erreurs courantes
  const tooLate = [
    t('terrainGovernance.light.tooLate.1', 'Les délais annoncés sont rarement les délais réels'),
    t('terrainGovernance.light.tooLate.2', 'Les intermédiaires non-officiels peuvent créer des dépendances'),
    t('terrainGovernance.light.tooLate.3', 'Le premier logement n\'est souvent pas le bon'),
    t('terrainGovernance.light.tooLate.4', 'Le réseau local compte plus que prévu'),
    t('terrainGovernance.light.tooLate.5', 'La langue administrative diffère du quotidien'),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold">{t('terrainGovernance.light.title', 'Réalité administrative')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('terrainGovernance.light.subtitle', 'Ce qu\'il faut savoir avant de s\'installer')}
          </p>
        </div>
      </div>

      {/* Scores simplifiés */}
      <div className="grid gap-4">
        {lightScores.map(score => (
          <Card key={score.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{score.label}</p>
                  <p className="text-xs text-muted-foreground">{score.description}</p>
                </div>
                <Badge variant={score.value >= 4 ? 'default' : score.value >= 3 ? 'secondary' : 'destructive'}>
                  {score.value}/5
                </Badge>
              </div>
              <Progress value={score.value * 20} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {t('terrainGovernance.light.redFlags', 'Drapeaux rouges')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {redFlags.map(flag => (
                <li key={flag.id} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  {flag.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('terrainGovernance.light.timelineTitle', 'Délais réels estimés')}
          </CardTitle>
          <CardDescription>
            {t('terrainGovernance.light.timelineNote', 'Ajoutez toujours un tampon de 30-50%')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-500/10">
              <p className="text-xs text-muted-foreground">{t('terrainGovernance.timeline.optimistic', 'Optimiste')}</p>
              <p className="font-semibold text-green-600">3-6 mois</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 ring-2 ring-yellow-500/30">
              <p className="text-xs text-muted-foreground">{t('terrainGovernance.timeline.realistic', 'Réaliste')}</p>
              <p className="font-semibold text-yellow-600">6-12 mois</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10">
              <p className="text-xs text-muted-foreground">{t('terrainGovernance.timeline.pessimistic', 'Pessimiste')}</p>
              <p className="font-semibold text-red-600">12-18 mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist démarches */}
      <Accordion type="single" collapsible>
        <AccordionItem value="checklist">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t('terrainGovernance.light.checklistTitle', 'Checklist démarches')}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {adminChecklist.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <Checkbox 
                    id={item.id}
                    checked={clarificationsDone.includes(item.id)}
                    onCheckedChange={(checked) => onClarificationToggle?.(item.id, !!checked)}
                  />
                  <label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Ce qu'on comprend trop tard */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-600">
            <HelpCircle className="w-4 h-4" />
            {t('terrainGovernance.light.tooLateTitle', 'Ce que les gens comprennent trop tard')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tooLate.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
