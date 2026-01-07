import { useTranslation } from 'react-i18next';
import { Country, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PyramidVisualizationProps {
  country: Country;
  translatedPyramid?: {
    top: string;
    institutions: string;
    gatekeepers: string;
    valueCreators: string;
    base: string;
    realAsset: string;
  };
  className?: string;
}

const pyramidLevels = [
  { key: 'top', width: '35%' },
  { key: 'institutions', width: '50%' },
  { key: 'gatekeepers', width: '65%' },
  { key: 'valueCreators', width: '80%' },
  { key: 'base', width: '95%' },
] as const;

export function PyramidVisualization({ country, translatedPyramid, className }: PyramidVisualizationProps) {
  const { t } = useTranslation();
  const typeInfo = PYRAMID_TYPE_INFO[country.pyramidType];
  const colorClass = `pyramid-gradient-${typeInfo.color.replace('pyramid-', '')}`;

  const pyramid = translatedPyramid || country.pyramid;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pyramid Structure */}
      <div className="flex flex-col items-center gap-1">
        {pyramidLevels.map((level, index) => (
          <div
            key={level.key}
            className="relative group"
            style={{ width: level.width }}
          >
            <div
              className={cn(
                'relative py-4 px-6 text-center transition-all duration-300',
                'border border-border/30 backdrop-blur-sm',
                'hover:scale-[1.02] hover:z-10',
                index === 0 && 'rounded-t-lg',
                index === pyramidLevels.length - 1 && 'rounded-b-lg'
              )}
              style={{
                background: `linear-gradient(135deg, 
                  hsl(var(--${typeInfo.color}) / ${0.4 - index * 0.05}) 0%, 
                  hsl(var(--${typeInfo.color}) / ${0.2 - index * 0.03}) 100%)`,
              }}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {t(`pyramid.${level.key}`)}
              </div>
              <div className="text-sm font-medium text-foreground/90">
                {pyramid[level.key]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real Asset */}
      <div className="text-center mt-8">
        <div className="inline-block px-6 py-3 rounded-full border border-primary/30 bg-primary/5">
          <div className="text-xs uppercase tracking-wider text-primary mb-1">{t('pyramid.realAsset')}</div>
          <div className="text-lg font-display font-semibold text-foreground">
            {pyramid.realAsset}
          </div>
        </div>
      </div>
    </div>
  );
}
