import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  CharacterCard as CharacterCardType, 
  GameResources, 
  createDefaultResources,
  POSITIVE_TRAITS,
  NEGATIVE_TRAITS,
  ASPIRATIONS,
  CharacterTrait,
  CharacterAspiration,
  ResourceType,
} from '@/lib/game-data';
import { PyramidType, PYRAMID_TYPE_INFO, type Country } from '@/lib/types';
import { useCountries, getCountriesSnapshot } from '@/lib/countries-data';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';
import { PROFESSIONS, EDUCATION_LEVELS, type EducationLevel, type Profession } from '@/lib/profession-data';
import { Shuffle, Dices, Flag, Briefcase, GraduationCap, Heart, Target, AlertTriangle, Play, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import CharacterCard from './CharacterCard';

interface LifeAssignmentProps {
  playerCount: number;
  playerColors: { bg: string; ring: string; text: string }[];
  onComplete: (characters: CharacterCardType[]) => void;
  onBack: () => void;
}

interface RandomProfile {
  countryId: string;
  countryName: string;
  pyramidType: PyramidType;
  flag: string;
  profession: Profession;
  education: EducationLevel;
  traits: CharacterTrait[];
  constraint: CharacterTrait;
  aspirations: CharacterAspiration[];
  estimatedSalary: number;
  passportStrength: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

// Countries weighted by population (roughly)
const COUNTRY_WEIGHTS: { id: string; weight: number }[] = [
  // High population countries (more likely to be born there)
  { id: 'china', weight: 18 },
  { id: 'india', weight: 17 },
  { id: 'usa', weight: 4 },
  { id: 'indonesia', weight: 4 },
  { id: 'brazil', weight: 3 },
  { id: 'nigeria', weight: 3 },
  { id: 'bangladesh', weight: 2 },
  { id: 'russia', weight: 2 },
  { id: 'mexico', weight: 2 },
  { id: 'japan', weight: 2 },
  { id: 'philippines', weight: 1.5 },
  { id: 'egypt', weight: 1.5 },
  { id: 'vietnam', weight: 1.5 },
  { id: 'turkey', weight: 1 },
  { id: 'germany', weight: 1 },
  { id: 'france', weight: 0.8 },
  { id: 'uk', weight: 0.8 },
  { id: 'thailand', weight: 1 },
  { id: 'south_africa', weight: 0.8 },
  { id: 'south_korea', weight: 0.7 },
  { id: 'colombia', weight: 0.7 },
  { id: 'spain', weight: 0.6 },
  { id: 'argentina', weight: 0.6 },
  { id: 'poland', weight: 0.5 },
  { id: 'canada', weight: 0.5 },
  { id: 'morocco', weight: 0.5 },
  { id: 'senegal', weight: 0.3 },
  { id: 'cameroon', weight: 0.3 },
  { id: 'portugal', weight: 0.2 },
  { id: 'switzerland', weight: 0.1 },
  { id: 'uae', weight: 0.1 },
  { id: 'singapore', weight: 0.1 },
];

// Education weighted by global reality (most people don't have higher education)
const EDUCATION_WEIGHTS: { level: EducationLevel; weight: number }[] = [
  { level: 'no_diploma', weight: 25 },
  { level: 'high_school', weight: 30 },
  { level: 'vocational', weight: 15 },
  { level: 'associate', weight: 12 },
  { level: 'bachelor', weight: 10 },
  { level: 'master', weight: 5 },
  { level: 'engineering', weight: 2 },
  { level: 'medical_degree', weight: 0.5 },
  { level: 'doctorate', weight: 0.3 },
  { level: 'law_degree', weight: 0.2 },
];

function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { item, weight } of items) {
    random -= weight;
    if (random <= 0) return item;
  }
  
  return items[items.length - 1].item;
}

function getFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

