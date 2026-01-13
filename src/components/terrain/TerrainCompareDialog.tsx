import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Scale, ArrowLeftRight } from 'lucide-react';
import { useCountries } from '@/lib/countries-store';
import { useTerrainRealities, TerrainRealitiesResult } from '@/hooks/useTerrainRealities';
import { RiskOverviewChart } from './RiskOverviewChart';

interface TerrainCompareDialogProps {
  currentCountryId: string;
  currentCountryName: string;
  currentData: TerrainRealitiesResult;
}

export function TerrainCompareDialog({ 
  currentCountryId, 
  currentCountryName, 
  currentData 
}: TerrainCompareDialogProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const { generateRealities, isLoading, result: comparisonData, reset } = useTerrainRealities();

  const handleSelectCountry = async (countryName: string) => {
    setSelectedCountry(countryName);
    reset();
    await generateRealities(countryName);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCountry(null);
    reset();
  };

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-300';
      case 'medium': return 'bg-amber-500/20 text-amber-300';
      case 'low': return 'bg-green-500/20 text-green-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">{t('terrainRealities.compareCountries')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {t('terrainRealities.comparisonView')}
          </DialogTitle>
          <DialogDescription>
            {t('terrainRealities.selectCountryToCompare')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Country */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{currentCountryName}</h3>
              <Badge className={getRiskColor(currentData.overall_risk_level)}>
                {t(`terrainRealities.risk${currentData.overall_risk_level.charAt(0).toUpperCase() + currentData.overall_risk_level.slice(1)}`)}
              </Badge>
            </div>
            <RiskOverviewChart data={currentData} />
          </div>

          {/* Comparison Country */}
          <div className="space-y-2">
            {!selectedCountry && !isLoading && !comparisonData && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('terrainRealities.selectAnotherCountry')}</p>
                <ScrollArea className="h-64 border rounded-md p-2">
                  <div className="space-y-1">
                    {countries
                      .filter(c => c.id !== currentCountryId)
                      .map(country => (
                        <Button
                          key={country.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleSelectCountry(country.name)}
                        >
                          {country.name}
                        </Button>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('terrainRealities.loadingComparison')}</p>
                </div>
              </div>
            )}

            {comparisonData && selectedCountry && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{comparisonData.country_name}</h3>
                  <Badge className={getRiskColor(comparisonData.overall_risk_level)}>
                    {t(`terrainRealities.risk${comparisonData.overall_risk_level.charAt(0).toUpperCase() + comparisonData.overall_risk_level.slice(1)}`)}
                  </Badge>
                </div>
                <RiskOverviewChart data={comparisonData} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCountry(null);
                    reset();
                  }}
                >
                  {t('terrainRealities.selectAnotherCountry')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
