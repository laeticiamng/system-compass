import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const analysis = useMemo(() => {
    const requirements: Requirement[] = [
      { label: 'Au moins 8 caractères', met: password.length >= 8 },
      { label: 'Une lettre majuscule', met: /[A-Z]/.test(password) },
      { label: 'Une lettre minuscule', met: /[a-z]/.test(password) },
      { label: 'Un chiffre', met: /[0-9]/.test(password) },
      { label: 'Un caractère spécial', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const metCount = requirements.filter(r => r.met).length;
    const strength = (metCount / requirements.length) * 100;

    let level: 'weak' | 'medium' | 'strong' = 'weak';
    let label = 'Faible';
    let color = 'bg-red-500';

    if (strength >= 80) {
      level = 'strong';
      label = 'Fort';
      color = 'bg-emerald-500';
    } else if (strength >= 60) {
      level = 'medium';
      label = 'Moyen';
      color = 'bg-amber-500';
    }

    return { requirements, strength, level, label, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-center gap-2">
        <Progress value={analysis.strength} className="flex-1 h-2" />
        <span className={`text-sm font-medium ${
          analysis.level === 'strong' ? 'text-emerald-500' :
          analysis.level === 'medium' ? 'text-amber-500' : 'text-red-500'
        }`}>
          {analysis.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {analysis.requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