function generateRandomLife(countries: Country[]): RandomProfile {
  // 1. Random country (weighted by population)
  const countryId = weightedRandom(
    COUNTRY_WEIGHTS.map(c => ({ item: c.id, weight: c.weight }))
  );
  const country = countries.find(c => c.id === countryId) || countries[0];
  
  // 2. Random education (weighted by global reality)
  const education = weightedRandom(
    EDUCATION_WEIGHTS.map(e => ({ item: e.level, weight: e.weight }))
  );
  
  // 3. Random profession compatible with education
  const compatibleProfessions = PROFESSIONS.filter(p => 
    p.requiredEducation.includes(education)
  );
  const profession = compatibleProfessions.length > 0 
    ? compatibleProfessions[Math.floor(Math.random() * compatibleProfessions.length)]
    : PROFESSIONS.find(p => p.id === 'other') || PROFESSIONS[0];
  
  // 4. Random traits (1-2 positive, 1 negative)
  const shuffledPositive = [...POSITIVE_TRAITS].sort(() => Math.random() - 0.5);
  const numPositive = Math.random() > 0.5 ? 2 : 1;
  const traits = shuffledPositive.slice(0, numPositive);
  
  const shuffledNegative = [...NEGATIVE_TRAITS].sort(() => Math.random() - 0.5);
  const constraint = shuffledNegative[0];
  
  // 5. Random aspirations
  const shuffledAspirations = [...ASPIRATIONS].sort(() => Math.random() - 0.5);
  const aspirations = shuffledAspirations.slice(0, 2);
  
  // 6. Calculate difficulty based on starting conditions
  let difficultyScore = 0;
  
  // Country factors
  if (country.pyramidType === 'PROBLEM_RENT') difficultyScore += 3;
  if (country.pyramidType === 'RESOURCE_EXTRACTION') difficultyScore += 2;
  if (country.pyramidType === 'HYBRID_TRANSITION') difficultyScore += 1;
  if (country.pyramidType === 'GROWTH_RISK') difficultyScore -= 1;
  if (country.pyramidType === 'COMPETENCE_TRUST') difficultyScore -= 1;
  if (country.pyramidType === 'STABILITY_REDIS') difficultyScore -= 1;
  
  // Passport strength
  const passportRank = country.snapshot.passportRank;
  if (passportRank > 80) difficultyScore += 3;
  else if (passportRank > 50) difficultyScore += 2;
  else if (passportRank > 30) difficultyScore += 1;
  else if (passportRank < 15) difficultyScore -= 1;
  
  // Education
  if (education === 'no_diploma') difficultyScore += 2;
  else if (education === 'high_school') difficultyScore += 1;
  else if (education === 'master' || education === 'engineering') difficultyScore -= 1;
  else if (education === 'medical_degree' || education === 'doctorate') difficultyScore -= 2;
  
  // Traits
  if (constraint.id === 'poor_background') difficultyScore += 2;
  if (constraint.id === 'visa_restricted') difficultyScore += 2;
  if (constraint.id === 'chronic_illness') difficultyScore += 1;
  
  const difficulty: RandomProfile['difficulty'] = 
    difficultyScore >= 5 ? 'extreme' :
    difficultyScore >= 3 ? 'hard' :
    difficultyScore >= 1 ? 'medium' : 'easy';
  
  return {
    countryId: country.id,
    countryName: country.name,
    pyramidType: country.pyramidType,
    flag: getFlagEmoji(country.iso2),
    profession,
    education,
    traits,
    constraint,
    aspirations,
    estimatedSalary: Math.round(country.costOfLiving.monthlyBudgetSingle * profession.averageSalaryMultiplier),
    passportStrength: 100 - country.snapshot.passportRank,
    difficulty,
  };
}

function profileToCharacter(profile: RandomProfile, id: string, name: string): CharacterCardType {
  // Calculate starting resources based on profile
  const resources = createDefaultResources();
  
  // Country influence
  const country = getCountriesSnapshot().find(c => c.id === profile.countryId);
  if (country) {
    if (country.pyramidType === 'GROWTH_RISK') resources.money += 1;
    if (country.pyramidType === 'STABILITY_REDIS') resources.health += 1;
    if (country.pyramidType === 'PROBLEM_RENT') resources.network += 1;
    if (country.pyramidType === 'COMPETENCE_TRUST') resources.skills += 1;
    if (country.pyramidType === 'RESOURCE_EXTRACTION') {
      resources.money += 2;
      resources.mobility -= 1;
    }
    
    // Passport strength affects mobility
    resources.mobility = Math.round(profile.passportStrength / 15);
  }
  
  // Education influence
  if (['master', 'engineering', 'doctorate', 'medical_degree'].includes(profile.education)) {
    resources.skills += 2;
  } else if (['bachelor', 'associate'].includes(profile.education)) {
    resources.skills += 1;
  }
  
  // Profession influence
  if (profile.profession.remoteWorkPossible) {
    resources.mobility += 1;
  }
  if (profile.profession.averageSalaryMultiplier > 1.5) {
    resources.money += 1;
  }
  
  // Apply traits
  [...profile.traits, profile.constraint].forEach(trait => {
    if (trait.resourceBonus) {
      Object.entries(trait.resourceBonus).forEach(([resource, bonus]) => {
        resources[resource as ResourceType] = Math.max(0, Math.min(10,
          resources[resource as ResourceType] + bonus
        ));
      });
    }
  });
  
  return {
    id,
    name,
    birthCountry: profile.countryId,
    traits: profile.traits,
    constraint: profile.constraint,
    majorAspirations: profile.aspirations.map(a => ({ ...a, scoreMultiplier: 2 })),
    minorAspiration: { ...ASPIRATIONS[Math.floor(Math.random() * ASPIRATIONS.length)], scoreMultiplier: 1 },
    startingResources: resources,
  };
}

const DIFFICULTY_COLORS = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  extreme: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DIFFICULTY_LABELS = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
  extreme: 'Extrême',
};

