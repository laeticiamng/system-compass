import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Languages, Play, CheckCircle2, XCircle, Loader2, AlertTriangle, Copy, Download, Merge, FileJson, Database, RefreshCw, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Json } from "@/integrations/supabase/types";

// Import translation files
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import es from "@/locales/es.json";
import it from "@/locales/it.json";
import nl from "@/locales/nl.json";
import pt from "@/locales/pt.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LocaleData = Record<string, any>;

interface SavedTranslation {
  id: string;
  country_id: string;
  target_lang: string;
  translation: Record<string, unknown>;
  created_at: string;
  is_approved: boolean;
}

const LANGUAGES: { code: string; name: string; flag: string; data: LocaleData }[] = [
  { code: "en", name: "English", flag: "🇬🇧", data: en },
  { code: "fr", name: "Français", flag: "🇫🇷", data: fr },
  { code: "de", name: "Deutsch", flag: "🇩🇪", data: de },
  { code: "es", name: "Español", flag: "🇪🇸", data: es },
  { code: "it", name: "Italiano", flag: "🇮🇹", data: it },
  { code: "nl", name: "Nederlands", flag: "🇳🇱", data: nl },
  { code: "pt", name: "Português", flag: "🇵🇹", data: pt },
];

interface TranslationResult {
  countryId: string;
  status: "pending" | "translating" | "success" | "error";
  error?: string;
  translation?: Record<string, unknown>;
}

