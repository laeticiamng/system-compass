/**
 * GranularErrorBoundary - Component-level error boundaries
 * Prevents cascade failures while providing useful feedback
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  minHeight?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showStack: boolean;
}

export class GranularErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorBoundary] ${this.props.componentName || 'Component'}:`, error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo, showStack } = this.state;
    const { children, fallback, componentName, showDetails = false, minHeight = '100px' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <Card 
          className="border-destructive/30 bg-destructive/5"
          style={{ minHeight }}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            
            <div>
              <p className="font-medium text-sm text-foreground">
                {componentName 
                  ? `Erreur dans ${componentName}`
                  : 'Une erreur est survenue'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ce composant n'a pas pu s'afficher correctement.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </Button>

            {showDetails && error && (
              <Collapsible
                open={showStack}
                onOpenChange={(open) => this.setState({ showStack: open })}
                className="w-full mt-2"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs">
                    <Bug className="w-3 h-3" />
                    Détails techniques
                    <ChevronDown className={`w-3 h-3 transition-transform ${showStack ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="text-left p-3 bg-muted/50 rounded-md overflow-auto max-h-40">
                    <p className="text-xs font-mono text-destructive mb-2">
                      {error.name}: {error.message}
                    </p>
                    {errorInfo?.componentStack && (
                      <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
                        {errorInfo.componentStack.slice(0, 500)}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <GranularErrorBoundary componentName={componentName || WrappedComponent.displayName}>
        <WrappedComponent {...props} />
      </GranularErrorBoundary>
    );
  };
}

/**
 * Widget-specific error boundary with compact UI
 */
export function WidgetErrorFallback({ 
  title, 
  onRetry 
}: { 
  title: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="p-4 border border-border/50 rounded-lg bg-muted/20 text-center">
      <AlertTriangle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
      <p className="text-xs text-muted-foreground mb-2">
        {title} indisponible
      </p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-xs">
          Réessayer
        </Button>
      )}
    </div>
  );
}
