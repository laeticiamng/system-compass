import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to analytics/monitoring if available
    try {
      // Could send to Sentry, LogRocket, etc.
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Store in localStorage for debugging
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.unshift(errorLog);
      localStorage.setItem('error_logs', JSON.stringify(existingLogs.slice(0, 10)));
    } catch {
      // Fail silently
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = () => {
    const errorText = [
      `Error: ${this.state.error?.message}`,
      `Stack: ${this.state.error?.stack}`,
      `Component Stack: ${this.state.errorInfo?.componentStack}`,
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`
    ].join('\n\n');
    
    navigator.clipboard.writeText(errorText);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl font-display">
                Oops, une erreur est survenue
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                L'application a rencontré un problème inattendu. Vous pouvez essayer de recharger la page ou retourner à l'accueil.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error details (dev mode only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 overflow-hidden">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs font-mono text-muted-foreground mt-2 max-h-32 overflow-auto">
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger la page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
                {import.meta.env.DEV && (
                  <Button onClick={this.handleCopyError} variant="ghost" size="sm" className="w-full">
                    <Bug className="w-4 h-4 mr-2" />
                    Copier les détails de l'erreur
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Si le problème persiste, veuillez contacter le support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
