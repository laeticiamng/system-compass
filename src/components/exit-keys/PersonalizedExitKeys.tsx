import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Key, ChevronRight, AlertTriangle, CheckCircle, Shield, 
  Clock, Target, Zap, MapPin, Briefcase, GraduationCap,
  Users, DollarSign, FileText, Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';
import { EXIT_KEYS, ExitKey, ExitKeyStep } from '@/lib/exit-keys-engine';
import { getProfession } from '@/lib/profession-data';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';

interface PersonalizedExitKeysProps {
  destinationCountryId: string;
  currentCountryId: string;
  intention: ProjectIntention;
  age: number;
  professionId?: string;
  hasCapital: boolean;
  hasCredentials: boolean;
  hasNetwork: boolean;
  educationLevel?: string;
}

function getFlagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

// Generate personalized steps based on destination, profession, and intention
function generatePersonalizedSteps(
  destination: Country,
  intention: ProjectIntention,
  age: number,
  professionId?: string,
  hasCredentials?: boolean
): { steps: string[]; warnings: string[]; accelerators: string[]; timeline: string } {
  const steps: string[] = [];
  const warnings: string[] = [];
  const accelerators: string[] = [];
  let timeline = '6-12 mois';

  const profession = professionId ? getProfession(professionId) : null;

  // Base steps for all intentions
  switch (intention) {
    case 'installation':
      steps.push(`Vérifier les équivalences de diplômes pour ${destination.name}`);
      steps.push(`Rechercher les offres d'emploi dans votre secteur`);
      steps.push(`Préparer les démarches de visa de travail`);
      steps.push(`Trouver un logement temporaire`);
      
      if (profession) {
        // Check if profession requires licensing (healthcare, legal, etc.)
        const requiresLicense = profession.category === 'healthcare' || profession.category === 'legal';
        if (requiresLicense) {
          steps.push(`Obtenir la reconnaissance de votre licence professionnelle en ${destination.name}`);
          warnings.push(`Votre profession nécessite une accréditation locale en ${destination.name}`);
          timeline = '12-24 mois';
        }
        if (profession.internationalDemand === 'high' || profession.internationalDemand === 'very_high') {
          accelerators.push(`Forte demande internationale pour les ${profession.name}`);
        }
      }

      if (age > 45) {
        warnings.push('Certains visas ont des limites d\'âge - vérifiez les conditions');
      }
      if (age < 30) {
        accelerators.push('Éligible aux programmes jeunes professionnels / PVT');
      }
      break;

    case 'vacation':
      steps.push(`Vérifier les conditions d'entrée pour ${destination.name}`);
      steps.push('Réserver hébergement et transports');
      steps.push('Souscrire une assurance voyage');
      steps.push('Préparer un budget quotidien réaliste');
      timeline = '1-4 semaines';

      const costOfLiving = destination.costOfLiving?.monthlyBudgetSingle || 1500;
      if (costOfLiving < 1000) {
        accelerators.push('Destination très économique');
      }
      break;

    case 'internship':
      steps.push(`Rechercher des entreprises/organisations en ${destination.name}`);
      steps.push('Préparer CV et lettre de motivation adaptés');
      steps.push('Demander un visa étudiant/stagiaire');
      steps.push('Trouver un logement étudiant');
      timeline = '3-6 mois de préparation';

      if (age > 30) {
        warnings.push('Les stages sont généralement réservés aux moins de 30 ans');
      }
      if (hasCredentials) {
        accelerators.push('Vos diplômes faciliteront les démarches');
      }
      break;

    case 'retirement':
      steps.push('Calculer votre pension nette après imposition');
      steps.push(`Vérifier les accords fiscaux France-${destination.name}`);
      steps.push('Évaluer la couverture santé disponible');
      steps.push('Trouver un logement adapté');
      timeline = '6-12 mois de préparation';

      if (age < 55) {
        warnings.push('Vous n\'êtes pas encore en âge de retraite légal');
      }
      const healthcareQuality = destination.healthcare?.qualityScore || 50;
      if (healthcareQuality < 60) {
        warnings.push('Système de santé limité - assurance privée recommandée');
      } else {
        accelerators.push('Bon système de santé public');
      }
      break;

    case 'digital_nomad':
      steps.push(`Vérifier les visas nomade digital en ${destination.name}`);
      steps.push('Préparer votre structure juridique (auto-entrepreneur, société)');
      steps.push('Trouver des espaces de coworking');
      steps.push('Assurer une couverture santé internationale');
      timeline = '1-3 mois de préparation';

      if (destination.pyramidType === 'GROWTH_RISK') {
        accelerators.push('Communauté nomade active dans ce pays');
      }
      break;
  }

  return { steps, warnings, accelerators, timeline };
}

