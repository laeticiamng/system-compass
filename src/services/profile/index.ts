/**
 * Profile Service - User profile matching and recommendations
 */

export interface UserProfile {
  id: string;
  age?: number;
  nationality?: string;
  profession?: string;
  incomeLevel?: 'low' | 'medium' | 'high' | 'very_high';
  familyStatus?: 'single' | 'couple' | 'family_small' | 'family_large';
  priorities: string[];
  dealbreakers: string[];
}

export interface MatchResult {
  countryId: string;
  matchScore: number;
  matchReasons: string[];
  warnings: string[];
}

/**
 * Match user profile with country characteristics
 */
export function matchProfileToCountry(
  profile: UserProfile,
  countryData: {
    id: string;
    pyramidType: string;
    costOfLiving: number;
    lgbtqFriendly?: boolean;
    familyFriendly?: boolean;
  }
): MatchResult {
  const matchReasons: string[] = [];
  const warnings: string[] = [];
  let score = 50; // Base score

  // Income vs cost of living
  const incomeLevels = { low: 1, medium: 2, high: 3, very_high: 4 };
  const incomeLevel = incomeLevels[profile.incomeLevel || 'medium'];
  
  if (incomeLevel >= 3 && countryData.costOfLiving > 70) {
    matchReasons.push('Budget compatible with cost of living');
    score += 15;
  } else if (incomeLevel < 2 && countryData.costOfLiving > 70) {
    warnings.push('Cost of living may be challenging');
    score -= 15;
  }

  // Family considerations
  if (profile.familyStatus?.startsWith('family') && countryData.familyFriendly) {
    matchReasons.push('Family-friendly destination');
    score += 10;
  }

  // Priority matching
  if (profile.priorities.includes('safety') && countryData.pyramidType === 'meritocracy') {
    matchReasons.push('Stable meritocratic system');
    score += 10;
  }

  // Dealbreaker checking
  if (profile.dealbreakers.includes('lgbtq_unfriendly') && !countryData.lgbtqFriendly) {
    warnings.push('LGBTQ+ rights concerns');
    score -= 30;
  }

  return {
    countryId: countryData.id,
    matchScore: Math.max(0, Math.min(100, score)),
    matchReasons,
    warnings,
  };
}

/**
 * Validate user profile completeness
 */
export function validateProfileCompleteness(profile: Partial<UserProfile>): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const requiredFields = ['age', 'nationality', 'profession', 'incomeLevel', 'priorities'];
  const missingFields = requiredFields.filter(field => 
    !profile[field as keyof UserProfile] || 
    (Array.isArray(profile[field as keyof UserProfile]) && 
     (profile[field as keyof UserProfile] as unknown[]).length === 0)
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage: Math.round(
      ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
    ),
  };
}
