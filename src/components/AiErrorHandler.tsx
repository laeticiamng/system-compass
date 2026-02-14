import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertCircle, CreditCard, Clock } from 'lucide-react';

interface AiErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
}

/**
 * Handles AI-related errors (rate limits, payment required) and displays appropriate toasts
 */
export function useAiErrorHandler() {
  const { t } = useTranslation();

  const handleAiError = (error: unknown): boolean => {
    if (!error) return false;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusMatch = errorMessage.match(/(\d{3})/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : null;

    // Rate limit exceeded (429)
    if (status === 429 || errorMessage.toLowerCase().includes('rate limit')) {
      toast.error(t('ai.errors.rateLimitTitle', 'Limite de requêtes atteinte'), {
        description: t('ai.errors.rateLimitDescription', 'Veuillez patienter quelques instants avant de réessayer.'),
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        duration: 8000,
        action: {
          label: t('common.retry', 'Réessayer'),
          onClick: () => window.location.reload(),
        },
      });
      return true;
    }

    // Payment required (402)
    if (status === 402 || errorMessage.toLowerCase().includes('payment required') || errorMessage.toLowerCase().includes('insufficient credits')) {
      toast.error(t('ai.errors.paymentRequiredTitle', 'Crédits insuffisants'), {
        description: t('ai.errors.paymentRequiredDescription', 'Ajoutez des crédits à votre espace de travail pour continuer.'),
        icon: <CreditCard className="w-5 h-5 text-red-500" />,
        duration: 10000,
        action: {
          label: t('ai.errors.addCredits', 'Ajouter des crédits'),
          onClick: () => window.open('https://lovable.dev/settings', '_blank'),
        },
      });
      return true;
    }

    // Generic AI error
    if (errorMessage.toLowerCase().includes('ai') || errorMessage.toLowerCase().includes('gateway')) {
      toast.error(t('ai.errors.genericTitle', 'Erreur AI'), {
        description: t('ai.errors.genericDescription', 'Une erreur est survenue. Veuillez réessayer.'),
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        duration: 6000,
      });
      return true;
    }

    return false;
  };

  return { handleAiError };
}

/**
 * Component that displays AI error toasts when an error is passed
 */
export function AiErrorHandler({ error }: AiErrorHandlerProps) {
  const { handleAiError } = useAiErrorHandler();

  useEffect(() => {
    if (error) {
      handleAiError(error);
    }
  }, [error, handleAiError]);

  return null;
}

/**
 * Wrapper function for async operations that may encounter AI errors
 */
export async function withAiErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (error: unknown) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error('AI operation error:', error);
    onError?.(error);
    return null;
  }
}

/**
 * Parse edge function response and check for AI errors
 */
export function parseAiResponse(response: { data: unknown; error: unknown }): {
  success: boolean;
  data: unknown;
  errorType?: 'rate_limit' | 'payment_required' | 'generic';
  errorMessage?: string;
} {
  if (response.error) {
    const errorMessage = typeof response.error === 'string' 
      ? response.error 
      : (response.error as { message?: string })?.message || 'Unknown error';

    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return { 
        success: false, 
        data: null, 
        errorType: 'rate_limit',
        errorMessage: 'Rate limit exceeded'
      };
    }

    if (errorMessage.includes('402') || errorMessage.includes('payment')) {
      return { 
        success: false, 
        data: null, 
        errorType: 'payment_required',
        errorMessage: 'Insufficient credits'
      };
    }

    return { 
      success: false, 
      data: null, 
      errorType: 'generic',
      errorMessage 
    };
  }

  return { success: true, data: response.data };
}