// Find relevant exit keys for the destination and intention
function findRelevantExitKeys(
  destination: Country,
  intention: ProjectIntention,
  professionId?: string
): ExitKey[] {
  const profession = professionId ? getProfession(professionId) : null;
  
  return EXIT_KEYS.filter(key => {
    // Check if key targets this pyramid type
    const matchesPyramid = key.targetPyramids.includes(destination.pyramidType);
    
    // Check profession compatibility
    const matchesProfession = !profession || 
      profession.compatibleExitKeys.length === 0 || 
      profession.compatibleExitKeys.includes(key.id);

    // Check intention relevance
    let matchesIntention = true;
    if (intention === 'vacation') {
      // Vacation doesn't need exit keys - it's temporary
      matchesIntention = false;
    } else if (intention === 'internship') {
      matchesIntention = key.difficulty === 'accessible';
    } else if (intention === 'retirement') {
      matchesIntention = key.id.includes('retire') || key.linkedPyramids.includes('STABILITY_REDIS');
    }

    return matchesPyramid && matchesProfession && matchesIntention;
  }).slice(0, 3);
}

const difficultyConfig = {
  accessible: { label: 'Accessible', color: 'bg-emerald-500/20 text-emerald-400', icon: '🟢' },
  exigeant: { label: 'Exigeant', color: 'bg-amber-500/20 text-amber-400', icon: '🟡' },
  expert: { label: 'Expert', color: 'bg-red-500/20 text-red-400', icon: '🔴' },
};

export function PersonalizedExitKeys({
  destinationCountryId,
  currentCountryId,
  intention,
  age,
  professionId,
  hasCapital,
  hasCredentials,
  hasNetwork,
  educationLevel,
}: PersonalizedExitKeysProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { getPyramidLabel } = usePyramidTranslations();

  const destination = countries.find(c => c.id === destinationCountryId);
  const currentCountry = countries.find(c => c.id === currentCountryId);

  const { steps, warnings, accelerators, timeline } = useMemo(() => {
    if (!destination) return { steps: [], warnings: [], accelerators: [], timeline: '' };
    return generatePersonalizedSteps(destination, intention, age, professionId, hasCredentials);
  }, [destination, intention, age, professionId, hasCredentials]);

  const relevantExitKeys = useMemo(() => {
    if (!destination) return [];
    return findRelevantExitKeys(destination, intention, professionId);
  }, [destination, intention, professionId]);

  const profession = professionId ? getProfession(professionId) : null;

  if (!destination) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('exitKeys.personalized.selectDestination', 'Sélectionnez une destination pour voir les clés personnalisées')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Destination header */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{getFlagEmoji(destination.iso2)}</span>
          <div>
            <h2 className="text-2xl font-bold">{destination.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {getPyramidLabel(destination.pyramidType)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-primary">{timeline}</div>
            <p className="text-xs text-muted-foreground">{t('exitKeys.personalized.estimatedTimeline', 'Délai estimé')}</p>
          </div>
        </div>

        {/* Profile summary */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <span className="px-3 py-1 rounded-full bg-muted text-sm">
            {age} ans
          </span>
          {profession && (
            <span className="px-3 py-1 rounded-full bg-muted text-sm">
              {profession.name}
            </span>
          )}
          {educationLevel && (
            <span className="px-3 py-1 rounded-full bg-muted text-sm">
              {educationLevel}
            </span>
          )}
          {hasCapital && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
              💰 Capital
            </span>
          )}
          {hasCredentials && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
              📜 Diplômes
            </span>
          )}
          {hasNetwork && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
              🤝 Réseau
            </span>
          )}
        </div>
      </div>

      {/* Personalized steps */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t('exitKeys.personalized.yourSteps', 'Vos étapes personnalisées')}
        </h3>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Warnings & Accelerators */}
      <div className="grid md:grid-cols-2 gap-4">
        {warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <h4 className="font-medium text-amber-500 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('exitKeys.personalized.warnings', 'Points d\'attention')}
            </h4>
            <ul className="space-y-1">
              {warnings.map((warning, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {accelerators.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <h4 className="font-medium text-emerald-500 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('exitKeys.personalized.accelerators', 'Vos atouts')}
            </h4>
            <ul className="space-y-1">
              {accelerators.map((acc, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  {acc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Relevant Exit Keys (for installation/retirement/digital_nomad) */}
      {intention !== 'vacation' && relevantExitKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('exitKeys.personalized.relevantStrategies', 'Stratégies recommandées')}
          </h3>
          <div className="grid gap-4">
            {relevantExitKeys.map(key => (
              <div key={key.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{key.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{key.name}</h4>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", difficultyConfig[key.difficulty].color)}>
                        {difficultyConfig[key.difficulty].label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{key.unlocks}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {key.timeframe}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {key.successCondition}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country-specific info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          {t('exitKeys.personalized.countryInfo', 'Informations clés sur')} {destination.name}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {destination.costOfLiving && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Coût de vie mensuel</p>
              <p className="font-bold text-lg">~{destination.costOfLiving.monthlyBudgetSingle}€</p>
            </div>
          )}
          {destination.healthcare && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Système de santé</p>
              <p className="font-bold text-lg">{destination.healthcare.qualityScore}/100</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
