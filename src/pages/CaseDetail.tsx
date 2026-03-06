import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useUserCase, isDeepMode } from '@/hooks/useUserCases';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';
import { useCountryById } from '@/lib/countries-data';
import { getExtendedCountryMeta } from '@/lib/countries-extended';
import { GovernanceLight, GovernanceDeep } from '@/components/governance';
import { CasePdfExport } from '@/components/cases/CasePdfExport';
import { CaseMilestones } from '@/components/cases/CaseMilestones';
import { MarketStudyWizard } from '@/components/cases/MarketStudyWizard';
import { ActorsMap } from '@/components/cases/ActorsMap';
import { RiskRegisterEnhanced } from '@/components/cases/RiskRegisterEnhanced';
import { StructuralRulesSection } from '@/components/cases/StructuralRulesSection';
import { CaseAIGenerator } from '@/components/cases/CaseAIGenerator';
import { GovernanceAdvanced } from '@/components/cases/GovernanceAdvanced';
import { RoadmapOS, RiskEngine, BudgetRunway, PriorityBoard, EvidenceVault, PmoPdfExport, ComplianceMatrix, AiCitationsDisplay } from '@/components/pmo';
import { usePmoObjectives } from '@/hooks/usePmoObjectives';
import { usePmoInitiatives } from '@/hooks/usePmoInitiatives';
import { usePmoRisks } from '@/hooks/usePmoRisks';
import { usePmoBudget } from '@/hooks/usePmoBudget';
import { usePmoMilestones } from '@/hooks/usePmoMilestones';
import { usePmoCompliance } from '@/hooks/usePmoCompliance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Briefcase, Shield, Target, FileText,
  Clock, Calendar, AlertTriangle, Loader2,
  TrendingUp, Users, FileCheck, LayoutDashboard, CircleDollarSign,
  ListOrdered, Archive, Home, MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
