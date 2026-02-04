/**
 * Centralized Error Handler Service
 * Provides consistent error handling, logging, and user-friendly messages
 */

import { toast } from 'sonner';

// =============================================================================
// Error Types
// =============================================================================

export enum ErrorCode {
  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_RATE_LIMITED = 'AUTH_RATE_LIMITED',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  
  // Network errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_SERVER_ERROR = 'NETWORK_SERVER_ERROR',
  
  // Database errors
  DB_NOT_FOUND = 'DB_NOT_FOUND',
  DB_DUPLICATE = 'DB_DUPLICATE',
  DB_CONSTRAINT = 'DB_CONSTRAINT',
  DB_PERMISSION = 'DB_PERMISSION',
  DB_RATE_LIMITED = 'DB_RATE_LIMITED',
  
  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_REQUIRED = 'VALIDATION_REQUIRED',
  
  // Business logic errors
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  
  // AI errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_RATE_LIMITED = 'AI_RATE_LIMITED',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  
  // Generic
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: unknown;
  recoverable: boolean;
  action?: () => void;
  actionLabel?: string;
}

// =============================================================================
// Error Messages (i18n-ready)
// =============================================================================

const ERROR_MESSAGES: Record<ErrorCode, { message: string; userMessage: string }> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    message: 'Invalid email or password',
    userMessage: 'Email ou mot de passe incorrect',
  },
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: {
    message: 'Email not verified',
    userMessage: 'Veuillez vérifier votre email avant de vous connecter',
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    message: 'Session expired',
    userMessage: 'Votre session a expiré, veuillez vous reconnecter',
  },
  [ErrorCode.AUTH_RATE_LIMITED]: {
    message: 'Too many auth attempts',
    userMessage: 'Trop de tentatives, réessayez dans quelques minutes',
  },
  [ErrorCode.AUTH_WEAK_PASSWORD]: {
    message: 'Password too weak',
    userMessage: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre',
  },
  [ErrorCode.NETWORK_OFFLINE]: {
    message: 'Network offline',
    userMessage: 'Pas de connexion internet. Vérifiez votre réseau.',
  },
  [ErrorCode.NETWORK_TIMEOUT]: {
    message: 'Request timeout',
    userMessage: 'La requête a pris trop de temps. Réessayez.',
  },
  [ErrorCode.NETWORK_SERVER_ERROR]: {
    message: 'Server error',
    userMessage: 'Une erreur serveur est survenue. Réessayez plus tard.',
  },
  [ErrorCode.DB_NOT_FOUND]: {
    message: 'Resource not found',
    userMessage: 'L\'élément demandé n\'existe pas ou a été supprimé',
  },
  [ErrorCode.DB_DUPLICATE]: {
    message: 'Duplicate entry',
    userMessage: 'Cet élément existe déjà',
  },
  [ErrorCode.DB_CONSTRAINT]: {
    message: 'Constraint violation',
    userMessage: 'Les données ne respectent pas les contraintes requises',
  },
  [ErrorCode.DB_PERMISSION]: {
    message: 'Permission denied',
    userMessage: 'Vous n\'avez pas les droits pour effectuer cette action',
  },
  [ErrorCode.DB_RATE_LIMITED]: {
    message: 'Database rate limited',
    userMessage: 'Trop de requêtes, patientez quelques secondes',
  },
  [ErrorCode.VALIDATION_FAILED]: {
    message: 'Validation failed',
    userMessage: 'Certains champs sont invalides',
  },
  [ErrorCode.VALIDATION_REQUIRED]: {
    message: 'Required field missing',
    userMessage: 'Veuillez remplir tous les champs obligatoires',
  },
  [ErrorCode.QUOTA_EXCEEDED]: {
    message: 'Quota exceeded',
    userMessage: 'Quota épuisé. Passez à un forfait supérieur.',
  },
  [ErrorCode.FEATURE_DISABLED]: {
    message: 'Feature disabled',
    userMessage: 'Cette fonctionnalité n\'est pas disponible actuellement',
  },
  [ErrorCode.SUBSCRIPTION_REQUIRED]: {
    message: 'Subscription required',
    userMessage: 'Un abonnement est requis pour accéder à cette fonctionnalité',
  },
  [ErrorCode.AI_SERVICE_UNAVAILABLE]: {
    message: 'AI service unavailable',
    userMessage: 'Le service IA est temporairement indisponible',
  },
  [ErrorCode.AI_RATE_LIMITED]: {
    message: 'AI rate limited',
    userMessage: 'Limite IA atteinte, réessayez dans quelques minutes',
  },
  [ErrorCode.AI_INVALID_RESPONSE]: {
    message: 'Invalid AI response',
    userMessage: 'L\'IA n\'a pas pu générer une réponse valide',
  },
  [ErrorCode.UNKNOWN]: {
    message: 'Unknown error',
    userMessage: 'Une erreur inattendue est survenue',
  },
};

