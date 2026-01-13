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
  BookOpen
} from 'lucide-react';
import { ScamCard } from './ScamCard';
import { LegitOptionCard } from './LegitOptionCard';
import type { FinancialIntelResult } from '@/hooks/useFinancialIntel';

interface FinancialIntelResultsProps {
  result: FinancialIntelResult;
}

const confidenceColors: Record<string, string> = {
  high: 'bg-green-500/20 text-green-300 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export function FinancialIntelResults({ result }: FinancialIntelResultsProps) {
  const { t } = useTranslation();

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
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {result.country_profile.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{result.country_profile.currency}</span>
            </div>
            <Badge 
              variant="outline" 
              className={confidenceColors[result.country_profile.source_confidence]}
            >
              {t(`financialIntel.confidence.${result.country_profile.source_confidence}`, 
                result.country_profile.source_confidence === 'high' ? 'Sources fiables' :
                result.country_profile.source_confidence === 'medium' ? 'Sources moyennes' : 'À confirmer localement'
              )}
            </Badge>
          </div>
          
          {result.country_profile.main_regulators.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {t('financialIntel.regulators', 'Régulateurs principaux')}
              </p>
              <div className="flex flex-wrap gap-2">
                {result.country_profile.main_regulators.map((reg, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
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
          <TabsTrigger value="scams" className="flex items-center gap-2 py-3 data-[state=active]:bg-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('financialIntel.scamsTab', 'Montages à risque')}</span>
            <span className="sm:hidden">{t('financialIntel.scamsTabShort', 'Risques')}</span>
            <Badge variant="destructive" className="ml-1 text-xs">
              {result.scam_top7.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="legit" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/20">
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
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">
              {t('financialIntel.scamsTitle', 'Top 7 des montages à risque (souvent des arnaques)')}
            </h3>
          </div>
          
          {result.scam_top7.map((scam, index) => (
            <ScamCard key={index} scam={scam} index={index} />
          ))}
        </TabsContent>

        <TabsContent value="legit" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Shield className="h-5 w-5" />
            <h3 className="font-semibold">
              {t('financialIntel.legitTitle', 'Top 7 des options légitimes et "safe-by-design"')}
            </h3>
          </div>
          
          {result.legit_top7.map((option, index) => (
            <LegitOptionCard key={index} option={option} index={index} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Sources */}
      {result.sources.length > 0 && (
        <Card className="bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('financialIntel.sources', 'Sources utilisées')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs"
                  title={source.url}
                >
                  {source.name}
                  {source.type && (
                    <span className="ml-1 text-muted-foreground">({source.type})</span>
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('financialIntel.confidenceScore', 'Score de confiance')}: {Math.round(result.confidence * 100)}%
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
