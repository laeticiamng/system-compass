import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { supabase } from '@/integrations/supabase/client';
import { useCountries } from '@/lib/countries-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Target, AlertTriangle, CheckCircle, RotateCcw, Download, Filter, ArrowRight, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface CountryTag {
  country_id: string;
  network_weight: number;
  diploma_weight: number;
  risk_tolerance: number;
  admin_speed: number;
  authority_verticality: number;
  mental_friction: number;
  social_mobility: number;
  predictability: number;
  reputation_requirement: number;
  compliance_sensitivity: number;
}

interface UserProfile {
  networkImportance: number;
  diplomaImportance: number;
  riskAppetite: number;
  needForSpeed: number;
  hierarchyComfort: number;
  stabilityNeed: number;
  mentalLoadTolerance: number;
  mobilityPriority: number;
}

interface MatchResult {
  countryId: string;
  countryName: string;
  iso2: string;
  score: number;
  frictions: string[];
  strengths: string[];
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const DEFAULT_PROFILE: UserProfile = {
  networkImportance: 3,
  diplomaImportance: 3,
  riskAppetite: 3,
  needForSpeed: 3,
  hierarchyComfort: 3,
  stabilityNeed: 3,
  mentalLoadTolerance: 3,
  mobilityPriority: 3,
};

const REGIONS = ['Europe', 'North America', 'Asia', 'Middle East', 'Oceania', 'South America'];

export default function ProfileMatcher() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [tags, setTags] = useState<CountryTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [showResults, setShowResults] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from('country_tags').select('*');
      if (!error && data) setTags(data as CountryTag[]);
      setLoading(false);
    }
    fetchTags();
  }, []);

  const getCountryRegion = (countryId: string): string => {
    const regionMap: Record<string, string> = {
      france: 'Europe', germany: 'Europe', 'united-kingdom': 'Europe', switzerland: 'Europe',
      netherlands: 'Europe', italy: 'Europe', spain: 'Europe', portugal: 'Europe',
      usa: 'North America', canada: 'North America', mexico: 'North America',
      japan: 'Asia', singapore: 'Asia',
      australia: 'Oceania',
      'united-arab-emirates': 'Middle East',
      brazil: 'South America',
    };
    return regionMap[countryId] || 'Other';
  };

  const matchResults = useMemo((): MatchResult[] => {
    if (tags.length === 0) return [];

    return tags.map(tag => {
      const country = countries.find(c => c.id === tag.country_id);
      if (!country) return null;
      if (selectedRegions.length > 0 && !selectedRegions.includes(getCountryRegion(tag.country_id))) return null;

      const frictions: string[] = [];
      const strengths: string[] = [];
      let score = 100;

      // Analysis logic
      if (Math.abs(profile.networkImportance - tag.network_weight) >= 2 && profile.networkImportance < tag.network_weight) {
        frictions.push(t('tags.networkWeight') + ': High reliance on connections');
        score -= 16;
      } else if (Math.abs(profile.networkImportance - tag.network_weight) <= 1) {
        strengths.push(t('tags.networkWeight'));
      }

      if (Math.abs(profile.diplomaImportance - tag.diploma_weight) >= 2 && profile.diplomaImportance < tag.diploma_weight) {
        frictions.push(t('tags.diplomaWeight') + ': Credentials heavily required');
        score -= 16;
      } else if (Math.abs(profile.diplomaImportance - tag.diploma_weight) <= 1) {
        strengths.push(t('tags.diplomaWeight'));
      }

      if (Math.abs(profile.riskAppetite - tag.risk_tolerance) >= 2) {
        if (profile.riskAppetite > tag.risk_tolerance) {
          frictions.push(t('tags.riskTolerance') + ': System is risk-averse');
          score -= 20;
        }
      } else {
        strengths.push(t('tags.riskTolerance'));
      }

      if (Math.abs(profile.needForSpeed - tag.admin_speed) >= 2 && profile.needForSpeed > tag.admin_speed) {
        frictions.push(t('tags.adminSpeed') + ': Slow bureaucracy');
        score -= 14;
      } else if (tag.admin_speed >= 3) {
        strengths.push(t('tags.adminSpeed'));
      }

      if (Math.abs(profile.hierarchyComfort - tag.authority_verticality) >= 2 && profile.hierarchyComfort < tag.authority_verticality) {
        frictions.push(t('tags.authorityVerticality') + ': Very hierarchical');
        score -= 16;
      } else {
        strengths.push(t('tags.authorityVerticality'));
      }

      if (Math.abs(profile.stabilityNeed - tag.predictability) >= 2 && profile.stabilityNeed > tag.predictability) {
        frictions.push(t('tags.predictability') + ': Unstable environment');
        score -= 18;
      } else if (tag.predictability >= 3) {
        strengths.push(t('tags.predictability'));
      }

      if (tag.mental_friction >= 4 && profile.mentalLoadTolerance < 4) {
        frictions.push(t('tags.mentalFriction') + ': High cognitive load');
        score -= 14;
      } else if (tag.mental_friction <= 2) {
        strengths.push(t('tags.mentalFriction'));
      }

      if (tag.social_mobility >= 4) {
        strengths.push(t('tags.socialMobility'));
        score += 5;
      } else if (tag.social_mobility <= 2 && profile.mobilityPriority >= 4) {
        frictions.push(t('tags.socialMobility') + ': Limited upward mobility');
        score -= 16;
      }

      const finalScore = Math.max(0, Math.min(100, score));
      if (finalScore < minScore) return null;

      return { countryId: tag.country_id, countryName: country.name, iso2: country.iso2, score: finalScore, frictions, strengths };
    }).filter((r): r is MatchResult => r !== null).sort((a, b) => b.score - a.score);
  }, [countries, tags, profile, t, selectedRegions, minScore]);

  const handleSliderChange = (key: keyof UserProfile, value: number[]) => {
    setProfile(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setSelectedRegions([]);
    setMinScore(0);
    setShowResults(false);
  };

  const handleExportPDF = async () => {
    if (!resultsRef.current || matchResults.length === 0) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(resultsRef.current, { scale: 2, useCORS: true, backgroundColor: '#1a1a2e' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save('profile-matcher-results.pdf');
      toast.success(t('profileMatcher.exportSuccess', 'PDF exported successfully!'));
    } catch (error) {
      toast.error(t('profileMatcher.exportError', 'Failed to export PDF'));
    } finally {
      setExporting(false);
    }
  };

  const getMatchLevel = (score: number) => {
    if (score >= 75) return { label: t('profileMatcher.highMatch', 'High Match'), color: 'text-risk-low', bg: 'bg-risk-low/10' };
    if (score >= 50) return { label: t('profileMatcher.mediumMatch', 'Medium Match'), color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: t('profileMatcher.lowMatch', 'Low Match'), color: 'text-risk-high', bg: 'bg-risk-high/10' };
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderItems = [
    { key: 'networkImportance', label: t('profileMatcher.preferences.networkImportance', 'Network importance') },
    { key: 'diplomaImportance', label: t('profileMatcher.preferences.diplomaImportance', 'Credential reliance') },
    { key: 'riskAppetite', label: t('profileMatcher.preferences.riskAppetite', 'Risk appetite') },
    { key: 'needForSpeed', label: t('profileMatcher.preferences.needForSpeed', 'Need for fast processes') },
    { key: 'hierarchyComfort', label: t('profileMatcher.preferences.hierarchyComfort', 'Hierarchy comfort') },
    { key: 'stabilityNeed', label: t('profileMatcher.preferences.stabilityNeed', 'Stability need') },
    { key: 'mentalLoadTolerance', label: t('profileMatcher.preferences.mentalLoadTolerance', 'Mental load tolerance') },
    { key: 'mobilityPriority', label: t('profileMatcher.preferences.mobilityPriority', 'Mobility priority') },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Helmet>
        <title>Trouver mon pays — Compass</title>
        <meta name="description" content="Trouvez les pays qui correspondent à votre profil. Ajustez vos préférences et découvrez vos meilleurs matchs." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Trouver mon pays — Compass" />
        <meta property="og:description" content="Découvrez quels pays correspondent le mieux à votre profil personnel." />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trouver mon pays — Compass" />
        <meta name="twitter:description" content="Découvrez quels pays correspondent le mieux à votre profil personnel." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Target className="w-10 h-10" />
            {t('profileMatcher.title', 'Profile Matcher')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('profileMatcher.description', 'Set your preferences and discover which countries align best with your profile.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('profileMatcher.yourProfile', 'Your Profile')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {sliderItems.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground font-medium">{profile[key as keyof UserProfile]}/5</span>
                    </div>
                    <Slider value={[profile[key as keyof UserProfile]]} onValueChange={(v) => handleSliderChange(key as keyof UserProfile, v)} min={1} max={5} step={1} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2"><Filter className="w-4 h-4" />{t('profileMatcher.filters', 'Filters')}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", filtersOpen && "rotate-180")} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('profileMatcher.minScore', 'Minimum score')}: {minScore}%</label>
                      <Slider value={[minScore]} onValueChange={(v) => setMinScore(v[0])} min={0} max={90} step={10} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('profileMatcher.regions', 'Regions')}</label>
                      <div className="flex flex-wrap gap-2">
                        {REGIONS.map(region => (
                          <Badge key={region} variant={selectedRegions.includes(region) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleRegion(region)}>{region}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <div className="flex gap-2">
              <Button onClick={() => setShowResults(true)} className="flex-1 gap-2"><ArrowRight className="w-4 h-4" />{t('profileMatcher.analyze', 'Analyze Matches')}</Button>
              <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('profileMatcher.matchResults', 'Match Results')}
                {showResults && <Badge variant="secondary">{matchResults.length}</Badge>}
              </h2>
              {showResults && matchResults.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="ml-2">{t('profileMatcher.exportPDF', 'Export PDF')}</span>
                </Button>
              )}
            </div>

            <div ref={resultsRef}>
              {!showResults ? (
                <Card className="h-96 flex items-center justify-center">
                  <p className="text-muted-foreground text-center px-8">{t('profileMatcher.instructions', 'Adjust your profile and click "Analyze Matches".')}</p>
                </Card>
              ) : matchResults.length === 0 ? (
                <Card className="h-96 flex items-center justify-center">
                  <p className="text-muted-foreground text-center px-8">{t('profileMatcher.noResults', 'No countries match. Adjust criteria.')}</p>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {matchResults.map((result, index) => {
                    const matchLevel = getMatchLevel(result.score);
                    return (
                      <Card key={result.countryId} className={cn("overflow-hidden", index < 3 && "ring-1 ring-primary/20")}>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                              <span className="text-xl">{getFlagEmoji(result.iso2)}</span>{result.countryName}
                            </CardTitle>
                            <Badge className={cn(matchLevel.bg, matchLevel.color, "border-0")}>{result.score}%</Badge>
                          </div>
                          <Progress value={result.score} className="h-2 mt-2" />
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-3">
                          {result.strengths.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {result.strengths.slice(0, 4).map((s, i) => (
                                <span key={i} className="text-xs px-1.5 py-0.5 bg-risk-low/10 text-risk-low rounded flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />{s}
                                </span>
                              ))}
                            </div>
                          )}
                          {result.frictions.length > 0 && (
                            <div className="space-y-1">
                              {result.frictions.slice(0, 3).map((f, i) => (
                                <p key={i} className="text-xs text-risk-high flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /><span>{f}</span>
                                </p>
                              ))}
                            </div>
                          )}
                          {result.frictions.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">{t('profileMatcher.noFrictions', 'No significant frictions')}</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">{t('intelligence.disclaimer', 'Analysis tool: not advice. Simulation ≠ prediction.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
