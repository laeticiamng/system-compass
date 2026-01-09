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

// Mapping pyramid types to translation keys (using the short keys from translations)
const PYRAMID_TYPE_TO_KEY: Record<string, string> = {
  PROBLEM_RENT: 'rent',
  STABILITY_REDIS: 'stability',
  COMPETENCE_TRUST: 'competence',
  GROWTH_RISK: 'growth',
  HYBRID_TRANSITION: 'hybrid',
  RESOURCE_EXTRACTION: 'resource',
};

export function CountryTroncSection({
  country,
  displayPyramid,
  displayRuleOfGold,
  displayWhoWins,
  displayWhoLoses,
}: CountryTroncSectionProps) {
  const { t } = useTranslation();
  
  // Get the translation key for the pyramid type
  const behaviorKey = PYRAMID_TYPE_TO_KEY[country.pyramidType] || 'stability';
  
  // Get behaviors as arrays from translations
  const rewards = t(`pyramidBehaviors.${behaviorKey}.rewards`, { returnObjects: true }) as string[];
  const punishes = t(`pyramidBehaviors.${behaviorKey}.punishes`, { returnObjects: true }) as string[];

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
            {Array.isArray(rewards) && rewards.slice(0, 4).map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                {item}
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
            {Array.isArray(punishes) && punishes.slice(0, 4).map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Frequent errors - from pyramidTypes details */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-amber-500">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            {t('countryDetail.tronc.frequentErrors', 'Erreurs fréquentes')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(() => {
              // Map to pyramidTypes format for warning signs
              const pyramidTypeKey = behaviorKey === 'stability' ? 'stabilityRedis' 
                : behaviorKey === 'rent' ? 'problemRent'
                : behaviorKey === 'competence' ? 'competenceTrust'
                : behaviorKey === 'growth' ? 'growthRisk'
                : behaviorKey === 'hybrid' ? 'hybridTransition'
                : 'resourceExtraction';
              
              const warningSigns = t(`pyramidTypes.details.${pyramidTypeKey}.warningSigns`, { returnObjects: true }) as string[];
              
              return Array.isArray(warningSigns) && warningSigns.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {item}
                </li>
              ));
            })()}
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
