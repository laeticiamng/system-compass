import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, AlertTriangle, Sparkles, FileText, History, RefreshCw } from 'lucide-react';
import { useFinancialIntel, FinancialIntelResult } from '@/hooks/useFinancialIntel';
import { FinancialIntelResults } from '@/components/financial-intel/FinancialIntelResults';
import { FinancialIntelPdfExport } from '@/components/financial-intel/FinancialIntelPdfExport';
import { FinancialIntelHistory } from '@/components/financial-intel/FinancialIntelHistory';
import { FinancialIntelQuota } from '@/components/financial-intel/FinancialIntelQuota';
import { ShareButton } from '@/components/financial-intel/ShareButton';
import { useCountries } from '@/lib/countries-store';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const SECTORS = [
  { value: '', label: 'Tous les secteurs' },
  { value: 'savings', label: 'Épargne' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'crypto', label: 'Crypto-monnaies' },
  { value: 'trading', label: 'Trading' },
  { value: 'retirement', label: 'Retraite' },
  { value: 'insurance', label: 'Assurance' },
  { value: 'credit', label: 'Crédit' },
];

const AUDIENCES = [
  { value: '', label: 'Tous publics' },
  { value: 'individual', label: 'Particulier' },
  { value: 'diaspora', label: 'Diaspora' },
  { value: 'sme', label: 'PME' },
  { value: 'association', label: 'Association' },
];

export default function FinancialSafetyIntel() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { tier } = useSubscription();
  const { generateIntel, isLoading, result, error, reset } = useFinancialIntel();
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sectorFocus, setSectorFocus] = useState('');
  const [audience, setAudience] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const isPro = tier === 'pro' || tier === 'premium';

  const handleGenerate = async () => {
    if (!selectedCountry) return;
    await generateIntel({
      country: selectedCountry,
      sector_focus: sectorFocus || undefined,
      audience: audience || undefined,
    });
  };

  const handleReset = () => {
    reset();
    setSelectedCountry('');
    setSectorFocus('');
    setAudience('');
  };

  const handleLoadFromHistory = (historyResult: FinancialIntelResult) => {
    // The result is loaded directly from the history component
    // We need to set it in our local state if we want to display it
    setShowHistory(false);
  };

  const handlePdfExportComplete = () => {
    toast.success(t('financialIntel.pdfExported', 'PDF exporté avec succès'));
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t('financialIntel.title', 'Financial Safety Intel')}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            {t('financialIntel.subtitle', 'Comprendre les risques, reconnaître les pièges, choisir des voies régulées.')}
          </p>
        </div>

        {/* Disclaimer Banner */}
        <Alert className="mb-6 bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-sm text-amber-200">
            {t('financialIntel.mainDisclaimer', 
              'Information de prévention et éducation uniquement. Pas de conseil financier personnalisé. Vérifiez toujours les agréments auprès des régulateurs officiels.'
            )}
          </AlertDescription>
        </Alert>

        {/* Quota display */}
        <FinancialIntelQuota className="mb-6" />

        {!result ? (
          <div className="space-y-6">
            {/* History toggle */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                {t('financialIntel.history', 'Historique')}
              </Button>
            </div>

            {showHistory ? (
              <FinancialIntelHistory onLoadSnapshot={handleLoadFromHistory} />
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {t('financialIntel.generateTitle', 'Générer une analyse')}
                  </CardTitle>
                  <CardDescription>
                    {t('financialIntel.generateDescription', 
                      'Sélectionnez un pays pour obtenir les Top 7 arnaques à éviter et les Top 7 options régulées.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Country Select */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-1">
                      {t('common.country', 'Pays')}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country" className="w-full">
                        <SelectValue placeholder={t('financialIntel.selectCountry', 'Choisir un pays...')} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sector Focus */}
                  <div className="space-y-2">
                    <Label htmlFor="sector" className="flex items-center gap-1">
                      {t('financialIntel.sectorFocus', 'Focus sectoriel')}
                      <span className="text-muted-foreground text-xs">({t('common.optional', 'optionnel')})</span>
                    </Label>
                    <Select value={sectorFocus} onValueChange={setSectorFocus}>
                      <SelectTrigger id="sector" className="w-full">
                        <SelectValue placeholder={t('financialIntel.allSectors', 'Tous les secteurs')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>
                            {sector.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Audience */}
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="flex items-center gap-1">
                      {t('financialIntel.audience', 'Audience')}
                      <span className="text-muted-foreground text-xs">({t('common.optional', 'optionnel')})</span>
                    </Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger id="audience" className="w-full">
                        <SelectValue placeholder={t('financialIntel.allAudiences', 'Tous publics')} />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIENCES.map((aud) => (
                          <SelectItem key={aud.value} value={aud.value}>
                            {aud.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tier info */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {isPro ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30">Pro</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {isPro 
                          ? t('financialIntel.proAccess', 'Accès complet + export PDF')
                          : t('financialIntel.freeAccess', 'Aperçu Top 3 + Top 3')
                        }
                      </span>
                    </div>
                    {isPro && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">PDF</span>
                      </div>
                    )}
                  </div>

                  {/* Error display */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!selectedCountry || isLoading}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('financialIntel.generating', 'Génération en cours...')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t('financialIntel.generate', 'Générer l\'analyse')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('financialIntel.newAnalysis', 'Nouvelle analyse')}
              </Button>
              
              <div className="flex items-center gap-2">
                <ShareButton 
                  result={result} 
                  country={selectedCountry} 
                />
                
                {isPro && (
                  <FinancialIntelPdfExport 
                    result={result}
                    country={selectedCountry}
                    sectorFocus={sectorFocus}
                    audience={audience}
                    onExportComplete={handlePdfExportComplete}
                  />
                )}
              </div>
            </div>

            {/* Results */}
            <FinancialIntelResults result={result} isPro={isPro} />
          </div>
        )}
      </div>
    </div>
  );
}
