import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, ArrowLeft, Target, Compass, Clock, Zap, 
  MapPin, Heart, Shield, TrendingUp, Users, Sparkles,
  CheckCircle, AlertTriangle, Lightbulb, BarChart3, Gauge,
  Trophy, Brain, Briefcase, GraduationCap
} from 'lucide-react';
import { 
  LifeMotorProfile, 
  LifeTrajectoryProfile, 
  TrajectoryPlan,
  TrajectoryRecommendation,
  LIFE_MOTOR_PROFILES,
  LifePriority
} from '@/lib/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';

interface Question {
  id: string;
  type: 'choice' | 'binary' | 'priority';
  question: string;
  options?: { value: string; label: string; description?: string }[];
}

const questions: Question[] = [
  {
    id: 'timePreference',
    type: 'choice',
    question: 'lifeTrajectory.questions.timePreference.question',
    options: [
      { value: 'short', label: 'lifeTrajectory.questions.timePreference.short', description: 'lifeTrajectory.questions.timePreference.shortDesc' },
      { value: 'long', label: 'lifeTrajectory.questions.timePreference.long', description: 'lifeTrajectory.questions.timePreference.longDesc' },
    ],
  },
  {
    id: 'incomeShock',
    type: 'choice',
    question: 'lifeTrajectory.questions.incomeShock.question',
    options: [
      { value: 'panic', label: 'lifeTrajectory.questions.incomeShock.panic' },
      { value: 'adapt', label: 'lifeTrajectory.questions.incomeShock.adapt' },
      { value: 'prepared', label: 'lifeTrajectory.questions.incomeShock.prepared' },
    ],
  },
  {
    id: 'priority',
    type: 'priority',
    question: 'lifeTrajectory.questions.priority.question',
    options: [
      { value: 'freedom', label: 'lifeTrajectory.questions.priority.freedom' },
      { value: 'money', label: 'lifeTrajectory.questions.priority.money' },
      { value: 'meaning', label: 'lifeTrajectory.questions.priority.meaning' },
      { value: 'status', label: 'lifeTrajectory.questions.priority.status' },
      { value: 'family', label: 'lifeTrajectory.questions.priority.family' },
      { value: 'calm', label: 'lifeTrajectory.questions.priority.calm' },
    ],
  },
  {
    id: 'intensity',
    type: 'binary',
    question: 'lifeTrajectory.questions.intensity.question',
  },
  {
    id: 'geographic',
    type: 'binary',
    question: 'lifeTrajectory.questions.geographic.question',
  },
  {
    id: 'uncertainty',
    type: 'choice',
    question: 'lifeTrajectory.questions.uncertainty.question',
    options: [
      { value: 'low', label: 'lifeTrajectory.questions.uncertainty.low' },
      { value: 'medium', label: 'lifeTrajectory.questions.uncertainty.medium' },
      { value: 'high', label: 'lifeTrajectory.questions.uncertainty.high' },
    ],
  },
  {
    id: 'autonomy',
    type: 'choice',
    question: 'lifeTrajectory.questions.autonomy.question',
    options: [
      { value: 'structured', label: 'lifeTrajectory.questions.autonomy.structured' },
      { value: 'autonomous', label: 'lifeTrajectory.questions.autonomy.autonomous' },
    ],
  },
  {
    id: 'studies',
    type: 'binary',
    question: 'lifeTrajectory.questions.studies.question',
  },
  {
    id: 'selling',
    type: 'binary',
    question: 'lifeTrajectory.questions.selling.question',
  },
  {
    id: 'contribute',
    type: 'binary',
    question: 'lifeTrajectory.questions.contribute.question',
  },
  {
    id: 'lgbtq',
    type: 'binary',
    question: 'lifeTrajectory.questions.lgbtq.question',
  },
];

