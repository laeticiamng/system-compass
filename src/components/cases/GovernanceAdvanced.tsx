import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Users, Clock, Shield, AlertTriangle, Loader2, 
  Sparkles, RefreshCw, Trash2, Plus, ChevronDown, ChevronUp,
  CheckCircle2, HelpCircle, Link as LinkIcon, Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useGovernanceIntel, GovernanceActor, IntermediationPattern, GovernancePartner, DelayReality } from '@/hooks/useGovernanceIntel';
import { UserCase } from '@/hooks/useUserCases';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GovernanceAdvancedProps {
  caseData: UserCase;
  countryName: string;
  countryCode: string;
}

const ACTOR_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  institution: { label: 'Institution', color: 'bg-blue-500' },
  regulator: { label: 'Régulateur', color: 'bg-purple-500' },
  payer: { label: 'Payeur', color: 'bg-green-500' },
  approver: { label: 'Approbateur', color: 'bg-amber-500' },
  operator: { label: 'Opérateur', color: 'bg-orange-500' },
  judicial: { label: 'Judiciaire', color: 'bg-red-500' },
  local_authority: { label: 'Autorité locale', color: 'bg-teal-500' },
  industry_body: { label: 'Organisation prof.', color: 'bg-indigo-500' },
  supplier: { label: 'Fournisseur', color: 'bg-gray-500' },
  other: { label: 'Autre', color: 'bg-slate-500' },
};

const PATTERN_TYPE_LABELS: Record<string, string> = {
  access_chain: 'Chaîne d\'accès',
  signature_bottleneck: 'Goulot de signature',
  delegated_negotiation: 'Négociation déléguée',
  informal_queue: 'File informelle',
  paper_stuck: 'Dossier bloqué',
  multi_approver: 'Multi-approbateurs',
  joint_venture_requirement: 'Exigence JV',
  payment_delay: 'Retard de paiement',
};

