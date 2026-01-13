import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  FileCheck, 
  Users, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';

interface TerrainFrictionRisksProps {
  countryId: string;
  countryName: string;
}

const RISK_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  opacity: { label: 'Opacité', icon: <Eye className="w-4 h-4" /> },
  intermediary: { label: 'Intermédiaires', icon: <Users className="w-4 h-4" /> },
  undocumented: { label: 'Non-documenté', icon: <FileCheck className="w-4 h-4" /> },
  delay: { label: 'Délais', icon: <Clock className="w-4 h-4" /> },
  capture: { label: 'Dépendance', icon: <AlertTriangle className="w-4 h-4" /> },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Faible', color: 'bg-green-500/20 text-green-700 border-green-500/30' },
  medium: { label: 'Modéré', color: 'bg-amber-500/20 text-amber-700 border-amber-500/30' },
  high: { label: 'Élevé', color: 'bg-red-500/20 text-red-700 border-red-500/30' },
};

export function TerrainFrictionRisks({ countryId, countryName }: TerrainFrictionRisksProps) {
  const { t } = useTranslation();
  const { governance } = useCountryGovernance(countryId);

  // Get friction risks from governance data or use defaults
  const frictionData = governance?.friction_risks as {
    redFlags?: Array<{ id: string; label: string; severity: 'low' | 'medium' | 'high' }>;
    protections?: Array<{ id: string; label: string; implemented: boolean }>;
  } | undefined;

  const defaultRisks = [
    {
      id: 'opacity-1',
      type: 'opacity',
      severity: 'medium' as const,
      description: t('governance.friction.risk1Desc', 'Processus décisionnels peu transparents dans l\'administration'),
      protection: t('governance.friction.risk1Protection', 'Documenter toutes les interactions, demander confirmation écrite'),
    },
    {
      id: 'intermediary-1',
      type: 'intermediary',
      severity: 'medium' as const,
      description: t('governance.friction.risk2Desc', 'Recours fréquent à des intermédiaires pour accéder aux décideurs'),
      protection: t('governance.friction.risk2Protection', 'Vérifier références, ne jamais dépendre d\'un seul intermédiaire'),
    },
    {
      id: 'delay-1',
      type: 'delay',
      severity: 'high' as const,
      description: t('governance.friction.risk3Desc', 'Délais administratifs imprévisibles (2x à 5x les délais annoncés)'),
      protection: t('governance.friction.risk3Protection', 'Prévoir tampon temps x3, jalons contractuels avec pénalités'),
    },
  ];

  const redFlags = frictionData?.redFlags?.filter(f => f.severity === 'high').map(f => f.label) || [
    t('governance.friction.redFlag1', 'Demande de paiement hors contrat'),
    t('governance.friction.redFlag2', 'Pression temporelle artificielle'),
    t('governance.friction.redFlag3', 'Refus de documentation écrite'),
    t('governance.friction.redFlag4', 'Interlocuteur unique sans alternative'),
    t('governance.friction.redFlag5', 'Changement de règles en cours de processus'),
  ];

  const protections = [
    { label: t('governance.friction.protection1', 'Contrats avec jalons'), icon: <FileCheck className="w-4 h-4" /> },
    { label: t('governance.friction.protection2', 'Due diligence partenaires'), icon: <Users className="w-4 h-4" /> },
    { label: t('governance.friction.protection3', 'POC avant engagement'), icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: t('governance.friction.protection4', 'Documentation systématique'), icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-amber-600" />
          {t('governance.friction.title', 'Friction non-officielle (risques)')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('governance.friction.description', 'Zones d\'opacité et mesures de protection pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Friction Score */}
        {governance && (
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">{t('governance.friction.scoreLabel', 'Score friction')}</span>
            <Badge variant="outline" className={governance.friction_score >= 4 ? 'text-green-600' : governance.friction_score >= 3 ? 'text-amber-600' : 'text-red-600'}>
              {governance.friction_score}/5
            </Badge>
          </div>
        )}

        {/* Friction Risks */}
        <div className="space-y-3">
          {defaultRisks.map(risk => (
            <div key={risk.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {RISK_TYPE_CONFIG[risk.type]?.icon}
                  <span className="font-medium">{RISK_TYPE_CONFIG[risk.type]?.label}</span>
                </div>
                <Badge className={SEVERITY_CONFIG[risk.severity]?.color}>
                  {SEVERITY_CONFIG[risk.severity]?.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{risk.description}</p>
              <div className="flex items-start gap-2 text-sm bg-green-500/10 text-green-700 p-2 rounded">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t('governance.friction.protectionPrefix', 'Protection')} : {risk.protection}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Red Flags */}
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('governance.friction.redFlags', 'Drapeaux rouges')}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              {redFlags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Protections */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            {t('governance.friction.protections', 'Mesures de protection recommandées')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {protections.map((protection, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg text-sm">
                <span className="text-green-600">{protection.icon}</span>
                <span>{protection.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground italic border-t pt-4">
          {t('governance.friction.disclaimer', 'Ce module identifie les risques de friction. Il ne fournit aucune instruction de contournement. L\'objectif est la prévention, pas la prescription.')}
        </p>
      </CardContent>
    </Card>
  );
}
