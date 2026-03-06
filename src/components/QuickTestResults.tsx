/**
 * QuickTestResults - Displays actionable results from the Quick Test
 * Shows profile type, top 3 matching countries, and CTAs
 */

import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Clock,
  MapPin,
  Key,
  ArrowRight,
  RefreshCcw,
  Crown,
  Eye,
  AlertTriangle,
  Target,
  Compass,
  Briefcase,
  Globe
} from 'lucide-react';
import { PyramidType } from '@/lib/types';

// Profile types based on test answers
export interface ProfileType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const PROFILE_TYPES: Record<string, ProfileType> = {
  explorateur_prudent: {
    id: 'explorateur_prudent',
    label: 'Explorateur Prudent',
    description: 'Curieux mais méthodique, vous analysez avant d\'agir',
    icon: <Compass className="w-6 h-6" />
  },
  stratege_fiscal: {
    id: 'stratege_fiscal',
    label: 'Stratège Fiscal',
    description: 'L\'optimisation financière guide vos choix de vie',
    icon: <Target className="w-6 h-6" />
  },
  nomade_digital: {
    id: 'nomade_digital',
    label: 'Nomade Digital',
    description: 'La liberté géographique est votre priorité absolue',
    icon: <Globe className="w-6 h-6" />
  },
  batisseur_stable: {
    id: 'batisseur_stable',
    label: 'Bâtisseur Stable',
    description: 'Vous construisez sur le long terme avec des bases solides',
    icon: <Briefcase className="w-6 h-6" />
  },
  opportuniste_agile: {
    id: 'opportuniste_agile',
    label: 'Opportuniste Agile',
    description: 'Vous saisissez les opportunités quand elles se présentent',
    icon: <Eye className="w-6 h-6" />
  }
};

export interface MatchedCountry {
  id: string;
  name: string;
  compatibility: number; // 0-100
  pyramidType: string;
  highlights: string[];
}

// Map answers to profile type
export function determineProfileType(answers: {
  situation?: string;
  priority?: string;
  riskTolerance?: string;
  mainConstraint?: string;
}): string {
  const { priority, riskTolerance, mainConstraint } = answers;

  if (priority === 'money' && riskTolerance === 'low') {
    return 'stratege_fiscal';
  }
  if (priority === 'freedom' && riskTolerance === 'high') {
    return 'nomade_digital';
  }
  if (priority === 'security' || mainConstraint === 'family') {
    return 'batisseur_stable';
  }
  if (riskTolerance === 'high' && priority === 'money') {
    return 'opportuniste_agile';
  }
  return 'explorateur_prudent';
}

// Match countries based on profile and pyramid type
export function matchCountries(
  profileType: string,
  pyramidType: PyramidType,
  allCountries: { id: string; name: string; pyramid_type: string }[]
): MatchedCountry[] {
  // Countries that match each profile type
  const profileCountryScores: Record<string, Record<string, number>> = {
    explorateur_prudent: {
      'portugal': 92, 'spain': 88, 'thailand': 85, 'germany': 82, 'canada': 80
    },
    stratege_fiscal: {
      'switzerland': 95, 'singapore': 92, 'uae': 90, 'portugal': 87, 'malta': 85
    },
    nomade_digital: {
      'portugal': 94, 'thailand': 91, 'mexico': 88, 'indonesia': 86, 'costa-rica': 84
    },
    batisseur_stable: {
      'france': 90, 'germany': 88, 'switzerland': 87, 'canada': 85, 'australia': 83
    },
    opportuniste_agile: {
      'uae': 93, 'singapore': 91, 'usa': 88, 'uk': 85, 'hong-kong': 83
    }
  };

  const scores = profileCountryScores[profileType] || profileCountryScores.explorateur_prudent;
  
  // Get top 3 countries with their details
  const matchedCountries: MatchedCountry[] = [];
  
  for (const [countryId, score] of Object.entries(scores).slice(0, 3)) {
    const country = allCountries.find(c => c.id === countryId);
    if (country) {
      matchedCountries.push({
        id: country.id,
        name: country.name,
        compatibility: score,
        pyramidType: country.pyramid_type,
        highlights: getCountryHighlights(countryId, profileType)
      });
    } else {
      // Fallback for countries not in DB
      matchedCountries.push({
        id: countryId,
        name: countryId.charAt(0).toUpperCase() + countryId.slice(1).replace(/-/g, ' '),
        compatibility: score,
        pyramidType: pyramidType,
        highlights: getCountryHighlights(countryId, profileType)
      });
    }
  }

  return matchedCountries;
}

function getCountryHighlights(countryId: string, _profileType: string): string[] {
  const highlights: Record<string, string[]> = {
    'portugal': ['Golden Visa', 'NHR fiscal', 'Qualité de vie'],
    'switzerland': ['Stabilité bancaire', 'Fiscalité avantageuse', 'Infrastructure'],
    'singapore': ['Hub business', 'Fiscalité attractive', 'Sécurité'],
    'thailand': ['Coût de vie bas', 'Visa nomade', 'Climat'],
    'uae': ['0% impôt revenu', 'Hub international', 'Facilités business'],
    'germany': ['Économie forte', 'Sécurité sociale', 'Opportunités emploi'],
    'canada': ['Immigration facile', 'Qualité de vie', 'Opportunités'],
    'france': ['Protection sociale', 'Culture', 'Éducation'],
    'spain': ['Qualité de vie', 'Coût raisonnable', 'Visa doré'],
    'mexico': ['Coût de vie', 'Proximité USA', 'Culture'],
    'indonesia': ['Coût de vie', 'Visa nomade', 'Nature'],
    'costa-rica': ['Stabilité', 'Nature', 'Visa pensionado'],
    'malta': ['Fiscalité EU', 'Anglophone', 'Taille humaine'],
    'australia': ['Qualité de vie', 'Opportunités', 'Climat'],
    'usa': ['Opportunités business', 'Innovation', 'Marché'],
    'uk': ['Hub financier', 'Anglophone', 'Opportunités'],
    'hong-kong': ['Hub financier', 'Fiscalité', 'Business friendly']
  };
  return highlights[countryId] || ['Destination prometteuse', 'À explorer', 'Potentiel intéressant'];
}

