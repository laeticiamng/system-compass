import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Database, Play, CheckCircle2, XCircle, Loader2, RefreshCw, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

interface TranslationStatus {
  countryId: string;
  countryName: string;
  hasVariantTranslation: boolean;
  hasIntelTranslation: boolean;
  status: "pending" | "translating" | "success" | "error" | "skipped";
  error?: string;
}

const AdminDatabaseTranslations = () => {
  const [selectedLang, setSelectedLang] = useState<string>("fr");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatuses, setTranslationStatuses] = useState<TranslationStatus[]>([]);
  const [overallStats, setOverallStats] = useState<{
    totalCountries: number;
    variantsTranslated: Record<string, number>;
    intelTranslated: Record<string, number>;
  } | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Load overall stats
  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Get all countries with variants
      const { data: variants } = await supabase
        .from('country_variants')
        .select('country_id');
      
      // Get translation counts per language
      const { data: variantTranslations } = await supabase
        .from('country_variants_translations')
        .select('language, country_id');
      
      const { data: intelTranslations } = await supabase
        .from('country_intelligence_translations')
        .select('language, country_id');

      const variantsTranslated: Record<string, number> = {};
      const intelTranslated: Record<string, number> = {};

      for (const lang of LANGUAGES) {
        variantsTranslated[lang.code] = variantTranslations?.filter(t => t.language === lang.code).length || 0;
        intelTranslated[lang.code] = intelTranslations?.filter(t => t.language === lang.code).length || 0;
      }

      setOverallStats({
        totalCountries: variants?.length || 0,
        variantsTranslated,
        intelTranslated
      });

    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  // Load status for selected language
  const loadLanguageStatus = async (lang: string) => {
    setIsLoading(true);
    try {
      // Get all countries with variants and intelligence
      const { data: variants } = await supabase
        .from('country_variants')
        .select('country_id');

      const { data: intelligence } = await supabase
        .from('country_intelligence')
        .select('country_id');

      // Get existing translations for this language
      const { data: variantTranslations } = await supabase
        .from('country_variants_translations')
        .select('country_id')
        .eq('language', lang);

      const { data: intelTranslations } = await supabase
        .from('country_intelligence_translations')
        .select('country_id')
        .eq('language', lang);

      const variantTranslatedSet = new Set(variantTranslations?.map(t => t.country_id) || []);
      const intelTranslatedSet = new Set(intelTranslations?.map(t => t.country_id) || []);
      const intelSet = new Set(intelligence?.map(i => i.country_id) || []);

      const statuses: TranslationStatus[] = (variants || []).map(v => ({
        countryId: v.country_id,
        countryName: v.country_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        hasVariantTranslation: variantTranslatedSet.has(v.country_id),
        hasIntelTranslation: !intelSet.has(v.country_id) || intelTranslatedSet.has(v.country_id),
        status: "pending" as const
      }));

      setTranslationStatuses(statuses);
    } catch (error) {
      console.error("Error loading language status:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedLang) {
      loadLanguageStatus(selectedLang);
    }
  }, [selectedLang]);

  const missingCount = useMemo(() => {
    return translationStatuses.filter(s => !s.hasVariantTranslation || !s.hasIntelTranslation).length;
  }, [translationStatuses]);

  const translateMissing = async () => {
    const toTranslate = translationStatuses.filter(s => !s.hasVariantTranslation || !s.hasIntelTranslation);
    
    if (toTranslate.length === 0) {
      toast.info("Toutes les traductions sont déjà complètes pour cette langue");
      return;
    }

    setIsTranslating(true);
    setCurrentProgress(0);
    
    let completed = 0;
    let errors = 0;

    for (const item of toTranslate) {
      // Update status to translating
      setTranslationStatuses(prev => prev.map(s => 
        s.countryId === item.countryId ? { ...s, status: "translating" as const } : s
      ));

      try {
        // Call batch translate for this single country
        const { data, error } = await supabase.functions.invoke("batch-translate-countries", {
          body: {
            languages: [selectedLang],
            limit: 1,
            offset: translationStatuses.findIndex(s => s.countryId === item.countryId)
          }
        });

        if (error) throw error;

        // Check result
        const result = data?.results?.find((r: { countryId: string }) => r.countryId === item.countryId);
        
        if (result?.status === "error") {
          throw new Error(result.error || "Translation failed");
        }

        setTranslationStatuses(prev => prev.map(s => 
          s.countryId === item.countryId ? { 
            ...s, 
            status: "success" as const,
            hasVariantTranslation: true,
            hasIntelTranslation: true
          } : s
        ));
        completed++;

      } catch (error) {
        console.error(`Error translating ${item.countryId}:`, error);
        setTranslationStatuses(prev => prev.map(s => 
          s.countryId === item.countryId ? { 
            ...s, 
            status: "error" as const,
            error: error instanceof Error ? error.message : "Unknown error"
          } : s
        ));
        errors++;
      }

      setCurrentProgress(((completed + errors) / toTranslate.length) * 100);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTranslating(false);
    
    if (completed > 0) {
      toast.success(`${completed} traduction(s) complétée(s)`);
      loadStats();
    }
    if (errors > 0) {
      toast.error(`${errors} erreur(s) lors de la traduction`);
    }
  };

  // Translate a single country
  const translateSingleCountry = async (countryId: string, index: number) => {
    setTranslationStatuses(prev => prev.map(s => 
      s.countryId === countryId ? { ...s, status: "translating" as const } : s
    ));

    try {
      const { data, error } = await supabase.functions.invoke("batch-translate-countries", {
        body: {
          languages: [selectedLang],
          limit: 1,
          offset: index
        }
      });

      if (error) throw error;

      const result = data?.results?.find((r: { countryId: string }) => r.countryId === countryId);
      
      if (result?.status === "error") {
        throw new Error(result.error || "Translation failed");
      }

      setTranslationStatuses(prev => prev.map(s => 
        s.countryId === countryId ? { 
          ...s, 
          status: "success" as const,
          hasVariantTranslation: true,
          hasIntelTranslation: true
        } : s
      ));
      
      toast.success(`${countryId} traduit avec succès`);
      loadStats();

    } catch (error) {
      console.error(`Error translating ${countryId}:`, error);
      setTranslationStatuses(prev => prev.map(s => 
        s.countryId === countryId ? { 
          ...s, 
          status: "error" as const,
          error: error instanceof Error ? error.message : "Unknown error"
        } : s
      ));
      toast.error(`Erreur: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const getStatusIcon = (status: TranslationStatus) => {
    if (status.status === "translating") {
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    }
    if (status.status === "success") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (status.status === "error") {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    if (status.hasVariantTranslation && status.hasIntelTranslation) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <div className="w-4 h-4 rounded-full bg-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link to="/admin/translations" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux traductions
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Database className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Traductions Base de Données</h1>
            <p className="text-muted-foreground">
              Variantes et Intelligence des pays (stockées en Supabase)
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Couverture globale</CardTitle>
                <CardDescription>
                  {overallStats?.totalCountries || 0} pays avec données en base
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadStats} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {overallStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {LANGUAGES.map(lang => {
                  const variantPct = overallStats.totalCountries > 0 
                    ? Math.round((overallStats.variantsTranslated[lang.code] / overallStats.totalCountries) * 100) 
                    : 0;
                  const intelPct = overallStats.totalCountries > 0 
                    ? Math.round((overallStats.intelTranslated[lang.code] / overallStats.totalCountries) * 100) 
                    : 0;
                  const avgPct = Math.round((variantPct + intelPct) / 2);
                  
                  return (
                    <div 
                      key={lang.code}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLang === lang.code ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedLang(lang.code)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium text-sm">{lang.code.toUpperCase()}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Variantes</span>
                          <span className={variantPct === 100 ? "text-green-500" : "text-amber-500"}>
                            {variantPct}%
                          </span>
                        </div>
                        <Progress value={variantPct} className="h-1" />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Intelligence</span>
                          <span className={intelPct === 100 ? "text-green-500" : "text-amber-500"}>
                            {intelPct}%
                          </span>
                        </div>
                        <Progress value={intelPct} className="h-1" />
                      </div>
                      <div className="mt-2 text-center">
                        <Badge variant={avgPct === 100 ? "default" : "outline"} className="text-xs">
                          {avgPct}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Language Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{LANGUAGES.find(l => l.code === selectedLang)?.flag}</span>
                <div>
                  <CardTitle>
                    {LANGUAGES.find(l => l.code === selectedLang)?.name || selectedLang}
                  </CardTitle>
                  <CardDescription>
                    {missingCount} pays à traduire
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={translateMissing}
                  disabled={isTranslating || missingCount === 0}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traduction en cours...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Traduire {missingCount} pays
                    </>
                  )}
                </Button>
              </div>
            </div>
            {isTranslating && (
              <Progress value={currentProgress} className="mt-4" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {translationStatuses.map((status, index) => (
                    <div
                      key={status.countryId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        status.hasVariantTranslation && status.hasIntelTranslation 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <span className="font-medium">{status.countryName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <Badge 
                            variant={status.hasVariantTranslation ? "default" : "outline"}
                            className={`text-xs ${status.hasVariantTranslation ? 'bg-green-500' : ''}`}
                          >
                            V
                          </Badge>
                          <Badge 
                            variant={status.hasIntelTranslation ? "default" : "outline"}
                            className={`text-xs ${status.hasIntelTranslation ? 'bg-green-500' : ''}`}
                          >
                            I
                          </Badge>
                        </div>
                        {(!status.hasVariantTranslation || !status.hasIntelTranslation) && status.status !== "translating" && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => translateSingleCountry(status.countryId, index)}
                            disabled={isTranslating}
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                        {status.error && (
                          <span className="text-xs text-destructive max-w-[200px] truncate">
                            {status.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDatabaseTranslations;
