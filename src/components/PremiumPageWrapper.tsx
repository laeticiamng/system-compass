import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { Loader2 } from 'lucide-react';

interface PremiumPageWrapperProps {
  /** The premium content to show */
  children: ReactNode;
  /** Preview content to show blurred behind paywall (first screen) */
  previewContent?: ReactNode;
  /** Custom paywall title */
  title?: string;
  /** Custom paywall description */
  description?: string;
  /** Tier required to access */
  tier?: 'premium' | 'pro';
}

/**
 * Wrapper component that protects premium pages.
 * Free users see a blurred preview with a paywall overlay.
 * Premium/Pro users see the full content.
 */
export function PremiumPageWrapper({
  children,
  previewContent,
  title,
  description,
  tier = 'premium',
}: PremiumPageWrapperProps) {
  const { t } = useTranslation();
  const { loading, canAccessPremium, canAccessPro } = useSubscription();

  // Show loading state while checking subscription
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user has required access
  const hasAccess = tier === 'pro' ? canAccessPro : canAccessPremium;

  // If user has access, show full content
  if (hasAccess) {
    return <>{children}</>;
  }

  // Otherwise show paywall with optional preview
  const defaultTitle = t('subscription.premiumRequired', 'Contenu Premium');
  const defaultDescription = t(
    'subscription.upgradeToAccess',
    'Passez à Premium pour accéder à cette fonctionnalité et débloquer toutes les analyses avancées.'
  );

  return (
    <PremiumPaywall
      title={title || defaultTitle}
      description={description || defaultDescription}
      tier={tier}
    >
      {previewContent}
    </PremiumPaywall>
  );
}

// Export list of free countries (accessible without premium)
export const FREE_COUNTRY_IDS = ['france', 'suisse', 'belgique'];

/**
 * Check if a country is accessible for free users
 */
export function isCountryFree(countryId: string): boolean {
  return FREE_COUNTRY_IDS.includes(countryId.toLowerCase());
}
