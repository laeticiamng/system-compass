/**
 * API Error Handler Utility
 * 
 * Centralized error handling for API calls with:
 * - Consistent error messages
 * - Logging for debugging
 * - User-friendly error formatting
 */

import { toast } from 'sonner';

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  endpoint?: string;
}

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'AUTH_INVALID_CREDENTIALS': 'Email ou mot de passe incorrect',
  'AUTH_USER_NOT_FOUND': 'Aucun compte trouvé avec cet email',
  'AUTH_EMAIL_NOT_CONFIRMED': 'Veuillez confirmer votre email avant de vous connecter',
  'AUTH_WEAK_PASSWORD': 'Le mot de passe ne respecte pas les critères de sécurité',
  'AUTH_SESSION_EXPIRED': 'Votre session a expiré, veuillez vous reconnecter',
  
  // Database errors
  'PGRST116': 'Aucune donnée trouvée',
  'PGRST301': 'Accès non autorisé - veuillez vous connecter',
  '42501': 'Permission refusée pour cette opération',
  '23505': 'Cette entrée existe déjà',
  '23503': 'Référence invalide - données liées manquantes',
  
  // Network errors
  'NETWORK_ERROR': 'Erreur de connexion - vérifiez votre connexion internet',
  'TIMEOUT': 'La requête a pris trop de temps - réessayez',
  
  // Rate limiting
  '429': 'Trop de requêtes - veuillez patienter quelques instants',
  
  // Payment errors
  '402': 'Abonnement requis pour cette fonctionnalité',
  
  // Generic
  'UNKNOWN': 'Une erreur inattendue s\'est produite',
};

/**
 * Parse and format API error for display
 */
export function parseApiError(error: unknown, endpoint?: string): ApiError {
  const timestamp = new Date();
  
  // Handle Supabase error format
  if (error && typeof error === 'object' && 'code' in error) {
    const supaError = error as { code: string; message: string; details?: string };
    return {
      code: supaError.code,
      message: ERROR_MESSAGES[supaError.code] || supaError.message || ERROR_MESSAGES.UNKNOWN,
      details: supaError.details,
      timestamp,
      endpoint,
    };
  }
  
  // Handle Error instances
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        details: error.message,
        timestamp,
        endpoint,
      };
    }
    
    return {
      code: 'UNKNOWN',
      message: error.message || ERROR_MESSAGES.UNKNOWN,
      timestamp,
      endpoint,
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error,
      timestamp,
      endpoint,
    };
  }
  
  return {
    code: 'UNKNOWN',
    message: ERROR_MESSAGES.UNKNOWN,
    timestamp,
    endpoint,
  };
}

/**
 * Show error toast with parsed message
 */
export function showApiError(error: unknown, endpoint?: string): void {
  const parsed = parseApiError(error, endpoint);
  
  // Log for debugging
  console.error(`[API Error] ${parsed.code}:`, {
    message: parsed.message,
    details: parsed.details,
    endpoint: parsed.endpoint,
    timestamp: parsed.timestamp,
  });
  
  toast.error(parsed.message);
}

/**
 * Show success toast
 */
export function showApiSuccess(message: string): void {
  toast.success(message);
}

/**
 * Show info toast
 */
export function showApiInfo(message: string): void {
  toast.info(message);
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    endpoint?: string;
    showToast?: boolean;
    fallback?: T;
  }
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (options?.showToast !== false) {
      showApiError(error, options?.endpoint);
    }
    
    if (options?.fallback !== undefined) {
      return options.fallback;
    }
    
    return undefined;
  }
}

/**
 * Create a retry wrapper for flaky operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const delayMs = options?.delayMs ?? 1000;
  const backoff = options?.backoff ?? true;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
