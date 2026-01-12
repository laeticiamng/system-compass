import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Plus, Trash2, Building2, UserCheck, AlertTriangle, 
  ShieldCheck, Eye, Lock, HelpCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCase } from '@/hooks/useUserCases';

type ActorType = 'institutional' | 'decider' | 'access' | 'blocker' | 'operator' | 'potential_partner' | 'provider';
type ActorStatus = 'official' | 'influential';
type ActorRole = 'sign' | 'block' | 'access' | 'execute' | 'advise';
type DependencyLevel = 'low' | 'medium' | 'high';
type ReliabilityStatus = 'unverified' | 'in_progress' | 'verified';

interface Actor {
  id: string;
  name: string;
  type: ActorType;
  status: ActorStatus;
  role: ActorRole;
  dependencyLevel: DependencyLevel;
  reliability: ReliabilityStatus;
  notes: string;
  proofs: string[];
  isRedFlag: boolean;
}

interface ActorsMapProps {
  caseData: UserCase;
  onUpdateCase: (updates: Partial<UserCase>) => void;
}

const ACTOR_TYPES: Record<ActorType, { label: string; icon: React.ElementType; color: string }> = {
  institutional: { label: 'Institutionnel', icon: Building2, color: 'bg-blue-500' },
  decider: { label: 'Décideur', icon: UserCheck, color: 'bg-purple-500' },
  access: { label: 'Accès', icon: Lock, color: 'bg-green-500' },
  blocker: { label: 'Bloqueur', icon: AlertTriangle, color: 'bg-red-500' },
  operator: { label: 'Opérateur', icon: Users, color: 'bg-orange-500' },
  potential_partner: { label: 'Partenaire potentiel', icon: ShieldCheck, color: 'bg-teal-500' },
  provider: { label: 'Prestataire', icon: HelpCircle, color: 'bg-gray-500' },
};

const ACTOR_ROLES: Record<ActorRole, string> = {
  sign: 'Peut signer',
  block: 'Peut bloquer',
  access: 'Donne accès',
  execute: 'Exécute',
  advise: 'Conseille',
};

const RELIABILITY_COLORS: Record<ReliabilityStatus, string> = {
  unverified: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
};

