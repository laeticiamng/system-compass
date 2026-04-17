/**
 * GlobalConnector Tests
 * Tests for inter-module connectivity and context management
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock supabase client before any imports that depend on it
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) }),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

// Silence the deprecation warning emitted by the shim during tests
vi.spyOn(console, 'warn').mockImplementation(() => {});

import {
  setModuleContext,
  getModuleContext,
  clearModuleContext,
} from '../GlobalConnector';
import { useNavigationContext } from '@/domains/_shared/navigationStore';

describe('GlobalConnector (deprecated shim)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useNavigationContext.getState().clearContext();
  });

  afterEach(() => {
    sessionStorage.clear();
    useNavigationContext.getState().clearContext();
  });

  describe('Module Context Management', () => {
    it('should set and get module context correctly', () => {
      const context = {
        sourceModule: 'exit-keys',
        targetModule: 'dashboard',
        data: { exitKeyId: '123', countryId: 'FR' },
      };
      
      setModuleContext(context);
      const retrieved = getModuleContext();
      
      expect(retrieved?.sourceModule).toBe('exit-keys');
      expect(retrieved?.targetModule).toBe('dashboard');
      expect(retrieved?.data.exitKeyId).toBe('123');
    });

    it('should clear module context', () => {
      setModuleContext({
        sourceModule: 'test',
        targetModule: 'test2',
        data: {},
      });
      
      clearModuleContext();
      expect(getModuleContext()).toBeNull();
    });

    it('should return null for empty storage', () => {
      expect(getModuleContext()).toBeNull();
    });
  });
});
