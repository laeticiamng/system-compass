/**
 * GlobalConnector Tests
 * Tests for inter-module connectivity and context management
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  setModuleContext, 
  getModuleContext, 
  clearModuleContext,
} from '../GlobalConnector';

describe('GlobalConnector', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
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
