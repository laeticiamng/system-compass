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
import { Loader2, Scale, ArrowLeftRight, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCountries } from '@/lib/countries-store';
import { useTerrainRealities, TerrainRealitiesResult } from '@/hooks/useTerrainRealities';
import { RiskOverviewChart } from './RiskOverviewChart';

interface TerrainCompareDialogProps {
  currentCountryId: string;
  currentCountryName: string;
  currentData: TerrainRealitiesResult;
}

interface ComparisonIndicator {
  label: string;
  currentValue: string;
  comparisonValue: string;
  currentLevel: 'high' | 'medium' | 'low';
  comparisonLevel: 'high' | 'medium' | 'low';
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

  const getRiskScore = (level: 'high' | 'medium' | 'low'): number => {
    switch (level) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  };

  const getComparisonIcon = (current: 'high' | 'medium' | 'low', comparison: 'high' | 'medium' | 'low') => {
    const currentScore = getRiskScore(current);
    const comparisonScore = getRiskScore(comparison);
    
    if (comparisonScore < currentScore) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else if (comparisonScore > currentScore) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getComparisonIndicators = (): ComparisonIndicator[] => {
    if (!comparisonData) return [];

    const indicators: ComparisonIndicator[] = [];

    // Overall risk
    indicators.push({
      label: t('terrainRealities.overallRisk', 'Risque global'),
      currentValue: t(`terrainRealities.risk${currentData.overall_risk_level.charAt(0).toUpperCase() + currentData.overall_risk_level.slice(1)}`),
      comparisonValue: t(`terrainRealities.risk${comparisonData.overall_risk_level.charAt(0).toUpperCase() + comparisonData.overall_risk_level.slice(1)}`),
      currentLevel: currentData.overall_risk_level,
      comparisonLevel: comparisonData.overall_risk_level
    });

    // Compare domain-specific risks
    const domainComparisons = [
      { 
        label: t('terrainRealities.healthcare', 'Santé'), 
        currentLevel: currentData.healthcare_realities.risk_level,
        comparisonLevel: comparisonData.healthcare_realities.risk_level
      },
      { 
        label: t('terrainRealities.justice', 'Justice'), 
        currentLevel: currentData.justice_realities.risk_level,
        comparisonLevel: comparisonData.justice_realities.risk_level
      },
      { 
        label: t('terrainRealities.security', 'Sécurité'), 
        currentLevel: currentData.security_realities.risk_level,
        comparisonLevel: comparisonData.security_realities.risk_level
      },
      { 
        label: t('terrainRealities.administration', 'Administration'), 
        currentLevel: currentData.administration_realities.risk_level,
        comparisonLevel: comparisonData.administration_realities.risk_level
      }
    ];

    domainComparisons.forEach(domain => {
      indicators.push({
        label: domain.label,
        currentValue: t(`terrainRealities.risk${domain.currentLevel.charAt(0).toUpperCase() + domain.currentLevel.slice(1)}`),
        comparisonValue: t(`terrainRealities.risk${domain.comparisonLevel.charAt(0).toUpperCase() + domain.comparisonLevel.slice(1)}`),
        currentLevel: domain.currentLevel,
        comparisonLevel: domain.comparisonLevel
      });
    });

    return indicators;
  };

  const getVerdict = () => {
    if (!comparisonData) return null;

    const currentScore = getRiskScore(currentData.overall_risk_level);
    const comparisonScore = getRiskScore(comparisonData.overall_risk_level);

    if (comparisonScore < currentScore) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        text: t('terrainRealities.comparisonBetter', '{{country}} présente moins de risques', { country: comparisonData.country_name }),
        color: 'text-emerald-500'
      };
    } else if (comparisonScore > currentScore) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        text: t('terrainRealities.comparisonWorse', '{{country}} présente plus de risques', { country: comparisonData.country_name }),
        color: 'text-amber-500'
      };
    }
    return {
      icon: <Minus className="w-5 h-5 text-muted-foreground" />,
      text: t('terrainRealities.comparisonSame', 'Niveau de risque similaire'),
      color: 'text-muted-foreground'
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">{t('terrainRealities.compareCountries')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {t('terrainRealities.comparisonView')}
          </DialogTitle>
          <DialogDescription>
            {t('terrainRealities.selectCountryToCompare')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Country */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{currentCountryName}</h3>
              <Badge className={getRiskColor(currentData.overall_risk_level)}>
                {t(`terrainRealities.risk${currentData.overall_risk_level.charAt(0).toUpperCase() + currentData.overall_risk_level.slice(1)}`)}
              </Badge>
            </div>
            <RiskOverviewChart data={currentData} />
          </div>

          {/* Comparison Country */}
          <div className="space-y-4">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{comparisonData.country_name}</h3>
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

        {/* Comparison Table */}
        {comparisonData && (
          <div className="mt-6 space-y-4">
            {/* Verdict */}
            {getVerdict() && (
              <div className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 ${getVerdict()?.color}`}>
                {getVerdict()?.icon}
                <span className="font-medium">{getVerdict()?.text}</span>
              </div>
            )}

            {/* Indicators Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">{t('terrainRealities.indicator', 'Indicateur')}</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">{currentCountryName}</th>
                    <th className="px-4 py-2 text-center text-sm font-medium w-12"></th>
                    <th className="px-4 py-2 text-center text-sm font-medium">{comparisonData.country_name}</th>
                  </tr>
                </thead>
                <tbody>
                  {getComparisonIndicators().map((indicator, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2 text-sm">{indicator.label}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="outline" className={getRiskColor(indicator.currentLevel)}>
                          {indicator.currentValue}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {getComparisonIcon(indicator.currentLevel, indicator.comparisonLevel)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="outline" className={getRiskColor(indicator.comparisonLevel)}>
                          {indicator.comparisonValue}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
