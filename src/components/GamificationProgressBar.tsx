/**
 * GamificationProgressBar - XP + Level badge for the header
 *
 * Tracks: countries visited, simulations launched, comparisons made.
 * Levels: Touriste → Explorateur → Nomade → Stratège → Global Citizen
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plane, Globe, Compass, Target, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// LEVEL SYSTEM
// ============================================================

interface Level {
  name: string;
  nameKey: string;
  minXP: number;
  icon: typeof Plane;
  color: string;
}

const LEVELS: Level[] = [
  { name: 'Touriste', nameKey: 'gamification.level.tourist', minXP: 0, icon: Plane, color: 'text-gray-500' },
  { name: 'Explorateur', nameKey: 'gamification.level.explorer', minXP: 100, icon: Compass, color: 'text-blue-500' },
  { name: 'Nomade', nameKey: 'gamification.level.nomad', minXP: 300, icon: Globe, color: 'text-emerald-500' },
  { name: 'Stratège', nameKey: 'gamification.level.strategist', minXP: 600, icon: Target, color: 'text-amber-500' },
  { name: 'Global Citizen', nameKey: 'gamification.level.globalCitizen', minXP: 1000, icon: Crown, color: 'text-primary' },
];

// XP values per action
const XP_VALUES = {
  country_visited: 20,
  simulation_completed: 30,
  comparison_made: 15,
  quiz_completed: 50,
  game_played: 40,
  matcher_completed: 25,
  profile_created: 50,
};

const XP_STORAGE_KEY = 'pyramid-compass-xp';

function getStoredXP(): number {
  try {
    const stored = localStorage.getItem(XP_STORAGE_KEY);
    if (stored) return parseInt(stored, 10);
    // Default starting XP (from demo entries)
    const defaultXP = 120;
    localStorage.setItem(XP_STORAGE_KEY, String(defaultXP));
    return defaultXP;
  } catch {
    return 0;
  }
}

function getCurrentLevel(xp: number): { current: Level; next: Level | null; progressToNext: number } {
  let current = LEVELS[0];
  let next: Level | null = null;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }

  const progressToNext = next
    ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
    : 100;

  return { current, next, progressToNext };
}

// ============================================================
// COMPONENT
// ============================================================

export function GamificationProgressBar({ className }: { className?: string }) {
  const { t } = useTranslation();

  const xp = useMemo(() => getStoredXP(), []);
  const { current, next, progressToNext } = useMemo(() => getCurrentLevel(xp), [xp]);

  const Icon = current.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/gamification"
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer',
              className
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', current.color)} />
            <div className="hidden sm:flex items-center gap-1.5">
              <span className={cn('text-xs font-medium', current.color)}>
                {t(current.nameKey, current.name)}
              </span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressToNext)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{xp} XP</span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <p className="font-semibold">
              {t(current.nameKey, current.name)} — {xp} XP
            </p>
            {next && (
              <p className="text-muted-foreground">
                {t('gamification.nextLevel', 'Prochain niveau :')} {t(next.nameKey, next.name)} ({next.minXP} XP)
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              {t('gamification.clickForDetails', 'Cliquez pour voir votre progression')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Add XP helper — call from anywhere to award XP
 */
export function addXP(amount: number): number {
  const current = getStoredXP();
  const newXP = current + amount;
  localStorage.setItem(XP_STORAGE_KEY, String(newXP));
  return newXP;
}

export { XP_VALUES, LEVELS, getStoredXP, getCurrentLevel };
