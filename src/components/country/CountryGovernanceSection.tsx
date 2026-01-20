import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';
import { Loader2, Shield, Briefcase, Users, AlertTriangle, MapPin, Clock } from 'lucide-react';
import {
  CountryGovernanceScore,
  TerrainStateOfArt,
  TerrainAttractiveness,
  TerrainFrictionRisks,
  TerrainCompetition,
  TerrainStability,
  TerrainFiscalChecklist,
  TerrainCustomsLogistics,
  TerrainPartnerReliability,
  TerrainPOCPlanner,
  TerrainTimeline,
  GovernanceMap,
} from '@/components/governance';

interface CountryGovernanceSectionProps {
  countryId: string;
  countryName: string;
  pyramidType?: string;
  snapshot?: { corruptionIndex?: number; freedomIndex?: number };
}

export function CountryGovernanceSection({ 
  countryId, 
  countryName, 
  pyramidType,
  snapshot 
}: CountryGovernanceSectionProps) {
  const { t } = useTranslation();
  const { governance, isLoading, averageScore } = useCountryGovernance(countryId, pyramidType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Score Global Gouvernance */}
      <CountryGovernanceScore 
        countryId={countryId} 
        countryName={countryName}
        snapshot={snapshot}
      />

      {/* Tabs pour les différentes sections */}
      <Tabs defaultValue="preparation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-6">
          <TabsTrigger value="preparation" className="gap-1 text-xs sm:text-sm">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('governance.preparation', 'Préparation')}</span>
            <span className="sm:hidden">Prép.</span>
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-1 text-xs sm:text-sm">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('governance.risks', 'Risques')}</span>
            <span className="sm:hidden">Risk</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-1 text-xs sm:text-sm">
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('governance.operations', 'Opérations')}</span>
            <span className="sm:hidden">Ops</span>
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-1 text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('governance.partners', 'Partenaires')}</span>
            <span className="sm:hidden">Part.</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-1 text-xs sm:text-sm hidden lg:flex">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t('governance.mapTab', 'Carte')}</span>
          </TabsTrigger>
          <TabsTrigger value="execution" className="gap-1 text-xs sm:text-sm hidden lg:flex">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t('governance.execution', 'Exécution')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Préparation: État de l'art, Attractivité */}
        <TabsContent value="preparation" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <TerrainStateOfArt 
              countryId={countryId}
              countryName={countryName}
            />
            <TerrainAttractiveness 
              countryId={countryId}
              countryName={countryName}
            />
          </div>
          <TerrainStability 
            countryId={countryId}
            countryName={countryName}
            snapshot={snapshot}
          />
        </TabsContent>

        {/* Risques: Friction, Concurrence */}
        <TabsContent value="risks" className="space-y-6">
          <TerrainFrictionRisks 
            countryId={countryId}
            countryName={countryName}
          />
          <TerrainCompetition 
            countryId={countryId}
            countryName={countryName}
          />
        </TabsContent>

        {/* Opérations: Fiscalité, Douanes */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <TerrainFiscalChecklist 
              countryId={countryId}
              countryName={countryName}
            />
            <TerrainCustomsLogistics 
              countryId={countryId}
              countryName={countryName}
            />
          </div>
        </TabsContent>

        {/* Partenaires */}
        <TabsContent value="partners" className="space-y-6">
          <TerrainPartnerReliability 
            countryId={countryId}
            countryName={countryName}
          />
        </TabsContent>

        {/* Carte Gouvernance */}
        <TabsContent value="governance" className="space-y-6">
          <GovernanceMap 
            countryId={countryId}
            countryName={countryName}
          />
        </TabsContent>

        {/* Exécution: POC, Timeline */}
        <TabsContent value="execution" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <TerrainPOCPlanner 
              countryId={countryId}
              countryName={countryName}
            />
            <TerrainTimeline 
              countryId={countryId}
              countryName={countryName}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
