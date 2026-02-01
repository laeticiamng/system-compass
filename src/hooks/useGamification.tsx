import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useUserHistory } from './useUserHistory';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserProgress, 
  UserPhase,
  calculateLevel,
  createInitialProgress,
  BADGES,
  getBadgeById
} from '@/lib/gamification-system';

// Storage key for local persistence (fallback for anonymous users)
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
  const { countries } = useUserHistory();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from Supabase or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      // For logged-in users, try Supabase first
      if (user?.id) {
        try {
          const { data, error } = await (supabase as any)
            .from('gamification_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            setProgress({
              userId: data.user_id,
              xp: data.xp,
              level: data.level as UserProgress['level'],
              badges: data.badges || [],
              phase: data.phase as UserPhase,
              streak: data.streak,
              achievements: [],
              lastActive: data.last_active,
              createdAt: data.created_at,
            });
            setIsLoading(false);
            return;
          }

          // No record found, create one
          if (error?.code === 'PGRST116') {
            const initial = createInitialProgress(user.id);
            const { error: insertError } = await (supabase as any)
              .from('gamification_progress')
              .insert({
                user_id: user.id,
                xp: initial.xp,
                level: initial.level,
                badges: initial.badges,
                phase: initial.phase,
                streak: initial.streak,
              });

            if (!insertError) {
              setProgress(initial);
            } else {
              console.warn('Could not create gamification record:', insertError.message);
              // Fallback to localStorage
              const stored = localStorage.getItem(STORAGE_KEY);
              if (stored) {
                setProgress(JSON.parse(stored));
              } else {
                setProgress(initial);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load gamification from Supabase:', err);
          // Fallback to localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setProgress(JSON.parse(stored));
          } else {
            setProgress(createInitialProgress(user.id));
          }
        }
      } else {
        // Anonymous user - use localStorage only
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setProgress(JSON.parse(stored));
          } else {
            const initial = createInitialProgress('anonymous');
            setProgress(initial);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
          }
        } catch (error) {
          console.error('Failed to load gamification progress:', error);
          setProgress(createInitialProgress('anonymous'));
        }
      }
      setIsLoading(false);
    };

    loadProgress();
  }, [user?.id]);

  // Sync progress to Supabase and localStorage whenever it changes
  useEffect(() => {
    if (!progress) return;

    // Always save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    // Sync to Supabase for logged-in users
    if (user?.id && progress.userId === user.id) {
      (supabase as any)
        .from('gamification_progress')
        .upsert({
          user_id: user.id,
          xp: progress.xp,
          level: progress.level,
          badges: progress.badges,
          phase: progress.phase,
          streak: progress.streak,
          last_active: progress.lastActive,
        }, { onConflict: 'user_id' })
        .then(({ error }: { error: any }) => {
          if (error) {
            console.warn('Could not sync gamification progress:', error.message);
          }
        });
    }
  }, [progress, user?.id]);

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
    if (!progress || !countries) return;

    const countriesViewed = countries?.length || 0;
    
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
  }, [progress, countries, unlockBadge]);

  // Auto-check conditions on countries change
  useEffect(() => {
    if (countries && progress) {
      checkBadgeConditions();
    }
  }, [countries, checkBadgeConditions]);

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
