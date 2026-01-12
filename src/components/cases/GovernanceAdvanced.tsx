import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Users, Clock, Shield, AlertTriangle, Loader2, 
  Sparkles, RefreshCw, Trash2, Plus, ChevronDown, ChevronUp,
  CheckCircle2, HelpCircle, Link as LinkIcon, Calendar,
  Edit2, X, Save, FileDown, Search, Filter, Info
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useGovernanceIntel, GovernanceActor, IntermediationPattern, GovernancePartner, DelayReality } from '@/hooks/useGovernanceIntel';
import { UserCase } from '@/hooks/useUserCases';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface GovernanceAdvancedProps {
  caseData: UserCase;
  countryName: string;
  countryCode: string;
}

// Translation keys for actor types
const ACTOR_TYPES = [
  'institution', 'regulator', 'payer', 'approver', 'operator', 
  'judicial', 'local_authority', 'industry_body', 'supplier', 'other'
] as const;

const ACTOR_TYPE_COLORS: Record<string, string> = {
  institution: 'bg-blue-500',
  regulator: 'bg-purple-500',
  payer: 'bg-green-500',
  approver: 'bg-amber-500',
  operator: 'bg-orange-500',
  judicial: 'bg-red-500',
  local_authority: 'bg-teal-500',
  industry_body: 'bg-indigo-500',
  supplier: 'bg-gray-500',
  other: 'bg-slate-500',
};

const POWER_TYPES = ['sign', 'approve', 'block', 'grant_access', 'control_budget', 'control_permit', 'enforce', 'procure'] as const;

const PATTERN_TYPES = [
  'access_chain', 'signature_bottleneck', 'delegated_negotiation', 'informal_queue',
  'paper_stuck', 'multi_approver', 'joint_venture_requirement', 'payment_delay'
] as const;

const PARTNER_TYPES = [
  'mandatory_local_partner', 'commercial_partner', 'implementation_partner', 
  'distribution_partner', 'equity_partner'
] as const;

const RISK_LEVELS = ['low', 'medium', 'high'] as const;

