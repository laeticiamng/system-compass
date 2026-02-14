/**
 * Security Service - Input validation and sanitization
 */

import { z } from 'zod';

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const schema = z.string().email().max(255);
  const result = schema.safeParse(email.trim().toLowerCase());
  return result.success ? result.data : null;
}

/**
 * Sanitize URL to prevent open redirect
 */
export function sanitizeUrl(url: string, allowedDomains: string[]): string | null {
  try {
    const parsed = new URL(url);
    if (allowedDomains.includes(parsed.hostname)) {
      return url;
    }
    // Only allow relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return null;
  } catch {
    // Allow relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return null;
  }
}

/**
 * Rate limit check (client-side helper)
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const storageKey = `rate_limit_${key}`;
  const now = Date.now();
  
  try {
    const stored = localStorage.getItem(storageKey);
    let data = stored ? JSON.parse(stored) : { attempts: 0, windowStart: now };
    
    // Reset window if expired
    if (now - data.windowStart > windowMs) {
      data = { attempts: 0, windowStart: now };
    }
    
    const allowed = data.attempts < maxAttempts;
    
    if (allowed) {
      data.attempts += 1;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
    
    return {
      allowed,
      remainingAttempts: Math.max(0, maxAttempts - data.attempts),
      resetTime: data.windowStart + windowMs,
    };
  } catch (error) {
    // If localStorage fails, allow the request but log for visibility
    console.warn('Rate limit check failed (localStorage unavailable):', error);
    return { allowed: true, remainingAttempts: maxAttempts, resetTime: now + windowMs };
  }
}

/**
 * Hash sensitive data for logging (one-way)
 */
export async function hashForLog(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 25;
  else feedback.push('At least 8 characters required');

  if (/[a-z]/.test(password)) score += 25;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 25;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 10;
  else feedback.push('Add special characters');

  return {
    isStrong: score >= 75,
    score: Math.min(100, score),
    feedback,
  };
}
