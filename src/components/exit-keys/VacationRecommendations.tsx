import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, DollarSign, Shield, Clock, MapPin, AlertTriangle, Sparkles, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSmartVacationRecommendations, getDomesticVacationOptions, VacationDestination, DomesticDestination } from '@/lib/purchasing-power';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DestinationInsights } from '@/components/DestinationInsights';
import { DestinationRecommendation } from '@/lib/nationality-advantages';

interface VacationRecommendationsProps {
  currentCountryId: string;
  nationalityIds: string[];
  professionId?: string;
}

function getAccessBadgeColor(accessType: VacationDestination['accessType']): string {
  switch (accessType) {
    case 'visa_free': return 'bg-emerald-500/20 text-emerald-400';
    case 'visa_on_arrival': return 'bg-blue-500/20 text-blue-400';
    case 'easy_visa': return 'bg-amber-500/20 text-amber-400';
    case 'requires_visa': return 'bg-red-500/20 text-red-400';
  }
}

function VacationCard({ 
  destination, 
  onRequestInsights,
}: { 
  destination: VacationDestination; 
  onRequestInsights: (dest: VacationDestination) => void;
}) {
  const { t } = useTranslation();
  
  return (
    <div className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{destination.flag}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{destination.countryName}</h4>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className={cn("text-xs px-2 py-0.5 rounded-full", getAccessBadgeColor(destination.accessType))}>
              {t(`vacation.access.${destination.accessType}`, destination.accessType)}
            </span>
            <span className="text-xs text-muted-foreground">
              {destination.bestTimeToVisit}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
          <p className="text-lg font-bold text-emerald-400">{destination.purchasingPowerIndex}</p>
          <p className="text-xs text-muted-foreground">{t('vacation.purchasingPower', 'Pouvoir d\'achat')}</p>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
          <p className="text-lg font-bold text-blue-400">{destination.stayDurationAffordable}{t('vacation.days', 'j')}</p>
          <p className="text-xs text-muted-foreground">{t('vacation.withOneMonth', 'avec 1 mois')}</p>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <Shield className="w-4 h-4 mx-auto mb-1 text-amber-400" />
          <p className="text-lg font-bold text-amber-400">{destination.safetyScore}</p>
          <p className="text-xs text-muted-foreground">{t('vacation.safety', 'Sécurité')}</p>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        <p>{t('vacation.budget', 'Budget')}: <strong>~{destination.dailyBudgetLocal}€/{t('vacation.perDay', 'jour')}</strong></p>
      </div>
      
      {destination.warnings.length > 0 && (
        <div className="mb-2 flex items-start gap-1 text-xs text-amber-400">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{destination.warnings.join(', ')}</span>
        </div>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2 mt-2"
        onClick={() => onRequestInsights(destination)}
      >
        <Bot className="w-4 h-4" />
        {t('vacation.aiGuide', 'Guide IA')}
      </Button>
    </div>
  );
}

function DomesticCard({ destination }: { destination: DomesticDestination }) {
  const { t } = useTranslation();
  
  return (
    <div className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <MapPin className="w-6 h-6 text-primary" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold">{destination.city}</h4>
          <p className="text-sm text-muted-foreground">{destination.region}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">{destination.purchasingPowerIndex}</p>
          <p className="text-xs text-muted-foreground">{t('vacation.valueRatio', 'Rapport qualité/prix')}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-400">~{destination.dailyBudget}€</p>
          <p className="text-xs text-muted-foreground">{t('vacation.perDayFull', 'par jour')}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {destination.reasons.map((reason, i) => (
          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {reason}
          </span>
        ))}
      </div>
    </div>
  );
}

export function VacationRecommendations({ currentCountryId, nationalityIds, professionId }: VacationRecommendationsProps) {
  const { t } = useTranslation();
  const [selectedDestination, setSelectedDestination] = useState<VacationDestination | null>(null);
  
  const recommendations = useMemo(() => {
    if (!professionId) return null;
    return getSmartVacationRecommendations(currentCountryId, nationalityIds, professionId);
  }, [currentCountryId, nationalityIds, professionId]);
  
  const domesticOptions = useMemo(() => {
    return getDomesticVacationOptions(currentCountryId);
  }, [currentCountryId]);

  const handleRequestInsights = (dest: VacationDestination) => {
    setSelectedDestination(dest);
  };

  // Convert VacationDestination to DestinationRecommendation for DestinationInsights
  const convertToDestinationRec = (dest: VacationDestination): DestinationRecommendation => {
    // Map visa_on_arrival to easy_visa for compatibility
    const accessType = dest.accessType === 'visa_on_arrival' ? 'easy_visa' : dest.accessType;
    
    return {
      countryId: dest.countryId,
      countryName: dest.countryName,
      flag: dest.flag,
      accessType: accessType as 'visa_free' | 'easy_visa' | 'work_visa' | 'requires_visa',
      reasons: dest.reasons,
      score: dest.purchasingPowerIndex,
      matchedAdvantages: [],
    };
  };
  
  if (!professionId) {
    return (
      <div className="glass-card rounded-xl p-6 border-dashed border-2">
        <div className="text-center py-6">
          <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t('vacation.noProfession', 'Renseignez votre métier pour obtenir des recommandations vacances personnalisées basées sur votre pouvoir d\'achat')}
          </p>
        </div>
      </div>
    );
  }
  
  if (!recommendations || recommendations.bestValue.length === 0) {
    return null;
  }
  
  return (
    <>
      <div className="glass-card rounded-xl p-6 border-2 border-primary/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          {t('vacation.title', 'Recommandations Vacances par Pouvoir d\'Achat')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('vacation.subtitle', 'Destinations où votre salaire vous offre le meilleur rapport qualité/prix')}
        </p>
        
        <Tabs defaultValue="bestValue" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="bestValue" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              {t('vacation.tabs.bestValue', 'Meilleur prix')}
            </TabsTrigger>
            <TabsTrigger value="safest" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              {t('vacation.tabs.safest', 'Sûres')}
            </TabsTrigger>
            <TabsTrigger value="visaFree" className="text-xs">
              <Plane className="w-3 h-3 mr-1" />
              {t('vacation.tabs.visaFree', 'Sans visa')}
            </TabsTrigger>
            <TabsTrigger value="hidden" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {t('vacation.tabs.hidden', 'Pépites')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bestValue">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.bestValue.map(dest => (
                <VacationCard 
                  key={dest.countryId} 
                  destination={dest} 
                  onRequestInsights={handleRequestInsights}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="safest">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.safestOptions.map(dest => (
                <VacationCard 
                  key={dest.countryId} 
                  destination={dest} 
                  onRequestInsights={handleRequestInsights}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="visaFree">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.visaFreeOptions.map(dest => (
                <VacationCard 
                  key={dest.countryId} 
                  destination={dest} 
                  onRequestInsights={handleRequestInsights}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="hidden">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.hiddenGems.map(dest => (
                <VacationCard 
                  key={dest.countryId} 
                  destination={dest} 
                  onRequestInsights={handleRequestInsights}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Domestic options */}
        {domesticOptions.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {t('vacation.domestic', 'Options domestiques (sans voyager loin)')}
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domesticOptions.slice(0, 3).map((dest, i) => (
                <DomesticCard key={i} destination={dest} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DestinationInsights Modal */}
      {selectedDestination && (
        <DestinationInsights
          destination={convertToDestinationRec(selectedDestination)}
          nationalities={nationalityIds}
          aspiration="vacation"
          currentCountry={currentCountryId}
          mode="vacation"
          onClose={() => setSelectedDestination(null)}
        />
      )}
    </>
  );
}