function determineMotorProfile(answers: Record<string, string>): LifeMotorProfile {
  const priority = answers.priority as LifePriority;
  const riskTolerance = answers.uncertainty;
  const wantsAutonomy = answers.autonomy === 'autonomous';
  const wantsToContribute = answers.contribute === 'yes';
  const geographic = answers.geographic === 'yes';
  const timePreference = answers.timePreference;
  
  // Profile determination logic
  if (priority === 'calm' && riskTolerance === 'low') return 'COMFORT';
  if (priority === 'meaning' && wantsToContribute) return 'PURPOSE';
  if (priority === 'status') return 'STATUS';
  if (priority === 'freedom' && geographic) return 'NOMAD';
  if (priority === 'money' && riskTolerance === 'low') return 'SAFE_WEALTH';
  if (priority === 'money' && riskTolerance !== 'low' && timePreference === 'long') return 'BUILDER';
  if (timePreference === 'short' && riskTolerance === 'high') return 'LOTTERY';
  if (answers.incomeShock === 'panic') return 'RECOVERY';
  
  return 'BUILDER'; // Default
}

function generateTrajectories(
  profile: LifeMotorProfile,
  answers: Record<string, string>
): TrajectoryRecommendation[] {
  const t = (key: string) => key; // Will be replaced with actual translation
  
  const trajectories: Record<LifeMotorProfile, TrajectoryRecommendation[]> = {
    LOTTERY: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.lottery.safe.title',
        description: 'lifeTrajectory.plans.lottery.safe.description',
        duration: '6-12 months',
        paths: ['lifeTrajectory.plans.lottery.safe.paths.0', 'lifeTrajectory.plans.lottery.safe.paths.1'],
        skills: ['lifeTrajectory.plans.lottery.safe.skills.0', 'lifeTrajectory.plans.lottery.safe.skills.1'],
        risks: ['lifeTrajectory.plans.lottery.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.lottery.safe.steps.0', 'lifeTrajectory.plans.lottery.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.lottery.hybrid.title',
        description: 'lifeTrajectory.plans.lottery.hybrid.description',
        duration: '1-2 years',
        paths: ['lifeTrajectory.plans.lottery.hybrid.paths.0', 'lifeTrajectory.plans.lottery.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.lottery.hybrid.skills.0', 'lifeTrajectory.plans.lottery.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.lottery.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.lottery.hybrid.steps.0', 'lifeTrajectory.plans.lottery.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.lottery.ambitious.title',
        description: 'lifeTrajectory.plans.lottery.ambitious.description',
        duration: '2-3 years',
        paths: ['lifeTrajectory.plans.lottery.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.lottery.ambitious.skills.0', 'lifeTrajectory.plans.lottery.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.lottery.ambitious.risks.0', 'lifeTrajectory.plans.lottery.ambitious.risks.1'],
        firstSteps: ['lifeTrajectory.plans.lottery.ambitious.steps.0', 'lifeTrajectory.plans.lottery.ambitious.steps.1'],
      },
    ],
    COMFORT: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.comfort.safe.title',
        description: 'lifeTrajectory.plans.comfort.safe.description',
        duration: '1-2 years',
        paths: ['lifeTrajectory.plans.comfort.safe.paths.0', 'lifeTrajectory.plans.comfort.safe.paths.1'],
        skills: ['lifeTrajectory.plans.comfort.safe.skills.0'],
        risks: ['lifeTrajectory.plans.comfort.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.comfort.safe.steps.0', 'lifeTrajectory.plans.comfort.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.comfort.hybrid.title',
        description: 'lifeTrajectory.plans.comfort.hybrid.description',
        duration: '2-3 years',
        paths: ['lifeTrajectory.plans.comfort.hybrid.paths.0', 'lifeTrajectory.plans.comfort.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.comfort.hybrid.skills.0', 'lifeTrajectory.plans.comfort.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.comfort.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.comfort.hybrid.steps.0', 'lifeTrajectory.plans.comfort.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.comfort.ambitious.title',
        description: 'lifeTrajectory.plans.comfort.ambitious.description',
        duration: '3-5 years',
        paths: ['lifeTrajectory.plans.comfort.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.comfort.ambitious.skills.0', 'lifeTrajectory.plans.comfort.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.comfort.ambitious.risks.0'],
        firstSteps: ['lifeTrajectory.plans.comfort.ambitious.steps.0', 'lifeTrajectory.plans.comfort.ambitious.steps.1'],
      },
    ],
    BUILDER: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.builder.safe.title',
        description: 'lifeTrajectory.plans.builder.safe.description',
        duration: '2-3 years',
        paths: ['lifeTrajectory.plans.builder.safe.paths.0', 'lifeTrajectory.plans.builder.safe.paths.1'],
        skills: ['lifeTrajectory.plans.builder.safe.skills.0', 'lifeTrajectory.plans.builder.safe.skills.1'],
        risks: ['lifeTrajectory.plans.builder.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.builder.safe.steps.0', 'lifeTrajectory.plans.builder.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.builder.hybrid.title',
        description: 'lifeTrajectory.plans.builder.hybrid.description',
        duration: '3-5 years',
        paths: ['lifeTrajectory.plans.builder.hybrid.paths.0', 'lifeTrajectory.plans.builder.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.builder.hybrid.skills.0', 'lifeTrajectory.plans.builder.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.builder.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.builder.hybrid.steps.0', 'lifeTrajectory.plans.builder.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.builder.ambitious.title',
        description: 'lifeTrajectory.plans.builder.ambitious.description',
        duration: '5-10 years',
        paths: ['lifeTrajectory.plans.builder.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.builder.ambitious.skills.0', 'lifeTrajectory.plans.builder.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.builder.ambitious.risks.0', 'lifeTrajectory.plans.builder.ambitious.risks.1'],
        firstSteps: ['lifeTrajectory.plans.builder.ambitious.steps.0', 'lifeTrajectory.plans.builder.ambitious.steps.1'],
      },
    ],
    SAFE_WEALTH: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.safeWealth.safe.title',
        description: 'lifeTrajectory.plans.safeWealth.safe.description',
        duration: '3-5 years',
        paths: ['lifeTrajectory.plans.safeWealth.safe.paths.0', 'lifeTrajectory.plans.safeWealth.safe.paths.1'],
        skills: ['lifeTrajectory.plans.safeWealth.safe.skills.0'],
        risks: ['lifeTrajectory.plans.safeWealth.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.safeWealth.safe.steps.0', 'lifeTrajectory.plans.safeWealth.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.safeWealth.hybrid.title',
        description: 'lifeTrajectory.plans.safeWealth.hybrid.description',
        duration: '5-7 years',
        paths: ['lifeTrajectory.plans.safeWealth.hybrid.paths.0', 'lifeTrajectory.plans.safeWealth.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.safeWealth.hybrid.skills.0', 'lifeTrajectory.plans.safeWealth.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.safeWealth.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.safeWealth.hybrid.steps.0', 'lifeTrajectory.plans.safeWealth.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.safeWealth.ambitious.title',
        description: 'lifeTrajectory.plans.safeWealth.ambitious.description',
        duration: '7-10 years',
        paths: ['lifeTrajectory.plans.safeWealth.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.safeWealth.ambitious.skills.0', 'lifeTrajectory.plans.safeWealth.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.safeWealth.ambitious.risks.0'],
        firstSteps: ['lifeTrajectory.plans.safeWealth.ambitious.steps.0', 'lifeTrajectory.plans.safeWealth.ambitious.steps.1'],
      },
    ],
    NOMAD: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.nomad.safe.title',
        description: 'lifeTrajectory.plans.nomad.safe.description',
        duration: '6-12 months',
        paths: ['lifeTrajectory.plans.nomad.safe.paths.0', 'lifeTrajectory.plans.nomad.safe.paths.1'],
        skills: ['lifeTrajectory.plans.nomad.safe.skills.0', 'lifeTrajectory.plans.nomad.safe.skills.1'],
        risks: ['lifeTrajectory.plans.nomad.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.nomad.safe.steps.0', 'lifeTrajectory.plans.nomad.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.nomad.hybrid.title',
        description: 'lifeTrajectory.plans.nomad.hybrid.description',
        duration: '1-2 years',
        paths: ['lifeTrajectory.plans.nomad.hybrid.paths.0', 'lifeTrajectory.plans.nomad.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.nomad.hybrid.skills.0', 'lifeTrajectory.plans.nomad.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.nomad.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.nomad.hybrid.steps.0', 'lifeTrajectory.plans.nomad.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.nomad.ambitious.title',
        description: 'lifeTrajectory.plans.nomad.ambitious.description',
        duration: '2-5 years',
        paths: ['lifeTrajectory.plans.nomad.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.nomad.ambitious.skills.0', 'lifeTrajectory.plans.nomad.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.nomad.ambitious.risks.0', 'lifeTrajectory.plans.nomad.ambitious.risks.1'],
        firstSteps: ['lifeTrajectory.plans.nomad.ambitious.steps.0', 'lifeTrajectory.plans.nomad.ambitious.steps.1'],
      },
    ],
    PURPOSE: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.purpose.safe.title',
        description: 'lifeTrajectory.plans.purpose.safe.description',
        duration: '1-2 years',
        paths: ['lifeTrajectory.plans.purpose.safe.paths.0', 'lifeTrajectory.plans.purpose.safe.paths.1'],
        skills: ['lifeTrajectory.plans.purpose.safe.skills.0'],
        risks: ['lifeTrajectory.plans.purpose.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.purpose.safe.steps.0', 'lifeTrajectory.plans.purpose.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.purpose.hybrid.title',
        description: 'lifeTrajectory.plans.purpose.hybrid.description',
        duration: '2-4 years',
        paths: ['lifeTrajectory.plans.purpose.hybrid.paths.0', 'lifeTrajectory.plans.purpose.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.purpose.hybrid.skills.0', 'lifeTrajectory.plans.purpose.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.purpose.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.purpose.hybrid.steps.0', 'lifeTrajectory.plans.purpose.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.purpose.ambitious.title',
        description: 'lifeTrajectory.plans.purpose.ambitious.description',
        duration: '5+ years',
        paths: ['lifeTrajectory.plans.purpose.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.purpose.ambitious.skills.0', 'lifeTrajectory.plans.purpose.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.purpose.ambitious.risks.0'],
        firstSteps: ['lifeTrajectory.plans.purpose.ambitious.steps.0', 'lifeTrajectory.plans.purpose.ambitious.steps.1'],
      },
    ],
    STATUS: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.status.safe.title',
        description: 'lifeTrajectory.plans.status.safe.description',
        duration: '3-5 years',
        paths: ['lifeTrajectory.plans.status.safe.paths.0', 'lifeTrajectory.plans.status.safe.paths.1'],
        skills: ['lifeTrajectory.plans.status.safe.skills.0'],
        risks: ['lifeTrajectory.plans.status.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.status.safe.steps.0', 'lifeTrajectory.plans.status.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.status.hybrid.title',
        description: 'lifeTrajectory.plans.status.hybrid.description',
        duration: '5-7 years',
        paths: ['lifeTrajectory.plans.status.hybrid.paths.0', 'lifeTrajectory.plans.status.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.status.hybrid.skills.0', 'lifeTrajectory.plans.status.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.status.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.status.hybrid.steps.0', 'lifeTrajectory.plans.status.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.status.ambitious.title',
        description: 'lifeTrajectory.plans.status.ambitious.description',
        duration: '7-10+ years',
        paths: ['lifeTrajectory.plans.status.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.status.ambitious.skills.0', 'lifeTrajectory.plans.status.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.status.ambitious.risks.0', 'lifeTrajectory.plans.status.ambitious.risks.1'],
        firstSteps: ['lifeTrajectory.plans.status.ambitious.steps.0', 'lifeTrajectory.plans.status.ambitious.steps.1'],
      },
    ],
    RECOVERY: [
      {
        plan: 'SAFE',
        title: 'lifeTrajectory.plans.recovery.safe.title',
        description: 'lifeTrajectory.plans.recovery.safe.description',
        duration: '6-12 months',
        paths: ['lifeTrajectory.plans.recovery.safe.paths.0', 'lifeTrajectory.plans.recovery.safe.paths.1'],
        skills: ['lifeTrajectory.plans.recovery.safe.skills.0'],
        risks: ['lifeTrajectory.plans.recovery.safe.risks.0'],
        firstSteps: ['lifeTrajectory.plans.recovery.safe.steps.0', 'lifeTrajectory.plans.recovery.safe.steps.1'],
      },
      {
        plan: 'HYBRID',
        title: 'lifeTrajectory.plans.recovery.hybrid.title',
        description: 'lifeTrajectory.plans.recovery.hybrid.description',
        duration: '1-2 years',
        paths: ['lifeTrajectory.plans.recovery.hybrid.paths.0', 'lifeTrajectory.plans.recovery.hybrid.paths.1'],
        skills: ['lifeTrajectory.plans.recovery.hybrid.skills.0', 'lifeTrajectory.plans.recovery.hybrid.skills.1'],
        risks: ['lifeTrajectory.plans.recovery.hybrid.risks.0'],
        firstSteps: ['lifeTrajectory.plans.recovery.hybrid.steps.0', 'lifeTrajectory.plans.recovery.hybrid.steps.1'],
      },
      {
        plan: 'AMBITIOUS',
        title: 'lifeTrajectory.plans.recovery.ambitious.title',
        description: 'lifeTrajectory.plans.recovery.ambitious.description',
        duration: '2-5 years',
        paths: ['lifeTrajectory.plans.recovery.ambitious.paths.0'],
        skills: ['lifeTrajectory.plans.recovery.ambitious.skills.0', 'lifeTrajectory.plans.recovery.ambitious.skills.1'],
        risks: ['lifeTrajectory.plans.recovery.ambitious.risks.0'],
        firstSteps: ['lifeTrajectory.plans.recovery.ambitious.steps.0', 'lifeTrajectory.plans.recovery.ambitious.steps.1'],
      },
    ],
  };

  return trajectories[profile] || trajectories.BUILDER;
}

