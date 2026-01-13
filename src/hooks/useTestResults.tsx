import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface TestResult {
  id: string;
  user_id: string;
  test_type: 'quick_test' | 'profile_test';
  answers: Record<string, unknown>;
  result_pyramid: string;
  result_archetype: string | null;
  elapsed_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export function useTestResults() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's test results
  const fetchResults = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults((data as unknown as TestResult[]) || []);
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save a new test result
  const saveResult = async (
    testType: 'quick_test' | 'profile_test',
    answers: Record<string, unknown>,
    resultPyramid: string,
    resultArchetype?: string,
    elapsedSeconds?: number
  ): Promise<boolean> => {
    if (!user) {
      // Store locally if not authenticated
      localStorage.setItem(`lastTest_${testType}`, JSON.stringify({
        answers,
        result_pyramid: resultPyramid,
        result_archetype: resultArchetype,
        elapsed_seconds: elapsedSeconds,
        created_at: new Date().toISOString()
      }));
      return true;
    }

    try {
      const { error } = await supabase
        .from('user_test_results')
        .insert({
          user_id: user.id,
          test_type: testType,
          answers: answers as any,
          result_pyramid: resultPyramid,
          result_archetype: resultArchetype || null,
          elapsed_seconds: elapsedSeconds || null
        });

      if (error) throw error;
      
      toast.success(t('tests.resultSaved', 'Résultat sauvegardé !'));
      await fetchResults();
      return true;
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error(t('tests.saveError', 'Erreur de sauvegarde'));
      return false;
    }
  };

  // Get latest result for a test type
  const getLatestResult = (testType: 'quick_test' | 'profile_test'): TestResult | null => {
    return results.find(r => r.test_type === testType) || null;
  };

  // Delete a test result
  const deleteResult = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_test_results')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setResults(prev => prev.filter(r => r.id !== id));
      toast.success(t('tests.resultDeleted', 'Résultat supprimé'));
      return true;
    } catch (error) {
      console.error('Error deleting test result:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchResults();
    } else {
      setResults([]);
    }
  }, [user]);

  return {
    results,
    loading,
    saveResult,
    getLatestResult,
    deleteResult,
    refetch: fetchResults
  };
}