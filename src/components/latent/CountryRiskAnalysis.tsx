import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Scale,
  Landmark,
  Users,
  Briefcase,
  Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  countryRiskProfiles,
  type CountryRiskProfile,
  type CountryHiddenRisk,
} from '@/lib/country-risks-data';

// ---------- helpers ----------

const CATEGORY_CONFIG: Record<
  CountryHiddenRisk['category'],
  { icon: typeof AlertTriangle; label: string; color: string }
> = {
  corruption: {
    icon: Landmark,
    label: 'Corruption',
    color: 'text-red-500',
  },
  legal_trap: {
    icon: Scale,
    label: 'Piege juridique',
    color: 'text-orange-500',
  },
  cultural: {
    icon: Globe2,
    label: 'Risque culturel',
    color: 'text-purple-500',
  },
  financial: {
    icon: Briefcase,
    label: 'Risque financier',
    color: 'text-amber-500',
  },
  bureaucratic: {
    icon: Shield,
    label: 'Bureaucratie',
    color: 'text-blue-500',
  },
  social: {
    icon: Users,
    label: 'Risque social',
    color: 'text-pink-500',
  },
};

const VISIBILITY_LABELS: Record<CountryHiddenRisk['visibility'], string> = {
  invisible: 'Invisible',
  subtle: 'Subtil',
  emerging: 'Emergent',
};

const VISIBILITY_COLORS: Record<CountryHiddenRisk['visibility'], string> = {
  invisible: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  subtle: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  emerging: 'bg-red-500/10 text-red-500 border-red-500/20',
};

function getSeverityColor(severity: number): string {
  if (severity <= 3) return 'bg-green-500';
  if (severity <= 6) return 'bg-amber-500';
  return 'bg-red-500';
}

function getSeverityTextColor(severity: number): string {
  if (severity <= 3) return 'text-green-600';
  if (severity <= 6) return 'text-amber-600';
  return 'text-red-600';
}

function getSeverityLabel(severity: number): string {
  if (severity <= 3) return 'Faible';
  if (severity <= 6) return 'Modere';
  return 'Eleve';
}

function getScoreBarColor(score: number): string {
  if (score <= 3) return 'bg-green-500';
  if (score <= 6) return 'bg-amber-500';
  return 'bg-red-500';
}

// ---------- sub-components ----------

interface ScoreBarProps {
  label: string;
  score: number;
  icon: typeof AlertTriangle;
  maxScore?: number;
}

