import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Key, AlertTriangle, Clock, Target, Zap, FileText, Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';
import { EXIT_KEYS, ExitKey } from '@/lib/exit-keys-engine';
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

// Find relevant exit keys for the destination and intention
function findRelevantExitKeys(
  destination: Country,
  intention: ProjectIntention,
  professionId?: string
): ExitKey[] {
  const profession = professionId ? getProfession(professionId) : null;
  
  return EXIT_KEYS.filter(key => {
    const matchesPyramid = key.targetPyramids.includes(destination.pyramidType);
    
    const matchesProfession = !profession || 
      profession.compatibleExitKeys.length === 0 || 
      profession.compatibleExitKeys.includes(key.id);

    let matchesIntention = true;
    if (intention === 'vacation') {
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
  accessible: { labelKey: 'exitKeys.difficulty.accessible', color: 'bg-green-500/20 text-green-400' },
  exigeant: { labelKey: 'exitKeys.difficulty.demanding', color: 'bg-amber-500/20 text-amber-400' },
  expert: { labelKey: 'exitKeys.difficulty.expert', color: 'bg-red-500/20 text-red-400' },
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
  const profession = professionId ? getProfession(professionId) : null;

  // Generate personalized steps, warnings, and accelerators using translations
  const { steps, warnings, accelerators, timeline } = useMemo(() => {
    if (!destination) return { steps: [], warnings: [], accelerators: [], timeline: '' };
    
    const stepsList: string[] = [];
    const warningsList: string[] = [];
    const acceleratorsList: string[] = [];
    let timelineStr = t('exitKeys.personalized.timeline.6to12months', '6-12 mois');

    const countryName = destination.name;

    switch (intention) {
      case 'installation':
        stepsList.push(t('exitKeys.personalized.steps.checkDiplomas', 'Vérifier les équivalences de diplômes pour {{country}}', { country: countryName }));
        stepsList.push(t('exitKeys.personalized.steps.searchJobs', 'Rechercher les offres d\'emploi dans votre secteur'));
        stepsList.push(t('exitKeys.personalized.steps.prepareVisa', 'Préparer les démarches de visa de travail'));
        stepsList.push(t('exitKeys.personalized.steps.findHousing', 'Trouver un logement temporaire'));
        
        if (profession) {
          const requiresLicense = profession.category === 'healthcare' || profession.category === 'legal';
          if (requiresLicense) {
            stepsList.push(t('exitKeys.personalized.steps.getLicense', 'Obtenir la reconnaissance de votre licence professionnelle en {{country}}', { country: countryName }));
            warningsList.push(t('exitKeys.personalized.warnings.requiresLicense', 'Votre profession nécessite une accréditation locale en {{country}}', { country: countryName }));
            timelineStr = t('exitKeys.personalized.timeline.12to24months', '12-24 mois');
          }
          if (profession.internationalDemand === 'high' || profession.internationalDemand === 'very_high') {
            acceleratorsList.push(t('exitKeys.personalized.accelerators.highDemand', 'Forte demande internationale pour les {{profession}}', { profession: profession.name }));
          }
        }

        if (age > 45) {
          warningsList.push(t('exitKeys.personalized.warnings.ageLimit', 'Certains visas ont des limites d\'âge - vérifiez les conditions'));
        }
        if (age < 30) {
          acceleratorsList.push(t('exitKeys.personalized.accelerators.youngPro', 'Éligible aux programmes jeunes professionnels / PVT'));
        }
        break;

      case 'vacation':
        stepsList.push(t('exitKeys.personalized.steps.checkEntry', 'Vérifier les conditions d\'entrée pour {{country}}', { country: countryName }));
        stepsList.push(t('exitKeys.personalized.steps.bookTravel', 'Réserver hébergement et transports'));
        stepsList.push(t('exitKeys.personalized.steps.getInsurance', 'Souscrire une assurance voyage'));
        stepsList.push(t('exitKeys.personalized.steps.prepareBudget', 'Préparer un budget quotidien réaliste'));
        timelineStr = t('exitKeys.personalized.timeline.1to4weeks', '1-4 semaines');

        const costOfLiving = destination.costOfLiving?.monthlyBudgetSingle || 1500;
        if (costOfLiving < 1000) {
          acceleratorsList.push(t('exitKeys.personalized.accelerators.veryAffordable', 'Destination très économique'));
        }
        break;

      case 'internship':
        stepsList.push(t('exitKeys.personalized.steps.searchCompanies', 'Rechercher des entreprises/organisations en {{country}}', { country: countryName }));
        stepsList.push(t('exitKeys.personalized.steps.prepareCV', 'Préparer CV et lettre de motivation adaptés'));
        stepsList.push(t('exitKeys.personalized.steps.studentVisa', 'Demander un visa étudiant/stagiaire'));
        stepsList.push(t('exitKeys.personalized.steps.studentHousing', 'Trouver un logement étudiant'));
        timelineStr = t('exitKeys.personalized.timeline.3to6months', '3-6 mois de préparation');

        if (age > 30) {
          warningsList.push(t('exitKeys.personalized.warnings.internshipAge', 'Les stages sont généralement réservés aux moins de 30 ans'));
        }
        if (hasCredentials) {
          acceleratorsList.push(t('exitKeys.personalized.accelerators.credentials', 'Vos diplômes faciliteront les démarches'));
        }
        break;

      case 'retirement':
        stepsList.push(t('exitKeys.personalized.steps.calculatePension', 'Calculer votre pension nette après imposition'));
        stepsList.push(t('exitKeys.personalized.steps.checkTaxTreaties', 'Vérifier les accords fiscaux avec {{country}}', { country: countryName }));
        stepsList.push(t('exitKeys.personalized.steps.evaluateHealthcare', 'Évaluer la couverture santé disponible'));
        stepsList.push(t('exitKeys.personalized.steps.findAdaptedHousing', 'Trouver un logement adapté'));
        timelineStr = t('exitKeys.personalized.timeline.6to12monthsPrep', '6-12 mois de préparation');

        if (age < 55) {
          warningsList.push(t('exitKeys.personalized.warnings.notRetired', 'Vous n\'êtes pas encore en âge de retraite légal'));
        }
        const healthcareQuality = destination.healthcare?.qualityScore || 50;
        if (healthcareQuality < 60) {
          warningsList.push(t('exitKeys.personalized.warnings.limitedHealthcare', 'Système de santé limité - assurance privée recommandée'));
        } else {
          acceleratorsList.push(t('exitKeys.personalized.accelerators.goodHealthcare', 'Bon système de santé public'));
        }
        break;

      case 'digital_nomad':
        stepsList.push(t('exitKeys.personalized.steps.checkNomadVisa', 'Vérifier les visas nomade digital en {{country}}', { country: countryName }));
        stepsList.push(t('exitKeys.personalized.steps.prepareStructure', 'Préparer votre structure juridique (auto-entrepreneur, société)'));
        stepsList.push(t('exitKeys.personalized.steps.findCoworking', 'Trouver des espaces de coworking'));
        stepsList.push(t('exitKeys.personalized.steps.internationalHealth', 'Assurer une couverture santé internationale'));
        timelineStr = t('exitKeys.personalized.timeline.1to3months', '1-3 mois de préparation');

        if (destination.pyramidType === 'GROWTH_RISK') {
          acceleratorsList.push(t('exitKeys.personalized.accelerators.nomadCommunity', 'Communauté nomade active dans ce pays'));
        }
        break;
    }

    return { steps: stepsList, warnings: warningsList, accelerators: acceleratorsList, timeline: timelineStr };
  }, [destination, intention, age, professionId, hasCredentials, t, profession]);

  const relevantExitKeys = useMemo(() => {
    if (!destination) return [];
    return findRelevantExitKeys(destination, intention, professionId);
  }, [destination, intention, professionId]);

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
            {age} {t('common.years', 'ans')}
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
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-sm">
              💰 {t('exitKeys.profile.capital', 'Capital')}
            </span>
          )}
          {hasCredentials && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
              📜 {t('exitKeys.profile.diplomas', 'Diplômes')}
            </span>
          )}
          {hasNetwork && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm">
              🤝 {t('exitKeys.profile.network', 'Réseau')}
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
            <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
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
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('exitKeys.personalized.accelerators', 'Vos atouts')}
            </h4>
            <ul className="space-y-1">
              {accelerators.map((acc, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
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
                        {t(difficultyConfig[key.difficulty].labelKey, key.difficulty)}
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
              <p className="text-xs text-muted-foreground mb-1">{t('exitKeys.personalized.monthlyCost', 'Coût de vie mensuel')}</p>
              <p className="font-bold text-lg">~{destination.costOfLiving.monthlyBudgetSingle}€</p>
            </div>
          )}
          {destination.healthcare && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">{t('exitKeys.personalized.healthcareSystem', 'Système de santé')}</p>
              <p className="font-bold text-lg">{destination.healthcare.qualityScore}/100</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
