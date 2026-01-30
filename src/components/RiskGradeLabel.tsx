/**
 * RiskGradeLabel - Système de notation type Coface (A1 → E)
 * Convertit les scores numériques en grades visuels marketables
 */
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export type RiskGrade = 'A1' | 'A2' | 'A3' | 'A4' | 'B' | 'C' | 'D' | 'E';

interface RiskGradeLabelProps {
  /** Score from 0-100 (higher = better/safer) */
  score: number;
  /** Optional label to display */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show tooltip with details */
  showTooltip?: boolean;
  /** Animation on mount */
  animated?: boolean;
  /** Additional className */
  className?: string;
}

// Grade configuration with colors and meanings
const gradeConfig: Record<RiskGrade, {
  color: string;
  bgColor: string;
  borderColor: string;
  labelKey: string;
  descriptionKey: string;
  icon: typeof Shield;
}> = {
  A1: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    labelKey: 'grade.a1Label',
    descriptionKey: 'grade.a1Desc',
    icon: CheckCircle
  },
  A2: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    labelKey: 'grade.a2Label',
    descriptionKey: 'grade.a2Desc',
    icon: CheckCircle
  },
  A3: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    labelKey: 'grade.a3Label',
    descriptionKey: 'grade.a3Desc',
    icon: Shield
  },
  A4: {
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/20',
    labelKey: 'grade.a4Label',
    descriptionKey: 'grade.a4Desc',
    icon: Shield
  },
  B: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    labelKey: 'grade.bLabel',
    descriptionKey: 'grade.bDesc',
    icon: AlertTriangle
  },
  C: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    labelKey: 'grade.cLabel',
    descriptionKey: 'grade.cDesc',
    icon: AlertTriangle
  },
  D: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    labelKey: 'grade.dLabel',
    descriptionKey: 'grade.dDesc',
    icon: XCircle
  },
  E: {
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/30',
    labelKey: 'grade.eLabel',
    descriptionKey: 'grade.eDesc',
    icon: XCircle
  }
};

/**
 * Convert a 0-100 score to a Coface-style grade (A1 → E)
 * Higher scores = better grades (safer)
 */
export function scoreToGrade(score: number): RiskGrade {
  if (score >= 90) return 'A1';
  if (score >= 80) return 'A2';
  if (score >= 70) return 'A3';
  if (score >= 60) return 'A4';
  if (score >= 50) return 'B';
  if (score >= 40) return 'C';
  if (score >= 25) return 'D';
  return 'E';
}

/**
 * Convert a grade back to an approximate score range
 */
export function gradeToScoreRange(grade: RiskGrade): [number, number] {
  const ranges: Record<RiskGrade, [number, number]> = {
    A1: [90, 100],
    A2: [80, 89],
    A3: [70, 79],
    A4: [60, 69],
    B: [50, 59],
    C: [40, 49],
    D: [25, 39],
    E: [0, 24]
  };
  return ranges[grade];
}

export function RiskGradeLabel({
  score,
  label,
  size = 'md',
  showTooltip = true,
  animated = true,
  className
}: RiskGradeLabelProps) {
  const { t } = useTranslation();
  const grade = scoreToGrade(score);
  const config = gradeConfig[grade];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const gradeComponent = (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <IconComponent className={iconSizes[size]} />
      <span className="font-bold">{grade}</span>
      {label && <span className="font-normal opacity-80">· {label}</span>}
    </motion.div>
  );

  if (!showTooltip) return gradeComponent;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {gradeComponent}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <span className={config.color}>{grade}</span>
            <span>— {t(config.labelKey, config.labelKey)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t(config.descriptionKey, config.descriptionKey)}
          </p>
          <p className="text-xs opacity-60">
            {t('grade.scoreLabel', 'Score')}: {score}/100
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Compact version showing just the grade letter
 */
export function RiskGradeBadge({ 
  score, 
  className 
}: { 
  score: number; 
  className?: string;
}) {
  const grade = scoreToGrade(score);
  const config = gradeConfig[grade];

  return (
    <span className={cn(
      "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border",
      config.bgColor,
      config.borderColor,
      config.color,
      className
    )}>
      {grade}
    </span>
  );
}

/**
 * Full risk card with grade and details
 */
export function RiskGradeCard({
  score,
  title,
  description,
  className
}: {
  score: number;
  title: string;
  description?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const grade = scoreToGrade(score);
  const config = gradeConfig[grade];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          config.bgColor
        )}>
          <IconComponent className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xl font-bold", config.color)}>{grade}</span>
            <span className="text-sm font-medium">{title}</span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-1">
            {t(config.labelKey, config.labelKey)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
    </motion.div>
  );
}
