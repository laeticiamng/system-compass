import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { countries } from '@/lib/countries-data';
import { Country, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Target, AlertTriangle, MapPin, TrendingUp, Shield, Share2, DollarSign, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { OVISuggestionsWidget } from '@/components/ovi/OVISuggestionsWidget';

const PYRAMID_TYPE_LABELS: Record<string, string> = {
  PROBLEM_RENT: 'pyramids.problemRent.label',
  STABILITY_REDIS: 'pyramids.stabilityRedis.label',
  COMPETENCE_TRUST: 'pyramids.competenceTrust.label',
  GROWTH_RISK: 'pyramids.growthRisk.label',
  HYBRID_TRANSITION: 'pyramids.hybridTransition.label',
  RESOURCE_EXTRACTION: 'pyramids.resourceExtraction.label',
};

const PYRAMID_TYPE_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'pyramid-rent',
  STABILITY_REDIS: 'pyramid-stability',
  COMPETENCE_TRUST: 'pyramid-competence',
  GROWTH_RISK: 'pyramid-growth',
  HYBRID_TRANSITION: 'pyramid-hybrid',
  RESOURCE_EXTRACTION: 'pyramid-resource',
};

interface MatchedCountry {
  country: Country;
  score: number;
  reasons: string[];
  warnings: string[];
}

function calculateCompatibility(profile: UserProfile, country: Country, t: (key: string) => string): MatchedCountry {
  let score = 50; // Base score
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  const { pyramidType, risks } = country;
  
  // Ambition matching
  if (profile.ambition > 7) {
    if (pyramidType === 'GROWTH_RISK') {
      score += 15;
      reasons.push(t('match.reasons.ambitionGrowth'));
    } else if (pyramidType === 'STABILITY_REDIS') {
      score -= 10;
      warnings.push(t('match.reasons.ambitionFrustrated'));
    }
  }
  
  // Merit need matching
  if (profile.meritNeed > 7) {
    if (pyramidType === 'COMPETENCE_TRUST') {
      score += 15;
      reasons.push(t('match.reasons.meritCompetence'));
    } else if (pyramidType === 'PROBLEM_RENT') {
      score -= 15;
      warnings.push(t('match.reasons.meritConnection'));
    }
  }
  
  // Risk tolerance matching
  if (profile.riskTolerance > 7) {
    if (pyramidType === 'GROWTH_RISK') {
      score += 10;
      reasons.push(t('match.reasons.riskGrowth'));
    }
    if (risks.safety > 50 || risks.volatility > 50) {
      score += 5; // Can handle risky environments
    }
  } else if (profile.riskTolerance < 4) {
    if (risks.safety > 50 || risks.volatility > 50) {
      score -= 15;
      warnings.push(t('match.reasons.lowRiskWarning'));
    }
    if (pyramidType === 'STABILITY_REDIS' || pyramidType === 'COMPETENCE_TRUST') {
      score += 10;
      reasons.push(t('match.reasons.safetyMatch'));
    }
  }
  
  // Security need matching
  if (profile.securityNeed > 7) {
    if (pyramidType === 'STABILITY_REDIS') {
      score += 15;
      reasons.push(t('match.reasons.securityNet'));
    } else if (pyramidType === 'GROWTH_RISK') {
      score -= 10;
      warnings.push(t('match.reasons.securityUnmet'));
    }
    if (risks.legal < 30 && risks.safety < 30) {
      score += 10;
      reasons.push(t('match.reasons.lowRiskEnvironment'));
    }
  }
  
  // Bureaucracy tolerance
  if (profile.bureaucracyTolerance < 4) {
    if (risks.bureaucracy > 60) {
      score -= 15;
      warnings.push(t('match.reasons.bureaucracyWarning'));
    }
  } else if (profile.bureaucracyTolerance > 7) {
    if (risks.bureaucracy > 60) {
      score += 5;
      reasons.push(t('match.reasons.bureaucracyMatch'));
    }
  }
  
  // Innovation drive
  if (profile.innovationDrive > 7) {
    if (pyramidType === 'GROWTH_RISK') {
      score += 10;
      reasons.push(t('match.reasons.innovationMatch'));
    } else if (pyramidType === 'PROBLEM_RENT') {
      score -= 10;
      warnings.push(t('match.reasons.innovationSuppressed'));
    }
  }
  
  // Discretion preference
  if (profile.discretionPreference > 7) {
    if (pyramidType === 'PROBLEM_RENT') {
      score += 10;
      reasons.push(t('match.reasons.discretionValuable'));
    }
  } else if (profile.discretionPreference < 4) {
    if (pyramidType === 'PROBLEM_RENT') {
      score -= 10;
      warnings.push(t('match.reasons.visibilityRisk'));
    }
  }
  
  // Corruption penalty for rule-followers
  if (profile.meritNeed > 6 && risks.corruption > 60) {
    score -= 10;
    warnings.push(t('match.reasons.corruptionChallenge'));
  }
  
  // Bonus for low-risk environments
  const avgRisk = (risks.legal + risks.safety + risks.corruption + risks.volatility + risks.bureaucracy) / 5;
  if (avgRisk < 30) {
    score += 10;
    reasons.push(t('match.reasons.overallLowRisk'));
  } else if (avgRisk > 60) {
    score -= 5;
  }
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));
  
  return { country, score, reasons, warnings };
}