export function GovernanceAdvanced({ caseData, countryName, countryCode }: GovernanceAdvancedProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('actors');
  const [sector, setSector] = useState('');
  const [projectType, setProjectType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddActorDialog, setShowAddActorDialog] = useState(false);
  const [showAddPatternDialog, setShowAddPatternDialog] = useState(false);
  const [showAddPartnerDialog, setShowAddPartnerDialog] = useState(false);
  const [showAddDelayDialog, setShowAddDelayDialog] = useState(false);
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
  
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
    addActor,
    updateActor,
    deleteActor,
    addPattern,
    updatePattern,
    deletePattern,
    addPartner,
    updatePartner,
    deletePartner,
    addDelay,
    updateDelay,
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

  const dateLocale = i18n.language === 'fr' ? fr : enUS;

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
                {t('governanceAdvanced.title', 'Gouvernance avancée')}
              </CardTitle>
              <CardDescription>
                {t('governanceAdvanced.description', 'Cartographie des acteurs, schémas d\'intermédiation, partenaires et délais réels')}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {totalItems > 0 && (
                <Badge variant="outline">{totalItems} {t('governanceAdvanced.items', 'éléments')}</Badge>
              )}
              {aiItems > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  {aiItems} IA
                </Badge>
              )}
              <Dialog open={showFrameworkDialog} onOpenChange={setShowFrameworkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Info className="w-4 h-4" />
                    {t('governanceAdvanced.framework', 'Framework')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('governanceAdvanced.frameworkTitle', 'Framework Gouvernance')}</DialogTitle>
                  </DialogHeader>
                  <FrameworkContent />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Generation form */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('governanceAdvanced.sector', 'Secteur')}
              </label>
              <Input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder={t('governanceAdvanced.sectorPlaceholder', 'ex: santé, finance, télécom...')}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('governanceAdvanced.projectType', 'Type de projet')}
              </label>
              <Input
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder={t('governanceAdvanced.projectTypePlaceholder', 'ex: service numérique, import...')}
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
              {t('governanceAdvanced.generate', 'Générer avec IA')}
            </Button>
            {aiItems > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" title={t('governanceAdvanced.clearAI', 'Supprimer les données IA')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('governanceAdvanced.confirmClearTitle', 'Supprimer les données IA ?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('governanceAdvanced.confirmClearDescription', 'Cette action supprimera toutes les données générées par IA. Les éléments ajoutés manuellement seront conservés.')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel', 'Annuler')}</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAIData}>{t('common.confirm', 'Confirmer')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Last run info */}
          {lastRun && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {t('governanceAdvanced.lastRun', 'Dernière génération')}: {formatDistanceToNow(new Date(lastRun.created_at), { 
                addSuffix: true, 
                locale: dateLocale
              })}
              {lastRun.status === 'completed' && (
                <Badge variant="outline" className="text-xs bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {lastRun.actors_count + lastRun.patterns_count + lastRun.partners_count + lastRun.delays_count} {t('governanceAdvanced.items', 'éléments')}
                </Badge>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('governanceAdvanced.search', 'Rechercher...')}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="actors" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governanceAdvanced.tabs.actors', 'Acteurs')}</span>
            {actors.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{actors.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governanceAdvanced.tabs.patterns', 'Intermédiation')}</span>
            {patterns.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{patterns.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governanceAdvanced.tabs.partners', 'Partenaires')}</span>
            {partners.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{partners.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="delays" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('governanceAdvanced.tabs.delays', 'Délais')}</span>
            {delays.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{delays.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Actors Tab */}
        <TabsContent value="actors">
          <ActorsSection 
            actors={actors.filter(a => !searchQuery || a.label.toLowerCase().includes(searchQuery.toLowerCase()))} 
            onDelete={deleteActor}
            onUpdate={updateActor}
            onAdd={() => setShowAddActorDialog(true)}
            countryCode={countryCode}
          />
          <AddActorDialog 
            open={showAddActorDialog} 
            onOpenChange={setShowAddActorDialog}
            onAdd={addActor}
            countryCode={countryCode}
          />
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns">
          <PatternsSection 
            patterns={patterns.filter(p => !searchQuery || p.description_neutral.toLowerCase().includes(searchQuery.toLowerCase()))} 
            onDelete={deletePattern}
            onUpdate={updatePattern}
            onAdd={() => setShowAddPatternDialog(true)}
          />
          <AddPatternDialog 
            open={showAddPatternDialog} 
            onOpenChange={setShowAddPatternDialog}
            onAdd={addPattern}
          />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <PartnersSection 
            partners={partners.filter(p => !searchQuery || (p.description?.toLowerCase().includes(searchQuery.toLowerCase())))} 
            onDelete={deletePartner}
            onUpdate={updatePartner}
            onAdd={() => setShowAddPartnerDialog(true)}
          />
          <AddPartnerDialog 
            open={showAddPartnerDialog} 
            onOpenChange={setShowAddPartnerDialog}
            onAdd={addPartner}
          />
        </TabsContent>

        {/* Delays Tab */}
        <TabsContent value="delays">
          <DelaysSection 
            delays={delays.filter(d => !searchQuery || d.process_name.toLowerCase().includes(searchQuery.toLowerCase()))} 
            onDelete={deleteDelay}
            onUpdate={updateDelay}
            onAdd={() => setShowAddDelayDialog(true)}
          />
          <AddDelayDialog 
            open={showAddDelayDialog} 
            onOpenChange={setShowAddDelayDialog}
            onAdd={addDelay}
          />
        </TabsContent>
      </Tabs>

      {/* Prevention notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">{t('governanceAdvanced.notice.title', 'Orientation prévention')}</p>
              <p className="text-muted-foreground">
                {t('governanceAdvanced.notice.text', 'Ces informations décrivent des risques et schémas observés à des fins de prévention. Elles ne recommandent aucune pratique illégale. Consultez un conseil local pour toute décision.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Framework Content Component
function FrameworkContent() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6 text-sm">
      {/* Key Actor vs Partner */}
      <div>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {t('governanceAdvanced.framework.actorVsPartner', 'Acteur clé vs Partenaire')}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-700 mb-2">{t('governanceAdvanced.framework.keyActor', 'Acteur clé')}</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• {t('governanceAdvanced.framework.actor1', 'Peut autoriser (signature/agrément)')}</li>
              <li>• {t('governanceAdvanced.framework.actor2', 'Peut bloquer (goulot d\'étranglement)')}</li>
              <li>• {t('governanceAdvanced.framework.actor3', 'Donne accès (au bon décideur)')}</li>
              <li>• {t('governanceAdvanced.framework.actor4', 'Exécute (mise en œuvre)')}</li>
            </ul>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="font-medium text-amber-700 mb-2">{t('governanceAdvanced.framework.partner', 'Partenaire')}</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• {t('governanceAdvanced.framework.partner1', 'Relation structurante')}</li>
              <li>• {t('governanceAdvanced.framework.partner2', 'Obligation légale/réglementaire')}</li>
              <li>• {t('governanceAdvanced.framework.partner3', 'Capital/exclusivité/JV')}</li>
              <li>• {t('governanceAdvanced.framework.partner4', 'Contrôle partagé')}</li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Chain of Access */}
      <div>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {t('governanceAdvanced.framework.chainAccess', 'Réalité de la chaîne d\'accès')}
        </h3>
        <ul className="space-y-1 text-muted-foreground">
          <li>• {t('governanceAdvanced.framework.chain1', 'L\'accès au signataire peut être indirect')}</li>
          <li>• {t('governanceAdvanced.framework.chain2', 'Le dossier peut rester "bloqué en bas"')}</li>
          <li>• {t('governanceAdvanced.framework.chain3', 'Délais officiels ≠ délais observés')}</li>
          <li className="text-primary font-medium">→ {t('governanceAdvanced.framework.chain4', 'Rendre visible la chaîne d\'accès comme risque de délai/dépendance')}</li>
        </ul>
      </div>

      <Separator />

      {/* Anti-copy Risk */}
      <div>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {t('governanceAdvanced.framework.antiCopy', 'Risque "partage d\'info" (anti-copie)')}
        </h3>
        <ul className="space-y-1 text-muted-foreground">
          <li>• {t('governanceAdvanced.framework.copy1', 'Pitch "macro" au départ - pas de détails')}</li>
          <li>• {t('governanceAdvanced.framework.copy2', 'Versioning des documents partagés')}</li>
          <li>• {t('governanceAdvanced.framework.copy3', 'NDA/contrats avant partage sensible')}</li>
        </ul>
        <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
          <strong>{t('governanceAdvanced.framework.dontShare', 'Ne pas partager tôt')} :</strong> {t('governanceAdvanced.framework.dontShareList', 'Business plan détaillé, liste clients, technologie propriétaire, pricing strategy')}
        </div>
      </div>

      <Separator />

      {/* POC Mandatory */}
      <div>
        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {t('governanceAdvanced.framework.poc', 'POC obligatoire (entrepreneurship)')}
        </h3>
        <p className="text-muted-foreground mb-2">{t('governanceAdvanced.framework.pocDesc', 'Toujours proposer un POC : test faible investissement avec critères go/no-go clairs.')}</p>
        <div className="p-2 bg-green-50 rounded text-green-700 text-xs">
          <strong>{t('governanceAdvanced.framework.pocGoal', 'Objectif')} :</strong> {t('governanceAdvanced.framework.pocGoalDesc', 'Éviter le piège "investi 2/3 puis blocage"')}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function ActorsSection({ actors, onDelete, onUpdate, onAdd, countryCode }: { 
  actors: GovernanceActor[]; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<GovernanceActor>) => void;
  onAdd: () => void;
  countryCode: string;
}) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (actors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governanceAdvanced.noActors', 'Aucun acteur cartographié')}</p>
          <p className="text-sm mb-4">{t('governanceAdvanced.generateHint', 'Utilisez la génération IA ou ajoutez manuellement')}</p>
          <Button onClick={onAdd} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('governanceAdvanced.addActor', 'Ajouter un acteur')}
          </Button>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{t('governanceAdvanced.actors.title', 'Acteurs clés')}</CardTitle>
          <CardDescription>
            {t('governanceAdvanced.actors.description', 'Institutions et rôles qui signent, approuvent, bloquent ou donnent accès')}
          </CardDescription>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          {t('governanceAdvanced.add', 'Ajouter')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([type, typeActors]) => {
          const color = ACTOR_TYPE_COLORS[type] || ACTOR_TYPE_COLORS.other;
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm font-medium">{t(`governanceAdvanced.actorTypes.${type}`, type)}</span>
                <Badge variant="secondary" className="text-xs">{typeActors.length}</Badge>
              </div>
              
              {typeActors.map(actor => (
                <ActorCard 
                  key={actor.id} 
                  actor={actor} 
                  expanded={expandedId === actor.id}
                  onToggle={() => setExpandedId(expandedId === actor.id ? null : actor.id)}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActorCard({ actor, expanded, onToggle, onDelete, onUpdate }: {
  actor: GovernanceActor;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<GovernanceActor>) => void;
}) {
  const { t } = useTranslation();

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
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
                  {t(`governanceAdvanced.formalityLevels.${actor.formality_level}`, actor.formality_level)}
                </Badge>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 space-y-3">
            <Separator />
            {actor.power_types.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">{t('governanceAdvanced.powers', 'Pouvoirs')} :</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {actor.power_types.map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {t(`governanceAdvanced.powerTypes.${p}`, p)}
                    </Badge>
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
            <DeleteConfirmButton onDelete={() => onDelete(actor.id)} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function PatternsSection({ patterns, onDelete, onUpdate, onAdd }: { 
  patterns: IntermediationPattern[]; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<IntermediationPattern>) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  if (patterns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governanceAdvanced.noPatterns', 'Aucun schéma d\'intermédiation identifié')}</p>
          <p className="text-sm mb-4">{t('governanceAdvanced.generateHint', 'Utilisez la génération IA ou ajoutez manuellement')}</p>
          <Button onClick={onAdd} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('governanceAdvanced.addPattern', 'Ajouter un schéma')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{t('governanceAdvanced.patterns.title', 'Schémas d\'intermédiation')}</CardTitle>
          <CardDescription>
            {t('governanceAdvanced.patterns.description', 'Patterns d\'accès et points de friction typiques - en mode prévention')}
          </CardDescription>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          {t('governanceAdvanced.add', 'Ajouter')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map(pattern => (
          <PatternCard key={pattern.id} pattern={pattern} onDelete={onDelete} />
        ))}
      </CardContent>
    </Card>
  );
}

function PatternCard({ pattern, onDelete }: { pattern: IntermediationPattern; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const borderColor = pattern.risk_level === 'high' ? '#ef4444' : pattern.risk_level === 'medium' ? '#f59e0b' : '#22c55e';

  return (
    <Card className="border-l-4" style={{ borderLeftColor: borderColor }}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{t(`governanceAdvanced.patternTypes.${pattern.pattern_type}`, pattern.pattern_type)}</span>
              <Badge className={`${pattern.risk_level === 'high' ? 'bg-red-100 text-red-700' : pattern.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {t(`governanceAdvanced.riskLevels.${pattern.risk_level}`, pattern.risk_level)}
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
              {t('governanceAdvanced.warningSignals', 'Signaux d\'alerte')}
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
              {t('governanceAdvanced.recommendedProtections', 'Protections recommandées')}
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
          <DeleteConfirmButton onDelete={() => onDelete(pattern.id)} />
        </div>
      </CardContent>
    </Card>
  );
}

function PartnersSection({ partners, onDelete, onUpdate, onAdd }: { 
  partners: GovernancePartner[]; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<GovernancePartner>) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  if (partners.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governanceAdvanced.noPartners', 'Aucun partenariat identifié')}</p>
          <p className="text-sm mb-4">{t('governanceAdvanced.generateHint', 'Utilisez la génération IA ou ajoutez manuellement')}</p>
          <Button onClick={onAdd} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('governanceAdvanced.addPartner', 'Ajouter un partenaire')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{t('governanceAdvanced.partners.title', 'Exigences de partenariat')}</CardTitle>
          <CardDescription>
            {t('governanceAdvanced.partners.description', 'Partenaires obligatoires ou recommandés selon le secteur et le pays')}
          </CardDescription>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          {t('governanceAdvanced.add', 'Ajouter')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {partners.map(partner => (
          <PartnerCard key={partner.id} partner={partner} onDelete={onDelete} />
        ))}
      </CardContent>
    </Card>
  );
}

function PartnerCard({ partner, onDelete }: { partner: GovernancePartner; onDelete: (id: string) => void }) {
  const { t } = useTranslation();

  return (
    <Card className={partner.is_mandatory ? 'border-amber-500/50' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{t(`governanceAdvanced.partnerTypes.${partner.partner_type}`, partner.partner_type)}</span>
              {partner.is_mandatory && <Badge variant="destructive">{t('governanceAdvanced.mandatory', 'Obligatoire')}</Badge>}
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
            <span className="text-xs font-medium text-red-600">{t('governanceAdvanced.risksToWatch', 'Risques à surveiller')}</span>
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
            <span className="text-xs font-medium text-blue-600">{t('governanceAdvanced.dueDiligenceChecklist', 'Checklist due diligence')}</span>
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
          <DeleteConfirmButton onDelete={() => onDelete(partner.id)} />
        </div>
      </CardContent>
    </Card>
  );
}

function DelaysSection({ delays, onDelete, onUpdate, onAdd }: { 
  delays: DelayReality[]; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DelayReality>) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  if (delays.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t('governanceAdvanced.noDelays', 'Aucune analyse de délais')}</p>
          <p className="text-sm mb-4">{t('governanceAdvanced.generateHint', 'Utilisez la génération IA ou ajoutez manuellement')}</p>
          <Button onClick={onAdd} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {t('governanceAdvanced.addDelay', 'Ajouter un processus')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{t('governanceAdvanced.delays.title', 'Réalité des délais')}</CardTitle>
          <CardDescription>
            {t('governanceAdvanced.delays.description', 'Comparaison délais officiels vs délais observés avec implications cashflow')}
          </CardDescription>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          {t('governanceAdvanced.add', 'Ajouter')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {delays.map(delay => (
          <DelayCard key={delay.id} delay={delay} onDelete={onDelete} />
        ))}
      </CardContent>
    </Card>
  );
}

function DelayCard({ delay, onDelete }: { delay: DelayReality; onDelete: (id: string) => void }) {
  const { t } = useTranslation();

  return (
    <Card>
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
            <div className="text-xs text-muted-foreground mb-1">{t('governanceAdvanced.official', 'Officiel')}</div>
            <div className="font-medium">{delay.official_timeframe || '-'}</div>
          </div>
          <div className="p-2 bg-green-50 rounded text-center">
            <div className="text-xs text-green-600 mb-1">{t('governanceAdvanced.optimistic', 'Optimiste')}</div>
            <div className="font-medium text-green-700">{delay.optimistic_timeframe || '-'}</div>
          </div>
          <div className="p-2 bg-amber-50 rounded text-center">
            <div className="text-xs text-amber-600 mb-1">{t('governanceAdvanced.realistic', 'Réaliste')}</div>
            <div className="font-medium text-amber-700">{delay.realistic_timeframe || '-'}</div>
          </div>
          <div className="p-2 bg-red-50 rounded text-center">
            <div className="text-xs text-red-600 mb-1">{t('governanceAdvanced.pessimistic', 'Pessimiste')}</div>
            <div className="font-medium text-red-700">{delay.pessimistic_timeframe || '-'}</div>
          </div>
        </div>

        {delay.delay_risk_signals.length > 0 && (
          <div>
            <span className="text-xs font-medium text-amber-600">{t('governanceAdvanced.delayFactors', 'Facteurs de retard')}</span>
            <ul className="mt-1 flex flex-wrap gap-1">
              {delay.delay_risk_signals.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </ul>
          </div>
        )}

        {delay.cashflow_implications && (
          <div className="p-2 bg-blue-50 rounded">
            <span className="text-xs font-medium text-blue-600">{t('governanceAdvanced.cashflowImpact', 'Impact cashflow')}</span>
            <p className="text-sm text-blue-700 mt-1">{delay.cashflow_implications}</p>
          </div>
        )}

        <div className="flex justify-end">
          <DeleteConfirmButton onDelete={() => onDelete(delay.id)} />
        </div>
      </CardContent>
    </Card>
  );
}

// Helper components
function ConfidenceBadge({ score }: { score: number }) {
  const { t } = useTranslation();
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className={`flex items-center gap-1 text-xs ${color}`} title={t('governanceAdvanced.confidence', 'Confiance')}>
      <HelpCircle className="w-3 h-3" />
      {score}%
    </div>
  );
}

function DeleteConfirmButton({ onDelete }: { onDelete: () => void }) {
  const { t } = useTranslation();
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="w-3 h-3 mr-1" />
          {t('common.delete', 'Supprimer')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('governanceAdvanced.confirmDeleteTitle', 'Confirmer la suppression')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('governanceAdvanced.confirmDeleteDescription', 'Cette action est irréversible.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel', 'Annuler')}</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>{t('common.delete', 'Supprimer')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SourcesList({ sources }: { sources: { url: string; title: string; type: string; date?: string }[] }) {
  const { t } = useTranslation();
  if (!sources || sources.length === 0) return null;
  
  return (
    <div>
      <span className="text-xs text-muted-foreground">{t('governanceAdvanced.sources', 'Sources')} :</span>
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

// Add Dialogs
function AddActorDialog({ open, onOpenChange, onAdd, countryCode }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (actor: Partial<GovernanceActor>) => Promise<any>;
  countryCode: string;
}) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [actorType, setActorType] = useState<string>('institution');
  const [notes, setNotes] = useState('');
  const [formalityLevel, setFormalityLevel] = useState<string>('formal');
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!label.trim()) {
      toast.error(t('governanceAdvanced.errors.labelRequired', 'Le nom est requis'));
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd({
        country_code: countryCode,
        label: label.trim(),
        actor_type: actorType,
        notes: notes.trim() || undefined,
        formality_level: formalityLevel,
        power_types: selectedPowers,
        confidence_score: 70,
      });
      toast.success(t('governanceAdvanced.actorAdded', 'Acteur ajouté'));
      onOpenChange(false);
      setLabel('');
      setNotes('');
      setSelectedPowers([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('governanceAdvanced.addActor', 'Ajouter un acteur')}</DialogTitle>
          <DialogDescription>{t('governanceAdvanced.addActorDesc', 'Ajoutez manuellement un acteur institutionnel')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.actorLabel', 'Nom de l\'institution/rôle')} *</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('governanceAdvanced.actorLabelPlaceholder', 'Ex: Ministère du Commerce')} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.actorType', 'Type')}</label>
            <Select value={actorType} onValueChange={setActorType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTOR_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{t(`governanceAdvanced.actorTypes.${type}`, type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.formalityLevel', 'Niveau de formalité')}</label>
            <Select value={formalityLevel} onValueChange={setFormalityLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">{t('governanceAdvanced.formalityLevels.formal', 'Formel')}</SelectItem>
                <SelectItem value="mixed">{t('governanceAdvanced.formalityLevels.mixed', 'Mixte')}</SelectItem>
                <SelectItem value="unknown">{t('governanceAdvanced.formalityLevels.unknown', 'Inconnu')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.powers', 'Pouvoirs')}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {POWER_TYPES.map(power => (
                <label key={power} className="flex items-center gap-1 text-sm">
                  <Checkbox 
                    checked={selectedPowers.includes(power)} 
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedPowers([...selectedPowers, power]);
                      else setSelectedPowers(selectedPowers.filter(p => p !== power));
                    }} 
                  />
                  {t(`governanceAdvanced.powerTypes.${power}`, power)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.notes', 'Notes')}</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('governanceAdvanced.notesPlaceholder', 'Description du rôle...')} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Annuler')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('governanceAdvanced.add', 'Ajouter')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPatternDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (pattern: Partial<IntermediationPattern>) => Promise<any>;
}) {
  const { t } = useTranslation();
  const [patternType, setPatternType] = useState<string>('access_chain');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<string>('medium');
  const [signals, setSignals] = useState('');
  const [protections, setProtections] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error(t('governanceAdvanced.errors.descriptionRequired', 'La description est requise'));
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd({
        pattern_type: patternType,
        description_neutral: description.trim(),
        risk_level: riskLevel,
        signals: signals.split('\n').filter(s => s.trim()),
        protections: protections.split('\n').filter(p => p.trim()),
        confidence_score: 70,
      });
      toast.success(t('governanceAdvanced.patternAdded', 'Schéma ajouté'));
      onOpenChange(false);
      setDescription('');
      setSignals('');
      setProtections('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('governanceAdvanced.addPattern', 'Ajouter un schéma')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.patternType', 'Type de schéma')}</label>
            <Select value={patternType} onValueChange={setPatternType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PATTERN_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{t(`governanceAdvanced.patternTypes.${type}`, type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.description', 'Description')} *</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('governanceAdvanced.patternDescPlaceholder', 'Description neutre du schéma...')} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.riskLevel', 'Niveau de risque')}</label>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RISK_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{t(`governanceAdvanced.riskLevels.${level}`, level)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.signals', 'Signaux d\'alerte')} ({t('governanceAdvanced.onePerLine', 'un par ligne')})</label>
            <Textarea value={signals} onChange={(e) => setSignals(e.target.value)} placeholder={t('governanceAdvanced.signalsPlaceholder', 'Délais anormaux...\nDemandes informelles...')} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.protections', 'Protections')} ({t('governanceAdvanced.onePerLine', 'un par ligne')})</label>
            <Textarea value={protections} onChange={(e) => setProtections(e.target.value)} placeholder={t('governanceAdvanced.protectionsPlaceholder', 'Jalons contractuels...\nDue diligence...')} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Annuler')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('governanceAdvanced.add', 'Ajouter')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPartnerDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (partner: Partial<GovernancePartner>) => Promise<any>;
}) {
  const { t } = useTranslation();
  const [partnerType, setPartnerType] = useState<string>('commercial_partner');
  const [description, setDescription] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [riskFlags, setRiskFlags] = useState('');
  const [checklist, setChecklist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAdd({
        partner_type: partnerType,
        description: description.trim() || undefined,
        is_mandatory: isMandatory,
        risk_flags: riskFlags.split('\n').filter(r => r.trim()),
        due_diligence_checklist: checklist.split('\n').filter(c => c.trim()),
        confidence_score: 70,
      });
      toast.success(t('governanceAdvanced.partnerAdded', 'Partenaire ajouté'));
      onOpenChange(false);
      setDescription('');
      setRiskFlags('');
      setChecklist('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('governanceAdvanced.addPartner', 'Ajouter un partenaire')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.partnerType', 'Type de partenariat')}</label>
            <Select value={partnerType} onValueChange={setPartnerType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PARTNER_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{t(`governanceAdvanced.partnerTypes.${type}`, type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.description', 'Description')}</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox checked={isMandatory} onCheckedChange={(checked) => setIsMandatory(!!checked)} />
            <span className="text-sm">{t('governanceAdvanced.mandatoryPartner', 'Partenariat obligatoire')}</span>
          </label>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.riskFlags', 'Risques à surveiller')} ({t('governanceAdvanced.onePerLine', 'un par ligne')})</label>
            <Textarea value={riskFlags} onChange={(e) => setRiskFlags(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.dueDiligence', 'Checklist due diligence')} ({t('governanceAdvanced.onePerLine', 'un par ligne')})</label>
            <Textarea value={checklist} onChange={(e) => setChecklist(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Annuler')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('governanceAdvanced.add', 'Ajouter')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddDelayDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (delay: Partial<DelayReality>) => Promise<any>;
}) {
  const { t } = useTranslation();
  const [processName, setProcessName] = useState('');
  const [official, setOfficial] = useState('');
  const [optimistic, setOptimistic] = useState('');
  const [realistic, setRealistic] = useState('');
  const [pessimistic, setPessimistic] = useState('');
  const [signals, setSignals] = useState('');
  const [cashflow, setCashflow] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!processName.trim()) {
      toast.error(t('governanceAdvanced.errors.processNameRequired', 'Le nom du processus est requis'));
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd({
        process_name: processName.trim(),
        official_timeframe: official.trim() || undefined,
        optimistic_timeframe: optimistic.trim() || undefined,
        realistic_timeframe: realistic.trim() || undefined,
        pessimistic_timeframe: pessimistic.trim() || undefined,
        delay_risk_signals: signals.split('\n').filter(s => s.trim()),
        cashflow_implications: cashflow.trim() || undefined,
        confidence_score: 70,
      });
      toast.success(t('governanceAdvanced.delayAdded', 'Processus ajouté'));
      onOpenChange(false);
      setProcessName('');
      setOfficial('');
      setOptimistic('');
      setRealistic('');
      setPessimistic('');
      setSignals('');
      setCashflow('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('governanceAdvanced.addDelay', 'Ajouter un processus')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.processName', 'Nom du processus')} *</label>
            <Input value={processName} onChange={(e) => setProcessName(e.target.value)} placeholder={t('governanceAdvanced.processNamePlaceholder', 'Ex: Obtention licence import')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">{t('governanceAdvanced.official', 'Délai officiel')}</label>
              <Input value={official} onChange={(e) => setOfficial(e.target.value)} placeholder="Ex: 30 jours" />
            </div>
            <div>
              <label className="text-sm font-medium">{t('governanceAdvanced.optimistic', 'Optimiste')}</label>
              <Input value={optimistic} onChange={(e) => setOptimistic(e.target.value)} placeholder="Ex: 45 jours" />
            </div>
            <div>
              <label className="text-sm font-medium">{t('governanceAdvanced.realistic', 'Réaliste')}</label>
              <Input value={realistic} onChange={(e) => setRealistic(e.target.value)} placeholder="Ex: 3 mois" />
            </div>
            <div>
              <label className="text-sm font-medium">{t('governanceAdvanced.pessimistic', 'Pessimiste')}</label>
              <Input value={pessimistic} onChange={(e) => setPessimistic(e.target.value)} placeholder="Ex: 6 mois" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.delayFactors', 'Facteurs de retard')} ({t('governanceAdvanced.onePerLine', 'un par ligne')})</label>
            <Textarea value={signals} onChange={(e) => setSignals(e.target.value)} rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('governanceAdvanced.cashflowImpact', 'Impact cashflow')}</label>
            <Textarea value={cashflow} onChange={(e) => setCashflow(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel', 'Annuler')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('governanceAdvanced.add', 'Ajouter')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
