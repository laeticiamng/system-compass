/**
 * Password Strength Meter Component
 * 
 * Visual feedback for password strength with requirements checklist.
 */

import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: '8 caractères minimum', test: (p) => p.length >= 8 },
  { label: 'Une lettre majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Une lettre minuscule', test: (p) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p) => /[0-9]/.test(p) },
];

function calculateStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Base requirements
  requirements.forEach((req) => {
    if (req.test(password)) score += 1;
  });
  
  // Bonus for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 0.5;
  
  // Bonus for length
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;
  
  return Math.min(score / 5, 1); // Normalize to 0-1
}

function getStrengthLabel(strength: number): { label: string; color: string } {
  if (strength < 0.3) return { label: 'Faible', color: 'bg-destructive' };
  if (strength < 0.6) return { label: 'Moyen', color: 'bg-warning' };
  if (strength < 0.8) return { label: 'Bon', color: 'bg-primary' };
  return { label: 'Fort', color: 'bg-primary' };
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthMeterProps) {
  const strength = calculateStrength(password);
  const { label, color } = getStrengthLabel(strength);
  const passedRequirements = requirements.filter((r) => r.test(password));
  const allPassed = passedRequirements.length === requirements.length;

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Force du mot de passe
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              strength < 0.3 && "text-destructive",
              strength >= 0.3 && strength < 0.8 && "text-warning-foreground",
              strength >= 0.8 && "text-primary"
            )}
          >
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              color
            )}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((req, i) => {
            const passed = req.test(password);
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  passed ? "text-primary" : "text-muted-foreground"
                )}
              >
                {passed ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                <span>{req.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning for weak passwords */}
      {!allPassed && password.length > 0 && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 text-warning" />
          <span>
            Un mot de passe fort protège votre compte contre les accès non
            autorisés.
          </span>
        </div>
      )}
    </div>
  );
}
