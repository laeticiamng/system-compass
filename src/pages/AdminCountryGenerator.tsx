import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCountries } from "@/lib/countries-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Loader2, Play, RefreshCw, CheckCircle, XCircle, Clock, 
  AlertTriangle, Globe, Zap, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGenerationNotifications } from "@/hooks/useGenerationNotifications";

interface GenerationJob {
  id: string;
  country_id: string;
  country_name: string;
  iso2: string;
  status: "pending" | "running" | "done" | "failed" | "validating";
  specificity_score: number | null;
  confidence_score: number | null;
  stereotype_flag: boolean;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface GenerationBatch {
  id: string;
  name: string;
  total_countries: number;
  completed_countries: number;
  failed_countries: number;
  status: "pending" | "running" | "completed" | "failed";
  concurrency: number;
  created_at: string;
}

const PYRAMID_MAP: Record<string, string> = {
  "rent-seeking": "Rente du problème",
  "redistribution": "Redistribution stabilité",
  "trust-competence": "Confiance compétence",
  "risk-growth": "Risque croissance",
  "hybrid": "Hybride transition",
  "extraction": "Extraction ressources",
};

const REGION_MAP: Record<string, string> = {
  france: "Europe de l'Ouest",
  germany: "Europe de l'Ouest",
  "united-kingdom": "Europe du Nord",
  switzerland: "Europe de l'Ouest",
  netherlands: "Europe du Nord",
  italy: "Europe du Sud",
  spain: "Europe du Sud",
  portugal: "Europe du Sud",
  usa: "Amérique du Nord",
  canada: "Amérique du Nord",
  mexico: "Amérique du Nord",
  japan: "Asie de l'Est",
  singapore: "Asie du Sud-Est",
  australia: "Océanie",
  "united-arab-emirates": "Moyen-Orient",
  brazil: "Amérique du Sud",
};

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2.toUpperCase().split("").map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function AdminCountryGenerator() {
  const { countries } = useCountries();
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [batches, setBatches] = useState<GenerationBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [concurrency, setConcurrency] = useState(5);
  const [batchName, setBatchName] = useState("");

  // Real-time notifications hook
  const { connectionStatus, lastUpdate } = useGenerationNotifications();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const [jobsResult, batchesResult] = await Promise.all([
      supabase
        .from("country_generation_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("country_generation_batches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (jobsResult.data) setJobs(jobsResult.data as GenerationJob[]);
    if (batchesResult.data) setBatches(batchesResult.data as GenerationBatch[]);
    setLoading(false);
  }

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const selectAll = () => {
    setSelectedCountries(countries.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedCountries([]);
  };

  const startGeneration = async () => {
    if (selectedCountries.length === 0) {
      toast.error("Sélectionnez au moins un pays");
      return;
    }

    setGenerating(true);

    try {
      const countryInputs = selectedCountries.map(id => {
        const country = countries.find(c => c.id === id);
        return {
          country_id: id,
          country_name: country?.name || id,
          iso2: country?.iso2 || "XX",
          region: REGION_MAP[id] || "Unknown",
          primary_pyramid: PYRAMID_MAP[country?.pyramidType || "hybrid"] || "Hybride transition",
        };
      });

      const response = await supabase.functions.invoke("batch-generate-countries", {
        body: {
          batch_name: batchName || `Batch ${new Date().toLocaleDateString()}`,
          countries: countryInputs,
          concurrency,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Génération lancée pour ${selectedCountries.length} pays`);
      setSelectedCountries([]);
      setBatchName("");
      fetchData();
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Erreur lors du lancement de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const retryJob = async (job: GenerationJob) => {
    try {
      const response = await supabase.functions.invoke("generate-country-profile", {
        body: {
          job_id: job.id,
          country: {
            country_id: job.country_id,
            country_name: job.country_name,
            iso2: job.iso2,
            region: REGION_MAP[job.country_id] || "Unknown",
            primary_pyramid: "Hybride transition",
          },
        },
      });

      if (response.error) throw new Error(response.error.message);
      toast.success(`Relance pour ${job.country_name}`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la relance");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-risk-low" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-risk-high" />;
      case "running":
      case "validating":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      done: "bg-risk-low/10 text-risk-low",
      completed: "bg-risk-low/10 text-risk-low",
      failed: "bg-risk-high/10 text-risk-high",
      running: "bg-primary/10 text-primary",
      validating: "bg-yellow-500/10 text-yellow-500",
      pending: "bg-muted text-muted-foreground",
    };
    return variants[status] || variants.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const runningBatch = batches.find(b => b.status === "running");
  const completedJobs = jobs.filter(j => j.status === "done").length;
  const failedJobs = jobs.filter(j => j.status === "failed").length;
  const avgSpecificity = jobs.filter(j => j.specificity_score).reduce((acc, j) => acc + (j.specificity_score || 0), 0) / (jobs.filter(j => j.specificity_score).length || 1);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
                <Zap className="w-8 h-8" />
                Country Intelligence Generator
              </h1>
              <p className="text-muted-foreground">
                Génération automatisée des fiches pays Premium via IA (Tronc + Variante + Intelligence A→G + Tags)
              </p>
            </div>
            
            {/* Real-time connection indicator */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                connectionStatus === 'connected' && "bg-risk-low/10 text-risk-low",
                connectionStatus === 'connecting' && "bg-yellow-500/10 text-yellow-500",
                connectionStatus === 'disconnected' && "bg-muted text-muted-foreground",
                connectionStatus === 'error' && "bg-risk-high/10 text-risk-high"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  connectionStatus === 'connected' && "bg-risk-low animate-pulse",
                  connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                  connectionStatus === 'disconnected' && "bg-muted-foreground",
                  connectionStatus === 'error' && "bg-risk-high"
                )} />
                {connectionStatus === 'connected' && 'Temps réel actif'}
                {connectionStatus === 'connecting' && 'Connexion...'}
                {connectionStatus === 'disconnected' && 'Déconnecté'}
                {connectionStatus === 'error' && 'Erreur connexion'}
              </div>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Dernière MAJ: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-risk-low">{completedJobs}</div>
              <p className="text-sm text-muted-foreground">Terminés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-risk-high">{failedJobs}</div>
              <p className="text-sm text-muted-foreground">Échoués</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{avgSpecificity.toFixed(0)}%</div>
              <p className="text-sm text-muted-foreground">Spécificité moyenne</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Country Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sélection des pays
                </CardTitle>
                <CardDescription>
                  {selectedCountries.length} pays sélectionnés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>Tout</Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>Aucun</Button>
                </div>

                <ScrollArea className="h-64 border rounded-md p-2">
                  <div className="space-y-1">
                    {countries.map(country => (
                      <label
                        key={country.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50",
                          selectedCountries.includes(country.id) && "bg-primary/10"
                        )}
                      >
                        <Checkbox
                          checked={selectedCountries.includes(country.id)}
                          onCheckedChange={() => toggleCountry(country.id)}
                        />
                        <span>{getFlagEmoji(country.iso2)}</span>
                        <span className="text-sm">{country.name}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Nom du batch</label>
                    <Input
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="Batch Europe Ouest..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Concurrence: {concurrency}</label>
                    <Slider
                      value={[concurrency]}
                      onValueChange={(v) => setConcurrency(v[0])}
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>

                  <Button
                    onClick={startGeneration}
                    disabled={generating || selectedCountries.length === 0}
                    className="w-full gap-2"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Générer {selectedCountries.length} fiches
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Batch Progress */}
            {runningBatch && (
              <Card className="border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Batch en cours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">{runningBatch.name}</p>
                  <Progress
                    value={(runningBatch.completed_countries / runningBatch.total_countries) * 100}
                    className="h-2 mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {runningBatch.completed_countries} / {runningBatch.total_countries} terminés
                    {runningBatch.failed_countries > 0 && (
                      <span className="text-risk-high ml-2">({runningBatch.failed_countries} échecs)</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Jobs & Batches */}
          <div className="lg:col-span-2 space-y-4">
            {/* Batches */}
            <Card>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Historique des batches</span>
                      <ChevronDown className="w-4 h-4" />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-2">
                      {batches.slice(0, 10).map(batch => (
                        <div
                          key={batch.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(batch.status)}
                            <div>
                              <p className="font-medium text-sm">{batch.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(batch.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getStatusBadge(batch.status))}>
                              {batch.completed_countries}/{batch.total_countries}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Jobs récents</span>
                  <Button variant="ghost" size="sm" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {jobs.map(job => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job.status)}
                          <span className="text-lg">{getFlagEmoji(job.iso2)}</span>
                          <div>
                            <p className="font-medium">{job.country_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {job.completed_at
                                ? new Date(job.completed_at).toLocaleString()
                                : new Date(job.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {job.status === "done" && (
                            <div className="text-right">
                              <p className="text-sm">
                                Spécif: <span className="font-medium">{job.specificity_score}%</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Conf: {job.confidence_score}%
                              </p>
                            </div>
                          )}

                          {job.stereotype_flag && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}

                          <Badge className={cn("text-xs", getStatusBadge(job.status))}>
                            {job.status}
                          </Badge>

                          {job.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryJob(job)}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          ⚠️ Outil d'analyse uniquement. Pas de conseil juridique/financier/immigration. Simulation ≠ prédiction.
        </p>
      </div>
    </div>
  );
}