function ScoreBar({ label, score, icon: Icon, maxScore = 10 }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span className={cn('font-semibold tabular-nums', getSeverityTextColor(score))}>
          {score.toFixed(1)}/10
        </span>
      </div>
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            getScoreBarColor(score),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface RiskCardProps {
  risk: CountryHiddenRisk;
}

function RiskCard({ risk }: RiskCardProps) {
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const config = CATEGORY_CONFIG[risk.category];
  const CategoryIcon = config.icon;

  return (
    <Card
      className={cn(
        'glass-card transition-all duration-300 hover:shadow-md border-l-4',
        risk.severity <= 3 && 'border-l-green-500',
        risk.severity > 3 && risk.severity <= 6 && 'border-l-amber-500',
        risk.severity > 6 && 'border-l-red-500',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                'mt-0.5 p-2 rounded-lg shrink-0',
                risk.severity <= 3 && 'bg-green-500/10',
                risk.severity > 3 && risk.severity <= 6 && 'bg-amber-500/10',
                risk.severity > 6 && 'bg-red-500/10',
              )}
            >
              <CategoryIcon className={cn('w-4 h-4', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium leading-tight">
                {risk.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', VISIBILITY_COLORS[risk.visibility])}>
                  <Eye className="w-3 h-3 mr-1" />
                  {VISIBILITY_LABELS[risk.visibility]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <div
              className={cn(
                'text-lg font-bold tabular-nums',
                getSeverityTextColor(risk.severity),
              )}
            >
              {risk.severity}
            </div>
            <span className={cn('text-[10px] font-medium uppercase tracking-wider', getSeverityTextColor(risk.severity))}>
              {getSeverityLabel(risk.severity)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {risk.description}
        </p>

        {/* Severity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Severite</span>
            <span>{risk.severity}/10</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                getSeverityColor(risk.severity),
              )}
              style={{ width: `${(risk.severity / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Sources */}
        {risk.sources.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Sources :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {risk.sources.map((source, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Affected profiles */}
        {risk.affectedProfiles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              <Users className="w-3 h-3 inline mr-1" />
              Profils concernes :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {risk.affectedProfiles.map((profile, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-primary/5 border-primary/20"
                >
                  {profile}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mitigation tips - expandable */}
        {risk.mitigationTips.length > 0 && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between px-2 h-8 text-sm"
              onClick={() => setIsTipsOpen(!isTipsOpen)}
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                Conseils d'attenuation ({risk.mitigationTips.length})
              </span>
              {isTipsOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>

            {isTipsOpen && (
              <ul className="mt-2 space-y-2 pl-1">
                {risk.mitigationTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- main component ----------

export function CountryRiskAnalysis() {
  const { t } = useTranslation();
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');

  const selectedProfile: CountryRiskProfile | undefined = countryRiskProfiles.find(
    (p) => p.countryId === selectedCountryId,
  );

  const sortedProfiles = [...countryRiskProfiles].sort((a, b) =>
    a.countryName.localeCompare(b.countryName),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-amber-500/20 border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5 mr-2" />
              ZONES LATENTES
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold">
            Analyse des risques caches par pays
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Identifiez les risques invisibles, subtils et emergents specifiques a chaque pays de destination.
          </p>
        </div>
      </div>

      {/* Country selector */}
      <Card className="glass-card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <Globe2 className="w-4 h-4 text-primary" />
              Selectionnez un pays :
            </div>
            <Select
              value={selectedCountryId}
              onValueChange={setSelectedCountryId}
            >
              <SelectTrigger className="w-full sm:max-w-sm">
                <SelectValue placeholder="Choisir un pays..." />
              </SelectTrigger>
              <SelectContent>
                {sortedProfiles.map((profile) => (
                  <SelectItem key={profile.countryId} value={profile.countryId}>
                    <div className="flex items-center gap-2">
                      <span>{profile.countryName}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] ml-1',
                          profile.overallLatentScore <= 3 && 'border-green-500/30 text-green-600',
                          profile.overallLatentScore > 3 &&
                            profile.overallLatentScore <= 6 &&
                            'border-amber-500/30 text-amber-600',
                          profile.overallLatentScore > 6 && 'border-red-500/30 text-red-600',
                        )}
                      >
                        {profile.overallLatentScore.toFixed(1)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!selectedProfile && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">
              Aucun pays selectionne
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Choisissez un pays dans le menu ci-dessus pour decouvrir
              les risques caches qui ne figurent pas dans les classements traditionnels.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Country profile content */}
      {selectedProfile && (
        <div className="space-y-6">
          {/* Overall score */}
          <Card className="glass-card-elevated border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className={cn('w-5 h-5', getSeverityTextColor(selectedProfile.overallLatentScore))} />
                  Score latent global : {selectedProfile.countryName}
                </CardTitle>
                <div
                  className={cn(
                    'text-3xl font-bold tabular-nums',
                    getSeverityTextColor(selectedProfile.overallLatentScore),
                  )}
                >
                  {selectedProfile.overallLatentScore.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">/10</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Derniere mise a jour : {new Date(selectedProfile.lastUpdated).toLocaleDateString('fr-FR')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Radar-like bar visualization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <ScoreBar
                  label="Corruption"
                  score={selectedProfile.corruptionScore}
                  icon={Landmark}
                />
                <ScoreBar
                  label="Pieges juridiques"
                  score={selectedProfile.legalTrapScore}
                  icon={Scale}
                />
                <ScoreBar
                  label="Risques culturels"
                  score={selectedProfile.culturalRiskScore}
                  icon={Globe2}
                />
                <ScoreBar
                  label="Risques financiers"
                  score={selectedProfile.financialRiskScore}
                  icon={Briefcase}
                />
                <ScoreBar
                  label="Bureaucratie"
                  score={selectedProfile.bureaucraticScore}
                  icon={Shield}
                />
                <ScoreBar
                  label="Risques sociaux"
                  score={selectedProfile.socialRiskScore}
                  icon={Users}
                />
              </div>

              {/* Summary badges */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground mr-1">Legende :</span>
                <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-600">
                  1-3 Faible
                </Badge>
                <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/20 text-amber-600">
                  4-6 Modere
                </Badge>
                <Badge variant="outline" className="text-xs bg-red-500/10 border-red-500/20 text-red-600">
                  7-10 Eleve
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Risk count summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(CATEGORY_CONFIG) as CountryHiddenRisk['category'][]).map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              const count = selectedProfile.hiddenRisks.filter((r) => r.category === cat).length;
              return (
                <Card key={cat} className="glass-card text-center p-3">
                  <Icon className={cn('w-5 h-5 mx-auto mb-1', config.color)} />
                  <div className="text-xl font-bold">{count}</div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {config.label}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Hidden risk cards */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              Risques caches identifies ({selectedProfile.hiddenRisks.length})
            </h3>

            {selectedProfile.hiddenRisks.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Aucun risque cache repertorie pour ce pays.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {selectedProfile.hiddenRisks
                  .slice()
                  .sort((a, b) => b.severity - a.severity)
                  .map((risk) => (
                    <RiskCard key={risk.id} risk={risk} />
                  ))}
              </div>
            )}
          </div>

          {/* Legal disclaimer */}
          <Card className="glass-card border-muted-foreground/10 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-sm text-foreground/80">
                    Avertissement juridique
                  </p>
                  <p>
                    Les informations presentees dans cette analyse sont fournies a titre
                    purement indicatif et educatif. Elles ne constituent en aucun cas un
                    conseil juridique, financier ou professionnel. Les scores et evaluations
                    sont bases sur des donnees publiques et des analyses automatisees qui
                    peuvent contenir des imprecisions ou ne pas refleter la situation
                    actuelle dans le pays concerne.
                  </p>
                  <p>
                    Avant toute decision d'expatriation, d'investissement ou d'implantation,
                    nous recommandons vivement de consulter des professionnels qualifies
                    (avocats, fiscalistes, consultants en mobilite internationale) ayant une
                    expertise reconnue dans le pays de destination.
                  </p>
                  <p>
                    System Compass decline toute responsabilite quant aux decisions prises
                    sur la base de ces informations. Les risques caches, par nature, sont
                    difficiles a quantifier et leur materialisation depend de nombreux
                    facteurs contextuels propres a chaque situation individuelle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
