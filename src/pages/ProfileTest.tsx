import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { UserProfile, ProfileResult, PYRAMID_TYPE_INFO, PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft, User, Target, Shield, Zap, FileCheck, Lightbulb, Eye, Plane } from 'lucide-react';

const questions = [
  {
    key: 'ambition',
    icon: Target,
    question: 'How important is maximizing your income, impact, and career progression?',
    lowLabel: 'Not important',
    highLabel: 'Essential',
  },
  {
    key: 'meritNeed',
    icon: Shield,
    question: 'How much do you need effort and competence to be fairly rewarded?',
    lowLabel: 'I adapt',
    highLabel: 'Non-negotiable',
  },
  {
    key: 'riskTolerance',
    icon: Zap,
    question: 'Can you live without a social safety net if the upside potential is high?',
    lowLabel: 'Need security',
    highLabel: 'Ready to risk',
  },
  {
    key: 'securityNeed',
    icon: Shield,
    question: 'How much do you value stability, predictability, and protection?',
    lowLabel: 'Flexible',
    highLabel: 'Essential',
  },
  {
    key: 'bureaucracyTolerance',
    icon: FileCheck,
    question: 'Can you tolerate heavy procedures, paperwork, and slow processes?',
    lowLabel: 'Hate it',
    highLabel: 'Can manage',
  },
  {
    key: 'innovationDrive',
    icon: Lightbulb,
    question: 'How driven are you to create new things and solve complex problems?',
    lowLabel: 'Prefer routine',
    highLabel: 'Obsessed',
  },
  {
    key: 'discretionPreference',
    icon: Eye,
    question: 'Do you prefer to operate discreetly rather than be publicly visible?',
    lowLabel: 'Love spotlight',
    highLabel: 'Stay invisible',
  },
] as const;

const mobilityOptions = [
  { value: 'low', label: 'Cannot move', description: 'Stuck here for now' },
  { value: 'medium', label: '1-3 years', description: 'Can relocate mid-term' },
  { value: 'high', label: 'Anytime', description: 'Ready to move' },
] as const;

export default function ProfileTest() {
  const navigate = useNavigate();
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

  const totalSteps = questions.length + 1; // +1 for mobility question

  const handleSliderChange = (key: keyof UserProfile, value: number[]) => {
    setProfile((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleMobilityChange = (value: 'low' | 'medium' | 'high') => {
    setProfile((prev) => ({ ...prev, mobility: value }));
  };

  const calculateResult = (): ProfileResult => {
    const { ambition, meritNeed, riskTolerance, securityNeed, innovationDrive, discretionPreference } = profile;

    // Determine archetype
    let archetype = '';
    let description = '';
    const strengths: string[] = [];
    const vulnerabilities: string[] = [];
    const compatibleTypes: PyramidType[] = [];
    const redFlags: string[] = [];

    if (ambition > 7 && meritNeed > 7 && riskTolerance > 6) {
      archetype = 'Ambitious Meritocrat';
      description = 'You seek proportional rewards for excellence. You thrive where competence wins.';
      strengths.push('High drive and resilience', 'Strong work ethic');
      vulnerabilities.push('Frustrated by unfair systems', 'May burn out chasing fairness');
      compatibleTypes.push('COMPETENCE_TRUST', 'GROWTH_RISK');
      redFlags.push('Systems that reward connections over competence', 'Heavy redistribution systems');
    } else if (securityNeed > 7 && riskTolerance < 4) {
      archetype = 'Stability Seeker';
      description = 'You value predictability and protection. You perform best with a safety net.';
      strengths.push('Patient and methodical', 'Long-term planner');
      vulnerabilities.push('May miss high-growth opportunities', 'Risk-averse to a fault');
      compatibleTypes.push('STABILITY_REDIS', 'COMPETENCE_TRUST');
      redFlags.push('High-risk growth environments', 'Systems with weak social protections');
    } else if (discretionPreference > 7 && innovationDrive < 5) {
      archetype = 'Strategic Survivor';
      description = 'You know how to navigate without exposure. You build quietly and protect gains.';
      strengths.push('Tactical awareness', 'Risk management');
      vulnerabilities.push('May under-leverage visibility', 'Can become too defensive');
      compatibleTypes.push('PROBLEM_RENT', 'STABILITY_REDIS');
      redFlags.push('Systems requiring public profile', 'Transparent meritocracies');
    } else if (innovationDrive > 7 && riskTolerance > 6) {
      archetype = 'Growth Conquistador';
      description = 'You chase scale and speed. You thrive in high-stakes, high-reward environments.';
      strengths.push('Speed and adaptability', 'Opportunity recognition');
      vulnerabilities.push('May neglect stability', 'Burnout risk');
      compatibleTypes.push('GROWTH_RISK', 'COMPETENCE_TRUST');
      redFlags.push('Slow bureaucratic systems', 'Heavy taxation on growth');
    } else {
      archetype = 'Balanced Navigator';
      description = 'You adapt to context. You can survive many systems but may not optimize for any.';
      strengths.push('Flexibility', 'Broad tolerance');
      vulnerabilities.push('May lack strong direction', 'Risk of drift');
      compatibleTypes.push('STABILITY_REDIS', 'COMPETENCE_TRUST');
      redFlags.push('Extreme systems in any direction');
    }

    return { archetype, description, strengths, vulnerabilities, compatibleTypes, redFlags };
  };

  const handleComplete = () => {
    const calculatedResult = calculateResult();
    setResult(calculatedResult);
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
            <p className="text-xl text-muted-foreground">{result.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold text-risk-low mb-4">Strengths</h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-risk-low">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-display font-semibold text-risk-high mb-4">Vulnerabilities</h3>
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
            <h3 className="font-display font-semibold mb-4">Compatible Systems</h3>
            <div className="flex flex-wrap gap-3">
              {result.compatibleTypes.map((type) => {
                const info = PYRAMID_TYPE_INFO[type];
                return (
                  <span
                    key={type}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: `hsl(var(--${info.color}) / 0.15)`,
                      color: `hsl(var(--${info.color}))`,
                    }}
                  >
                    {info.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 border-l-4 border-risk-critical mb-12">
            <h3 className="font-display font-semibold mb-4">Red Flags — Avoid These</h3>
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
              onClick={() => navigate('/countries')}
              className="bg-primary text-primary-foreground gap-2"
            >
              Find Compatible Countries
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setStep(0);
              }}
            >
              Retake Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = step < questions.length ? questions[step] : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {step + 1} of {totalSteps}</span>
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
                  {currentQuestion.question}
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
                  <span>{currentQuestion.lowLabel}</span>
                  <span className="font-semibold text-foreground">
                    {profile[currentQuestion.key as keyof UserProfile]}
                  </span>
                  <span>{currentQuestion.highLabel}</span>
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
                  What is your mobility potential?
                </h2>
              </div>

              <div className="grid gap-4">
                {mobilityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMobilityChange(option.value)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all',
                      profile.mobility === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
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
            Back
          </Button>
          <Button onClick={handleNext} className="gap-2 bg-primary text-primary-foreground">
            {step === totalSteps - 1 ? 'See Results' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
