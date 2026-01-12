import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useCountries } from '@/lib/countries-data';
import { getExtendedCountryMeta } from '@/lib/countries-extended';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Target, AlertTriangle, CheckCircle, RotateCcw, TrendingUp, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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
}

interface MatchResult {
  countryId: string;
  countryName: string;
  iso2: string;
  score: number;
  frictions: string[];
  strengths: string[];
  mobilityScore: number;
  frictionScore: number;
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const DEFAULT_PROFILE: UserProfile = {
  networkImportance: 3,
  diplomaImportance: 3,
  riskAppetite: 3,
  needForSpeed: 3,
  hierarchyComfort: 3,
  stabilityNeed: 3,
};

export function ProfileCountryMatcher() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [tags, setTags] = useState<CountryTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from('country_tags')
        .select('*');

      if (!error && data) {
        setTags(data as CountryTag[]);
      }
      setLoading(false);
    }

    fetchTags();
  }, []);

  const matchResults = useMemo((): MatchResult[] => {
    if (tags.length === 0) return [];

    return tags.map(tag => {
      // Get country info - first check main countries, then extended
      const country = countries.find(c => c.id === tag.country_id);
      const extendedMeta = getExtendedCountryMeta(tag.country_id);
      
      if (!country && !extendedMeta) return null;
      
      const countryName = country?.name || extendedMeta?.name || tag.country_id;
      const iso2 = country?.iso2 || extendedMeta?.iso2 || '';

      const frictions: string[] = [];
      const strengths: string[] = [];
      let score = 100;

      // Network weight analysis
      const networkDiff = Math.abs(profile.networkImportance - tag.network_weight);
      if (networkDiff >= 2) {
        if (profile.networkImportance < tag.network_weight) {
          frictions.push(t('tags.networkWeight', 'Network Weight') + ': ' + t('profileMatcher.frictions', 'High reliance on connections'));
          score -= networkDiff * 8;
        }
      } else if (networkDiff <= 1 && profile.networkImportance >= 3 && tag.network_weight >= 3) {
        strengths.push(t('tags.networkWeight', 'Network Weight'));
      }

      // Diploma weight analysis
      const diplomaDiff = Math.abs(profile.diplomaImportance - tag.diploma_weight);
      if (diplomaDiff >= 2) {
        if (profile.diplomaImportance < tag.diploma_weight) {
          frictions.push(t('tags.diplomaWeight', 'Diploma Weight') + ': ' + t('profileMatcher.frictions', 'Credentials heavily required'));
          score -= diplomaDiff * 8;
        }
      } else if (diplomaDiff <= 1) {
        strengths.push(t('tags.diplomaWeight', 'Diploma Weight'));
      }

      // Risk tolerance analysis
      const riskDiff = Math.abs(profile.riskAppetite - tag.risk_tolerance);
      if (riskDiff >= 2) {
        if (profile.riskAppetite > tag.risk_tolerance) {
          frictions.push(t('tags.riskTolerance', 'Risk Tolerance') + ': ' + t('profileMatcher.frictions', 'System is risk-averse'));
          score -= riskDiff * 10;
        } else {
          frictions.push(t('tags.riskTolerance', 'Risk Tolerance') + ': ' + t('profileMatcher.frictions', 'High risk environment'));
          score -= riskDiff * 6;
        }
      } else if (riskDiff <= 1) {
        strengths.push(t('tags.riskTolerance', 'Risk Tolerance'));
      }

      // Admin speed analysis
      const speedDiff = Math.abs(profile.needForSpeed - tag.admin_speed);
      if (speedDiff >= 2) {
        if (profile.needForSpeed > tag.admin_speed) {
          frictions.push(t('tags.adminSpeed', 'Admin Speed') + ': ' + t('profileMatcher.frictions', 'Slow bureaucracy'));
          score -= speedDiff * 7;
        }
      } else if (speedDiff <= 1 && tag.admin_speed >= 3) {
        strengths.push(t('tags.adminSpeed', 'Admin Speed'));
      }

      // Hierarchy comfort analysis
      const hierarchyDiff = Math.abs(profile.hierarchyComfort - tag.authority_verticality);
      if (hierarchyDiff >= 2) {
        if (profile.hierarchyComfort < tag.authority_verticality) {
          frictions.push(t('tags.authorityVerticality', 'Authority') + ': ' + t('profileMatcher.frictions', 'Very hierarchical'));
          score -= hierarchyDiff * 8;
        }
      } else if (hierarchyDiff <= 1) {
        strengths.push(t('tags.authorityVerticality', 'Authority style'));
      }

      // Stability need analysis
      const stabilityDiff = Math.abs(profile.stabilityNeed - tag.predictability);
      if (stabilityDiff >= 2) {
        if (profile.stabilityNeed > tag.predictability) {
          frictions.push(t('tags.predictability', 'Predictability') + ': ' + t('profileMatcher.frictions', 'Unstable environment'));
          score -= stabilityDiff * 9;
        }
      } else if (stabilityDiff <= 1 && tag.predictability >= 3) {
        strengths.push(t('tags.predictability', 'Predictability'));
      }

      // Mental friction bonus/penalty
      if (tag.mental_friction >= 4) {
        frictions.push(t('tags.mentalFriction', 'Mental Friction') + ': ' + t('profileMatcher.frictions', 'High cognitive load'));
        score -= 10;
      } else if (tag.mental_friction <= 2) {
        strengths.push(t('tags.mentalFriction', 'Low mental friction'));
      }

      // Social mobility bonus
      if (tag.social_mobility >= 4) {
        strengths.push(t('tags.socialMobility', 'High social mobility'));
        score += 5;
      }

      return {
        countryId: tag.country_id,
        countryName,
        iso2,
        score: Math.max(0, Math.min(100, score)),
        frictions,
        strengths,
        mobilityScore: tag.social_mobility,
        frictionScore: tag.mental_friction,
      };
    }).filter((r): r is MatchResult => r !== null)
      .sort((a, b) => b.score - a.score);
  }, [countries, tags, profile, t]);

  const handleSliderChange = (key: keyof UserProfile, value: number[]) => {
    setProfile(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setShowResults(false);
  };

  const getMatchLevel = (score: number): { label: string; color: string; icon: typeof TrendingUp } => {
    if (score >= 75) return { label: t('profileMatcher.highMatch', 'High Match'), color: 'text-risk-low', icon: TrendingUp };
    if (score >= 50) return { label: t('profileMatcher.mediumMatch', 'Medium Match'), color: 'text-yellow-500', icon: Shield };
    return { label: t('profileMatcher.lowMatch', 'Low Match'), color: 'text-risk-high', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const topMatches = matchResults.slice(0, 10);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-xl flex items-center justify-center gap-2">
          <Target className="w-5 h-5" />
          {t('profileMatcher.title', 'Profile Matcher')}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          {t('profileMatcher.description', 'Set your preferences and see which countries align best')}
        </p>
        <Badge variant="outline" className="mt-2">
          {tags.length} {t('common.country', 'countries')} {t('countries.intelligenceAvailable', 'available')}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Sliders */}
        <div className="space-y-6">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            {t('profileMatcher.yourProfile', 'Your Profile')}
          </h4>

          {[
            { key: 'networkImportance', label: t('profileMatcher.preferences.networkImportance', 'Network importance'), icon: '🤝' },
            { key: 'diplomaImportance', label: t('profileMatcher.preferences.diplomaImportance', 'Credential reliance'), icon: '🎓' },
            { key: 'riskAppetite', label: t('profileMatcher.preferences.riskAppetite', 'Risk appetite'), icon: '🎲' },
            { key: 'needForSpeed', label: t('profileMatcher.preferences.needForSpeed', 'Need for fast processes'), icon: '⚡' },
            { key: 'hierarchyComfort', label: t('profileMatcher.preferences.hierarchyComfort', 'Hierarchy comfort'), icon: '📊' },
            { key: 'stabilityNeed', label: t('profileMatcher.preferences.stabilityNeed', 'Stability need'), icon: '🛡️' },
          ].map(({ key, label, icon }) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{icon} {label}</span>
                <Badge variant="secondary" className="text-xs">{profile[key as keyof UserProfile]}/5</Badge>
              </div>
              <Slider
                value={[profile[key as keyof UserProfile]]}
                onValueChange={(value) => handleSliderChange(key as keyof UserProfile, value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('profileMatcher.preferences.low', 'Low')}</span>
                <span>{t('profileMatcher.preferences.high', 'High')}</span>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setShowResults(true)} className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              {t('profileMatcher.analyze', 'Analyze Matches')}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            {t('profileMatcher.matchResults', 'Match Results')}
            {showResults && <span className="ml-2 text-xs font-normal">({topMatches.length} top)</span>}
          </h4>

          {!showResults ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p className="text-center">
                {t('profileMatcher.description', 'Adjust your profile and click analyze')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {topMatches.map((result, index) => {
                const matchLevel = getMatchLevel(result.score);
                const MatchIcon = matchLevel.icon;
                return (
                  <Link to={`/country/${result.countryId}`} key={result.countryId}>
                    <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                            {result.iso2 && getFlagEmoji(result.iso2)} {result.countryName}
                          </CardTitle>
                          <Badge variant="outline" className={cn("flex items-center gap-1", matchLevel.color)}>
                            <MatchIcon className="w-3 h-3" />
                            {result.score}%
                          </Badge>
                        </div>
                        <Progress value={result.score} className="h-1.5 mt-1" />
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2">
                        {result.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.strengths.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-xs px-1.5 py-0.5 bg-risk-low/10 text-risk-low rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {result.frictions.length > 0 && (
                          <div className="space-y-1">
                            {result.frictions.slice(0, 2).map((f, i) => (
                              <p key={i} className="text-xs text-risk-high flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {f}
                              </p>
                            ))}
                          </div>
                        )}
                        {result.frictions.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            {t('profileMatcher.noFrictions', 'No significant frictions detected')}
                          </p>
                        )}
                        
                        {/* Extra metrics */}
                        <div className="flex gap-2 pt-1 border-t">
                          <span className="text-xs text-muted-foreground">
                            📈 {t('tags.socialMobility', 'Mobility')}: {result.mobilityScore}/5
                          </span>
                          <span className="text-xs text-muted-foreground">
                            🧠 {t('tags.mentalFriction', 'Friction')}: {result.frictionScore}/5
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        {t('intelligence.disclaimer', 'Analysis tool: not advice. Simulation ≠ prediction.')}
      </p>
    </div>
  );
}
