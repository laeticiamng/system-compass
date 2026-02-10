import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, Target, Users, AlertTriangle, DollarSign, 
  Building2, Eye, Plus, Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GovernanceScore, UserGovernanceNotes } from '@/hooks/useCountryGovernance';
import { UserCase } from '@/hooks/useUserCases';

interface GovernanceDeepProps {
  governance: GovernanceScore;
  userNotes?: UserGovernanceNotes | null;
  caseData?: UserCase;
  onUpdateCase?: (updates: Partial<UserCase>) => void;
  onSaveNotes?: (notes: Partial<UserGovernanceNotes>) => void;
}

export function GovernanceDeep({ 
  governance, 
  caseData, 
  onUpdateCase
}: GovernanceDeepProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  // Scores complets (5 axes)
  const fullScores = [
    { id: 'stability', label: t('terrainGovernance.scores.stability'), value: governance.stability_score, desc: governance.stability_notes },
    { id: 'friction', label: t('terrainGovernance.scores.friction'), value: governance.friction_score, desc: governance.friction_notes },
    { id: 'operational', label: t('terrainGovernance.scores.operational'), value: governance.operational_score, desc: governance.operational_notes },
    { id: 'captureRisk', label: t('terrainGovernance.scores.captureRisk'), value: governance.capture_risk_score, desc: governance.capture_risk_notes },
    { id: 'ecosystem', label: t('terrainGovernance.scores.ecosystem'), value: governance.ecosystem_score, desc: governance.ecosystem_notes },
  ];

  const addRiskItem = () => {
    if (!caseData || !onUpdateCase) return;
    const newRisk = {
      id: crypto.randomUUID(),
      category: 'operational',
      description: '',
      probability: 'medium' as const,
      impact: 'medium' as const,
      mitigation: '',
      status: 'open' as const,
    };
    onUpdateCase({
      risk_register: [...(caseData.risk_register || []), newRisk],
    });
  };

  const addGovernanceActor = () => {
    if (!caseData || !onUpdateCase) return;
    const newActor = {
      id: crypto.randomUUID(),
      name: '',
      role: '',
      level: 'official' as const,
      power: 'access' as const,
      reliability: 3 as const,
    };
    onUpdateCase({
      governance_map: [...(caseData.governance_map || []), newActor],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{t('terrainGovernance.deep.title', 'Gouvernance & Stratégie')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('terrainGovernance.deep.subtitle', 'Analyse complète pour projet d\'implantation')}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/30">
          <Building2 className="w-3 h-3 mr-1" />
          B2B
        </Badge>
      </div>

      {/* Scores complets */}
      <div className="grid grid-cols-5 gap-3">
        {fullScores.map(score => (
          <Card key={score.id} className="text-center">
            <CardContent className="p-3">
              <div className={`text-2xl font-bold ${
                score.value >= 4 ? 'text-green-500' : 
                score.value >= 3 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {score.value}/5
              </div>
              <p className="text-xs text-muted-foreground mt-1">{score.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs B2B */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="overview" className="gap-1">
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">{t('terrainGovernance.deep.tabs.overview', 'Vue')}</span>
          </TabsTrigger>
          <TabsTrigger value="riskRegister" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">{t('terrainGovernance.deep.tabs.risks', 'Risques')}</span>
          </TabsTrigger>
          <TabsTrigger value="governanceMap" className="gap-1">
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">{t('terrainGovernance.deep.tabs.actors', 'Acteurs')}</span>
          </TabsTrigger>
          <TabsTrigger value="poc" className="gap-1">
            <Target className="w-3 h-3" />
            <span className="hidden sm:inline">{t('terrainGovernance.deep.tabs.poc', 'POC')}</span>
          </TabsTrigger>
          <TabsTrigger value="cashReality" className="gap-1">
            <DollarSign className="w-3 h-3" />
            <span className="hidden sm:inline">{t('terrainGovernance.deep.tabs.cash', 'Cash')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {fullScores.map(score => (
            <Card key={score.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{score.label}</CardTitle>
                  <Badge variant={score.value >= 4 ? 'default' : score.value >= 3 ? 'secondary' : 'destructive'}>
                    {score.value}/5
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{score.desc || t('common.noData', 'Pas de données')}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Risk Register */}
        <TabsContent value="riskRegister" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t('terrainGovernance.deep.riskRegister', 'Risk Register')}</h4>
            <Button size="sm" onClick={addRiskItem} className="gap-1">
              <Plus className="w-4 h-4" />
              {t('terrainGovernance.deep.addRisk', 'Ajouter')}
            </Button>
          </div>

          {caseData?.risk_register?.length ? (
            <div className="space-y-3">
              {caseData.risk_register.map((risk, idx) => (
                <Card key={risk.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <Input 
                          placeholder={t('terrainGovernance.deep.riskDesc', 'Description du risque')}
                          value={risk.description}
                          onChange={(e) => {
                            const updated = [...caseData.risk_register];
                            updated[idx] = { ...risk, description: e.target.value };
                            onUpdateCase?.({ risk_register: updated });
                          }}
                        />
                        <div className="flex gap-2">
                          <Select 
                            value={risk.probability}
                            onValueChange={(val) => {
                              const updated = [...caseData.risk_register];
                              updated[idx] = { ...risk, probability: val as any };
                              onUpdateCase?.({ risk_register: updated });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{t('terrainGovernance.frictionRisks.severity.low', 'Faible')}</SelectItem>
                              <SelectItem value="medium">{t('terrainGovernance.frictionRisks.severity.medium', 'Moyen')}</SelectItem>
                              <SelectItem value="high">{t('terrainGovernance.frictionRisks.severity.high', 'Élevé')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select 
                            value={risk.impact}
                            onValueChange={(val) => {
                              const updated = [...caseData.risk_register];
                              updated[idx] = { ...risk, impact: val as any };
                              onUpdateCase?.({ risk_register: updated });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{t('terrainGovernance.deep.impactLow', 'Impact faible')}</SelectItem>
                              <SelectItem value="medium">{t('terrainGovernance.deep.impactMedium', 'Impact moyen')}</SelectItem>
                              <SelectItem value="high">{t('terrainGovernance.deep.impactHigh', 'Impact fort')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const updated = caseData.risk_register.filter((_, i) => i !== idx);
                          onUpdateCase?.({ risk_register: updated });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>{t('terrainGovernance.deep.noRisks', 'Aucun risque documenté')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Governance Map */}
        <TabsContent value="governanceMap" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t('terrainGovernance.stakeholders.title', 'Cartographie des acteurs')}</h4>
            <Button size="sm" onClick={addGovernanceActor} className="gap-1">
              <Plus className="w-4 h-4" />
              {t('terrainGovernance.stakeholders.addStakeholder', 'Ajouter')}
            </Button>
          </div>

          {caseData?.governance_map?.length ? (
            <div className="space-y-3">
              {caseData.governance_map.map((actor, idx) => (
                <Card key={actor.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      <Input 
                        placeholder={t('terrainGovernance.stakeholders.name', 'Nom')}
                        value={actor.name}
                        onChange={(e) => {
                          const updated = [...caseData.governance_map];
                          updated[idx] = { ...actor, name: e.target.value };
                          onUpdateCase?.({ governance_map: updated });
                        }}
                      />
                      <Input 
                        placeholder={t('terrainGovernance.stakeholders.role', 'Rôle')}
                        value={actor.role}
                        onChange={(e) => {
                          const updated = [...caseData.governance_map];
                          updated[idx] = { ...actor, role: e.target.value };
                          onUpdateCase?.({ governance_map: updated });
                        }}
                      />
                      <Select 
                        value={actor.power}
                        onValueChange={(val) => {
                          const updated = [...caseData.governance_map];
                          updated[idx] = { ...actor, power: val as any };
                          onUpdateCase?.({ governance_map: updated });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sign">{t('terrainGovernance.stakeholders.power.sign', 'Peut signer')}</SelectItem>
                          <SelectItem value="block">{t('terrainGovernance.stakeholders.power.block', 'Peut bloquer')}</SelectItem>
                          <SelectItem value="access">{t('terrainGovernance.stakeholders.power.access', 'Donne accès')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Badge variant={actor.reliability >= 4 ? 'default' : actor.reliability >= 3 ? 'secondary' : 'destructive'}>
                          {actor.reliability}/5
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const updated = caseData.governance_map.filter((_, i) => i !== idx);
                            onUpdateCase?.({ governance_map: updated });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>{t('terrainGovernance.deep.noActors', 'Aucun acteur cartographié')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* POC Planner */}
        <TabsContent value="poc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('terrainGovernance.poc.title', 'POC Planner')}</CardTitle>
              <CardDescription>{t('terrainGovernance.poc.description', 'Planifiez votre preuve de concept')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('terrainGovernance.poc.hypothesis', 'Hypothèse principale')}</label>
                <Textarea 
                  placeholder={t('terrainGovernance.poc.hypothesisPlaceholder', 'Quelle hypothèse voulez-vous valider ?')}
                  value={caseData?.poc_hypothesis || ''}
                  onChange={(e) => onUpdateCase?.({ poc_hypothesis: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('terrainGovernance.poc.maxBudget', 'Budget maximum')}</label>
                  <Input 
                    type="number"
                    placeholder="10000"
                    value={caseData?.poc_budget || ''}
                    onChange={(e) => onUpdateCase?.({ poc_budget: Number(e.target.value) || null })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('terrainGovernance.poc.duration', 'Durée estimée')}</label>
                  <Input 
                    placeholder="3-6 mois"
                    value={caseData?.poc_duration || ''}
                    onChange={(e) => onUpdateCase?.({ poc_duration: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Reality */}
        <TabsContent value="cashReality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {t('terrainGovernance.deep.cashReality', 'Cash Reality')}
              </CardTitle>
              <CardDescription>
                {t('terrainGovernance.deep.cashRealityDesc', 'Tampon budgétaire recommandé : x3-x5')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">CAPEX estimé</label>
                  <Input 
                    type="number"
                    value={caseData?.cash_reality?.capex_estimated || ''}
                    onChange={(e) => onUpdateCase?.({ 
                      cash_reality: { 
                        ...caseData?.cash_reality, 
                        capex_estimated: Number(e.target.value) || 0 
                      } 
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Multiplicateur tampon</label>
                  <Select 
                    value={String(caseData?.cash_reality?.capex_buffer_multiplier || 3)}
                    onValueChange={(val) => onUpdateCase?.({ 
                      cash_reality: { 
                        ...caseData?.cash_reality, 
                        capex_buffer_multiplier: Number(val) 
                      } 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">x2 (optimiste)</SelectItem>
                      <SelectItem value="3">x3 (réaliste)</SelectItem>
                      <SelectItem value="5">x5 (prudent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {caseData?.cash_reality?.capex_estimated && (
                <Card className="bg-muted/30">
                  <CardContent className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">Budget réaliste recommandé</p>
                    <p className="text-2xl font-bold text-primary">
                      {((caseData.cash_reality.capex_estimated || 0) * (caseData.cash_reality.capex_buffer_multiplier || 3)).toLocaleString()} €
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
