/**
 * Input Sanitization Utilities
 * 
 * Security utilities for sanitizing user input to prevent XSS and injection attacks.
 */

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Remove potentially dangerous HTML tags while preserving safe content
 */
export function stripDangerousTags(html: string): string {
  // Remove script tags and their content
  let result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  result = result.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: URLs
  result = result.replace(/javascript:/gi, '');
  
  // Remove data: URLs (potential XSS vector)
  result = result.replace(/data:/gi, '');
  
  // Remove style tags (can be used for CSS injection)
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe, object, embed tags
  result = result.replace(/<(iframe|object|embed|form)[^>]*>.*?<\/\1>/gi, '');
  result = result.replace(/<(iframe|object|embed|form)[^>]*\/?>/gi, '');
  
  return result;
}

/**
 * Sanitize a string for use in URLs
 */
export function sanitizeForUrl(text: string): string {
  return encodeURIComponent(text.trim());
}

/**
 * Sanitize text for use in external links (WhatsApp, email, etc.)
 */
export function sanitizeForExternalLink(text: string, maxLength: number = 1000): string {
  // Trim and limit length
  const trimmed = text.trim().slice(0, maxLength);
  
  // Remove any control characters
  const cleaned = trimmed.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Encode for URL
  return encodeURIComponent(cleaned);
}

/**
 * Validate and sanitize an email address
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  // Additional length check
  if (trimmed.length > 254) {
    return null;
  }
  
  return trimmed;
}

/**
 * Sanitize a phone number
 */
export function sanitizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Must start with + or be all digits
  if (!cleaned.match(/^\+?\d{7,15}$/)) {
    return null;
  }
  
  return cleaned;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let clean = filename.replace(/[/\\:\x00]/g, '');
  
  // Remove leading dots (hidden files)
  clean = clean.replace(/^\.+/, '');
  
  // Limit length
  if (clean.length > 255) {
    const ext = clean.slice(clean.lastIndexOf('.'));
    clean = clean.slice(0, 255 - ext.length) + ext;
  }
  
  return clean || 'unnamed';
}

/**
 * Sanitize a CSS value to prevent CSS injection
 */
export function sanitizeCssValue(value: string): string {
  // Remove url(), expression(), and other potentially dangerous patterns
  return value
    .replace(/url\s*\([^)]*\)/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/[;{}]/g, '');
}

/**
 * Create a safe substring that doesn't break UTF-8 characters
 */
export function safeSubstring(str: string, start: number, end?: number): string {
  const arr = [...str]; // Spread to handle multi-byte characters
  return arr.slice(start, end).join('');
}

/**
 * Truncate text safely with ellipsis
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = safeSubstring(text, 0, maxLength - ellipsis.length);
  return truncated + ellipsis;
}

/**
 * Normalize whitespace (collapse multiple spaces, trim)
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Check if a string contains only alphanumeric characters and basic punctuation
 */
export function isSafeText(text: string): boolean {
  // Allow letters, numbers, common punctuation, and whitespace
  return /^[\p{L}\p{N}\s.,!?;:'"()\-–—@#%&*+=[\]{}/\\]+$/u.test(text);
}
