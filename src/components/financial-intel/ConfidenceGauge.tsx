import { useTranslation } from 'react-i18next';

interface ConfidenceGaugeProps {
  confidence: number;
  sourceConfidence: 'high' | 'medium' | 'low';
}

export function ConfidenceGauge({ confidence, sourceConfidence }: ConfidenceGaugeProps) {
  const { t } = useTranslation();
  const percentage = Math.round(confidence * 100);
  
  const getColor = () => {
    if (percentage >= 70) return 'text-green-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradient = () => {
    if (percentage >= 70) return 'from-green-500 to-emerald-400';
    if (percentage >= 40) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-orange-400';
  };

  const getLabel = () => {
    if (sourceConfidence === 'high') return t('financialIntel.confidenceHigh', 'Sources fiables');
    if (sourceConfidence === 'medium') return t('financialIntel.confidenceMedium', 'Sources moyennes');
    return t('financialIntel.confidenceLow', 'À confirmer localement');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Circular gauge */}
      <div className="relative w-12 h-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.26} 126`}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`${getGradient().includes('green') ? 'stop-color-green-500' : getGradient().includes('yellow') ? 'stop-color-yellow-500' : 'stop-color-red-500'}`} stopColor={percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#eab308' : '#ef4444'} />
              <stop offset="100%" className={`${getGradient().includes('emerald') ? 'stop-color-emerald-400' : getGradient().includes('amber') ? 'stop-color-amber-400' : 'stop-color-orange-400'}`} stopColor={percentage >= 70 ? '#34d399' : percentage >= 40 ? '#f59e0b' : '#f97316'} />
            </linearGradient>
          </defs>
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getColor()}`}>
          {percentage}%
        </span>
      </div>
      
      {/* Label */}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {t('financialIntel.confidenceScore', 'Confiance')}
        </span>
        <span className={`text-sm font-medium ${getColor()}`}>
          {getLabel()}
        </span>
      </div>
    </div>
  );
}
