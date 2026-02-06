import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Json } from '@/integrations/supabase/types';

interface StepProgress {
  phaseIndex: number;
  actionIndex: number;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  reminderEnabled?: boolean;
}

interface PhaseNote {
  phaseIndex: number;
  note: string;
  updatedAt: string;
}

export interface DashboardProgress {
  exitKeyId: string;
  startedAt: string;
  stepsProgress: StepProgress[];
  phaseNotes: PhaseNote[];
}

const LOCAL_STORAGE_KEY = 'exit_keys_dashboard';

export function useDashboardProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<DashboardProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load progress from localStorage or Supabase
  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);

      // First load from localStorage for immediate display
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData) as DashboardProgress;
          if (!parsed.phaseNotes) parsed.phaseNotes = [];
          setProgress(parsed);
        } catch (e) {
          // Silent fail for localStorage parsing errors
        }
      }

      // If user is logged in, fetch from Supabase
      if (user) {
        try {
          const { data, error } = await supabase
            .from('dashboard_progress')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!error && data) {
            const stepsData = Array.isArray(data.steps_progress) 
              ? data.steps_progress as unknown as StepProgress[]
              : [];
            const notesData = Array.isArray(data.phase_notes)
              ? data.phase_notes as unknown as PhaseNote[]
              : [];
            
            const cloudProgress: DashboardProgress = {
              exitKeyId: data.exit_key_id,
              startedAt: data.started_at,
              stepsProgress: stepsData,
              phaseNotes: notesData,
            };
            
            setProgress(cloudProgress);
            // Update localStorage with cloud data
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudProgress));
          } else if (localData) {
            // No cloud data but local data exists - sync local to cloud
            const parsed = JSON.parse(localData) as DashboardProgress;
            await syncToCloud(parsed);
          }
        } catch (error) {
          // Silent fail for cloud loading
        }
      }

      setLoading(false);
    };

    loadProgress();
  }, [user]);

  // Sync progress to Supabase
  const syncToCloud = useCallback(async (data: DashboardProgress) => {
    if (!user) return false;

    setSyncing(true);
    try {
      // First try to update existing record
      const { data: existing } = await supabase
        .from('dashboard_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('exit_key_id', data.exitKeyId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('dashboard_progress')
          .update({
            started_at: data.startedAt,
            steps_progress: JSON.parse(JSON.stringify(data.stepsProgress)) as Json,
            phase_notes: JSON.parse(JSON.stringify(data.phaseNotes)) as Json,
          })
          .eq('id', existing.id);

        if (error) {
          return false;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('dashboard_progress')
          .insert([{
            user_id: user.id,
            exit_key_id: data.exitKeyId,
            started_at: data.startedAt,
            steps_progress: JSON.parse(JSON.stringify(data.stepsProgress)) as Json,
            phase_notes: JSON.parse(JSON.stringify(data.phaseNotes)) as Json,
          }]);

        if (error) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Save progress (to localStorage and optionally to cloud)
  const saveProgress = useCallback(async (newProgress: DashboardProgress) => {
    setProgress(newProgress);
    
    // Always save to localStorage first (for offline/guest usage)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));

    // If user is logged in, sync to cloud
    if (user) {
      const success = await syncToCloud(newProgress);
      if (!success) {
        toast.error('Erreur de synchronisation cloud');
      }
    }
  }, [user, syncToCloud]);

  // Start a new plan
  const startPlan = useCallback(async (exitKeyId: string) => {
    const newProgress: DashboardProgress = {
      exitKeyId,
      startedAt: new Date().toISOString(),
      stepsProgress: [],
      phaseNotes: [],
    };

    await saveProgress(newProgress);
    return newProgress;
  }, [saveProgress]);

  // Toggle action completion
  const toggleAction = useCallback(async (phaseIndex: number, actionIndex: number) => {
    if (!progress) return;

    const now = new Date().toISOString();
    const existingIndex = progress.stepsProgress.findIndex(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
    );

    let newStepsProgress: StepProgress[];

    if (existingIndex >= 0) {
      newStepsProgress = progress.stepsProgress.map((s, i) =>
        i === existingIndex
          ? { ...s, completed: !s.completed, completedAt: !s.completed ? now : undefined }
          : s
      );
    } else {
      newStepsProgress = [...progress.stepsProgress, {
        phaseIndex,
        actionIndex,
        completed: true,
        completedAt: now,
      }];
    }

    const newProgress: DashboardProgress = {
      ...progress,
      stepsProgress: newStepsProgress,
    };

    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Set deadline for an action
  const setDeadline = useCallback(async (phaseIndex: number, actionIndex: number, deadline: string) => {
    if (!progress) return;

    const existingIndex = progress.stepsProgress.findIndex(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
    );

    let newStepsProgress: StepProgress[];

    if (existingIndex >= 0) {
      newStepsProgress = progress.stepsProgress.map((s, i) =>
        i === existingIndex
          ? { ...s, deadline, reminderEnabled: true }
          : s
      );
    } else {
      newStepsProgress = [...progress.stepsProgress, {
        phaseIndex,
        actionIndex,
        completed: false,
        deadline,
        reminderEnabled: true,
      }];
    }

    const newProgress: DashboardProgress = {
      ...progress,
      stepsProgress: newStepsProgress,
    };

    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Toggle reminder for an action
  const toggleReminder = useCallback(async (phaseIndex: number, actionIndex: number) => {
    if (!progress) return;

    const existingIndex = progress.stepsProgress.findIndex(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
    );

    if (existingIndex < 0) return;

    const newStepsProgress = progress.stepsProgress.map((s, i) =>
      i === existingIndex
        ? { ...s, reminderEnabled: !s.reminderEnabled }
        : s
    );

    const newProgress: DashboardProgress = {
      ...progress,
      stepsProgress: newStepsProgress,
    };

    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Save phase note
  const savePhaseNote = useCallback(async (phaseIndex: number, note: string) => {
    if (!progress) return;

    const now = new Date().toISOString();
    const existingIndex = progress.phaseNotes.findIndex(n => n.phaseIndex === phaseIndex);

    let newPhaseNotes: PhaseNote[];

    if (existingIndex >= 0) {
      newPhaseNotes = progress.phaseNotes.map((n, i) =>
        i === existingIndex
          ? { ...n, note, updatedAt: now }
          : n
      );
    } else {
      newPhaseNotes = [...progress.phaseNotes, {
        phaseIndex,
        note,
        updatedAt: now,
      }];
    }

    const newProgress: DashboardProgress = {
      ...progress,
      phaseNotes: newPhaseNotes,
    };

    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  // Reset progress
  const resetProgress = useCallback(async () => {
    setProgress(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    if (user) {
      try {
        await supabase
          .from('dashboard_progress')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        // Silent fail for cloud deletion
      }
    }
  }, [user]);

  // Helper functions
  const isActionCompleted = useCallback((phaseIndex: number, actionIndex: number): boolean => {
    if (!progress) return false;
    return progress.stepsProgress.some(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex && s.completed
    );
  }, [progress]);

  const getActionStep = useCallback((phaseIndex: number, actionIndex: number) => {
    if (!progress) return undefined;
    return progress.stepsProgress.find(
      s => s.phaseIndex === phaseIndex && s.actionIndex === actionIndex
    );
  }, [progress]);

  const getPhaseNote = useCallback((phaseIndex: number): string => {
    if (!progress) return '';
    const note = progress.phaseNotes.find(n => n.phaseIndex === phaseIndex);
    return note?.note || '';
  }, [progress]);

  const getPhaseNoteUpdatedAt = useCallback((phaseIndex: number): string | undefined => {
    if (!progress) return undefined;
    const note = progress.phaseNotes.find(n => n.phaseIndex === phaseIndex);
    return note?.updatedAt;
  }, [progress]);

  return {
    progress,
    loading,
    syncing,
    isLoggedIn: !!user,
    startPlan,
    toggleAction,
    setDeadline,
    toggleReminder,
    savePhaseNote,
    resetProgress,
    isActionCompleted,
    getActionStep,
    getPhaseNote,
    getPhaseNoteUpdatedAt,
  };
}
