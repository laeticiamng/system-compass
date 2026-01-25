import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePmoCompliance,
  FRAMEWORK_TYPE_LABELS,
  REQUIREMENT_STATUS_LABELS,
  CRITICALITY_LABELS,
  type FrameworkType,
  type RequirementStatus,
  type Criticality,
  type CreateFrameworkForm,
  type CreateRequirementForm,
} from '@/hooks/usePmoCompliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Plus, Shield, FileCheck, AlertTriangle,
  Loader2, Trash2, CheckCircle2, XCircle, Clock, ChevronRight
} from 'lucide-react';

interface ComplianceMatrixProps {
  caseId: string;
  isAdvancedMode?: boolean;
}

export function ComplianceMatrix({ caseId, isAdvancedMode = false }: ComplianceMatrixProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  const {
    frameworks,
    stats,
    isLoading,
    isCreating,
    createFramework,
    createRequirement,
    updateRequirementStatus,
    deleteFramework,
    deleteRequirement,
    getRequirementsByFramework,
  } = usePmoCompliance(caseId);

  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);

  const [frameworkForm, setFrameworkForm] = useState<CreateFrameworkForm>({
    framework_type: 'rgpd',
    name: '',
    description: '',
  });

  const [requirementForm, setRequirementForm] = useState<CreateRequirementForm>({
    framework_id: '',
    title: '',
    description: '',
    criticality: 'medium',
    category: '',
  });

  const handleCreateFramework = () => {
    const label = FRAMEWORK_TYPE_LABELS[frameworkForm.framework_type];
    createFramework({
      ...frameworkForm,
      name: frameworkForm.name || label[lang],
    });
    setFrameworkForm({ framework_type: 'rgpd', name: '', description: '' });
    setShowFrameworkDialog(false);
  };

  const handleCreateRequirement = () => {
    if (!selectedFrameworkId) return;
    createRequirement({
      ...requirementForm,
      framework_id: selectedFrameworkId,
    });
    setRequirementForm({
      framework_id: '',
      title: '',
      description: '',
      criticality: 'medium',
      category: '',
    });
    setShowRequirementDialog(false);
  };

  const getStatusIcon = (status: RequirementStatus) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'not_applicable':
        return <ChevronRight className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
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
            <Shield className="w-6 h-6 text-amber-600" />
            {t('pmo.compliance.title', 'Matrice de Conformité')}
          </h2>
          <p className="text-muted-foreground">
            {t('pmo.compliance.subtitle', 'RGPD, AI Act, MDR, EHDS et autres réglementations')}
          </p>
        </div>

        <Dialog open={showFrameworkDialog} onOpenChange={setShowFrameworkDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('pmo.compliance.addFramework', 'Ajouter un cadre')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('pmo.compliance.newFramework', 'Nouveau cadre réglementaire')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{t('pmo.compliance.frameworkType', 'Type de cadre')}</Label>
                <Select
                  value={frameworkForm.framework_type}
                  onValueChange={(v) => setFrameworkForm(f => ({ ...f, framework_type: v as FrameworkType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(FRAMEWORK_TYPE_LABELS) as FrameworkType[]).map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex flex-col">
                          <span>{FRAMEWORK_TYPE_LABELS[type][lang]}</span>
                          <span className="text-xs text-muted-foreground">{FRAMEWORK_TYPE_LABELS[type].description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('pmo.form.name', 'Nom')} ({t('pmo.optional', 'optionnel')})</Label>
                <Input
                  value={frameworkForm.name}
                  onChange={(e) => setFrameworkForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={FRAMEWORK_TYPE_LABELS[frameworkForm.framework_type][lang]}
                />
              </div>

              <div>
                <Label>{t('pmo.form.description', 'Description')}</Label>
                <Textarea
                  value={frameworkForm.description || ''}
                  onChange={(e) => setFrameworkForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={t('pmo.compliance.descPlaceholder', 'Notes sur le périmètre...')}
                />
              </div>

              {isAdvancedMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('pmo.compliance.version', 'Version')}</Label>
                    <Input
                      value={frameworkForm.version || ''}
                      onChange={(e) => setFrameworkForm(f => ({ ...f, version: e.target.value }))}
                      placeholder="v2023"
                    />
                  </div>
                  <div>
                    <Label>{t('pmo.compliance.sourceUrl', 'Source URL')}</Label>
                    <Input
                      value={frameworkForm.source_url || ''}
                      onChange={(e) => setFrameworkForm(f => ({ ...f, source_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateFramework}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('pmo.form.create', 'Créer')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Dashboard */}
      {stats.totalFrameworks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalRequirements}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.compliance.totalReq', 'Exigences')}</p>
            </CardContent>
          </Card>
          <Card className={stats.complianceRate >= 80 ? 'border-primary' : stats.complianceRate >= 50 ? 'border-warning' : 'border-destructive'}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.complianceRate}%</div>
              <p className="text-sm text-muted-foreground">{t('pmo.compliance.rate', 'Taux de conformité')}</p>
              <Progress value={stats.complianceRate} className="h-1 mt-2" />
            </CardContent>
          </Card>
          <Card className={stats.criticalGaps > 0 ? 'border-destructive' : ''}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-destructive">{stats.criticalGaps}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.compliance.criticalGaps', 'Gaps critiques')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.inProgressRequirements}</div>
              <p className="text-sm text-muted-foreground">{t('pmo.compliance.inProgress', 'En cours')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Frameworks List */}
      {frameworks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('pmo.compliance.noFrameworks', 'Aucun cadre réglementaire activé')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('pmo.compliance.noFrameworksHint', 'Activez les réglementations applicables à votre projet')}
            </p>
            <Button onClick={() => setShowFrameworkDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('pmo.compliance.activateFirst', 'Activer un cadre')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {frameworks.map(framework => {
            const frameworkReqs = getRequirementsByFramework(framework.id);
            const compliantCount = frameworkReqs.filter(r => r.status === 'compliant').length;
            const progress = frameworkReqs.length > 0 ? Math.round((compliantCount / frameworkReqs.length) * 100) : 0;

            return (
              <AccordionItem key={framework.id} value={framework.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-amber-600" />
                      <div className="text-left">
                        <div className="font-medium">{framework.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {FRAMEWORK_TYPE_LABELS[framework.framework_type as FrameworkType]?.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{frameworkReqs.length} exigences</Badge>
                      <div className="w-24">
                        <Progress value={progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Add Requirement Button */}
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {framework.description || t('pmo.compliance.noDescription', 'Pas de description')}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFrameworkId(framework.id);
                            setShowRequirementDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t('pmo.compliance.addRequirement', 'Exigence')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteFramework(framework.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Requirements List */}
                    {frameworkReqs.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        {t('pmo.compliance.noRequirements', 'Aucune exigence définie')}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {frameworkReqs.map(req => (
                          <Card key={req.id} className="border-l-4" style={{
                            borderLeftColor: req.criticality === 'critical' ? '#ef4444' :
                              req.criticality === 'high' ? '#f97316' :
                              req.criticality === 'medium' ? '#eab308' : '#9ca3af'
                          }}>
                            <CardContent className="py-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  {getStatusIcon(req.status as RequirementStatus)}
                                  <div>
                                    <div className="font-medium text-sm">
                                      {req.requirement_code && (
                                        <span className="text-muted-foreground mr-2">[{req.requirement_code}]</span>
                                      )}
                                      {req.title}
                                    </div>
                                    {req.description && (
                                      <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={CRITICALITY_LABELS[req.criticality as Criticality]?.color}>
                                    {CRITICALITY_LABELS[req.criticality as Criticality]?.[lang]}
                                  </Badge>
                                  <Select
                                    value={req.status}
                                    onValueChange={(status) => updateRequirementStatus({ id: req.id, status: status as RequirementStatus })}
                                  >
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(Object.keys(REQUIREMENT_STATUS_LABELS) as RequirementStatus[]).map(s => (
                                        <SelectItem key={s} value={s}>
                                          {REQUIREMENT_STATUS_LABELS[s][lang]}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive h-8 w-8 p-0"
                                    onClick={() => deleteRequirement(req.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Requirement Dialog */}
      <Dialog open={showRequirementDialog} onOpenChange={setShowRequirementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pmo.compliance.newRequirement', 'Nouvelle exigence')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label>{t('pmo.compliance.code', 'Code')}</Label>
                <Input
                  value={requirementForm.requirement_code || ''}
                  onChange={(e) => setRequirementForm(f => ({ ...f, requirement_code: e.target.value }))}
                  placeholder="ART-6"
                />
              </div>
              <div className="col-span-2">
                <Label>{t('pmo.form.title', 'Titre')}</Label>
                <Input
                  value={requirementForm.title}
                  onChange={(e) => setRequirementForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={t('pmo.compliance.titlePlaceholder', 'Ex: Base légale du traitement')}
                />
              </div>
            </div>

            <div>
              <Label>{t('pmo.form.description', 'Description')}</Label>
              <Textarea
                value={requirementForm.description || ''}
                onChange={(e) => setRequirementForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t('pmo.compliance.reqDescPlaceholder', 'Décrivez l\'exigence...')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('pmo.compliance.criticality', 'Criticité')}</Label>
                <Select
                  value={requirementForm.criticality}
                  onValueChange={(v) => setRequirementForm(f => ({ ...f, criticality: v as Criticality }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CRITICALITY_LABELS) as Criticality[]).map(c => (
                      <SelectItem key={c} value={c}>
                        {CRITICALITY_LABELS[c][lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('pmo.compliance.category', 'Catégorie')}</Label>
                <Input
                  value={requirementForm.category || ''}
                  onChange={(e) => setRequirementForm(f => ({ ...f, category: e.target.value }))}
                  placeholder={t('pmo.compliance.categoryPlaceholder', 'Ex: Données personnelles')}
                />
              </div>
            </div>

            {isAdvancedMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('pmo.compliance.sourceRef', 'Référence source')}</Label>
                  <Input
                    value={requirementForm.source_reference || ''}
                    onChange={(e) => setRequirementForm(f => ({ ...f, source_reference: e.target.value }))}
                    placeholder="Article 6, paragraphe 1"
                  />
                </div>
                <div>
                  <Label>{t('pmo.compliance.dueDate', 'Échéance')}</Label>
                  <Input
                    type="date"
                    value={requirementForm.due_date || ''}
                    onChange={(e) => setRequirementForm(f => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateRequirement}
              disabled={!requirementForm.title}
              className="w-full"
            >
              {t('pmo.form.create', 'Créer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
