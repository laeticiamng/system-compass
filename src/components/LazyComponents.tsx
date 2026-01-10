import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loaded heavy components - using .then() to handle named exports
export const LazyWorldMap = lazy(() => 
  import('@/components/WorldMap').then(m => ({ default: m.WorldMap }))
);
export const LazyFinancialTrajectoryChart = lazy(() => 
  import('@/components/FinancialTrajectoryChart')
);
export const LazyDestinationMap = lazy(() => 
  import('@/components/DestinationMap').then(m => ({ default: m.DestinationMap }))
);
export const LazyRadarCompareChart = lazy(() => 
  import('@/components/RadarCompareChart').then(m => ({ default: m.RadarCompareChart }))
);
export const LazyTagsRadarCompare = lazy(() => 
  import('@/components/TagsRadarCompare').then(m => ({ default: m.TagsRadarCompare }))
);
export const LazyHexagonalBoard = lazy(() => 
  import('@/components/game/HexagonalBoard')
);
export const LazyPyramidVisualization = lazy(() => 
  import('@/components/PyramidVisualization').then(m => ({ default: m.PyramidVisualization }))
);
export const LazyRetirementProjection = lazy(() => 
  import('@/components/RetirementProjection').then(m => ({ default: m.RetirementProjection }))
);

// Loading fallback components
export function MapLoadingFallback() {
  return (
    <div className="w-full h-[400px] rounded-xl bg-muted/50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="w-32 h-4 mx-auto" />
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    </div>
  );
}

export function ChartLoadingFallback() {
  return (
    <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-3/4 h-4 mx-auto" />
        <Skeleton className="w-1/2 h-4 mx-auto" />
        <p className="text-sm text-muted-foreground">Chargement du graphique...</p>
      </div>
    </div>
  );
}

export function GameLoadingFallback() {
  return (
    <div className="w-full h-[500px] rounded-xl bg-muted/50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="w-24 h-24 rounded-full mx-auto" />
        <Skeleton className="w-40 h-4 mx-auto" />
        <p className="text-sm text-muted-foreground">Chargement du jeu...</p>
      </div>
    </div>
  );
}

// Wrapper components with Suspense
interface WithSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WithMapSuspense({ children, fallback }: WithSuspenseProps) {
  return (
    <Suspense fallback={fallback || <MapLoadingFallback />}>
      {children}
    </Suspense>
  );
}

export function WithChartSuspense({ children, fallback }: WithSuspenseProps) {
  return (
    <Suspense fallback={fallback || <ChartLoadingFallback />}>
      {children}
    </Suspense>
  );
}

export function WithGameSuspense({ children, fallback }: WithSuspenseProps) {
  return (
    <Suspense fallback={fallback || <GameLoadingFallback />}>
      {children}
    </Suspense>
  );
}
