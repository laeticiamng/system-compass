/**
 * Challenge Progress Hook - Persisted challenge tracking with Supabase
 * Tracks daily/weekly challenge completion with real-time sync
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChallengeProgress {
  id: string;
  challengeId: string;
  challengeType: 'daily' | 'weekly';
  currentProgress: number;
  targetProgress: number;
  xpAwarded: number;
  expiresAt: Date;
  completedAt: Date | null;
}

interface UseChallengeProgressReturn {
  challenges: ChallengeProgress[];
  isLoading: boolean;
  incrementProgress: (challengeId: string, amount?: number) => Promise<void>;
  claimReward: (challengeId: string) => Promise<number>;
  getActiveChallenges: () => ChallengeProgress[];
  getCompletedToday: () => number;
}

// Generate challenge IDs based on date
const getDailyChallengeKey = () => {
  const today = new Date();
  return `daily-${today.toISOString().split('T')[0]}`;
};

const getWeeklyChallengeKey = () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  return `weekly-${weekStart.toISOString().split('T')[0]}`;
};

// Default challenges
const generateDefaultChallenges = (): Omit<ChallengeProgress, 'id'>[] => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  return [
    {
      challengeId: `${getDailyChallengeKey()}-login`,
      challengeType: 'daily',
      currentProgress: 0,
      targetProgress: 1,
      xpAwarded: 10,
      expiresAt: endOfDay,
      completedAt: null,
    },
    {
      challengeId: `${getDailyChallengeKey()}-explore`,
      challengeType: 'daily',
      currentProgress: 0,
      targetProgress: 1,
      xpAwarded: 25,
      expiresAt: endOfDay,
      completedAt: null,
    },
    {
      challengeId: `${getDailyChallengeKey()}-compare`,
      challengeType: 'daily',
      currentProgress: 0,
      targetProgress: 2,
      xpAwarded: 20,
      expiresAt: endOfDay,
      completedAt: null,
    },
    {
      challengeId: `${getWeeklyChallengeKey()}-explorer`,
      challengeType: 'weekly',
      currentProgress: 0,
      targetProgress: 5,
      xpAwarded: 150,
      expiresAt: endOfWeek,
      completedAt: null,
    },
    {
      challengeId: `${getWeeklyChallengeKey()}-fiscal`,
      challengeType: 'weekly',
      currentProgress: 0,
      targetProgress: 3,
      xpAwarded: 100,
      expiresAt: endOfWeek,
      completedAt: null,
    },
  ];
};

export function useChallengeProgress(): UseChallengeProgressReturn {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load challenges from database
  const loadChallenges = useCallback(async () => {
    if (!user?.id) {
      // For anonymous users, use localStorage
      const stored = localStorage.getItem('challenge-progress');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Filter out expired challenges
          const validChallenges = parsed.filter((c: ChallengeProgress) => 
            new Date(c.expiresAt) > new Date()
          );
          setChallenges(validChallenges);
        } catch {
          const defaults = generateDefaultChallenges().map((c, i) => ({
            ...c,
            id: `local-${i}`,
          }));
          setChallenges(defaults);
        }
      } else {
        const defaults = generateDefaultChallenges().map((c, i) => ({
          ...c,
          id: `local-${i}`,
        }));
        setChallenges(defaults);
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.warn('Could not load challenges:', error.message);
        const defaults = generateDefaultChallenges().map((c, i) => ({
          ...c,
          id: `local-${i}`,
        }));
        setChallenges(defaults);
      } else if (data && data.length > 0) {
        setChallenges(data.map(row => ({
          id: row.id,
          challengeId: row.challenge_id,
          challengeType: row.challenge_type as 'daily' | 'weekly',
          currentProgress: row.current_progress,
          targetProgress: row.target_progress,
          xpAwarded: row.xp_awarded,
          expiresAt: new Date(row.expires_at),
          completedAt: row.completed_at ? new Date(row.completed_at) : null,
        })));
      } else {
        // No challenges found, create defaults
        const defaults = generateDefaultChallenges();
        const insertData = defaults.map(c => ({
          user_id: user.id,
          challenge_id: c.challengeId,
          challenge_type: c.challengeType,
          current_progress: c.currentProgress,
          target_progress: c.targetProgress,
          xp_awarded: c.xpAwarded,
          expires_at: c.expiresAt.toISOString(),
          completed_at: null,
        }));

        const { data: inserted } = await supabase
          .from('challenge_progress')
          .insert(insertData)
          .select();

        if (inserted) {
          setChallenges(inserted.map(row => ({
            id: row.id,
            challengeId: row.challenge_id,
            challengeType: row.challenge_type as 'daily' | 'weekly',
            currentProgress: row.current_progress,
            targetProgress: row.target_progress,
            xpAwarded: row.xp_awarded,
            expiresAt: new Date(row.expires_at),
            completedAt: row.completed_at ? new Date(row.completed_at) : null,
          })));
        }
      }
    } catch (err) {
      console.error('Error loading challenges:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // Save to localStorage for anonymous users
  useEffect(() => {
    if (!user?.id && challenges.length > 0) {
      localStorage.setItem('challenge-progress', JSON.stringify(challenges));
    }
  }, [challenges, user?.id]);

  // Increment challenge progress
  const incrementProgress = useCallback(async (challengeId: string, amount = 1) => {
    setChallenges(prev => prev.map(c => {
      if (c.challengeId.includes(challengeId) && !c.completedAt) {
        const newProgress = Math.min(c.currentProgress + amount, c.targetProgress);
        const completed = newProgress >= c.targetProgress;
        return {
          ...c,
          currentProgress: newProgress,
          completedAt: completed ? new Date() : null,
        };
      }
      return c;
    }));

    if (user?.id) {
      const challenge = challenges.find(c => c.challengeId.includes(challengeId));
      if (challenge && !challenge.completedAt) {
        const newProgress = Math.min(challenge.currentProgress + amount, challenge.targetProgress);
        const completed = newProgress >= challenge.targetProgress;

        await supabase
          .from('challenge_progress')
          .update({
            current_progress: newProgress,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', challenge.id);
      }
    }
  }, [user?.id, challenges]);

  // Claim reward
  const claimReward = useCallback(async (challengeId: string): Promise<number> => {
    const challenge = challenges.find(c => c.challengeId.includes(challengeId));
    if (!challenge || !challenge.completedAt) return 0;

    return challenge.xpAwarded;
  }, [challenges]);

  // Get active (non-expired) challenges
  const getActiveChallenges = useCallback(() => {
    const now = new Date();
    return challenges.filter(c => c.expiresAt > now);
  }, [challenges]);

  // Get count completed today
  const getCompletedToday = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return challenges.filter(c => 
      c.completedAt && new Date(c.completedAt) >= today
    ).length;
  }, [challenges]);

  return {
    challenges,
    isLoading,
    incrementProgress,
    claimReward,
    getActiveChallenges,
    getCompletedToday,
  };
}
