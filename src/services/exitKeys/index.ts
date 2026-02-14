/**
 * Exit Keys Service - Strategy calculation and scoring
 */

export interface ExitKeyProfile {
  age: number;
  budget: number;
  familySize: number;
  skills: string[];
  languages: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  timeline: 'immediate' | 'short' | 'medium' | 'long';
}

export interface ExitKeyScore {
  keyId: string;
  feasibilityScore: number;
  timelineScore: number;
  costScore: number;
  riskScore: number;
  overallScore: number;
}

/**
 * Calculate exit key feasibility based on user profile
 */
export function calculateFeasibility(
  profile: ExitKeyProfile,
  keyRequirements: { minBudget: number; minAge?: number; requiredSkills?: string[] }
): number {
  let score = 100;

  // Budget check
  if (profile.budget < keyRequirements.minBudget) {
    score -= 30 * (1 - profile.budget / keyRequirements.minBudget);
  }

  // Age check
  if (keyRequirements.minAge && profile.age < keyRequirements.minAge) {
    score -= 20;
  }

  // Skills match
  if (keyRequirements.requiredSkills) {
    const matchedSkills = profile.skills.filter(s => 
      keyRequirements.requiredSkills!.includes(s)
    ).length;
    const skillRatio = matchedSkills / keyRequirements.requiredSkills.length;
    score = score * (0.5 + 0.5 * skillRatio);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate timeline score based on user preference
 */
export function calculateTimelineScore(
  userTimeline: ExitKeyProfile['timeline'],
  keyTimeline: string
): number {
  const timelineMap: Record<string, number> = {
    immediate: 1,
    short: 3,
    medium: 12,
    long: 36,
  };

  const userMonths = timelineMap[userTimeline];
  const keyMonths = parseInt(keyTimeline, 10) || 12;

  if (keyMonths <= userMonths) return 100;
  if (keyMonths <= userMonths * 2) return 70;
  if (keyMonths <= userMonths * 3) return 40;
  return 20;
}

/**
 * Calculate overall exit key score
 */
export function calculateExitKeyScore(
  profile: ExitKeyProfile,
  key: { 
    id: string; 
    minBudget: number; 
    timeline: string; 
    riskLevel: string;
    requiredSkills?: string[];
  }
): ExitKeyScore {
  const feasibilityScore = calculateFeasibility(profile, {
    minBudget: key.minBudget,
    requiredSkills: key.requiredSkills,
  });

  const timelineScore = calculateTimelineScore(profile.timeline, key.timeline);

  const costScore = profile.budget >= key.minBudget * 1.5 ? 100 :
    profile.budget >= key.minBudget ? 70 : 40;

  const riskMap: Record<string, Record<string, number>> = {
    low: { low: 100, medium: 50, high: 20 },
    medium: { low: 80, medium: 100, high: 60 },
    high: { low: 60, medium: 80, high: 100 },
  };
  const riskScore = riskMap[profile.riskTolerance]?.[key.riskLevel] ?? 50;

  const overallScore = Math.round(
    feasibilityScore * 0.35 +
    timelineScore * 0.25 +
    costScore * 0.2 +
    riskScore * 0.2
  );

  return {
    keyId: key.id,
    feasibilityScore,
    timelineScore,
    costScore,
    riskScore,
    overallScore,
  };
}