function getFlagEmoji(iso2: string): string {
  const codePoints = iso2.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { caseData, isLoading, updateCase, isUpdating } = useUserCase(id || '');

  // Get country info
  const { country } = useCountryById(caseData?.country_id);
  const extendedMeta = caseData && !country ? getExtendedCountryMeta(caseData.country_id) : null;
  const countryName = country?.name || extendedMeta?.name || caseData?.country_id || '';
  const countryIso2 = country?.iso2 || extendedMeta?.iso2 || '';
  const pyramidType = country?.pyramidType || extendedMeta?.pyramidType || 'HYBRID_TRANSITION';

  // Fetch governance data
  const { governance, isLoading: govLoading } = useCountryGovernance(
    caseData?.country_id || '', 
    pyramidType
  );

  // PMO Hooks - only fetch when case exists and is deep mode
  const isDeepCheck = caseData ? isDeepMode(caseData.intention) : false;
  const { objectives } = usePmoObjectives(isDeepCheck ? id! : null);
  const { initiatives } = usePmoInitiatives(isDeepCheck ? id! : null);
  const { risks } = usePmoRisks(isDeepCheck ? id! : null);
  const { budgetLines } = usePmoBudget(isDeepCheck ? id! : null);
  const { milestones } = usePmoMilestones(isDeepCheck ? id! : null);
  const { stats: complianceStats } = usePmoCompliance(isDeepCheck ? id! : null);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('cases.notFound', 'Dossier non trouvé')}</h1>
          <Button onClick={() => navigate('/dashboard')}>{t('cases.backToDashboard', 'Retour au tableau de bord')}</Button>
        </div>
      </div>
    );
  }

  const isDeep = isDeepMode(caseData.intention);
  const progress = calculateProgress(caseData, isDeep);
  const hasRedFlags = caseData.red_flags_acknowledged.length > 0;

  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-32 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-6xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('cases.backToDashboard', 'Retour au tableau de bord')}
          </Button>
          
          <CasePdfExport 
            caseData={caseData} 
            governanceData={governance}
            countryName={countryName}
          />
        </div>

        {/* Case Header */}
        <div className="glass-card-elevated rounded-xl p-6 mb-8 border-primary/10 glow-card">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Country Flag & Info */}
            <div className="flex items-center gap-4">
              {countryIso2 && <span className="text-5xl">{getFlagEmoji(countryIso2)}</span>}
              <div>
                <h1 className="font-display text-2xl font-bold gold-text">{caseData.title}</h1>
                <p className="text-muted-foreground">{countryName}</p>
              </div>
            </div>

            {/* Badges & Status */}
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <Badge variant={isDeep ? 'default' : 'secondary'} className={`gap-1 ${isDeep ? 'bg-primary/20 text-primary border-primary/30' : ''}`}>
                {isDeep ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                {isDeep 
                  ? t('cases.depth.deep', 'Mode Complet')
                  : t('cases.depth.light', 'Mode Essentiel')
                }
              </Badge>
              <Badge variant="outline" className="border-primary/20">
                {t(`cases.status.${caseData.status}`, caseData.status)}
              </Badge>
              {hasRedFlags && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {caseData.red_flags_acknowledged.length} {t('cases.redFlags', 'alertes')}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t('cases.progress', 'Progression')}
              </span>
              <span className="text-sm font-medium text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
              <Clock className="w-4 h-4 text-primary" />
              {t('cases.scenario', 'Scénario')}: {t(`cases.timeline.${caseData.timeline_scenario}`, caseData.timeline_scenario)}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
              {t('cases.updated', 'Mis à jour')}: {formatDistanceToNow(new Date(caseData.updated_at), { 
                addSuffix: true, 
                locale: i18n.language === 'fr' ? fr : undefined 
              })}
            </span>
          </div>
        </div>

        {/* AI Generator */}
        <CaseAIGenerator
          caseData={caseData}
          countryName={countryName}
          pyramidType={pyramidType}
          onUpdateCase={(updates) => updateCase(updates)}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="governance" className="space-y-6">
          <TabsList className={`grid w-full ${isDeep ? 'grid-cols-12' : 'grid-cols-4'} glass-card border-primary/10 p-1`}>
            <TabsTrigger value="governance" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isDeep 
                  ? t('cases.tabs.governance', 'Gouvernance')
                  : t('cases.tabs.reality', 'Réalité')
                }
              </span>
            </TabsTrigger>
            {isDeep && (
              <>
                <TabsTrigger value="gov-advanced" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.govAdvanced', 'Terrain')}</span>
                </TabsTrigger>
                <TabsTrigger value="market" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.market', 'Marché')}</span>
                </TabsTrigger>
                <TabsTrigger value="actors" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.actors', 'Acteurs')}</span>
                </TabsTrigger>
                <TabsTrigger value="risks" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.risks', 'Risques')}</span>
                </TabsTrigger>
                <TabsTrigger value="rules" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <FileCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.rules', 'Règles')}</span>
                </TabsTrigger>
                {/* PMO Tabs */}
                <TabsTrigger value="pmo-roadmap" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.pmoRoadmap', 'Plan')}</span>
                </TabsTrigger>
                <TabsTrigger value="pmo-risks" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.pmoRisks', 'Risques PMO')}</span>
                </TabsTrigger>
                <TabsTrigger value="pmo-budget" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <CircleDollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.pmoBudget', 'Budget')}</span>
                </TabsTrigger>
                <TabsTrigger value="pmo-priority" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <ListOrdered className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.pmoPriority', 'Priorités')}</span>
                </TabsTrigger>
                <TabsTrigger value="pmo-compliance" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.pmoCompliance', 'Conformité')}</span>
                </TabsTrigger>
                <TabsTrigger value="pmo-evidence" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Archive className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('cases.tabs.pmoEvidence', 'Preuves')}</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="milestones" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cases.tabs.milestones', 'Jalons')}</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cases.tabs.notes', 'Notes')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cases.tabs.settings', 'Paramètres')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Governance Tab */}
          <TabsContent value="governance">
            {govLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : governance ? (
              isDeep ? (
                <GovernanceDeep
                  governance={governance}
                  caseData={caseData}
                  onUpdateCase={(updates) => updateCase(updates)}
                />
              ) : (
                <GovernanceLight
                  governance={governance}
                  clarificationsDone={caseData.clarifications_done.map(c => c.id)}
                  onClarificationToggle={(id, done) => {
                    if (done) {
                      const newDone = [...caseData.clarifications_done, { id, label: id, verified_at: new Date().toISOString() }];
                      const newPending = caseData.clarifications_pending.filter(c => c.id !== id);
                      updateCase({ clarifications_done: newDone, clarifications_pending: newPending });
                    } else {
                      const newDone = caseData.clarifications_done.filter(c => c.id !== id);
                      updateCase({ clarifications_done: newDone });
                    }
                  }}
                />
              )
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {t('cases.noGovernanceData', 'Données de gouvernance non disponibles pour ce pays')}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Governance Advanced Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="gov-advanced">
              <GovernanceAdvanced
                caseData={caseData}
                countryName={countryName}
                countryCode={caseData.country_id}
              />
            </TabsContent>
          )}

          {/* Market Study Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="market">
              <MarketStudyWizard
                caseData={caseData}
                onUpdateCase={(updates) => updateCase(updates)}
                countryName={countryName}
              />
            </TabsContent>
          )}

          {/* Actors Map Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="actors">
              <ActorsMap
                caseData={caseData}
                onUpdateCase={(updates) => updateCase(updates)}
              />
            </TabsContent>
          )}

          {/* Risk Register Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="risks">
              <RiskRegisterEnhanced
                caseData={caseData}
                onUpdateCase={(updates) => updateCase(updates)}
              />
            </TabsContent>
          )}

          {/* Structural Rules Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="rules">
              <StructuralRulesSection
                caseData={caseData}
                onUpdateCase={(updates) => updateCase(updates)}
                countryName={countryName}
              />
            </TabsContent>
          )}

          {/* PMO Roadmap Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="pmo-roadmap">
              <RoadmapOS caseId={id!} isAdvancedMode={isDeep} />
            </TabsContent>
          )}

          {/* PMO Risk Engine Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="pmo-risks">
              <RiskEngine 
                caseId={id!} 
                isAdvancedMode={isDeep}
                onInitiativeCreated={() => {
                  // Trigger refetch of initiatives when created from risk
                }}
              />
            </TabsContent>
          )}

          {/* PMO Budget Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="pmo-budget">
              <BudgetRunway caseId={id!} />
            </TabsContent>
          )}

          {/* PMO Priority Board Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="pmo-priority">
              <PriorityBoard
                initiatives={initiatives}
                objectives={objectives}
                risks={risks}
                complianceStats={{
                  total: complianceStats.totalRequirements,
                  compliant: complianceStats.compliantRequirements,
                  gaps: complianceStats.nonCompliantRequirements + complianceStats.criticalGaps,
                }}
              />
            </TabsContent>
          )}

          {/* PMO Compliance Matrix Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="pmo-compliance">
              <ComplianceMatrix caseId={id!} isAdvancedMode={isDeep} />
            </TabsContent>
          )}

          {/* PMO Evidence Vault Tab (DEEP only) */}
          {isDeep && (
            <TabsContent value="pmo-evidence">
              <div className="flex justify-end mb-4">
                <PmoPdfExport
                  caseTitle={caseData?.title || 'Dossier'}
                  objectives={objectives}
                  initiatives={initiatives}
                  risks={risks}
                  budgetLines={budgetLines}
                  milestones={milestones}
                  isDeep={isDeep}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <EvidenceVault caseId={id!} />
                </div>
                <div>
                  <AiCitationsDisplay caseId={id!} showAllCitations />
                </div>
              </div>
            </TabsContent>
          )}

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <CaseMilestones
              caseData={caseData}
              onUpdateCase={(updates) => updateCase(updates)}
            />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>{t('cases.notes.title', 'Notes du dossier')}</CardTitle>
                <CardDescription>
                  {t('cases.notes.description', 'Vos observations et points d\'attention')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={caseData.notes || ''}
                  onChange={(e) => updateCase({ notes: e.target.value })}
                  placeholder={t('cases.notes.placeholder', 'Ajoutez vos notes ici...')}
                  className="min-h-[200px]"
                />
                {isUpdating && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('common.saving', 'Enregistrement...')}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{t('cases.settings.title', 'Paramètres du dossier')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timeline Scenario */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('cases.settings.scenario', 'Scénario de timeline')}
                  </label>
                  <Select
                    value={caseData.timeline_scenario}
                    onValueChange={(val: string) => updateCase({ timeline_scenario: val as 'optimistic' | 'realistic' | 'pessimistic' })}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimistic">{t('cases.timeline.optimistic', 'Optimiste')}</SelectItem>
                      <SelectItem value="realistic">{t('cases.timeline.realistic', 'Réaliste')}</SelectItem>
                      <SelectItem value="pessimistic">{t('cases.timeline.pessimistic', 'Pessimiste')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Buffer */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('cases.settings.budgetBuffer', 'Tampon budgétaire (%)')}
                  </label>
                  <Input
                    type="number"
                    value={caseData.budget_buffer_percent}
                    onChange={(e) => updateCase({ budget_buffer_percent: parseInt(e.target.value) || 30 })}
                    className="w-full max-w-xs"
                    min={0}
                    max={500}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('cases.settings.status', 'Statut')}
                  </label>
                  <Select
                    value={caseData.status}
                    onValueChange={(val: string) => updateCase({ status: val as 'draft' | 'active' | 'archived' })}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t('cases.status.draft', 'Brouillon')}</SelectItem>
                      <SelectItem value="active">{t('cases.status.active', 'Actif')}</SelectItem>
                      <SelectItem value="archived">{t('cases.status.archived', 'Archivé')}</SelectItem>
                      <SelectItem value="completed">{t('cases.status.completed', 'Terminé')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('cases.settings.startDate', 'Date de début estimée')}
                    </label>
                    <Input
                      type="date"
                      value={caseData.estimated_start_date || ''}
                      onChange={(e) => updateCase({ estimated_start_date: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('cases.settings.targetDate', 'Date cible')}
                    </label>
                    <Input
                      type="date"
                      value={caseData.target_completion_date || ''}
                      onChange={(e) => updateCase({ target_completion_date: e.target.value || null })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function calculateProgress(caseData: any, isDeep: boolean): number {
  if (isDeep) {
    // For DEEP: progress based on milestones + risk register + governance map
    const milestonesTotal = caseData.milestones.length;
    const milestonesDone = caseData.milestones.filter((m: any) => m.completed).length;
    const hasRisks = caseData.risk_register.length > 0 ? 1 : 0;
    const hasActors = caseData.governance_map.length > 0 ? 1 : 0;
    const hasPOC = caseData.poc_hypothesis ? 1 : 0;
    
    const total = milestonesTotal + 3; // milestones + 3 key sections
    const done = milestonesDone + hasRisks + hasActors + hasPOC;
    
    return total > 0 ? Math.round((done / total) * 100) : 0;
  } else {
    // For LIGHT: progress based on clarifications done
    const total = caseData.clarifications_done.length + caseData.clarifications_pending.length;
    return total > 0 ? Math.round((caseData.clarifications_done.length / total) * 100) : 0;
  }
}
