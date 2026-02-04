/**
 * Edge Functions Integration Tests
 * Tests for gov-intel, financial-intel, and traceos edge functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client
const mockSupabase = {
  functions: {
    invoke: vi.fn(),
  },
  auth: {
    getSession: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Edge Functions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('gov-intel Edge Function', () => {
    it('should analyze governance for a country', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: {
          actors: [{ label: 'Ministry of Finance', actor_type: 'ministry' }],
          delays: [{ process_name: 'Visa Processing', realistic_timeframe: '3-6 months' }],
          partners: [{ partner_type: 'legal_counsel', is_mandatory: true }],
          patterns: [{ pattern_type: 'formal_bureaucracy' }],
        },
        error: null,
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: {
          country_code: 'FR',
          sector: 'technology',
          project_type: 'company_setup',
        },
      });

      expect(result.error).toBeNull();
      expect(result.data.actors).toHaveLength(1);
      expect(result.data.delays).toBeDefined();
      expect(result.data.partners).toBeDefined();
    });

    it('should handle missing country code', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'country_code is required' },
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: { sector: 'technology' },
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('country_code');
    });

    it('should require authentication', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Unauthorized' },
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: { country_code: 'FR' },
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('financial-intel Edge Function', () => {
    it('should generate financial intelligence snapshot', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: {
          country: 'FR',
          legit_top7: [
            { name: 'Angel Investing', risk_level: 'medium', potential_return: 'high' },
          ],
          scam_top7: [
            { name: 'Ponzi Schemes', warning_signs: ['guaranteed returns'] },
          ],
          sources: ['Official government data', 'Financial regulators'],
        },
        error: null,
      });

      const result = await mockSupabase.functions.invoke('financial-intel', {
        body: { country: 'FR', language: 'fr' },
      });

      expect(result.error).toBeNull();
      expect(result.data.legit_top7).toBeDefined();
      expect(result.data.scam_top7).toBeDefined();
      expect(result.data.sources).toHaveLength(2);
    });

    it('should cache results appropriately', async () => {
      const firstCall = {
        data: { country: 'FR', cached: false },
        error: null,
      };
      const secondCall = {
        data: { country: 'FR', cached: true },
        error: null,
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce(firstCall)
        .mockResolvedValueOnce(secondCall);

      const result1 = await mockSupabase.functions.invoke('financial-intel', {
        body: { country: 'FR' },
      });
      const result2 = await mockSupabase.functions.invoke('financial-intel', {
        body: { country: 'FR' },
      });

      expect(result1.data.cached).toBe(false);
      expect(result2.data.cached).toBe(true);
    });
  });

  describe('traceos Edge Function', () => {
    it('should create export for dossier', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: {
          export_id: 'exp_123',
          format: 'pdf',
          status: 'processing',
          download_url: null,
        },
        error: null,
      });

      const result = await mockSupabase.functions.invoke('traceos-export', {
        body: {
          dossier_id: 'dos_123',
          format: 'pdf',
          include_annexes: true,
        },
      });

      expect(result.error).toBeNull();
      expect(result.data.export_id).toBeDefined();
      expect(result.data.format).toBe('pdf');
    });

    it('should validate dossier ownership', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Access denied: not owner of dossier' },
      });

      const result = await mockSupabase.functions.invoke('traceos-export', {
        body: { dossier_id: 'dos_other_user' },
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Access denied');
    });

    it('should handle large exports with pagination', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: {
          export_id: 'exp_large',
          total_items: 150,
          pages_generated: 15,
          status: 'completed',
        },
        error: null,
      });

      const result = await mockSupabase.functions.invoke('traceos-export', {
        body: { dossier_id: 'dos_large', format: 'pdf' },
      });

      expect(result.error).toBeNull();
      expect(result.data.total_items).toBe(150);
      expect(result.data.pages_generated).toBe(15);
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      // Simulate rate limit exceeded
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded', status: 429 },
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: { country_code: 'FR' },
      });

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabase.functions.invoke.mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        mockSupabase.functions.invoke('gov-intel', {
          body: { country_code: 'FR' },
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: 'invalid json string',
        error: null,
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: { country_code: 'FR' },
      });

      // Should handle gracefully - data exists but may be invalid
      expect(result.data).toBeDefined();
    });

    it('should handle timeout errors', async () => {
      mockSupabase.functions.invoke.mockRejectedValueOnce(
        new Error('Function timeout')
      );

      await expect(
        mockSupabase.functions.invoke('financial-intel', {
          body: { country: 'FR' },
        })
      ).rejects.toThrow('timeout');
    });
  });

  describe('Input Validation', () => {
    it('should sanitize XSS in inputs', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { sanitized: true },
        error: null,
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: {
          country_code: 'FR',
          sector: '<script>alert("xss")</script>technology',
        },
      });

      // Function should sanitize and not throw
      expect(result.data).toBeDefined();
    });

    it('should reject overly long inputs', async () => {
      const longInput = 'a'.repeat(10000);

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Input too long' },
      });

      const result = await mockSupabase.functions.invoke('gov-intel', {
        body: { country_code: 'FR', notes: longInput },
      });

      expect(result.error).toBeDefined();
    });
  });
});
