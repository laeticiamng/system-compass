import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ErrorCode,
  detectErrorCode,
  createAppError,
  isRecoverable,
  tryCatch,
  retryWithBackoff,
} from '../errorHandler';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

describe('errorHandler', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  describe('detectErrorCode', () => {
    it('returns NETWORK_OFFLINE when navigator is offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      expect(detectErrorCode(new Error('any'))).toBe(ErrorCode.NETWORK_OFFLINE);
    });

    it('detects invalid credentials', () => {
      expect(detectErrorCode({ message: 'Invalid login credentials' })).toBe(
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    });

    it('detects email not verified', () => {
      expect(detectErrorCode({ message: 'Email not confirmed' })).toBe(
        ErrorCode.AUTH_EMAIL_NOT_VERIFIED
      );
    });

    it('detects duplicate (Postgres 23505)', () => {
      expect(detectErrorCode({ code: '23505' })).toBe(ErrorCode.DB_DUPLICATE);
    });

    it('detects 404 not found', () => {
      expect(detectErrorCode({ status: 404 })).toBe(ErrorCode.DB_NOT_FOUND);
    });

    it('detects permission denied (403)', () => {
      expect(detectErrorCode({ status: 403 })).toBe(ErrorCode.DB_PERMISSION);
    });

    it('detects rate limit (429)', () => {
      expect(detectErrorCode({ status: 429 })).toBe(ErrorCode.DB_RATE_LIMITED);
    });

    it('detects server error (5xx)', () => {
      expect(detectErrorCode({ status: 503 })).toBe(ErrorCode.NETWORK_SERVER_ERROR);
    });

    it('falls back to UNKNOWN', () => {
      expect(detectErrorCode({ message: 'wat' })).toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('createAppError', () => {
    it('marks DB_PERMISSION as non-recoverable', () => {
      const err = createAppError({ status: 403 });
      expect(err.code).toBe(ErrorCode.DB_PERMISSION);
      expect(err.recoverable).toBe(false);
    });

    it('marks network errors as recoverable', () => {
      const err = createAppError({ status: 500 });
      expect(err.recoverable).toBe(true);
    });

    it('honours overrides', () => {
      const err = createAppError(null, { code: ErrorCode.QUOTA_EXCEEDED, userMessage: 'X' });
      expect(err.userMessage).toBe('X');
    });
  });

  describe('isRecoverable', () => {
    it('reads recoverable flag if present', () => {
      expect(isRecoverable({ recoverable: false } as never)).toBe(false);
    });
    it('falls back to error code detection', () => {
      expect(isRecoverable({ status: 500 })).toBe(true);
    });
  });

  describe('tryCatch', () => {
    it('returns success on resolve', async () => {
      const r = await tryCatch(async () => 42);
      expect(r).toEqual({ success: true, data: 42 });
    });

    it('returns failure on reject without throwing', async () => {
      const r = await tryCatch(async () => {
        throw new Error('boom');
      });
      expect(r.success).toBe(false);
    });
  });

  describe('retryWithBackoff', () => {
    it('returns immediately on success', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const r = await retryWithBackoff(fn, { initialDelay: 1, maxRetries: 3 });
      expect(r).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries then succeeds', async () => {
      let calls = 0;
      const fn = vi.fn().mockImplementation(async () => {
        calls += 1;
        if (calls < 3) throw { status: 500 };
        return 'ok';
      });
      const r = await retryWithBackoff(fn, { initialDelay: 1, maxRetries: 3 });
      expect(r).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('throws after exhausting retries', async () => {
      const fn = vi.fn().mockRejectedValue({ status: 500 });
      await expect(
        retryWithBackoff(fn, { initialDelay: 1, maxRetries: 2 })
      ).rejects.toBeDefined();
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('does not retry non-recoverable errors', async () => {
      const fn = vi.fn().mockRejectedValue({ status: 403 });
      await expect(
        retryWithBackoff(fn, { initialDelay: 1, maxRetries: 5 })
      ).rejects.toBeDefined();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