export default function Match() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<MatchedCountry[]>([]);

  useEffect(() => {
    // Try to load profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        
        // Calculate matches - pass t function
        const matchedCountries = countries
          .map(country => calculateCompatibility(parsed, country, t))
          .sort((a, b) => b.score - a.score);
        
        setMatches(matchedCountries);
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
  }, [t]);

  const shareResults = async () => {
    const topCountries = matches.slice(0, 3).map(m => m.country.name).join(', ');
    const text = `My top country matches: ${topCountries}. Find your best countries at ${window.location.origin}/profile-test`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Country Matches',
          text: text,
          url: window.location.origin + '/profile-test',
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success(t('match.linkCopied'));
      }
    } catch (e) {
      // User cancelled share or error
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t('match.linkCopied'));
      } catch {
        toast.error('Failed to share');
      }
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="glass-card rounded-xl p-12">
            <Target className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">
              {t('match.noProfile')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('match.noProfileDesc')}
            </p>
            <Button
              onClick={() => navigate('/profile-test')}
              className="bg-primary text-primary-foreground gap-2"
            >
              {t('match.takeTest')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const topMatches = matches.slice(0, 5);
  const avoidMatches = matches.slice(-3).reverse();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold mb-4">
              {t('match.title')}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-4">
              {t('match.subtitle')}
            </p>
            {/* Anti-illusion micro-text */}
            <p className="text-xs text-muted-foreground/60 max-w-lg mx-auto mb-6">
              {t('simulationDisclaimer.contextual.results')}
            </p>
            <Button variant="outline" onClick={shareResults} className="gap-2">
              <Share2 className="w-4 h-4" />
              {t('match.shareResults')}
            </Button>
          </div>

          {/* Top Matches */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              {t('match.topMatches')}
            </h2>
            <div className="space-y-4">
              {topMatches.map((match, index) => (
                <MatchCard key={match.country.id} match={match} rank={index + 1} />
              ))}
            </div>
          </div>

          {/* Countries to Avoid */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-risk-critical" />
              {t('match.avoidTitle')}
            </h2>
            <div className="space-y-4">
              {avoidMatches.map((match) => (
                <MatchCard key={match.country.id} match={match} isWarning />
              ))}
            </div>
          </div>

          {/* OVI Suggestions */}
          <div className="mb-12">
            <OVISuggestionsWidget 
              simulationType="matching" 
              context={{ countryIds: topMatches.map(m => m.country.id) }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/countries')}
              className="bg-primary text-primary-foreground gap-2"
            >
              {t('match.exploreAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/compare')}
            >
              {t('match.compareCountries')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/profile-test')}
            >
              {t('match.retakeTest')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, rank, isWarning }: { match: MatchedCountry; rank?: number; isWarning?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { country, score, reasons, warnings } = match;
  const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-risk-low';
    if (score >= 50) return 'text-risk-medium';
    if (score >= 30) return 'text-risk-high';
    return 'text-risk-critical';
  };

  return (
    <div
      onClick={() => navigate(`/country/${country.id}`)}
      className={cn(
        'glass-card rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.01]',
        isWarning && 'border-risk-critical/30'
      )}
    >
      <div className="flex items-start gap-4">
        {rank && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
            {rank}
          </div>
        )}
        <div className="text-4xl">{getFlagEmoji(country.iso2)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-xl font-semibold">{country.name}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
                color: `hsl(var(--${typeColor}))`,
              }}
            >
              {t(PYRAMID_TYPE_LABELS[country.pyramidType])}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {country.region}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              ${(country.snapshot.gdpPerCapita / 1000).toFixed(0)}k
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              #{country.snapshot.passportRank}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              ${country.costOfLiving.monthlyBudgetSingle}/mo
            </span>
            <span className="flex items-center gap-1">
              <Plane className="w-3 h-3" />
              {t(`visa.${country.visa.workVisa}`)}
            </span>
          </div>
          
          {reasons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {reasons.slice(0, 2).map((reason, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-risk-low/10 text-risk-low">
                  ✓ {reason}
                </span>
              ))}
            </div>
          )}
          
          {warnings.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {warnings.slice(0, 2).map((warning, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-risk-critical/10 text-risk-critical">
                  ⚠ {warning}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className={cn('font-display text-2xl font-bold', getScoreColor(score))}>
            {score}%
          </div>
          <div className="text-xs text-muted-foreground">{t('match.compatibility')}</div>
        </div>
      </div>
    </div>
  );
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
