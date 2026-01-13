import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { UserProfile, ProfileResult, PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTestResults } from '@/hooks/useTestResults';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, ArrowLeft, User, Target, Shield, Zap, FileCheck, Lightbulb, Eye, Plane } from 'lucide-react';

const questionKeys = [
  { key: 'ambition', icon: Target },
  { key: 'meritNeed', icon: Shield },
  { key: 'riskTolerance', icon: Zap },
  { key: 'securityNeed', icon: Shield },
  { key: 'bureaucracyTolerance', icon: FileCheck },
  { key: 'innovationDrive', icon: Lightbulb },
  { key: 'discretionPreference', icon: Eye },
] as const;

const mobilityOptions = ['low', 'medium', 'high'] as const;

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

export default function ProfileTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { saveResult } = useTestResults();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    ambition: 5,
    meritNeed: 5,
    riskTolerance: 5,
    securityNeed: 5,
    bureaucracyTolerance: 5,
    innovationDrive: 5,
    discretionPreference: 5,
    mobility: 'medium',
  });
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [startTime] = useState(Date.now());

  const totalSteps = questionKeys.length + 1; // +1 for mobility question

  const handleSliderChange = (key: keyof UserProfile, value: number[]) => {
    setProfile((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleMobilityChange = (value: 'low' | 'medium' | 'high') => {
    setProfile((prev) => ({ ...prev, mobility: value }));
  };

  const calculateResult = (): ProfileResult => {
    const { ambition, meritNeed, riskTolerance, securityNeed, innovationDrive, discretionPreference } = profile;

    let archetypeKey = 'balancedNavigator';
    const compatibleTypes: PyramidType[] = [];

    if (ambition > 7 && meritNeed > 7 && riskTolerance > 6) {
      archetypeKey = 'ambitiousMeritocrat';
      compatibleTypes.push('COMPETENCE_TRUST', 'GROWTH_RISK');
    } else if (securityNeed > 7 && riskTolerance < 4) {
      archetypeKey = 'stabilitySeeker';
      compatibleTypes.push('STABILITY_REDIS', 'COMPETENCE_TRUST');
    } else if (discretionPreference > 7 && innovationDrive < 5) {
      archetypeKey = 'strategicSurvivor';
      compatibleTypes.push('PROBLEM_RENT', 'STABILITY_REDIS');
    } else if (innovationDrive > 7 && riskTolerance > 6) {
      archetypeKey = 'growthConquistador';
      compatibleTypes.push('GROWTH_RISK', 'COMPETENCE_TRUST');
    } else {
      compatibleTypes.push('STABILITY_REDIS', 'COMPETENCE_TRUST');
    }

    const archetype = t(`profileTest.archetypes.${archetypeKey}.name`);
    const description = t(`profileTest.archetypes.${archetypeKey}.description`);
    const strengths = t(`profileTest.archetypes.${archetypeKey}.strengths`, { returnObjects: true }) as string[];
    const vulnerabilities = t(`profileTest.archetypes.${archetypeKey}.vulnerabilities`, { returnObjects: true }) as string[];
    const redFlags = t(`profileTest.archetypes.${archetypeKey}.redFlags`, { returnObjects: true }) as string[];

    return { archetype, description, strengths, vulnerabilities, compatibleTypes, redFlags };
  };

  const handleComplete = async () => {
    const calculatedResult = calculateResult();
    setResult(calculatedResult);
    // Save profile to localStorage for matching
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Save to backend
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const mainPyramid = calculatedResult.compatibleTypes[0] || 'STABILITY_REDIS';
    await saveResult('profile_test', profile as any, mainPyramid, calculatedResult.archetype, elapsedSeconds);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <User className="w-8 h-8" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">{result.archetype}</h1>
            <p className="text-xl text-muted-foreground mb-3">{result.description}</p>
            {/* Anti-illusion micro-text */}
            <p className="text-xs text-muted-foreground/60 max-w-lg mx-auto">
              {t('simulationDisclaimer.contextual.results')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold text-risk-low mb-4">{t('profileTest.strengths')}</h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-risk-low">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold text-risk-high mb-4">{t('profileTest.vulnerabilities')}</h3>
              <ul className="space-y-2">
                {result.vulnerabilities.map((v, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-risk-high">!</span> {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 mb-8">
            <h3 className="font-display font-semibold mb-4">{t('profileTest.compatibleSystems')}</h3>
            <div className="flex flex-wrap gap-3">
              {result.compatibleTypes.map((type) => {
                const color = PYRAMID_TYPE_COLORS[type];
                return (
                  <span
                    key={type}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: `hsl(var(--${color}) / 0.15)`,
                      color: `hsl(var(--${color}))`,
                    }}
                  >
                    {t(PYRAMID_TYPE_LABELS[type])}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 border-l-4 border-risk-critical mb-12">
            <h3 className="font-display font-semibold mb-4">{t('profileTest.redFlags')}</h3>
            <ul className="space-y-2">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-risk-critical">⚠</span> {flag}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/match')}
              className="bg-primary text-primary-foreground gap-2"
            >
              {t('profileTest.findCountries')}
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
              onClick={() => {
                setResult(null);
                setStep(0);
              }}
            >
              {t('profileTest.retakeTest')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = step < questionKeys.length ? questionKeys[step] : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{t('profileTest.questionOf', { current: step + 1, total: totalSteps })}</span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="glass-card rounded-xl p-8 mb-8">
          {currentQuestion ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <currentQuestion.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">
                  {t(`profileTest.questions.${currentQuestion.key}.question`)}
                </h2>
              </div>

              <div className="space-y-4">
                <Slider
                  value={[profile[currentQuestion.key as keyof UserProfile] as number]}
                  onValueChange={(value) =>
                    handleSliderChange(currentQuestion.key as keyof UserProfile, value)
                  }
                  min={0}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t(`profileTest.questions.${currentQuestion.key}.low`)}</span>
                  <span className="font-semibold text-foreground">
                    {profile[currentQuestion.key as keyof UserProfile]}
                  </span>
                  <span>{t(`profileTest.questions.${currentQuestion.key}.high`)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">
                  {t('profileTest.questions.mobility.question')}
                </h2>
              </div>

              <div className="grid gap-4">
                {mobilityOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleMobilityChange(option)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      profile.mobility === option
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="font-medium">{t(`profileTest.questions.mobility.options.${option}.label`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`profileTest.questions.mobility.options.${option}.description`)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('profileTest.back')}
          </Button>
          <Button onClick={handleNext} className="gap-2 bg-primary text-primary-foreground">
            {step === totalSteps - 1 ? t('profileTest.seeResults') : t('profileTest.next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