export default function LifeTrajectory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    profile: LifeMotorProfile;
    trajectories: TrajectoryRecommendation[];
    isLgbtq: boolean;
  } | null>(null);

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate result
      const profile = determineMotorProfile(newAnswers);
      const trajectories = generateTrajectories(profile, newAnswers);
      const isLgbtq = newAnswers.lgbtq === 'yes';
      
      setResult({ profile, trajectories, isLgbtq });
      
      // Save to localStorage
      localStorage.setItem('lifeTrajectoryProfile', JSON.stringify({
        profile,
        answers: newAnswers,
        isLgbtq,
      }));
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Generate profile radar data
  const profileRadarData = useMemo(() => {
    if (!result) return [];
    const answers = JSON.parse(localStorage.getItem('lifeTrajectoryProfile') || '{}').answers || {};
    
    return [
      { trait: 'Risque', value: answers.uncertainty === 'high' ? 90 : answers.uncertainty === 'medium' ? 60 : 30, fullMark: 100 },
      { trait: 'Autonomie', value: answers.autonomy === 'autonomous' ? 85 : 40, fullMark: 100 },
      { trait: 'Mobilité', value: answers.geographic === 'yes' ? 80 : 35, fullMark: 100 },
      { trait: 'Temps long', value: answers.timePreference === 'long' ? 90 : 30, fullMark: 100 },
      { trait: 'Social', value: answers.selling === 'yes' ? 75 : 45, fullMark: 100 },
      { trait: 'Formation', value: answers.studies === 'yes' ? 85 : 50, fullMark: 100 },
    ];
  }, [result]);

  // Profile strengths bar data
  const strengthsData = useMemo(() => {
    if (!result) return [];
    const profile = result.profile;
    const strengths: { name: string; value: number; color: string }[] = [];
    
    switch (profile) {
      case 'BUILDER':
        strengths.push({ name: 'Résilience', value: 90, color: '#10b981' });
        strengths.push({ name: 'Vision long terme', value: 85, color: '#3b82f6' });
        strengths.push({ name: 'Patience', value: 80, color: '#8b5cf6' });
        strengths.push({ name: 'Prise de risque', value: 70, color: '#f59e0b' });
        break;
      case 'NOMAD':
        strengths.push({ name: 'Adaptabilité', value: 95, color: '#10b981' });
        strengths.push({ name: 'Curiosité', value: 90, color: '#3b82f6' });
        strengths.push({ name: 'Flexibilité', value: 85, color: '#8b5cf6' });
        strengths.push({ name: 'Opportunisme', value: 75, color: '#f59e0b' });
        break;
      case 'SAFE_WEALTH':
        strengths.push({ name: 'Méthode', value: 95, color: '#10b981' });
        strengths.push({ name: 'Efficacité', value: 90, color: '#3b82f6' });
        strengths.push({ name: 'Analyse', value: 85, color: '#8b5cf6' });
        strengths.push({ name: 'Prudence', value: 80, color: '#f59e0b' });
        break;
      case 'PURPOSE':
        strengths.push({ name: 'Impact', value: 95, color: '#10b981' });
        strengths.push({ name: 'Empathie', value: 90, color: '#3b82f6' });
        strengths.push({ name: 'Communication', value: 88, color: '#8b5cf6' });
        strengths.push({ name: 'Collaboration', value: 82, color: '#f59e0b' });
        break;
      case 'STATUS':
        strengths.push({ name: 'Ambition', value: 95, color: '#10b981' });
        strengths.push({ name: 'Leadership', value: 88, color: '#3b82f6' });
        strengths.push({ name: 'Compétition', value: 85, color: '#8b5cf6' });
        strengths.push({ name: 'Image', value: 80, color: '#f59e0b' });
        break;
      case 'COMFORT':
        strengths.push({ name: 'Équilibre', value: 95, color: '#10b981' });
        strengths.push({ name: 'Sérénité', value: 90, color: '#3b82f6' });
        strengths.push({ name: 'Stabilité', value: 88, color: '#8b5cf6' });
        strengths.push({ name: 'Fiabilité', value: 85, color: '#f59e0b' });
        break;
      default:
        strengths.push({ name: 'Équilibre', value: 80, color: '#10b981' });
        strengths.push({ name: 'Adaptabilité', value: 75, color: '#3b82f6' });
        strengths.push({ name: 'Prudence', value: 70, color: '#8b5cf6' });
        strengths.push({ name: 'Stabilité', value: 85, color: '#f59e0b' });
    }
    return strengths;
  }, [result]);

  if (result) {
    const profileInfo = LIFE_MOTOR_PROFILES[result.profile];
    
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Profile Result Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="text-5xl md:text-6xl mb-4">{profileInfo.icon}</div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              {t(profileInfo.label)}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {t(profileInfo.description)}
            </p>
          </div>

          {/* Visualizations Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Radar Chart */}
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                <Gauge className="w-5 h-5 text-primary" />
                Ton profil en radar
              </h3>
              <div className="h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={profileRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="trait" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10 }}
                      tickCount={4}
                    />
                    <Radar
                      name="Profil"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths Bar Chart */}
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                <BarChart3 className="w-5 h-5 text-primary" />
                Tes forces principales
              </h3>
              <div className="h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthsData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={85} 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value}%`, 'Score']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {strengthsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {t('lifeTrajectory.results.workRelation')}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">{t(profileInfo.workRelation)}</p>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {t('lifeTrajectory.results.riskRelation')}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">{t(profileInfo.riskRelation)}</p>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-risk-low" />
                {t('lifeTrajectory.results.whatWorks')}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">{t(profileInfo.whatWorks)}</p>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-risk-high" />
                {t('lifeTrajectory.results.trap')}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">{t(profileInfo.trap)}</p>
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="glass-card rounded-xl p-4 md:p-6 mb-8 border-l-4 border-primary">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 w-fit">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-base md:text-lg mb-1">Score de clarté de profil</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Ton profil est clairement défini avec des tendances marquées
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">87%</div>
                <div className="text-xs text-muted-foreground">Cohérence</div>
              </div>
            </div>
          </div>

          {/* LGBTQ+ Notice */}
          {result.isLgbtq && (
            <div className="glass-card rounded-xl p-4 md:p-6 mb-8 border-l-4 border-pink-500">
              <div className="flex items-start gap-3 md:gap-4">
                <span className="text-xl md:text-2xl">🏳️‍🌈</span>
                <div>
                  <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{t('lifeTrajectory.lgbtq.title')}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">{t('lifeTrajectory.lgbtq.description')}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3 Trajectory Plans */}
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            {t('lifeTrajectory.results.yourPlans')}
          </h2>

          <div className="grid gap-6 mb-12">
            {result.trajectories.map((trajectory) => (
              <TrajectoryCard key={trajectory.plan} trajectory={trajectory} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/match')}
              className="bg-primary text-primary-foreground gap-2"
            >
              {t('lifeTrajectory.results.findCountries')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/countries')}
            >
              {t('lifeTrajectory.results.exploreCountries')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setStep(0);
                setAnswers({});
              }}
            >
              {t('lifeTrajectory.results.retake')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{t('lifeTrajectory.questionOf', { current: step + 1, total: questions.length })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">
              {t(currentQuestion.question)}
            </h2>
          </div>

          {currentQuestion.type === 'binary' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer('yes')}
                className={cn(
                  'p-6 rounded-xl border-2 transition-all text-center',
                  answers[currentQuestion.id] === 'yes'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="font-semibold">{t('common.yes')}</span>
              </button>
              <button
                onClick={() => handleAnswer('no')}
                className={cn(
                  'p-6 rounded-xl border-2 transition-all text-center',
                  answers[currentQuestion.id] === 'no'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="font-semibold">{t('common.no')}</span>
              </button>
            </div>
          )}

          {(currentQuestion.type === 'choice' || currentQuestion.type === 'priority') && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 transition-all text-left',
                    answers[currentQuestion.id] === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="font-semibold block">{t(option.label)}</span>
                  {option.description && (
                    <span className="text-sm text-muted-foreground">{t(option.description)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <div className="text-sm text-muted-foreground">
            {t('lifeTrajectory.selectToContinue')}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrajectoryCard({ trajectory }: { trajectory: TrajectoryRecommendation }) {
  const { t } = useTranslation();
  
  const planColors = {
    SAFE: 'border-blue-500 bg-blue-500/5',
    HYBRID: 'border-amber-500 bg-amber-500/5',
    AMBITIOUS: 'border-emerald-500 bg-emerald-500/5',
  };

  const planIcons = {
    SAFE: <Shield className="w-6 h-6 text-blue-500" />,
    HYBRID: <Target className="w-6 h-6 text-amber-500" />,
    AMBITIOUS: <TrendingUp className="w-6 h-6 text-emerald-500" />,
  };

  const planLabels = {
    SAFE: 'lifeTrajectory.planTypes.safe',
    HYBRID: 'lifeTrajectory.planTypes.hybrid',
    AMBITIOUS: 'lifeTrajectory.planTypes.ambitious',
  };

  return (
    <div className={cn('glass-card rounded-xl p-6 border-l-4', planColors[trajectory.plan])}>
      <div className="flex items-start gap-4 mb-4">
        {planIcons[trajectory.plan]}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs px-2 py-1 rounded-full bg-muted font-medium">
              {t(planLabels[trajectory.plan])}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {trajectory.duration}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold">{t(trajectory.title)}</h3>
          <p className="text-muted-foreground mt-1">{t(trajectory.description)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('lifeTrajectory.trajectory.paths')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {trajectory.paths.map((path, i) => (
              <li key={i}>• {t(path)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('lifeTrajectory.trajectory.skills')}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {trajectory.skills.map((skill, i) => (
              <li key={i}>• {t(skill)}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          {t('lifeTrajectory.trajectory.firstSteps')}
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {trajectory.firstSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary font-semibold">{i + 1}.</span>
              {t(step)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
