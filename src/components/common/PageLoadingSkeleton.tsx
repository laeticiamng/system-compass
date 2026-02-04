import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PageLoadingSkeletonProps {
  variant?: 'default' | 'academic' | 'country' | 'marketplace' | 'game' | 'dashboard';
}

/**
 * Unified page loading skeletons for consistent UX
 * Use this component for route-level loading states
 */
export function PageLoadingSkeleton({ variant = 'default' }: PageLoadingSkeletonProps) {
  switch (variant) {
    case 'academic':
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 md:pt-24">
          <div className="container mx-auto px-3 sm:px-4 py-6 md:py-12 space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-64 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            
            {/* Module tabs skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            
            {/* Content area skeleton */}
            <Card className="glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      );

    case 'country':
      return (
        <div className="min-h-screen bg-background pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Hero skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            {/* Tabs skeleton */}
            <Skeleton className="h-12 w-full max-w-md" />
            
            {/* Content grid skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="glass-card">
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );

    case 'marketplace':
      return (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          
          {/* Filter bar */}
          <Skeleton className="h-16 w-full" />
          
          {/* Expert cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      );

    case 'game':
      return (
        <div className="min-h-screen">
          {/* Hero section skeleton */}
          <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center pt-16">
            <div className="container mx-auto px-4 text-center space-y-6">
              <Skeleton className="h-8 w-48 mx-auto rounded-full" />
              <Skeleton className="h-16 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
              </div>
            </div>
          </section>
        </div>
      );

    case 'dashboard':
      return (
        <div className="min-h-screen bg-background pt-20 sm:pt-24">
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Widgets grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-background pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-64 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="glass-card">
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
  }
}

export default PageLoadingSkeleton;