// Free countries - others require premium
const FREE_COUNTRY_IDS = ['france', 'switzerland', 'belgium'];

interface QuickTestResultsProps {
  answers: {
    situation?: string;
    priority?: string;
    riskTolerance?: string;
    mainConstraint?: string;
  };
  pyramidType: PyramidType;
  pyramidInfo: { label: string; description: string };
  elapsedTime: number;
  onReset: () => void;
  countries: { id: string; name: string; pyramid_type: string }[];
}

export function QuickTestResults({
  answers,
  pyramidType,
  pyramidInfo,
  elapsedTime,
  onReset,
  countries
}: QuickTestResultsProps) {
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation();
  const { canAccessPremium } = useSubscription();

  const profileTypeId = determineProfileType(answers);
  const profileTypeData = PROFILE_TYPES[profileTypeId];
  const matchedCountries = matchCountries(profileTypeId, pyramidType, countries);

  const handleCountryClick = (countryId: string) => {
    const isFreeCountry = FREE_COUNTRY_IDS.includes(countryId);
    if (isFreeCountry || canAccessPremium) {
      navigate(`/country/${countryId}`);
    } else {
      navigate('/pricing', { state: { from: `/country/${countryId}` } });
    }
  };

  const handleExitKeysClick = () => {
    if (canAccessPremium) {
      navigate('/exit-keys', { state: { profileType: profileTypeId, pyramidType } });
    } else {
      navigate('/pricing', { state: { from: '/exit-keys' } });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <section className="relative pt-24 sm:pt-32 pb-16 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-2xl">
          {/* Timer badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 font-medium">
              <Clock className="w-4 h-4" />
              {elapsedTime} {t('common.seconds', 'secondes')}
            </div>
          </motion.div>

          {/* Profile Type Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border/50 rounded-3xl p-6 sm:p-10 mb-6 shadow-[0_0_60px_hsl(var(--primary)/0.1)]"
          >
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {t('quickTest.result.yourProfile', 'Votre profil type')}
            </p>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mb-6">
              <div className="flex items-center gap-4 justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/20 text-primary">
                  {profileTypeData.icon}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary">
                    {profileTypeData.label}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {profileTypeData.description}
              </p>
            </div>

            {/* Pyramid System */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
              <div className="flex items-center gap-3 justify-center">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t('quickTest.result.systemLooksLike', 'Ton profil')}
                  </p>
                  <p className="font-medium">{pyramidInfo.label}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top 3 Countries */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 mb-6"
          >
            <h3 className="font-semibold mb-6 flex items-center justify-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" />
              {t('quickTest.result.topCountries', 'Top 3 pays pour votre profil')}
            </h3>

            <div className="space-y-4">
              {matchedCountries.map((country, index) => {
                const isFree = FREE_COUNTRY_IDS.includes(country.id);
                const isLocked = !isFree && !canAccessPremium;
                
                return (
                  <motion.div
                    key={country.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-4 rounded-xl border transition-all ${
                      isLocked 
                        ? 'bg-muted/20 border-border/30' 
                        : 'bg-primary/5 border-primary/20 hover:border-primary/40 cursor-pointer'
                    }`}
                    onClick={() => !isLocked && handleCountryClick(country.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {country.name}
                            {isLocked && (
                              <Crown className="w-4 h-4 text-amber-500" />
                            )}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            country.compatibility >= 90 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                              : country.compatibility >= 80 
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {country.compatibility}% match
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {country.highlights.map((highlight, i) => (
                        <span 
                          key={i} 
                          className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {isLocked ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/pricing');
                        }}
                      >
                        <Crown className="w-4 h-4" />
                        Débloquer avec Premium
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-primary"
                      >
                        Voir le détail
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Exit Keys CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary/10 to-amber-500/10 border border-primary/20 rounded-3xl p-6 sm:p-8 mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Key className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-lg">
                {t('quickTest.result.exitKeysTitle', 'Vos recommandations personnalisées')}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t('quickTest.result.exitKeysDescription', 'Découvrez les stratégies de sortie adaptées à votre profil')}
            </p>
            <Button
              size="lg"
              onClick={handleExitKeysClick}
              className="w-full gap-2 h-14 rounded-full shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
            >
              {!canAccessPremium && <Crown className="w-5 h-5" />}
              <Key className="w-5 h-5" />
              {t('quickTest.result.getExitKeys', 'Obtenir mes recommandations')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            {!canAccessPremium && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                <Crown className="w-3 h-3 inline mr-1" />
                Fonctionnalité Premium
              </p>
            )}
          </motion.div>

          {/* Save results CTA for non-authenticated users */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 mb-6 text-center"
            >
              <p className="text-sm font-medium mb-2">
                {t('quickTest.result.saveTitle', '📌 Sauvegardez vos résultats')}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {t('quickTest.result.saveDescription', 'Créez un compte gratuit pour retrouver votre profil, vos pays compatibles et suivre votre progression.')}
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="gap-2"
              >
                {t('quickTest.result.createAccount', 'Créer mon compte gratuit')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Restart */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCcw className="w-4 h-4" />
              {t('quickTest.restart', 'Recommencer')}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground/70">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {t('quickTest.disclaimer', 'Simulation ≠ prédiction. Exploration uniquement.')}
          </p>
        </div>
      </section>
    </div>
  );
}
