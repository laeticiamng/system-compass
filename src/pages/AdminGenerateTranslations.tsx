import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft,
  Languages,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Copy,
  Download,
  Merge,
  FileJson,
  Database,
  RefreshCw,
  Clock,
  Check,
  ListChecks,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface TranslationJobLog {
  timestamp: string;
  level: string;
  message: string;
}

interface TranslationJob {
  id: string;
  country_id: string;
  target_lang: string;
  status: "queued" | "running" | "completed" | "failed";
  logs: TranslationJobLog[] | null;
  error_message: string | null;
  retries: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
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

const AdminGenerateTranslations = () => {
  const [targetLang, setTargetLang] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>([]);
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [activeTab, setActiveTab] = useState("generate");
  const [savedLangFilter, setSavedLangFilter] = useState<string>("all");
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());

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

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const { data, error } = await supabase
        .from("translation_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setJobs((data || []) as TranslationJob[]);
    } catch (error) {
      console.error("Error loading translation jobs:", error);
      toast.error("Erreur lors du chargement des jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadSavedTranslations();
    loadJobs();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("translation-jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "translation_jobs" },
        payload => {
          setJobs(prev => {
            const next = [...prev];
            if (payload.eventType === "DELETE") {
              return next.filter(job => job.id !== payload.old.id);
            }
            const updated = payload.new as TranslationJob;
            const index = next.findIndex(job => job.id === updated.id);
            if (index >= 0) {
              next[index] = updated;
              return next;
            }
            return [updated, ...next];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get source countries from English
  const sourceCountries = useMemo(
    (): Record<
      string,
      {
        name: string;
        region: string;
        ruleOfGold: string;
        pyramid: Record<string, string>;
        whoWins: string[];
        whoLoses: string[];
        playbook: Record<string, unknown>;
      }
    > => {
      return (en.countriesData || {}) as Record<
        string,
        {
          name: string;
          region: string;
          ruleOfGold: string;
          pyramid: Record<string, string>;
          whoWins: string[];
          whoLoses: string[];
          playbook: Record<string, unknown>;
        }
      >;
    },
    []
  );

  const countryIds = useMemo(() => Object.keys(sourceCountries), [sourceCountries]);

  // Get saved translations stats by language
  const savedStatsByLang = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const saved of savedTranslations) {
      stats[saved.target_lang] = (stats[saved.target_lang] || 0) + 1;
    }
    return stats;
  }, [savedTranslations]);

  const jobsForTargetLang = useMemo(() => {
    if (!targetLang) return jobs;
    return jobs.filter(job => job.target_lang === targetLang);
  }, [jobs, targetLang]);

  const pendingTranslations = useMemo(() => {
    return savedTranslations.filter(saved => !saved.is_approved);
  }, [savedTranslations]);

  const filteredSavedTranslations = useMemo(() => {
    let list = savedTranslations;
    if (savedLangFilter !== "all") {
      list = list.filter(saved => saved.target_lang === savedLangFilter);
    }
    if (showPendingOnly) {
      list = list.filter(saved => !saved.is_approved);
    }
    return list;
  }, [savedTranslations, savedLangFilter, showPendingOnly]);

  const approvalCandidates = useMemo(() => {
    return filteredSavedTranslations.filter(saved => !saved.is_approved);
  }, [filteredSavedTranslations]);

  // Find missing countries for target language
  const missingCountries = useMemo(() => {
    if (!targetLang) return [];
    const targetData = LANGUAGES.find(l => l.code === targetLang)?.data;
    if (!targetData) return countryIds;

    const targetCountries = targetData.countriesData || {};
    return countryIds.filter(id => !targetCountries[id]);
  }, [targetLang, countryIds]);

  const progress = useMemo(() => {
    if (jobsForTargetLang.length === 0) return 0;
    const completed = jobsForTargetLang.filter(job => job.status === "completed" || job.status === "failed").length;
    return (completed / jobsForTargetLang.length) * 100;
  }, [jobsForTargetLang]);

  const selectedTranslationsByCountry = useMemo(() => {
    if (!targetLang) return {};
    return savedTranslations
      .filter(saved => saved.target_lang === targetLang)
      .reduce((acc, saved) => {
        acc[saved.country_id] = saved.translation;
        return acc;
      }, {} as Record<string, Record<string, unknown>>);
  }, [savedTranslations, targetLang]);

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

    try {
      const countriesToTranslate = Array.from(selectedCountries).map(countryId => ({
        countryId,
        sourceCountry: sourceCountries[countryId as keyof typeof sourceCountries],
      }));

      const { data, error } = await supabase.functions.invoke("batch-generate-translations", {
        body: {
          targetLang,
          countries: countriesToTranslate,
        },
      });

      if (error) throw error;

      toast.success(`${data?.jobsCreated ?? countriesToTranslate.length} job(s) lancé(s)`);
      setSelectedCountries(new Set());
      loadJobs();
    } catch (error) {
      console.error("Error launching translation batch:", error);
      toast.error("Erreur lors du lancement de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!targetLang || Object.keys(selectedTranslationsByCountry).length === 0) {
      toast.error("Aucune traduction à copier");
      return;
    }
    const output = JSON.stringify(selectedTranslationsByCountry, null, 2);
    navigator.clipboard.writeText(output);
    toast.success("Traductions copiées dans le presse-papier");
  };

  const downloadTranslations = () => {
    if (!targetLang || Object.keys(selectedTranslationsByCountry).length === 0) {
      toast.error("Aucune traduction à télécharger");
      return;
    }
    const output = JSON.stringify(selectedTranslationsByCountry, null, 2);
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
    if (!targetLang || Object.keys(selectedTranslationsByCountry).length === 0) return null;

    const targetLangData = LANGUAGES.find(l => l.code === targetLang)?.data;
    if (!targetLangData) return null;

    const merged = JSON.parse(JSON.stringify(targetLangData)) as LocaleData;

    if (!merged.countriesData) {
      merged.countriesData = {};
    }

    for (const [countryId, translation] of Object.entries(selectedTranslationsByCountry)) {
      merged.countriesData[countryId] = translation;
    }

    return merged;
  }, [targetLang, selectedTranslationsByCountry]);

  const copyMergedToClipboard = () => {
    if (!getMergedFullFile) return;
    const output = JSON.stringify(getMergedFullFile, null, 2);
    navigator.clipboard.writeText(output);
    toast.success(
      `Fichier ${targetLang}.json complet copié (${Object.keys(getMergedFullFile.countriesData || {}).length} pays)`
    );
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

  const toggleApprovalSelection = (id: string) => {
    setSelectedApprovals(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllPendingApprovals = () => {
    setSelectedApprovals(new Set(approvalCandidates.map(item => item.id)));
  };

  const clearApprovalSelection = () => {
    setSelectedApprovals(new Set());
  };

  const approveSelected = async () => {
    if (selectedApprovals.size === 0) {
      toast.error("Sélectionnez au moins une traduction");
      return;
    }

    try {
      const { error } = await supabase
        .from("generated_translations")
        .update({ is_approved: true })
        .in("id", Array.from(selectedApprovals));

      if (error) throw error;

      toast.success(`${selectedApprovals.size} traduction(s) approuvée(s)`);
      setSelectedApprovals(new Set());
      loadSavedTranslations();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Erreur lors de la validation");
    }
  };

  const getStatusIcon = (status: TranslationJob["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: TranslationJob["status"]) => {
    switch (status) {
      case "queued":
        return "bg-muted text-muted-foreground";
      case "running":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLatestLog = (job: TranslationJob) => {
    if (!job.logs || !Array.isArray(job.logs) || job.logs.length === 0) return null;
    const lastLog = job.logs[job.logs.length - 1];
    if (!lastLog || typeof lastLog !== "object") return null;
    return (lastLog as TranslationJobLog).message || null;
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
              Génère automatiquement les traductions manquantes des pays avec l&apos;IA
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
                                {isMissing && <AlertTriangle className="w-3 h-3 text-destructive" />}
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
                            Lancement en cours...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Lancer {selectedCountries.size} job(s)
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Les traductions sont générées en arrière-plan. Suivez l&apos;avancement en temps réel.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Progress & Jobs */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Progression</CardTitle>
                    <Button variant="ghost" size="sm" onClick={loadJobs} disabled={jobsLoading}>
                      {jobsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {jobsForTargetLang.length > 0 && <Progress value={progress} className="mt-2" />}
                </CardHeader>
                <CardContent>
                  {jobsForTargetLang.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun job pour cette langue</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[420px]">
                      <div className="space-y-2">
                        {jobsForTargetLang.map(job => {
                          const countryName = sourceCountries[job.country_id as keyof typeof sourceCountries]?.name ||
                            job.country_id;
                          const latestLog = getLatestLog(job);
                          return (
                            <div
                              key={job.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(job.status)}
                                <div>
                                  <span className="font-medium">{countryName}</span>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(job.updated_at).toLocaleString()} · {job.retries} retry(s)
                                  </div>
                                  {latestLog && (
                                    <div className="text-xs text-muted-foreground mt-1">{latestLog}</div>
                                  )}
                                  {job.error_message && (
                                    <div className="text-xs text-destructive mt-1">{job.error_message}</div>
                                  )}
                                </div>
                              </div>
                              <Badge className={getStatusBadge(job.status)}>{job.status}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}

                  {Object.keys(selectedTranslationsByCountry).length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copier traductions en base
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadTranslations}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger partielles
                        </Button>
                      </div>

                      {getMergedFullFile && (
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Merge className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Fichier fusionné prêt à l&apos;emploi</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Fichier complet avec toutes les traductions existantes. Remplacez directement
                            <code className="bg-muted px-1 rounded">src/locales/{targetLang}.json</code>
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
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Traductions sauvegardées</CardTitle>
                    <CardDescription>
                      {savedTranslations.length} traduction(s) en base de données
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={savedLangFilter} onValueChange={value => setSavedLangFilter(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Toutes langues" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes langues</SelectItem>
                        {LANGUAGES.filter(l => l.code !== "en").map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={loadSavedTranslations} disabled={isLoadingDb}>
                      {isLoadingDb ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {savedTranslations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune traduction sauvegardée</p>
                    <p className="text-sm">Lancez un batch pour générer des traductions</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {LANGUAGES.filter(l => l.code !== "en").map(lang => {
                          const count = savedStatsByLang[lang.code] || 0;
                          return (
                            <Badge key={lang.code} variant={count > 0 ? "default" : "outline"} className="gap-1">
                              {lang.flag} {count} pays
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ListChecks className="w-4 h-4" />
                          <span>{pendingTranslations.length} traductions en attente</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={showPendingOnly}
                            onCheckedChange={value => setShowPendingOnly(Boolean(value))}
                          />
                          <span className="text-sm">Afficher uniquement en attente</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={selectAllPendingApprovals}
                          disabled={approvalCandidates.length === 0}
                        >
                          Tout sélectionner
                        </Button>
                        <Button size="sm" variant="ghost" onClick={clearApprovalSelection}>
                          Effacer
                        </Button>
                        <Button size="sm" onClick={approveSelected} disabled={selectedApprovals.size === 0}>
                          <Check className="w-4 h-4 mr-2" />
                          Approuver la sélection ({selectedApprovals.size})
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[520px]">
                      <div className="space-y-2">
                        {filteredSavedTranslations.map(saved => {
                          const lang = LANGUAGES.find(l => l.code === saved.target_lang);
                          const countryName = sourceCountries[saved.country_id as keyof typeof sourceCountries]?.name ||
                            saved.country_id;

                          return (
                            <div
                              key={saved.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {!saved.is_approved && (
                                  <Checkbox
                                    checked={selectedApprovals.has(saved.id)}
                                    onCheckedChange={() => toggleApprovalSelection(saved.id)}
                                  />
                                )}
                                <span className="text-lg">{lang?.flag || "🌍"}</span>
                                <div>
                                  <span className="font-medium">{countryName}</span>
                                  <span className="text-sm text-muted-foreground ml-2">→ {lang?.name}</span>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(saved.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {saved.is_approved ? (
                                  <Badge variant="outline" className="text-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Approuvé
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-orange-500">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    En attente
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
