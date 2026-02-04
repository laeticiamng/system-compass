/**
 * SkeletonCard - Reusable loading skeleton for cards
 * Provides consistent loading states across the platform
 */

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed' | 'country' | 'expert' | 'stat';
  count?: number;
}

export function SkeletonCard({ 
  className, 
  variant = 'default',
  count = 1 
}: SkeletonCardProps) {
  const cards = Array.from({ length: count }, (_, i) => i);

  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        );

      case 'detailed':
        return (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </CardContent>
          </>
        );

      case 'country':
        return (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-14 rounded" /> {/* Flag */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" /> {/* Pyramid badge */}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </>
        );

      case 'expert':
        return (
          <>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" /> {/* Avatar */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                  <div className="flex gap-1 mt-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </>
        );

      case 'stat':
        return (
          <CardContent className="p-4 text-center">
            <Skeleton className="h-8 w-8 mx-auto rounded-lg mb-3" />
            <Skeleton className="h-8 w-20 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </CardContent>
        );

      default:
        return (
          <>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </>
        );
    }
  };

  if (count === 1) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        {renderContent()}
      </Card>
    );
  }

  return (
    <>
      {cards.map((i) => (
        <Card key={i} className={cn("overflow-hidden", className)}>
          {renderContent()}
        </Card>
      ))}
    </>
  );
}

// Grid skeleton for list views
interface SkeletonGridProps {
  variant?: 'default' | 'compact' | 'detailed' | 'country' | 'expert' | 'stat';
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SkeletonGrid({
  variant = 'default',
  count = 6,
  columns = 3,
  className,
}: SkeletonGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      <SkeletonCard variant={variant} count={count} />
    </div>
  );
}

// Table skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/50 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`r-${rowIndex}`} 
          className="flex gap-4 p-4 border-b last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`c-${rowIndex}-${colIndex}`} 
              className="h-4 flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Page skeleton with header
interface SkeletonPageProps {
  showHeader?: boolean;
  showTabs?: boolean;
  contentVariant?: 'cards' | 'table' | 'mixed';
  className?: string;
}

export function SkeletonPage({
  showHeader = true,
  showTabs = false,
  contentVariant = 'cards',
  className,
}: SkeletonPageProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8 space-y-6", className)}>
      {/* Page header */}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {/* Tabs */}
      {showTabs && (
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      )}

      {/* Content */}
      {contentVariant === 'cards' && <SkeletonGrid count={6} columns={3} />}
      {contentVariant === 'table' && <SkeletonTable rows={8} columns={6} />}
      {contentVariant === 'mixed' && (
        <>
          <SkeletonGrid variant="stat" count={4} columns={4} />
          <SkeletonTable rows={5} columns={5} />
        </>
      )}
    </div>
  );
}