// =============================================================================
// Error Detection
// =============================================================================

/**
 * Detect error code from various error formats (Supabase, fetch, etc.)
 */
export function detectErrorCode(error: unknown): ErrorCode {
  if (!error) return ErrorCode.UNKNOWN;

  // Check for network issues
  if (!navigator.onLine) return ErrorCode.NETWORK_OFFLINE;

  // Handle Supabase errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    const message = (err.message as string) || '';
    const code = (err.code as string) || '';
    const status = err.status as number;

    // Auth errors
    if (message.includes('Invalid login credentials')) {
      return ErrorCode.AUTH_INVALID_CREDENTIALS;
    }
    if (message.includes('Email not confirmed')) {
      return ErrorCode.AUTH_EMAIL_NOT_VERIFIED;
    }
    if (message.includes('JWT expired') || message.includes('session')) {
      return ErrorCode.AUTH_SESSION_EXPIRED;
    }
    if (code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
      return ErrorCode.AUTH_RATE_LIMITED;
    }
    if (message.includes('Password should be')) {
      return ErrorCode.AUTH_WEAK_PASSWORD;
    }

    // Database errors
    if (code === '23505' || message.includes('duplicate')) {
      return ErrorCode.DB_DUPLICATE;
    }
    if (code === '23503' || message.includes('foreign key') || message.includes('constraint')) {
      return ErrorCode.DB_CONSTRAINT;
    }
    if (status === 404 || message.includes('not found')) {
      return ErrorCode.DB_NOT_FOUND;
    }
    if (status === 403 || message.includes('permission') || message.includes('policy')) {
      return ErrorCode.DB_PERMISSION;
    }
    if (status === 429) {
      return ErrorCode.DB_RATE_LIMITED;
    }

    // Network errors
    if (status >= 500) {
      return ErrorCode.NETWORK_SERVER_ERROR;
    }
    if (message.includes('timeout') || message.includes('AbortError')) {
      return ErrorCode.NETWORK_TIMEOUT;
    }
    if (message.includes('fetch') || message.includes('network')) {
      return ErrorCode.NETWORK_OFFLINE;
    }
  }

  return ErrorCode.UNKNOWN;
}

// =============================================================================
// Error Handler
// =============================================================================

/**
 * Create a structured AppError from any error
 */
export function createAppError(
  error: unknown,
  overrides?: Partial<AppError>
): AppError {
  const code = overrides?.code || detectErrorCode(error);
  const messages = ERROR_MESSAGES[code];

  return {
    code,
    message: messages.message,
    userMessage: overrides?.userMessage || messages.userMessage,
    details: error,
    recoverable: ![
      ErrorCode.DB_PERMISSION,
      ErrorCode.SUBSCRIPTION_REQUIRED,
      ErrorCode.FEATURE_DISABLED,
    ].includes(code),
    ...overrides,
  };
}

/**
 * Handle error with optional toast and logging
 */
export function handleError(
  error: unknown,
  options: {
    showToast?: boolean;
    logToConsole?: boolean;
    context?: string;
    onError?: (appError: AppError) => void;
  } = {}
): AppError {
  const {
    showToast = true,
    logToConsole = import.meta.env.DEV,
    context,
    onError,
  } = options;

  const appError = createAppError(error);

  // Log in development
  if (logToConsole) {
    console.error(`[${context || 'Error'}]`, {
      code: appError.code,
      message: appError.message,
      details: appError.details,
    });
  }

  // Show toast
  if (showToast) {
    const toastOptions: Parameters<typeof toast.error>[1] = {
      description: appError.userMessage,
    };

    if (appError.action && appError.actionLabel) {
      toastOptions.action = {
        label: appError.actionLabel,
        onClick: appError.action,
      };
    }

    toast.error('Erreur', toastOptions);
  }

  // Custom handler
  if (onError) {
    onError(appError);
  }

  return appError;
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, { context });
      throw error;
    }
  }) as T;
}

/**
 * Try-catch wrapper that returns Result type
 */
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const appError = handleError(error, { showToast: false, context });
    return { success: false, error: appError };
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if error is recoverable (can retry)
 */
export function isRecoverable(error: AppError | unknown): boolean {
  if (typeof error === 'object' && error !== null && 'recoverable' in error) {
    return (error as AppError).recoverable;
  }
  const code = detectErrorCode(error);
  return ![
    ErrorCode.DB_PERMISSION,
    ErrorCode.SUBSCRIPTION_REQUIRED,
    ErrorCode.FEATURE_DISABLED,
  ].includes(code);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = isRecoverable,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
}