const PARTNER_TYPE_LABELS: Record<string, string> = {
  mandatory_local_partner: 'Partenaire local obligatoire',
  commercial_partner: 'Partenaire commercial',
  implementation_partner: 'Partenaire d\'implémentation',
  distribution_partner: 'Partenaire de distribution',
  equity_partner: 'Partenaire en capital',
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export function GovernanceAdvanced({ caseData, countryName, countryCode }: GovernanceAdvancedProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('actors');
  const [sector, setSector] = useState('');
  const [projectType, setProjectType] = useState('');
  
  const {
    actors,
    patterns,
    partners,
    delays,
    lastRun,
    isLoading,
    isGenerating,
    generateIntel,
    clearAIData,
    deleteActor,
    deletePattern,
    deletePartner,
    deleteDelay,
  } = useGovernanceIntel(caseData.id);

  const handleGenerate = async () => {
    await generateIntel({
      country_code: countryCode,
      country_name: countryName,
      sector: sector || undefined,
      project_type: projectType || undefined,
      intention: String(caseData.intention).toLowerCase().includes('entrepreneur') ? 'entrepreneurship' : 'relocation',
    });
  };

  const totalItems = actors.length + patterns.length + partners.length + delays.length;
  const aiItems = actors.filter(a => a.is_ai_generated).length + 
                  patterns.filter(p => p.is_ai_generated).length +
                  partners.filter(p => p.is_ai_generated).length +
                  delays.filter(d => d.is_ai_generated).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with generation controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('governance.advanced.title', 'Gouvernance avancée')}
              </CardTitle>
              <CardDescription>
                {t('governance.advanced.description', 'Cartographie des acteurs, schémas d\'intermédiation, partenaires et délais réels')}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {totalItems > 0 && (
                <Badge variant="outline">{totalItems} {t('governance.items', 'éléments')}</Badge>
              )}
              {aiItems > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  {aiItems} IA
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Generation form */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('governance.sector', 'Secteur')}
              </label>
              <Input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder={t('governance.sectorPlaceholder', 'ex: santé, finance, télécom...')}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('governance.projectType', 'Type de projet')}
              </label>
              <Input
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder={t('governance.projectTypePlaceholder', 'ex: service numérique, import...')}
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {t('governance.generate', 'Générer avec IA')}
            </Button>
            {aiItems > 0 && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={clearAIData}
                title={t('governance.clearAI', 'Supprimer les données IA')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Last run info */}
          {lastRun && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {t('governance.lastRun', 'Dernière génération')}: {formatDistanceToNow(new Date(lastRun.created_at), { 
                addSuffix: true, 
                locale: i18n.language === 'fr' ? fr : undefined 
              })}
              {lastRun.status === 'completed' && (
                <Badge variant="outline" className="text-xs bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {lastRun.actors_count + lastRun.patterns_count + lastRun.partners_count + lastRun.delays_count} items
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="actors" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governance.tabs.actors', 'Acteurs')}</span>
            {actors.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{actors.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governance.tabs.patterns', 'Intermédiation')}</span>
            {patterns.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{patterns.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governance.tabs.partners', 'Partenaires')}</span>
            {partners.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{partners.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="delays" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governance.tabs.delays', 'Délais')}</span>
            {delays.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{delays.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Actors Tab */}
        <TabsContent value="actors">
          <ActorsSection actors={actors} onDelete={deleteActor} />
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns">
          <PatternsSection patterns={patterns} onDelete={deletePattern} />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <PartnersSection partners={partners} onDelete={deletePartner} />
        </TabsContent>

        {/* Delays Tab */}
        <TabsContent value="delays">
          <DelaysSection delays={delays} onDelete={deleteDelay} />
        </TabsContent>
      </Tabs>

      {/* Prevention notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">{t('governance.notice.title', 'Orientation prévention')}</p>
              <p className="text-muted-foreground">
                {t('governance.notice.text', 'Ces informations décrivent des risques et schémas observés à des fins de prévention. Elles ne recommandent aucune pratique illégale. Consultez un conseil local pour toute décision.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components
function ActorsSection({ actors, onDelete }: { actors: GovernanceActor[]; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (actors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governance.noActors', 'Aucun acteur cartographié')}</p>
          <p className="text-sm">{t('governance.generateHint', 'Utilisez la génération IA pour commencer')}</p>
        </CardContent>
      </Card>
    );
  }

  // Group by type
  const grouped = actors.reduce((acc, actor) => {
    if (!acc[actor.actor_type]) acc[actor.actor_type] = [];
    acc[actor.actor_type].push(actor);
    return acc;
  }, {} as Record<string, GovernanceActor[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('governance.actors.title', 'Acteurs clés')}</CardTitle>
        <CardDescription>
          {t('governance.actors.description', 'Institutions et rôles qui signent, approuvent, bloquent ou donnent accès')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([type, typeActors]) => {
          const config = ACTOR_TYPE_LABELS[type] || ACTOR_TYPE_LABELS.other;
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                <span className="text-sm font-medium">{config.label}</span>
                <Badge variant="secondary" className="text-xs">{typeActors.length}</Badge>
              </div>
              
              {typeActors.map(actor => (
                <Collapsible 
                  key={actor.id} 
                  open={expandedId === actor.id}
                  onOpenChange={() => setExpandedId(expandedId === actor.id ? null : actor.id)}
                >
                  <Card className="ml-4">
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{actor.label}</span>
                            {actor.is_ai_generated && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Sparkles className="w-3 h-3" />
                                IA
                              </Badge>
                            )}
                            <ConfidenceBadge score={actor.confidence_score} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {actor.formality_level === 'formal' ? 'Formel' : actor.formality_level === 'mixed' ? 'Mixte' : 'Inconnu'}
                            </Badge>
                            {expandedId === actor.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-3 space-y-3">
                        <Separator />
                        {actor.power_types.length > 0 && (
                          <div>
                            <span className="text-xs text-muted-foreground">Pouvoirs :</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {actor.power_types.map(p => (
                                <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {actor.notes && (
                          <p className="text-sm text-muted-foreground">{actor.notes}</p>
                        )}
                        {actor.sources && (actor.sources as any[]).length > 0 && (
                          <SourcesList sources={actor.sources as any[]} />
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => onDelete(actor.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Supprimer
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PatternsSection({ patterns, onDelete }: { patterns: IntermediationPattern[]; onDelete: (id: string) => void }) {
  const { t } = useTranslation();

  if (patterns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governance.noPatterns', 'Aucun schéma d\'intermédiation identifié')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('governance.patterns.title', 'Schémas d\'intermédiation')}</CardTitle>
        <CardDescription>
          {t('governance.patterns.description', 'Patterns d\'accès et points de friction typiques - en mode prévention')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map(pattern => (
          <Card key={pattern.id} className="border-l-4" style={{ borderLeftColor: pattern.risk_level === 'high' ? '#ef4444' : pattern.risk_level === 'medium' ? '#f59e0b' : '#22c55e' }}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{PATTERN_TYPE_LABELS[pattern.pattern_type] || pattern.pattern_type}</span>
                    <Badge className={RISK_LEVEL_COLORS[pattern.risk_level]}>
                      {pattern.risk_level === 'high' ? 'Risque élevé' : pattern.risk_level === 'medium' ? 'Risque moyen' : 'Risque faible'}
                    </Badge>
                    {pattern.is_ai_generated && <Badge variant="outline" className="text-xs gap-1"><Sparkles className="w-3 h-3" />IA</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description_neutral}</p>
                </div>
                <ConfidenceBadge score={pattern.confidence_score} />
              </div>

              {pattern.signals.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Signaux d'alerte
                  </span>
                  <ul className="mt-1 space-y-1">
                    {pattern.signals.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500 mt-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pattern.protections.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Protections recommandées
                  </span>
                  <ul className="mt-1 space-y-1">
                    {pattern.protections.map((p, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(pattern.id)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function PartnersSection({ partners, onDelete }: { partners: GovernancePartner[]; onDelete: (id: string) => void }) {
  const { t } = useTranslation();

  if (partners.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governance.noPartners', 'Aucun partenariat identifié')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('governance.partners.title', 'Exigences de partenariat')}</CardTitle>
        <CardDescription>
          {t('governance.partners.description', 'Partenaires obligatoires ou recommandés selon le secteur et le pays')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {partners.map(partner => (
          <Card key={partner.id} className={partner.is_mandatory ? 'border-amber-500/50' : ''}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{PARTNER_TYPE_LABELS[partner.partner_type] || partner.partner_type}</span>
                    {partner.is_mandatory && <Badge variant="destructive">Obligatoire</Badge>}
                    {partner.is_ai_generated && <Badge variant="outline" className="text-xs gap-1"><Sparkles className="w-3 h-3" />IA</Badge>}
                  </div>
                  {partner.description && (
                    <p className="text-sm text-muted-foreground">{partner.description}</p>
                  )}
                </div>
                <ConfidenceBadge score={partner.confidence_score} />
              </div>

              {partner.risk_flags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-red-600">Risques à surveiller</span>
                  <ul className="mt-1 space-y-1">
                    {partner.risk_flags.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {partner.due_diligence_checklist.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-blue-600">Checklist due diligence</span>
                  <ul className="mt-1 space-y-1">
                    {partner.due_diligence_checklist.map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(partner.id)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function DelaysSection({ delays, onDelete }: { delays: DelayReality[]; onDelete: (id: string) => void }) {
  const { t } = useTranslation();

  if (delays.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governance.noDelays', 'Aucune analyse de délais')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('governance.delays.title', 'Réalité des délais')}</CardTitle>
        <CardDescription>
          {t('governance.delays.description', 'Comparaison délais officiels vs délais observés avec implications cashflow')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {delays.map(delay => (
          <Card key={delay.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{delay.process_name}</span>
                  {delay.is_ai_generated && <Badge variant="outline" className="text-xs gap-1"><Sparkles className="w-3 h-3" />IA</Badge>}
                </div>
                <ConfidenceBadge score={delay.confidence_score} />
              </div>

              {/* Timeline comparison */}
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded text-center">
                  <div className="text-xs text-muted-foreground mb-1">Officiel</div>
                  <div className="font-medium">{delay.official_timeframe || '-'}</div>
                </div>
                <div className="p-2 bg-green-50 rounded text-center">
                  <div className="text-xs text-green-600 mb-1">Optimiste</div>
                  <div className="font-medium text-green-700">{delay.optimistic_timeframe || '-'}</div>
                </div>
                <div className="p-2 bg-amber-50 rounded text-center">
                  <div className="text-xs text-amber-600 mb-1">Réaliste</div>
                  <div className="font-medium text-amber-700">{delay.realistic_timeframe || '-'}</div>
                </div>
                <div className="p-2 bg-red-50 rounded text-center">
                  <div className="text-xs text-red-600 mb-1">Pessimiste</div>
                  <div className="font-medium text-red-700">{delay.pessimistic_timeframe || '-'}</div>
                </div>
              </div>

              {delay.delay_risk_signals.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-amber-600">Facteurs de retard</span>
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {delay.delay_risk_signals.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </ul>
                </div>
              )}

              {delay.cashflow_implications && (
                <div className="p-2 bg-blue-50 rounded">
                  <span className="text-xs font-medium text-blue-600">Impact cashflow</span>
                  <p className="text-sm text-blue-700 mt-1">{delay.cashflow_implications}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(delay.id)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

// Helper components
function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className={`flex items-center gap-1 text-xs ${color}`}>
      <HelpCircle className="w-3 h-3" />
      {score}%
    </div>
  );
}

function SourcesList({ sources }: { sources: { url: string; title: string; type: string; date?: string }[] }) {
  if (!sources || sources.length === 0) return null;
  
  return (
    <div>
      <span className="text-xs text-muted-foreground">Sources :</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {sources.map((s, i) => (
          <a 
            key={i} 
            href={s.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <LinkIcon className="w-3 h-3" />
            {s.title || s.url}
          </a>
        ))}
      </div>
    </div>
  );
}