import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useUserHistory } from './useUserHistory';
import { 
  UserProgress, 
  UserLevel, 
  UserPhase,
  calculateLevel,
  createInitialProgress,
  BADGES,
  getBadgeById
} from '@/lib/gamification-system';

// Storage key for local persistence
const STORAGE_KEY = 'gamification-progress';

interface UseGamificationReturn {
  progress: UserProgress | null;
  isLoading: boolean;
  addXp: (amount: number, reason?: string) => void;
  unlockBadge: (badgeId: string) => void;
  updateStreak: () => void;
  setPhase: (phase: UserPhase) => void;
  checkBadgeConditions: () => void;
}

export function useGamification(): UseGamificationReturn {
  const { user } = useAuth();
  const { history } = useUserHistory();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const loadProgress = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserProgress;
          // Update with user ID if logged in
          if (user?.id && parsed.userId !== user.id) {
            parsed.userId = user.id;
          }
          setProgress(parsed);
        } else {
          // Create initial progress
          const initial = createInitialProgress(user?.id || 'anonymous');
          setProgress(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch (error) {
        console.error('Failed to load gamification progress:', error);
        const initial = createInitialProgress(user?.id || 'anonymous');
        setProgress(initial);
      }
      setIsLoading(false);
    };

    loadProgress();
  }, [user?.id]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  // Add XP
  const addXp = useCallback((amount: number, _reason?: string) => {
    setProgress(prev => {
      if (!prev) return prev;
      const newXp = prev.xp + amount;
      const newLevel = calculateLevel(newXp);
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        lastActive: new Date().toISOString(),
      };
    });
  }, []);

  // Unlock a badge
  const unlockBadge = useCallback((badgeId: string) => {
    setProgress(prev => {
      if (!prev) return prev;
      if (prev.badges.includes(badgeId)) return prev; // Already unlocked
      
      const badge = getBadgeById(badgeId);
      const newXp = prev.xp + (badge?.xpReward || 0);
      
      return {
        ...prev,
        badges: [...prev.badges, badgeId],
        xp: newXp,
        level: calculateLevel(newXp),
        achievements: [
          ...prev.achievements,
          { id: badgeId, unlockedAt: new Date().toISOString() }
        ],
      };
    });
  }, []);

  // Update streak
  const updateStreak = useCallback(() => {
    setProgress(prev => {
      if (!prev) return prev;
      
      const lastActive = new Date(prev.lastActive);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      // If last active was yesterday, increment streak
      // If last active was today, keep streak
      // If last active was more than 48 hours ago, reset streak
      let newStreak = prev.streak;
      if (hoursDiff >= 24 && hoursDiff < 48) {
        newStreak = prev.streak + 1;
      } else if (hoursDiff >= 48) {
        newStreak = 1;
      }
      
      return {
        ...prev,
        streak: newStreak,
        lastActive: now.toISOString(),
      };
    });
  }, []);

  // Set phase
  const setPhase = useCallback((phase: UserPhase) => {
    setProgress(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        phase,
      };
    });
  }, []);

  // Check badge conditions based on user activity
  const checkBadgeConditions = useCallback(() => {
    if (!progress || !history) return;

    const countriesViewed = history.countries?.length || 0;
    
    // Check countries_explored badges
    BADGES.forEach(badge => {
      if (progress.badges.includes(badge.id)) return;
      
      if (badge.condition.type === 'countries_explored' && badge.condition.threshold) {
        if (countriesViewed >= badge.condition.threshold) {
          unlockBadge(badge.id);
        }
      }
      
      // Check streak badges
      if (badge.condition.type === 'days_active' && badge.condition.threshold) {
        if (progress.streak >= badge.condition.threshold) {
          unlockBadge(badge.id);
        }
      }
    });
  }, [progress, history, unlockBadge]);

  // Auto-check conditions on history change
  useEffect(() => {
    if (history && progress) {
      checkBadgeConditions();
    }
  }, [history, checkBadgeConditions]);

  // Update streak on load
  useEffect(() => {
    if (progress && !isLoading) {
      updateStreak();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    progress,
    isLoading,
    addXp,
    unlockBadge,
    updateStreak,
    setPhase,
    checkBadgeConditions,
  };
}
