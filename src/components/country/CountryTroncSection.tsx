import { useTranslation } from 'react-i18next';
import { Country } from '@/lib/types';
import { PyramidVisualization } from '@/components/PyramidVisualization';
import { RiskBars } from '@/components/RiskBars';
import { RuleOfGoldBanner } from '@/components/RuleOfGoldBanner';
import { WhoWinsWhoLoses } from '@/components/WhoWinsWhoLoses';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface CountryTroncSectionProps {
  country: Country;
  displayPyramid: Country['pyramid'];
  displayRuleOfGold: string;
  displayWhoWins: string[];
  displayWhoLoses: string[];
}

// Pyramid type to common behaviors mapping
const PYRAMID_BEHAVIORS = {
  PROBLEM_RENT: {
    rewards: [
      'pyramidBehaviors.problemRent.rewards.0',
      'pyramidBehaviors.problemRent.rewards.1',
      'pyramidBehaviors.problemRent.rewards.2',
    ],
    punishes: [
      'pyramidBehaviors.problemRent.punishes.0',
      'pyramidBehaviors.problemRent.punishes.1',
      'pyramidBehaviors.problemRent.punishes.2',
    ],
    errors: [
      'pyramidBehaviors.problemRent.errors.0',
      'pyramidBehaviors.problemRent.errors.1',
      'pyramidBehaviors.problemRent.errors.2',
    ],
  },
  STABILITY_REDIS: {
    rewards: [
      'pyramidBehaviors.stabilityRedis.rewards.0',
      'pyramidBehaviors.stabilityRedis.rewards.1',
      'pyramidBehaviors.stabilityRedis.rewards.2',
    ],
    punishes: [
      'pyramidBehaviors.stabilityRedis.punishes.0',
      'pyramidBehaviors.stabilityRedis.punishes.1',
      'pyramidBehaviors.stabilityRedis.punishes.2',
    ],
    errors: [
      'pyramidBehaviors.stabilityRedis.errors.0',
      'pyramidBehaviors.stabilityRedis.errors.1',
      'pyramidBehaviors.stabilityRedis.errors.2',
    ],
  },
  COMPETENCE_TRUST: {
    rewards: [
      'pyramidBehaviors.competenceTrust.rewards.0',
      'pyramidBehaviors.competenceTrust.rewards.1',
      'pyramidBehaviors.competenceTrust.rewards.2',
    ],
    punishes: [
      'pyramidBehaviors.competenceTrust.punishes.0',
      'pyramidBehaviors.competenceTrust.punishes.1',
      'pyramidBehaviors.competenceTrust.punishes.2',
    ],
    errors: [
      'pyramidBehaviors.competenceTrust.errors.0',
      'pyramidBehaviors.competenceTrust.errors.1',
      'pyramidBehaviors.competenceTrust.errors.2',
    ],
  },
  GROWTH_RISK: {
    rewards: [
      'pyramidBehaviors.growthRisk.rewards.0',
      'pyramidBehaviors.growthRisk.rewards.1',
      'pyramidBehaviors.growthRisk.rewards.2',
    ],
    punishes: [
      'pyramidBehaviors.growthRisk.punishes.0',
      'pyramidBehaviors.growthRisk.punishes.1',
      'pyramidBehaviors.growthRisk.punishes.2',
    ],
    errors: [
      'pyramidBehaviors.growthRisk.errors.0',
      'pyramidBehaviors.growthRisk.errors.1',
      'pyramidBehaviors.growthRisk.errors.2',
    ],
  },
  HYBRID_TRANSITION: {
    rewards: [
      'pyramidBehaviors.hybridTransition.rewards.0',
      'pyramidBehaviors.hybridTransition.rewards.1',
      'pyramidBehaviors.hybridTransition.rewards.2',
    ],
    punishes: [
      'pyramidBehaviors.hybridTransition.punishes.0',
      'pyramidBehaviors.hybridTransition.punishes.1',
      'pyramidBehaviors.hybridTransition.punishes.2',
    ],
    errors: [
      'pyramidBehaviors.hybridTransition.errors.0',
      'pyramidBehaviors.hybridTransition.errors.1',
      'pyramidBehaviors.hybridTransition.errors.2',
    ],
  },
  RESOURCE_EXTRACTION: {
    rewards: [
      'pyramidBehaviors.resourceExtraction.rewards.0',
      'pyramidBehaviors.resourceExtraction.rewards.1',
      'pyramidBehaviors.resourceExtraction.rewards.2',
    ],
    punishes: [
      'pyramidBehaviors.resourceExtraction.punishes.0',
      'pyramidBehaviors.resourceExtraction.punishes.1',
      'pyramidBehaviors.resourceExtraction.punishes.2',
    ],
    errors: [
      'pyramidBehaviors.resourceExtraction.errors.0',
      'pyramidBehaviors.resourceExtraction.errors.1',
      'pyramidBehaviors.resourceExtraction.errors.2',
    ],
  },
};

export function CountryTroncSection({
  country,
  displayPyramid,
  displayRuleOfGold,
  displayWhoWins,
  displayWhoLoses,
}: CountryTroncSectionProps) {
  const { t } = useTranslation();
  const behaviors = PYRAMID_BEHAVIORS[country.pyramidType as keyof typeof PYRAMID_BEHAVIORS] || PYRAMID_BEHAVIORS.STABILITY_REDIS;

  return (
    <div className="space-y-8">
      {/* Free Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium border border-green-500/20">
          <Info className="w-4 h-4" />
          {t('countryDetail.tronc.badge', 'Tronc commun — Accès gratuit')}
        </span>
      </div>

      {/* Rule of Gold */}
      <RuleOfGoldBanner rule={displayRuleOfGold} className="mb-4" />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pyramid */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">{t('countryDetail.systemPyramid')}</h2>
          <PyramidVisualization country={country} translatedPyramid={displayPyramid} />
        </div>

        {/* Risk Assessment */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">{t('countryDetail.riskAssessment')}</h2>
          <div className="glass-card rounded-xl p-6">
            <RiskBars risks={country.risks} />
          </div>
        </div>
      </div>

      {/* System Behaviors Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* What system rewards */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-green-500">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            {t('countryDetail.tronc.systemRewards', 'Ce que le système récompense')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {behaviors.rewards.map((key, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        {/* What system punishes */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-red-500">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            {t('countryDetail.tronc.systemPunishes', 'Ce que le système punit')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {behaviors.punishes.map((key, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        {/* Frequent errors */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-amber-500">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            {t('countryDetail.tronc.frequentErrors', 'Erreurs fréquentes')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {behaviors.errors.map((key, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Who Wins / Who Loses */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">{t('countryDetail.whoWinsLoses')}</h2>
        <WhoWinsWhoLoses wins={displayWhoWins} loses={displayWhoLoses} />
      </div>

      {/* Disclaimer */}
      <SimulationDisclaimer variant="prominent" context="results" />
    </div>
  );
}
