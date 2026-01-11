import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Phone, ExternalLink, Heart, XCircle, CheckCircle, Info, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PyramidType } from '@/lib/types';

interface RiskPreventionProps {
  currentCountryPyramidType?: PyramidType;
  birthCountryPyramidType?: PyramidType;
  currentCountryId?: string;
  birthCountryId?: string;
  // New props for dynamic display
  originCountryName?: string;
  destinationCountryName?: string;
}

interface RiskCategory {
  id: string;
  titleKey: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium';
  descriptionKey: string;
  realStatsKeys: string[];
  warningSignalsKeys: string[];
  preventionTipsKeys: string[];
  resources: { nameKey: string; url?: string; phone?: string }[];
  // Which pyramid types this risk is most relevant for
  relevantFor: {
    fromPyramids?: PyramidType[];  // If user is FROM these pyramid types
    toPyramids?: PyramidType[];    // If user is GOING TO these pyramid types
    countryIds?: string[];          // Specific countries (e.g., Mediterranean crossing)
  };
}

// All possible risk categories with i18n keys
const ALL_RISK_CATEGORIES: RiskCategory[] = [
  {
    id: 'human_trafficking',
    titleKey: 'riskPrevention.categories.humanTrafficking.title',
    icon: '🚨',
    severity: 'critical',
    descriptionKey: 'riskPrevention.categories.humanTrafficking.description',
    realStatsKeys: [
      'riskPrevention.categories.humanTrafficking.stats.1',
      'riskPrevention.categories.humanTrafficking.stats.2',
      'riskPrevention.categories.humanTrafficking.stats.3',
      'riskPrevention.categories.humanTrafficking.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.humanTrafficking.warnings.1',
      'riskPrevention.categories.humanTrafficking.warnings.2',
      'riskPrevention.categories.humanTrafficking.warnings.3',
      'riskPrevention.categories.humanTrafficking.warnings.4',
      'riskPrevention.categories.humanTrafficking.warnings.5',
      'riskPrevention.categories.humanTrafficking.warnings.6',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.humanTrafficking.prevention.1',
      'riskPrevention.categories.humanTrafficking.prevention.2',
      'riskPrevention.categories.humanTrafficking.prevention.3',
      'riskPrevention.categories.humanTrafficking.prevention.4',
      'riskPrevention.categories.humanTrafficking.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.traffickingHotline', phone: '0 805 123 123' },
      { nameKey: 'riskPrevention.resources.iom', url: 'https://www.iom.int' },
      { nameKey: 'riskPrevention.resources.cimade', url: 'https://www.lacimade.org' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
      toPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
  {
    id: 'fake_smugglers',
    titleKey: 'riskPrevention.categories.fakeSmugglers.title',
    icon: '⚠️',
    severity: 'critical',
    descriptionKey: 'riskPrevention.categories.fakeSmugglers.description',
    realStatsKeys: [
      'riskPrevention.categories.fakeSmugglers.stats.1',
      'riskPrevention.categories.fakeSmugglers.stats.2',
      'riskPrevention.categories.fakeSmugglers.stats.3',
      'riskPrevention.categories.fakeSmugglers.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.fakeSmugglers.warnings.1',
      'riskPrevention.categories.fakeSmugglers.warnings.2',
      'riskPrevention.categories.fakeSmugglers.warnings.3',
      'riskPrevention.categories.fakeSmugglers.warnings.4',
      'riskPrevention.categories.fakeSmugglers.warnings.5',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.fakeSmugglers.prevention.1',
      'riskPrevention.categories.fakeSmugglers.prevention.2',
      'riskPrevention.categories.fakeSmugglers.prevention.3',
      'riskPrevention.categories.fakeSmugglers.prevention.4',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.unhcr', url: 'https://www.unhcr.org' },
      { nameKey: 'riskPrevention.resources.sosMed', url: 'https://sosmediterranee.fr' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT'],
      countryIds: ['nigeria', 'senegal', 'mali', 'morocco', 'algeria', 'tunisia', 'libya', 'eritrea', 'sudan', 'syria', 'afghanistan'],
    },
  },
  {
    id: 'exploitation_work',
    titleKey: 'riskPrevention.categories.exploitationWork.title',
    icon: '⛓️',
    severity: 'high',
    descriptionKey: 'riskPrevention.categories.exploitationWork.description',
    realStatsKeys: [
      'riskPrevention.categories.exploitationWork.stats.1',
      'riskPrevention.categories.exploitationWork.stats.2',
      'riskPrevention.categories.exploitationWork.stats.3',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.exploitationWork.warnings.1',
      'riskPrevention.categories.exploitationWork.warnings.2',
      'riskPrevention.categories.exploitationWork.warnings.3',
      'riskPrevention.categories.exploitationWork.warnings.4',
      'riskPrevention.categories.exploitationWork.warnings.5',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.exploitationWork.prevention.1',
      'riskPrevention.categories.exploitationWork.prevention.2',
      'riskPrevention.categories.exploitationWork.prevention.3',
      'riskPrevention.categories.exploitationWork.prevention.4',
      'riskPrevention.categories.exploitationWork.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.laborInspection', phone: '0 800 730 033' },
      { nameKey: 'riskPrevention.resources.ccem', url: 'https://ccem.org' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION', 'HYBRID_TRANSITION'],
    },
  },
  {
    id: 'scam_immigration',
    titleKey: 'riskPrevention.categories.scamImmigration.title',
    icon: '🎭',
    severity: 'high',
    descriptionKey: 'riskPrevention.categories.scamImmigration.description',
    realStatsKeys: [
      'riskPrevention.categories.scamImmigration.stats.1',
      'riskPrevention.categories.scamImmigration.stats.2',
      'riskPrevention.categories.scamImmigration.stats.3',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.scamImmigration.warnings.1',
      'riskPrevention.categories.scamImmigration.warnings.2',
      'riskPrevention.categories.scamImmigration.warnings.3',
      'riskPrevention.categories.scamImmigration.warnings.4',
      'riskPrevention.categories.scamImmigration.warnings.5',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.scamImmigration.prevention.1',
      'riskPrevention.categories.scamImmigration.prevention.2',
      'riskPrevention.categories.scamImmigration.prevention.3',
      'riskPrevention.categories.scamImmigration.prevention.4',
      'riskPrevention.categories.scamImmigration.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.franceDiplomatie', url: 'https://france-visas.gouv.fr' },
      { nameKey: 'riskPrevention.resources.signalArnaques', url: 'https://signal-arnaques.com' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION', 'HYBRID_TRANSITION', 'GROWTH_RISK'],
    },
  },
  {
    id: 'sexual_exploitation',
    titleKey: 'riskPrevention.categories.sexualExploitation.title',
    icon: '🛑',
    severity: 'critical',
    descriptionKey: 'riskPrevention.categories.sexualExploitation.description',
    realStatsKeys: [
      'riskPrevention.categories.sexualExploitation.stats.1',
      'riskPrevention.categories.sexualExploitation.stats.2',
      'riskPrevention.categories.sexualExploitation.stats.3',
      'riskPrevention.categories.sexualExploitation.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.sexualExploitation.warnings.1',
      'riskPrevention.categories.sexualExploitation.warnings.2',
      'riskPrevention.categories.sexualExploitation.warnings.3',
      'riskPrevention.categories.sexualExploitation.warnings.4',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.sexualExploitation.prevention.1',
      'riskPrevention.categories.sexualExploitation.prevention.2',
      'riskPrevention.categories.sexualExploitation.prevention.3',
      'riskPrevention.categories.sexualExploitation.prevention.4',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.mouvementNid', url: 'https://mouvementdunid.org' },
      { nameKey: 'riskPrevention.resources.alcNice', url: 'https://association-alc.org' },
      { nameKey: 'riskPrevention.resources.victimHotline', phone: '116 006' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT'],
      countryIds: ['nigeria', 'romania', 'albania', 'china', 'moldova', 'ukraine', 'bulgaria'],
    },
  },
  {
    id: 'healthcare_abroad',
    titleKey: 'riskPrevention.categories.healthcareAbroad.title',
    icon: '🏥',
    severity: 'high',
    descriptionKey: 'riskPrevention.categories.healthcareAbroad.description',
    realStatsKeys: [
      'riskPrevention.categories.healthcareAbroad.stats.1',
      'riskPrevention.categories.healthcareAbroad.stats.2',
      'riskPrevention.categories.healthcareAbroad.stats.3',
      'riskPrevention.categories.healthcareAbroad.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.healthcareAbroad.warnings.1',
      'riskPrevention.categories.healthcareAbroad.warnings.2',
      'riskPrevention.categories.healthcareAbroad.warnings.3',
      'riskPrevention.categories.healthcareAbroad.warnings.4',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.healthcareAbroad.prevention.1',
      'riskPrevention.categories.healthcareAbroad.prevention.2',
      'riskPrevention.categories.healthcareAbroad.prevention.3',
      'riskPrevention.categories.healthcareAbroad.prevention.4',
      'riskPrevention.categories.healthcareAbroad.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.ameli', url: 'https://www.ameli.fr/assure/droits-demarches/europe-international' },
      { nameKey: 'riskPrevention.resources.cleiss', url: 'https://www.cleiss.fr' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
      toPyramids: ['GROWTH_RISK', 'RESOURCE_EXTRACTION', 'PROBLEM_RENT'],
    },
  },
  {
    id: 'retirement_abroad',
    titleKey: 'riskPrevention.categories.retirementAbroad.title',
    icon: '🌴',
    severity: 'medium',
    descriptionKey: 'riskPrevention.categories.retirementAbroad.description',
    realStatsKeys: [
      'riskPrevention.categories.retirementAbroad.stats.1',
      'riskPrevention.categories.retirementAbroad.stats.2',
      'riskPrevention.categories.retirementAbroad.stats.3',
      'riskPrevention.categories.retirementAbroad.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.retirementAbroad.warnings.1',
      'riskPrevention.categories.retirementAbroad.warnings.2',
      'riskPrevention.categories.retirementAbroad.warnings.3',
      'riskPrevention.categories.retirementAbroad.warnings.4',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.retirementAbroad.prevention.1',
      'riskPrevention.categories.retirementAbroad.prevention.2',
      'riskPrevention.categories.retirementAbroad.prevention.3',
      'riskPrevention.categories.retirementAbroad.prevention.4',
      'riskPrevention.categories.retirementAbroad.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.diplomatie', url: 'https://www.diplomatie.gouv.fr/fr/services-aux-francais/preparer-son-expatriation/retraite/' },
      { nameKey: 'riskPrevention.resources.ufe', url: 'https://www.ufe.org' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
  {
    id: 'expat_bubble',
    titleKey: 'riskPrevention.categories.expatBubble.title',
    icon: '🫧',
    severity: 'medium',
    descriptionKey: 'riskPrevention.categories.expatBubble.description',
    realStatsKeys: [
      'riskPrevention.categories.expatBubble.stats.1',
      'riskPrevention.categories.expatBubble.stats.2',
      'riskPrevention.categories.expatBubble.stats.3',
      'riskPrevention.categories.expatBubble.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.expatBubble.warnings.1',
      'riskPrevention.categories.expatBubble.warnings.2',
      'riskPrevention.categories.expatBubble.warnings.3',
      'riskPrevention.categories.expatBubble.warnings.4',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.expatBubble.prevention.1',
      'riskPrevention.categories.expatBubble.prevention.2',
      'riskPrevention.categories.expatBubble.prevention.3',
      'riskPrevention.categories.expatBubble.prevention.4',
      'riskPrevention.categories.expatBubble.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.francaisDuMonde', url: 'https://www.francais-du-monde.org' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
  {
    id: 'digital_nomad_reality',
    titleKey: 'riskPrevention.categories.digitalNomadReality.title',
    icon: '💻',
    severity: 'medium',
    descriptionKey: 'riskPrevention.categories.digitalNomadReality.description',
    realStatsKeys: [
      'riskPrevention.categories.digitalNomadReality.stats.1',
      'riskPrevention.categories.digitalNomadReality.stats.2',
      'riskPrevention.categories.digitalNomadReality.stats.3',
      'riskPrevention.categories.digitalNomadReality.stats.4',
    ],
    warningSignalsKeys: [
      'riskPrevention.categories.digitalNomadReality.warnings.1',
      'riskPrevention.categories.digitalNomadReality.warnings.2',
      'riskPrevention.categories.digitalNomadReality.warnings.3',
      'riskPrevention.categories.digitalNomadReality.warnings.4',
    ],
    preventionTipsKeys: [
      'riskPrevention.categories.digitalNomadReality.prevention.1',
      'riskPrevention.categories.digitalNomadReality.prevention.2',
      'riskPrevention.categories.digitalNomadReality.prevention.3',
      'riskPrevention.categories.digitalNomadReality.prevention.4',
      'riskPrevention.categories.digitalNomadReality.prevention.5',
    ],
    resources: [
      { nameKey: 'riskPrevention.resources.autoEntrepreneur', url: 'https://www.autoentrepreneur.urssaf.fr' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
];

// Get relevant risks based on user's situation
function getRelevantRisks(
  currentCountryPyramid?: PyramidType,
  birthCountryPyramid?: PyramidType,
  currentCountryId?: string,
  birthCountryId?: string
): RiskCategory[] {
  // If no context, return universal risks (work exploitation and scams)
  if (!currentCountryPyramid && !birthCountryPyramid) {
    return ALL_RISK_CATEGORIES.filter(r => 
      r.id === 'exploitation_work' || r.id === 'scam_immigration'
    );
  }

  const originPyramid = birthCountryPyramid || currentCountryPyramid;
  
  return ALL_RISK_CATEGORIES.filter(risk => {
    // Check if country ID is explicitly listed
    if (risk.relevantFor.countryIds?.length) {
      if (birthCountryId && risk.relevantFor.countryIds.includes(birthCountryId)) {
        return true;
      }
      if (currentCountryId && risk.relevantFor.countryIds.includes(currentCountryId)) {
        return true;
      }
    }

    // Check if origin pyramid type matches
    if (risk.relevantFor.fromPyramids?.length && originPyramid) {
      if (risk.relevantFor.fromPyramids.includes(originPyramid)) {
        return true;
      }
    }

    // Check if destination pyramid type matches
    if (risk.relevantFor.toPyramids?.length && currentCountryPyramid) {
      if (risk.relevantFor.toPyramids.includes(currentCountryPyramid)) {
        return true;
      }
    }

    return false;
  });
}

function getSeverityColor(severity: RiskCategory['severity']) {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
    case 'high': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
    case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
  }
}

export function RiskPrevention({ 
  currentCountryPyramidType,
  birthCountryPyramidType,
  currentCountryId,
  birthCountryId,
  originCountryName,
  destinationCountryName
}: RiskPreventionProps) {
  const { t } = useTranslation();
  
  const relevantRisks = useMemo(() => {
    return getRelevantRisks(
      currentCountryPyramidType,
      birthCountryPyramidType,
      currentCountryId,
      birthCountryId
    );
  }, [currentCountryPyramidType, birthCountryPyramidType, currentCountryId, birthCountryId]);

  // If no relevant risks, don't show the section
  if (relevantRisks.length === 0) {
    return null;
  }

  // Determine the primary context for the header message
  const isFromStableCountry = birthCountryPyramidType && 
    ['STABILITY_REDIS', 'COMPETENCE_TRUST'].includes(birthCountryPyramidType);

  // Dynamic header based on countries
  const headerTitle = isFromStableCountry 
    ? t('riskPrevention.titleStable', '⚠️ Points de Vigilance pour Votre Projet')
    : t('riskPrevention.titleUnstable', '⚠️ Risques des Raccourcis');

  const headerDesc = isFromStableCountry 
    ? t('riskPrevention.descStable', 'Votre situation privilégiée vous protège de certains risques, mais d\'autres défis vous attendent. Voici ce qu\'il faut anticiper.')
    : t('riskPrevention.descUnstable', 'Cette section n\'est pas là pour faire peur, mais pour informer et protéger. Les chemins officiels sont plus longs mais infiniment plus sûrs.');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={cn(
        "glass-card rounded-xl p-6 border-2",
        isFromStableCountry 
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-red-500/30 bg-red-500/5"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-full",
            isFromStableCountry ? "bg-amber-500/20" : "bg-red-500/20"
          )}>
            <AlertTriangle className={cn(
              "w-8 h-8",
              isFromStableCountry ? "text-amber-400" : "text-red-400"
            )} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">
                {headerTitle}
              </h2>
              {originCountryName && destinationCountryName && (
                <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {originCountryName} → {destinationCountryName}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mb-4">
              {originCountryName && destinationCountryName 
                ? t('riskPrevention.descDynamic', {
                    origin: originCountryName,
                    destination: destinationCountryName,
                    defaultValue: `Risques spécifiques pour un trajet ${originCountryName} → ${destinationCountryName}. ${headerDesc}`
                  })
                : headerDesc
              }
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{t('riskPrevention.infoProtection', 'Information = Protection')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>{t('riskPrevention.noJudgment', 'Aucun jugement, que de la prévention')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Golden Rule - only for migration risks */}
      {!isFromStableCountry && (
        <div className="glass-card rounded-xl p-6 bg-amber-500/5 border-amber-500/30">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🔑</span>
            {t('riskPrevention.goldenRule.title', 'Règle d\'Or')}
          </h3>
          <p className="text-lg font-medium text-amber-400 mb-2">
            {t('riskPrevention.goldenRule.quote', '"Si une offre semble trop belle pour être vraie, elle l\'est probablement."')}
          </p>
          <p className="text-muted-foreground">
            {t('riskPrevention.goldenRule.explanation', 'Les vrais emplois légaux ne demandent jamais de payer à l\'avance. Les vrais visas passent par les voies officielles. Les vraies opportunités vous laissent le temps de réfléchir.')}
          </p>
        </div>
      )}

      {/* Risk Categories */}
      <Accordion type="single" collapsible className="space-y-4">
        {relevantRisks.map(category => (
          <AccordionItem 
            key={category.id} 
            value={category.id}
            className={cn("glass-card rounded-xl border-2", getSeverityColor(category.severity))}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-4 text-left">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{t(category.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{t(category.descriptionKey)}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Stats */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {t('riskPrevention.realStats', 'Chiffres réels')}
                  </h4>
                  <ul className="space-y-2">
                    {category.realStatsKeys.map((statKey, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t(statKey)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning Signals */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    {t('riskPrevention.warningSignals', 'Signaux d\'alerte')}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {category.warningSignalsKeys.map((signalKey, i) => (
                      <div key={i} className="text-sm flex items-start gap-2 p-2 bg-red-500/10 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        {t(signalKey)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention Tips */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    {t('riskPrevention.howToProtect', 'Comment se protéger')}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {category.preventionTipsKeys.map((tipKey, i) => (
                      <div key={i} className="text-sm flex items-start gap-2 p-2 bg-emerald-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {t(tipKey)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-400">
                    <Phone className="w-4 h-4" />
                    {t('riskPrevention.resourcesAndHelp', 'Ressources et aide')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.resources.map((resource, i) => (
                      <div key={i}>
                        {resource.url ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                              {t(resource.nameKey)}
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Phone className="w-3 h-3" />
                            {t(resource.nameKey)}: {resource.phone}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Closing message */}
      <div className="glass-card rounded-xl p-6 text-center">
        <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="font-bold text-xl mb-2">
          {isFromStableCountry 
            ? t('riskPrevention.closingTitleStable', 'Préparez-vous bien, profitez pleinement')
            : t('riskPrevention.closingTitleUnstable', 'Chaque vie compte')
          }
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isFromStableCountry 
            ? t('riskPrevention.closingDescStable', 'Une bonne préparation vous permettra de profiter pleinement de votre expérience à l\'étranger. Anticipez les défis pour mieux les surmonter.')
            : t('riskPrevention.closingDescUnstable', 'Si vous connaissez quelqu\'un qui envisage de prendre des risques, partagez cette information. Il existe toujours des alternatives légales, même si elles demandent plus de patience. Votre vie vaut plus que n\'importe quel raccourci.')
          }
        </p>
      </div>
    </div>
  );
}
