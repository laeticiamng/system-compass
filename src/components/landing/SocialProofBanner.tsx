/**
 * SocialProofBanner - Trust badges for credibility
 * Only shows verified, factual information
 */
import { CheckCircle } from 'lucide-react';

export function SocialProofBanner() {
  // Removed: fake stats and simulated activity feed
  // Will be replaced with real analytics data when available
  return null;
}

export function TrustBadges() {
  const badges = [
    { label: 'Données sécurisées', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'RGPD compliant', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Pas de conseil fiscal', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground"
        >
          <span className="text-green-500">{badge.icon}</span>
          {badge.label}
        </div>
      ))}
    </div>
  );
}