const AdminGenerateTranslations = () => {
  const { t } = useTranslation();
  const [targetLang, setTargetLang] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [generatedTranslations, setGeneratedTranslations] = useState<Record<string, Record<string, unknown>>>({});
  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>([]);
  const [activeTab, setActiveTab] = useState("generate");

  // Load saved translations from database
  const loadSavedTranslations = async () => {
    setIsLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from("generated_translations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setSavedTranslations((data || []) as SavedTranslation[]);
    } catch (error) {
      console.error("Error loading translations:", error);
      toast.error("Erreur lors du chargement des traductions");
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadSavedTranslations();
  }, []);

  // Save generated translations to database
  const saveToDatabase = async () => {
    if (Object.keys(generatedTranslations).length === 0 || !targetLang) {
      toast.error("Aucune traduction à sauvegarder");
      return;
    }

    setIsSaving(true);
    try {
      const entries = Object.entries(generatedTranslations);
      
      for (const [countryId, translation] of entries) {
        // Check if translation exists
        const { data: existing } = await supabase
          .from("generated_translations")
          .select("id")
          .eq("country_id", countryId)
          .eq("target_lang", targetLang)
          .maybeSingle();

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from("generated_translations")
            .update({ translation: translation as Json })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from("generated_translations")
            .insert([{
              country_id: countryId,
              target_lang: targetLang,
              translation: translation as Json
            }]);
          if (error) throw error;
        }
      }

      toast.success(`${entries.length} traduction(s) sauvegardée(s) en base`);
      await loadSavedTranslations();
    } catch (error) {
      console.error("Error saving translations:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Get source countries from English
  const sourceCountries = useMemo((): Record<string, { name: string; region: string; ruleOfGold: string; pyramid: Record<string, string>; whoWins: string[]; whoLoses: string[]; playbook: Record<string, unknown> }> => {
    return (en.countriesData || {}) as Record<string, { name: string; region: string; ruleOfGold: string; pyramid: Record<string, string>; whoWins: string[]; whoLoses: string[]; playbook: Record<string, unknown> }>;
  }, []);

  const countryIds = useMemo(() => Object.keys(sourceCountries), [sourceCountries]);

  // Get saved translations stats by language
  const savedStatsByLang = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const t of savedTranslations) {
      stats[t.target_lang] = (stats[t.target_lang] || 0) + 1;
    }
    return stats;
  }, [savedTranslations]);

  // Find missing countries for target language
  const missingCountries = useMemo(() => {
    if (!targetLang) return [];
    const targetData = LANGUAGES.find(l => l.code === targetLang)?.data;
    if (!targetData) return countryIds;
    
    const targetCountries = targetData.countriesData || {};
    return countryIds.filter(id => !targetCountries[id]);
  }, [targetLang, countryIds]);

  const progress = useMemo(() => {
    if (results.length === 0) return 0;
    const completed = results.filter(r => r.status === "success" || r.status === "error").length;
    return (completed / results.length) * 100;
  }, [results]);

  const toggleCountry = (countryId: string) => {
    const newSelected = new Set(selectedCountries);
    if (newSelected.has(countryId)) {
      newSelected.delete(countryId);
    } else {
      newSelected.add(countryId);
    }
    setSelectedCountries(newSelected);
  };

  const selectAllMissing = () => {
    setSelectedCountries(new Set(missingCountries));
  };

  const clearSelection = () => {
    setSelectedCountries(new Set());
  };

  const generateTranslations = async () => {
    if (!targetLang || selectedCountries.size === 0) {
      toast.error("Sélectionnez une langue cible et au moins un pays");
      return;
    }

    setIsGenerating(true);
    const countriesToTranslate = Array.from(selectedCountries);
    
    // Initialize results
    setResults(countriesToTranslate.map(id => ({
      countryId: id,
      status: "pending"
    })));

    const newTranslations: Record<string, Record<string, unknown>> = {};
    
    // Process sequentially to avoid rate limits
    for (let i = 0; i < countriesToTranslate.length; i++) {
      const countryId = countriesToTranslate[i];
      const sourceCountry = sourceCountries[countryId as keyof typeof sourceCountries];
      
      if (!sourceCountry) continue;

      // Update status to translating
      setResults(prev => prev.map(r => 
        r.countryId === countryId ? { ...r, status: "translating" as const } : r
      ));

      try {
        const { data, error } = await supabase.functions.invoke("generate-country-translations", {
          body: {
            countryId,
            sourceCountry,
            targetLang
          }
        });

        if (error) throw error;

        if (data.error) {
          throw new Error(data.error);
        }

        newTranslations[countryId] = data.translation;
        
        setResults(prev => prev.map(r => 
          r.countryId === countryId ? { 
            ...r, 
            status: "success" as const,
            translation: data.translation 
          } : r
        ));

        // Small delay between requests to avoid rate limiting
        if (i < countriesToTranslate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error translating ${countryId}:`, error);
        setResults(prev => prev.map(r => 
          r.countryId === countryId ? { 
            ...r, 
            status: "error" as const,
            error: error instanceof Error ? error.message : "Unknown error"
          } : r
        ));
      }
    }

    setGeneratedTranslations(prev => ({ ...prev, ...newTranslations }));
    setIsGenerating(false);
    
    const successCount = Object.keys(newTranslations).length;
    if (successCount > 0) {
      toast.success(`${successCount} traduction(s) générée(s) avec succès`);
    }
  };

  const copyToClipboard = () => {
    const output = JSON.stringify(generatedTranslations, null, 2);
    navigator.clipboard.writeText(output);
    toast.success("Traductions copiées dans le presse-papier");
  };

  const downloadTranslations = () => {
    const output = JSON.stringify(generatedTranslations, null, 2);
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `countriesData-${targetLang}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé");
  };

  // Generate merged full file ready to replace the existing one
  const getMergedFullFile = useMemo(() => {
    if (!targetLang || Object.keys(generatedTranslations).length === 0) return null;
    
    const targetLangData = LANGUAGES.find(l => l.code === targetLang)?.data;
    if (!targetLangData) return null;

    // Deep clone the target language data
    const merged = JSON.parse(JSON.stringify(targetLangData)) as LocaleData;
    
    // Merge generated translations into countriesData
    if (!merged.countriesData) {
      merged.countriesData = {};
    }
    
    for (const [countryId, translation] of Object.entries(generatedTranslations)) {
      merged.countriesData[countryId] = translation;
    }

    return merged;
  }, [targetLang, generatedTranslations]);

  const copyMergedToClipboard = () => {
    if (!getMergedFullFile) return;
    const output = JSON.stringify(getMergedFullFile, null, 2);
    navigator.clipboard.writeText(output);
    toast.success(`Fichier ${targetLang}.json complet copié (${Object.keys(getMergedFullFile.countriesData || {}).length} pays)`);
  };

  const downloadMergedFile = () => {
    if (!getMergedFullFile) return;
    const output = JSON.stringify(getMergedFullFile, null, 2);
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetLang}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Fichier ${targetLang}.json téléchargé - remplacez src/locales/${targetLang}.json`);
  };

  const getStatusIcon = (status: TranslationResult["status"]) => {
    switch (status) {
      case "pending": return <div className="w-4 h-4 rounded-full bg-muted" />;
      case "translating": return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error": return <XCircle className="w-4 h-4 text-destructive" />;
    }
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
          <Languages className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Générateur de traductions</h1>
            <p className="text-muted-foreground">
              Génère automatiquement les traductions manquantes des pays avec l'IA
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Générer
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Sauvegardées ({savedTranslations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>Sélectionnez la langue cible et les pays à traduire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Langue cible</label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.filter(l => l.code !== "en").map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} 
                            {savedStatsByLang[lang.code] && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({savedStatsByLang[lang.code]} en base)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {targetLang && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pays manquants</span>
                        <Badge variant={missingCountries.length > 0 ? "destructive" : "default"}>
                          {missingCountries.length}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={selectAllMissing}>
                          Sélectionner manquants
                        </Button>
                        <Button size="sm" variant="ghost" onClick={clearSelection}>
                          Effacer
                        </Button>
                      </div>

                      <ScrollArea className="h-[300px] border rounded-md p-2">
                        <div className="space-y-2">
                          {countryIds.map(countryId => {
                            const isMissing = missingCountries.includes(countryId);
                            const countryName = sourceCountries[countryId as keyof typeof sourceCountries]?.name || countryId;
                            
                            return (
                              <div key={countryId} className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedCountries.has(countryId)}
                                  onCheckedChange={() => toggleCountry(countryId)}
                                  disabled={isGenerating}
                                />
                                <span className={`text-sm ${isMissing ? "text-destructive" : "text-muted-foreground"}`}>
                                  {countryName}
                                </span>
                                {isMissing && (
                                  <AlertTriangle className="w-3 h-3 text-destructive" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>

                      <Button
                        className="w-full"
                        onClick={generateTranslations}
                        disabled={isGenerating || selectedCountries.size === 0}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Générer {selectedCountries.size} traduction(s)
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Progress & Results */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Progression</CardTitle>
                  {isGenerating && (
                    <Progress value={progress} className="mt-2" />
                  )}
                </CardHeader>
                <CardContent>
                  {results.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Sélectionnez des pays et lancez la génération</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {results.map(result => (
                          <div
                            key={result.countryId}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(result.status)}
                              <span className="font-medium">
                                {sourceCountries[result.countryId as keyof typeof sourceCountries]?.name || result.countryId}
                              </span>
                            </div>
                            {result.error && (
                              <span className="text-sm text-destructive">{result.error}</span>
                            )}
                            {result.status === "success" && (
                              <Badge variant="outline" className="text-green-600">
                                Traduit
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {Object.keys(generatedTranslations).length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copier nouvelles traductions
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadTranslations}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger partielles
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={saveToDatabase}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Sauvegarder en base
                        </Button>
                      </div>

                      {getMergedFullFile && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Merge className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Fichier fusionné prêt à l'emploi</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Fichier complet avec toutes les traductions existantes + nouvelles. 
                            Remplacez directement <code className="bg-muted px-1 rounded">src/locales/{targetLang}.json</code>
                          </p>
                          <div className="flex gap-2">
                            <Button onClick={copyMergedToClipboard}>
                              <FileJson className="w-4 h-4 mr-2" />
                              Copier fichier complet
                            </Button>
                            <Button variant="secondary" onClick={downloadMergedFile}>
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger {targetLang}.json
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            {Object.keys(generatedTranslations).length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Aperçu des nouvelles traductions</CardTitle>
                  <CardDescription>
                    Nouveaux pays traduits ({Object.keys(generatedTranslations).length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(generatedTranslations, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Traductions sauvegardées</CardTitle>
                    <CardDescription>
                      {savedTranslations.length} traduction(s) en base de données
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadSavedTranslations} disabled={isLoadingDb}>
                    {isLoadingDb ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {savedTranslations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune traduction sauvegardée</p>
                    <p className="text-sm">Générez des traductions et cliquez sur "Sauvegarder en base"</p>
                  </div>
                ) : (
                  <>
                    {/* Stats by language */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {LANGUAGES.filter(l => l.code !== "en").map(lang => {
                        const count = savedStatsByLang[lang.code] || 0;
                        return (
                          <Badge 
                            key={lang.code} 
                            variant={count > 0 ? "default" : "outline"}
                            className="gap-1"
                          >
                            {lang.flag} {count} pays
                          </Badge>
                        );
                      })}
                    </div>

                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {savedTranslations.map(t => {
                          const lang = LANGUAGES.find(l => l.code === t.target_lang);
                          const countryName = sourceCountries[t.country_id as keyof typeof sourceCountries]?.name || t.country_id;
                          
                          return (
                            <div
                              key={t.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{lang?.flag || "🌍"}</span>
                                <div>
                                  <span className="font-medium">{countryName}</span>
                                  <span className="text-sm text-muted-foreground ml-2">→ {lang?.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(t.created_at).toLocaleDateString()}
                                </span>
                                {t.is_approved && (
                                  <Badge variant="outline" className="text-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Approuvé
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminGenerateTranslations;