export default function LifeAssignment({ 
  playerCount, 
  playerColors, 
  onComplete, 
  onBack 
}: LifeAssignmentProps) {
  const { t } = useTranslation();
  const { getPyramidLabel } = usePyramidTranslations();
  const { countries } = useCountries();
  const [profiles, setProfiles] = useState<RandomProfile[]>(() => 
    Array.from({ length: playerCount }, () => generateRandomLife(countries))
  );
  const [revealed, setRevealed] = useState<boolean[]>(() => 
    Array(playerCount).fill(false)
  );
  const [allRevealed, setAllRevealed] = useState(false);

  const handleReroll = (index: number) => {
    const newProfiles = [...profiles];
    newProfiles[index] = generateRandomLife(countries);
    setProfiles(newProfiles);
  };

  const handleRerollAll = () => {
    setProfiles(Array.from({ length: playerCount }, () => generateRandomLife(countries)));
    setRevealed(Array(playerCount).fill(false));
    setAllRevealed(false);
  };

  const handleReveal = (index: number) => {
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    
    if (newRevealed.every(r => r)) {
      setAllRevealed(true);
    }
  };

  const handleRevealAll = () => {
    setRevealed(Array(playerCount).fill(true));
    setAllRevealed(true);
  };

  const handleStart = () => {
    const characters = profiles.map((profile, i) => 
      profileToCharacter(profile, `player_${i}`, `Joueur ${i + 1}`)
    );
    onComplete(characters);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Dices className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">
              La Vie Vous Est Attribuée
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comme dans la vraie vie, vous ne choisissez pas où vous naissez. 
            Chaque joueur reçoit une situation de départ aléatoire. 
            <strong> À vous de jouer avec les cartes que vous avez.</strong>
          </p>
        </div>

        {/* Info Banner */}
        <div className="glass-card rounded-xl p-4 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Pourquoi c'est aléatoire ?</p>
              <p className="text-muted-foreground">
                Ce jeu simule la réalité : personne ne choisit son pays de naissance, 
                sa famille, ou ses contraintes initiales. Le but est de comprendre comment 
                naviguer le système mondial avec n'importe quel point de départ.
              </p>
            </div>
          </div>
        </div>

        {/* Player Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {profiles.map((profile, index) => (
            <div 
              key={index}
              className={cn(
                "glass-card rounded-xl overflow-hidden transition-all duration-500",
                revealed[index] ? "ring-2" : "ring-0",
                playerColors[index].ring.replace('ring-', 'ring-')
              )}
            >
              {/* Header */}
              <div className={cn("p-4", playerColors[index].bg)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="font-bold text-white">Joueur {index + 1}</span>
                  </div>
                  {revealed[index] && (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      DIFFICULTY_COLORS[profile.difficulty]
                    )}>
                      {DIFFICULTY_LABELS[profile.difficulty]}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!revealed[index] ? (
                  // Hidden state
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎲</div>
                    <p className="text-muted-foreground mb-4">
                      Votre destin est scellé...
                    </p>
                    <Button onClick={() => handleReveal(index)} className="gap-2">
                      <Dices className="w-4 h-4" />
                      Révéler mon destin
                    </Button>
                  </div>
                ) : (
                  // Revealed state
                  <div className="space-y-4 animate-fade-in">
                    {/* Country */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-4xl">{profile.flag}</span>
                      <div>
                        <p className="font-bold">{profile.countryName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getPyramidLabel(profile.pyramidType)}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">Passeport</p>
                        <p className={cn(
                          "font-bold",
                          profile.passportStrength > 70 ? 'text-emerald-400' :
                          profile.passportStrength > 40 ? 'text-amber-400' : 'text-red-400'
                        )}>
                          #{100 - profile.passportStrength}
                        </p>
                      </div>
                    </div>

                    {/* Education & Profession */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Études</span>
                        </div>
                        <p className="text-sm font-medium">
                          {EDUCATION_LEVELS.find(e => e.id === profile.education)?.label || profile.education}
                        </p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Métier</span>
                        </div>
                        <p className="text-sm font-medium">{profile.profession.name}</p>
                      </div>
                    </div>

                    {/* Traits */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.traits.map(trait => (
                          <span 
                            key={trait.id}
                            className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400"
                          >
                            {trait.icon} {t(trait.label)}
                          </span>
                        ))}
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                          {profile.constraint.icon} {t(profile.constraint.label)}
                        </span>
                      </div>
                    </div>

                    {/* Aspirations */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Objectifs de vie</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.aspirations.map(asp => (
                          <span 
                            key={asp.id}
                            className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary"
                          >
                            {asp.icon} {t(asp.label)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reroll option */}
                    <div className="pt-3 border-t border-border/50 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleReroll(index)}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Shuffle className="w-4 h-4" />
                        Nouvelle vie (triche 😏)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={onBack} variant="outline" className="gap-2">
            Retour
          </Button>

          {!allRevealed && (
            <Button onClick={handleRevealAll} variant="outline" className="gap-2">
              <Dices className="w-4 h-4" />
              Révéler tout le monde
            </Button>
          )}

          <Button onClick={handleRerollAll} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Nouvelles vies pour tous
          </Button>

          {allRevealed && (
            <Button onClick={handleStart} className="gap-2">
              <Play className="w-4 h-4" />
              Commencer la partie
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