export function ActorsMap({ caseData, onUpdateCase }: ActorsMapProps) {
  const { t } = useTranslation();
  const [expandedActor, setExpandedActor] = useState<string | null>(null);

  // Get actors from case data (or initialize empty)
  const actors: Actor[] = (caseData as any).actors_map || [];

  const updateActors = (newActors: Actor[]) => {
    onUpdateCase({ actors_map: newActors } as any);
  };

  const addActor = () => {
    const newActor: Actor = {
      id: crypto.randomUUID(),
      name: '',
      type: 'institutional',
      status: 'official',
      role: 'access',
      dependencyLevel: 'low',
      reliability: 'unverified',
      notes: '',
      proofs: [],
      isRedFlag: false,
    };
    updateActors([...actors, newActor]);
    setExpandedActor(newActor.id);
  };

  const updateActor = (id: string, updates: Partial<Actor>) => {
    updateActors(actors.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteActor = (id: string) => {
    updateActors(actors.filter(a => a.id !== id));
    if (expandedActor === id) setExpandedActor(null);
  };

  const addProof = (actorId: string, proof: string) => {
    if (!proof.trim()) return;
    const actor = actors.find(a => a.id === actorId);
    if (actor) {
      updateActor(actorId, { proofs: [...actor.proofs, proof.trim()] });
    }
  };

  const removeProof = (actorId: string, idx: number) => {
    const actor = actors.find(a => a.id === actorId);
    if (actor) {
      updateActor(actorId, { proofs: actor.proofs.filter((_, i) => i !== idx) });
    }
  };

  // Group actors by type
  const actorsByType = actors.reduce((acc, actor) => {
    if (!acc[actor.type]) acc[actor.type] = [];
    acc[actor.type].push(actor);
    return acc;
  }, {} as Record<ActorType, Actor[]>);

  const redFlagCount = actors.filter(a => a.isRedFlag).length;
  const verifiedCount = actors.filter(a => a.reliability === 'verified').length;
  const highDependencyCount = actors.filter(a => a.dependencyLevel === 'high').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('actorsMap.title', 'Cartographie des acteurs')}
            </CardTitle>
            <CardDescription>
              {t('actorsMap.description', 'Identifiez les parties prenantes clés de votre projet')}
            </CardDescription>
          </div>
          <Button size="sm" onClick={addActor}>
            <Plus className="w-4 h-4 mr-1" />
            {t('actorsMap.add', 'Ajouter')}
          </Button>
        </div>

        {/* Stats */}
        {actors.length > 0 && (
          <div className="flex gap-4 mt-4">
            <Badge variant="outline">{actors.length} {t('actorsMap.actors', 'acteurs')}</Badge>
            <Badge variant="outline" className="bg-green-50">{verifiedCount} {t('actorsMap.verified', 'vérifiés')}</Badge>
            {redFlagCount > 0 && (
              <Badge variant="destructive">{redFlagCount} {t('actorsMap.redFlags', 'alertes')}</Badge>
            )}
            {highDependencyCount > 0 && (
              <Badge variant="secondary" className="bg-amber-50">{highDependencyCount} {t('actorsMap.highDep', 'dépendance élevée')}</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {actors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('actorsMap.empty', 'Aucun acteur cartographié')}</p>
            <p className="text-sm">{t('actorsMap.emptyHint', 'Cliquez sur "Ajouter" pour commencer')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(actorsByType).map(([type, typeActors]) => {
              const typeConfig = ACTOR_TYPES[type as ActorType];
              const Icon = typeConfig.icon;
              
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${typeConfig.color} text-white`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium">{typeConfig.label}</span>
                    <Badge variant="secondary" className="text-xs">{typeActors.length}</Badge>
                  </div>
                  
                  <div className="space-y-2 ml-6">
                    {typeActors.map(actor => (
                      <Card 
                        key={actor.id} 
                        className={`${actor.isRedFlag ? 'border-destructive/50 bg-destructive/5' : ''}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {/* Main info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={actor.name}
                                  onChange={(e) => updateActor(actor.id, { name: e.target.value })}
                                  placeholder={t('actorsMap.namePlaceholder', 'Nom / Organisation')}
                                  className="font-medium"
                                />
                                {actor.isRedFlag && (
                                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                                )}
                              </div>

                              {/* Selectors row */}
                              <div className="grid grid-cols-4 gap-2">
                                <Select
                                  value={actor.type}
                                  onValueChange={(val) => updateActor(actor.id, { type: val as ActorType })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(ACTOR_TYPES).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={actor.status}
                                  onValueChange={(val) => updateActor(actor.id, { status: val as ActorStatus })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="official">{t('actorsMap.status.official', 'Officiel')}</SelectItem>
                                    <SelectItem value="influential">{t('actorsMap.status.influential', 'Influence')}</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={actor.role}
                                  onValueChange={(val) => updateActor(actor.id, { role: val as ActorRole })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(ACTOR_ROLES).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={actor.dependencyLevel}
                                  onValueChange={(val) => updateActor(actor.id, { dependencyLevel: val as DependencyLevel })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">{t('actorsMap.dep.low', 'Dép. faible')}</SelectItem>
                                    <SelectItem value="medium">{t('actorsMap.dep.medium', 'Dép. moyenne')}</SelectItem>
                                    <SelectItem value="high">{t('actorsMap.dep.high', 'Dép. élevée')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Reliability & Flags */}
                              <div className="flex items-center gap-3">
                                <Select
                                  value={actor.reliability}
                                  onValueChange={(val) => updateActor(actor.id, { reliability: val as ReliabilityStatus })}
                                >
                                  <SelectTrigger className={`w-32 text-xs ${RELIABILITY_COLORS[actor.reliability]}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unverified">{t('actorsMap.reliability.unverified', 'Non vérifié')}</SelectItem>
                                    <SelectItem value="in_progress">{t('actorsMap.reliability.inProgress', 'En cours')}</SelectItem>
                                    <SelectItem value="verified">{t('actorsMap.reliability.verified', 'Vérifié')}</SelectItem>
                                  </SelectContent>
                                </Select>

                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`redflag-${actor.id}`}
                                    checked={actor.isRedFlag}
                                    onCheckedChange={(checked) => updateActor(actor.id, { isRedFlag: !!checked })}
                                  />
                                  <label htmlFor={`redflag-${actor.id}`} className="text-xs cursor-pointer">
                                    {t('actorsMap.markRedFlag', 'Drapeau rouge')}
                                  </label>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedActor(expandedActor === actor.id ? null : actor.id)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Expanded details */}
                              {expandedActor === actor.id && (
                                <div className="mt-3 pt-3 border-t space-y-3">
                                  <Textarea
                                    value={actor.notes}
                                    onChange={(e) => updateActor(actor.id, { notes: e.target.value })}
                                    placeholder={t('actorsMap.notesPlaceholder', 'Notes sur cet acteur...')}
                                    className="text-sm"
                                  />
                                  <div>
                                    <label className="text-xs font-medium">{t('actorsMap.proofs', 'Preuves / Références')}</label>
                                    <div className="flex gap-2 mt-1">
                                      <Input
                                        placeholder={t('actorsMap.addProof', 'Ajouter une preuve...')}
                                        className="text-xs"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            addProof(actor.id, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {actor.proofs.map((proof, idx) => (
                                        <Badge 
                                          key={idx} 
                                          variant="outline" 
                                          className="text-xs cursor-pointer"
                                          onClick={() => removeProof(actor.id, idx)}
                                        >
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          {proof} ×
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Delete button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteActor(actor.id)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Warning notice */}
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">{t('actorsMap.notice.title', 'Important')}</p>
          <p>{t('actorsMap.notice.text', 'Cette cartographie documente les risques d\'opacité et de dépendance comme outils de prévention. Elle ne propose aucune action illégale. Recommandations : diversifier les contacts, exiger des preuves, utiliser des jalons contractuels.')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
