import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePmoRisks } from '@/hooks/usePmoRisks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, AlertTriangle, Shield, Clock, 
  Loader2, Trash2, AlertCircle, CheckCircle
} from 'lucide-react';
import { isPast, format } from 'date-fns';
import { 
  calculateRiskScore, 
  getRiskSeverity,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  type RiskCategory,
  type RiskStatus,
  type CreateRiskForm 
} from '@/lib/pmo-types';

interface RiskEngineProps {
  caseId: string;
  isAdvancedMode?: boolean;
}

export function RiskEngine({ caseId, isAdvancedMode = false }: RiskEngineProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  
  const { 
    risks, 
    kpis,
    isLoading,
    isCreating,
    createRisk,
    updateRisk,
    deleteRisk,
  } = usePmoRisks(caseId);

  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [riskForm, setRiskForm] = useState<CreateRiskForm>({
    title: '',
    description: '',
    category: 'operational',
    impact: 3,
    probability: 3,
  });

  const handleCreateRisk = () => {
    createRisk(riskForm);
    setRiskForm({
      title: '',
      description: '',
      category: 'operational',
      impact: 3,
      probability: 3,
    });
    setShowRiskDialog(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStatusIcon = (status: RiskStatus) => {
    switch (status) {
      case 'closed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'escalated': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'mitigating': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            {isAdvancedMode 
              ? t('pmo.risks.title', 'Registre des Risques')
              : t('pmo.risks.titleSimple', 'Points d\'attention')
            }
          </h2>
          <p className="text-muted-foreground">
            {isAdvancedMode
              ? t('pmo.risks.subtitle', 'Identification, scoring et mitigation')
              : t('pmo.risks.subtitleSimple', 'Ce qui pourrait freiner votre projet')
            }
          </p>
        </div>
        
        <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {isAdvancedMode 
                ? t('pmo.risks.addRisk', 'Nouveau risque')
                : t('pmo.risks.addConcern', 'Ajouter un point')
              }
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isAdvancedMode 
                  ? t('pmo.risks.newRisk', 'Identifier un risque')
                  : t('pmo.risks.newConcern', 'Nouveau point d\'attention')
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{t('pmo.form.title', 'Titre')}</Label>
                <Input
                  value={riskForm.title}
                  onChange={(e) => setRiskForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={t('pmo.risks.titlePlaceholder', 'Ex: Délai de visa incertain')}
                />
              </div>
              <div>
                <Label>{t('pmo.form.description', 'Description')}</Label>
                <Textarea
                  value={riskForm.description}
                  onChange={(e) => setRiskForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={t('pmo.risks.descPlaceholder', 'Décrivez le risque et ses causes potentielles...')}
                />
              </div>
              
              {isAdvancedMode && (
                <div>
                  <Label>{t('pmo.form.category', 'Catégorie')}</Label>
                  <Select
                    value={riskForm.category}
                    onValueChange={(v) => setRiskForm(f => ({ ...f, category: v as RiskCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(RISK_CATEGORY_LABELS) as RiskCategory[]).map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {RISK_CATEGORY_LABELS[cat][lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('pmo.risks.impact', 'Impact')} ({riskForm.impact}/5)</Label>
                  <Slider
                    value={[riskForm.impact]}
                    onValueChange={([v]) => setRiskForm(f => ({ ...f, impact: v }))}
                    min={1}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t('pmo.risks.probability', 'Probabilité')} ({riskForm.probability}/5)</Label>
                  <Slider
                    value={[riskForm.probability]}
                    onValueChange={([v]) => setRiskForm(f => ({ ...f, probability: v }))}
                    min={1}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('pmo.risks.score', 'Score de risque')}</span>
                  <Badge className={getSeverityColor(getRiskSeverity(calculateRiskScore(riskForm.impact, riskForm.probability)))}>
                    {calculateRiskScore(riskForm.impact, riskForm.probability)} - {getRiskSeverity(calculateRiskScore(riskForm.impact, riskForm.probability))}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>{t('pmo.risks.mitigation', 'Plan de mitigation')}</Label>
                <Textarea
                  value={riskForm.mitigation_plan || ''}
                  onChange={(e) => setRiskForm(f => ({ ...f, mitigation_plan: e.target.value }))}
                  placeholder={t('pmo.risks.mitigationPlaceholder', 'Quelles actions pour réduire ce risque ?')}
                />
              </div>

              <Button 
                onClick={handleCreateRisk} 
                disabled={!riskForm.title || !riskForm.description || isCreating}
                className="w-full"
              >
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('pmo.form.create', 'Créer')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Dashboard */}
      {isAdvancedMode && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{kpis.total_risks}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.risks.kpi.total', 'Total')}</p>
            </CardContent>
          </Card>
          <Card className={kpis.critical_risks > 0 ? 'border-red-500' : ''}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{kpis.critical_risks}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.risks.kpi.critical', 'Critiques')}</p>
            </CardContent>
          </Card>
          <Card className={kpis.risks_without_owner > 0 ? 'border-orange-500' : ''}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{kpis.risks_without_owner}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.risks.kpi.noOwner', 'Sans owner')}</p>
            </CardContent>
          </Card>
          <Card className={kpis.risks_without_mitigation > 0 ? 'border-yellow-500' : ''}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{kpis.risks_without_mitigation}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.risks.kpi.noMitigation', 'Sans plan')}</p>
            </CardContent>
          </Card>
          <Card className={kpis.overdue_reviews > 0 ? 'border-purple-500' : ''}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{kpis.overdue_reviews}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.risks.kpi.overdueReviews', 'Revues en retard')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isAdvancedMode 
                  ? t('pmo.risks.empty', 'Aucun risque identifié')
                  : t('pmo.risks.emptySimple', 'Aucun point d\'attention')
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('pmo.risks.emptyHint', 'Identifiez les risques pour mieux les anticiper')}
              </p>
              <Button onClick={() => setShowRiskDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('pmo.risks.addFirst', 'Identifier un risque')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          risks.map(risk => {
            const score = calculateRiskScore(risk.impact, risk.probability);
            const severity = getRiskSeverity(score);
            const isOverdue = risk.next_review_date && isPast(new Date(risk.next_review_date));

            return (
              <Card 
                key={risk.id} 
                className={`border-l-4 ${
                  severity === 'critical' ? 'border-l-red-500' :
                  severity === 'high' ? 'border-l-orange-500' :
                  severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(risk.status as RiskStatus)}
                      <div>
                        <CardTitle className="text-base">{risk.title}</CardTitle>
                        <CardDescription className="mt-1">{risk.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(severity)}>
                        {score} - {severity.toUpperCase()}
                      </Badge>
                      {isAdvancedMode && (
                        <Badge variant="outline">
                          {RISK_CATEGORY_LABELS[risk.category as RiskCategory]?.[lang]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Impact & Probability */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('pmo.risks.impact', 'Impact')}</span>
                        <span className="font-medium">{risk.impact}/5</span>
                      </div>
                      <Progress value={risk.impact * 20} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('pmo.risks.probability', 'Probabilité')}</span>
                        <span className="font-medium">{risk.probability}/5</span>
                      </div>
                      <Progress value={risk.probability * 20} className="h-2" />
                    </div>

                    {/* Mitigation */}
                    <div>
                      <div className="text-sm font-medium mb-1">{t('pmo.risks.mitigation', 'Mitigation')}</div>
                      {risk.mitigation_plan ? (
                        <p className="text-sm text-muted-foreground">{risk.mitigation_plan}</p>
                      ) : (
                        <p className="text-sm text-orange-600 italic">
                          {t('pmo.risks.noMitigation', 'Aucun plan défini')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-red-600">
                          <Clock className="w-3 h-3" />
                          {t('pmo.risks.overdueReview', 'Revue en retard')}
                        </span>
                      )}
                      {risk.next_review_date && !isOverdue && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t('pmo.risks.nextReview', 'Prochaine revue')}: {format(new Date(risk.next_review_date), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={risk.status}
                        onValueChange={(status) => updateRisk({ id: risk.id, updates: { status: status as RiskStatus } })}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(RISK_STATUS_LABELS) as RiskStatus[]).map(s => (
                            <SelectItem key={s} value={s}>
                              {RISK_STATUS_LABELS[s][lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => deleteRisk(risk.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
