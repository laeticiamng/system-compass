import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  Building2, 
  Coins,
  Info,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { ScamCard } from './ScamCard';
import { LegitOptionCard } from './LegitOptionCard';
import { ConfidenceGauge } from './ConfidenceGauge';
import { SourceLink } from './SourceLink';
import { CategoryFilter } from './CategoryFilter';
import type { FinancialIntelResult } from '@/hooks/useFinancialIntel';

interface FinancialIntelResultsProps {
  result: FinancialIntelResult;
  isPro?: boolean;
}

export function FinancialIntelResults({ result, isPro = false }: FinancialIntelResultsProps) {
  const { t } = useTranslation();
  const [scamCategoryFilter, setScamCategoryFilter] = useState<string | null>(null);
  const [legitCategoryFilter, setLegitCategoryFilter] = useState<string | null>(null);

  const filteredScams = scamCategoryFilter 
    ? result.scam_top7.filter(s => s.category === scamCategoryFilter)
    : result.scam_top7;

  const filteredLegit = legitCategoryFilter
    ? result.legit_top7.filter(o => o.category === legitCategoryFilter)
    : result.legit_top7;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Alert className="bg-muted/50 border-primary/30">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {result.disclaimer}
        </AlertDescription>
      </Alert>

      {/* Country Profile */}
      <Card className="bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {result.country_profile.name}
            </CardTitle>
            <ConfidenceGauge 
              confidence={result.confidence} 
              sourceConfidence={result.country_profile.source_confidence} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{result.country_profile.currency}</span>
            </div>
            {result.cached && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('financialIntel.cached', 'En cache')}
              </Badge>
            )}
          </div>
          
          {result.country_profile.main_regulators.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {t('financialIntel.regulators', 'Régulateurs principaux')}
              </p>
              <div className="flex flex-wrap gap-2">
                {result.country_profile.main_regulators.map((reg, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {reg}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Scams vs Legit */}
      <Tabs defaultValue="scams" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger 
            value="scams" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-destructive/20"
            aria-label={t('financialIntel.scamsTab', 'Montages à risque')}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('financialIntel.scamsTab', 'Montages à risque')}</span>
            <span className="sm:hidden">{t('financialIntel.scamsTabShort', 'Risques')}</span>
            <Badge variant="destructive" className="ml-1 text-xs">
              {result.scam_top7.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="legit" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/20"
            aria-label={t('financialIntel.legitTab', 'Options régulées')}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('financialIntel.legitTab', 'Options régulées')}</span>
            <span className="sm:hidden">{t('financialIntel.legitTabShort', 'Légitimes')}</span>
            <Badge className="ml-1 text-xs bg-primary/20 text-primary border-primary/30">
              {result.legit_top7.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scams" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h3 className="font-semibold">
              {t('financialIntel.scamsTitle', 'Top 7 des montages à risque (souvent des arnaques)')}
            </h3>
          </div>
          
          <CategoryFilter
            categories={result.scam_top7.map(s => s.category)}
            selectedCategory={scamCategoryFilter}
            onSelect={setScamCategoryFilter}
            type="scam"
          />
          
          {filteredScams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('financialIntel.noCategoryMatch', 'Aucun résultat pour cette catégorie')}
            </p>
          ) : (
            filteredScams.map((scam, index) => (
              <ScamCard key={index} scam={scam} index={index} />
            ))
          )}
        </TabsContent>

        <TabsContent value="legit" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Shield className="h-5 w-5" aria-hidden="true" />
            <h3 className="font-semibold">
              {t('financialIntel.legitTitle', 'Top 7 des options légitimes et "safe-by-design"')}
            </h3>
          </div>
          
          <CategoryFilter
            categories={result.legit_top7.map(o => o.category)}
            selectedCategory={legitCategoryFilter}
            onSelect={setLegitCategoryFilter}
            type="legit"
          />
          
          {filteredLegit.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('financialIntel.noCategoryMatch', 'Aucun résultat pour cette catégorie')}
            </p>
          ) : (
            filteredLegit.map((option, index) => (
              <LegitOptionCard key={index} option={option} index={index} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <Card className="bg-card/30 print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('financialIntel.sources', 'Sources utilisées')}
              <Badge variant="outline" className="text-xs ml-2">
                {result.sources.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, i) => (
                <SourceLink key={i} source={source} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
