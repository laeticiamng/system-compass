import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WhoWinsWhoLosesProps {
  wins: string[];
  loses: string[];
  className?: string;
}

export function WhoWinsWhoLoses({ wins, loses, className }: WhoWinsWhoLosesProps) {
  return (
    <div className={cn('grid md:grid-cols-2 gap-6', className)}>
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-risk-low/20">
            <TrendingUp className="w-4 h-4 text-risk-low" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Who Wins</h4>
        </div>
        <ul className="space-y-3">
          {wins.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span className="text-risk-low">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-risk-critical/20">
            <TrendingDown className="w-4 h-4 text-risk-critical" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Who Loses</h4>
        </div>
        <ul className="space-y-3">
          {loses.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span className="text-risk-critical">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
