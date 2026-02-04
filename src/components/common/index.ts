// Common reusable components index - v7.0.8
// Core utilities and shared UI patterns

// Export Management
export { MultiExportButton } from './MultiExportButton';
export { ExportButton } from './ExportButton';

// Offline & Network
export { OfflineBanner } from './OfflineBanner';
export { OfflineIndicator } from './OfflineIndicator';
export { OfflineExportQueue, useOfflineExportQueue } from './OfflineExportQueue';

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';
export { GranularErrorBoundary } from './GranularErrorBoundary';
export { ErrorCard } from './ErrorCard';

// Loading States
export { LoadingSkeleton } from './LoadingSkeleton';
export { PageLoadingSkeleton } from './PageLoadingSkeleton';

// Dialogs & Modals
export { ConfirmDialog } from './ConfirmDialog';

// Empty & Status States
export { EmptyState } from './EmptyState';
export { StatusBadge } from './StatusBadge';
export { DataSourceIndicator } from './DataSourceIndicator';

// History & Versioning
export { VersionHistory, type VersionEntry } from './VersionHistory';

// Simulation & Scenarios
export { ScenarioSimulator, type ScenarioVariable, type ScenarioResult } from './ScenarioSimulator';

// Data Visualization
export { TrendChart } from './TrendChart';
export { TrendIndicator } from './TrendIndicator';
export { ScoreGauge } from './ScoreGauge';

// Form Validation
export { ValidationFeedback, createValidationResult, type ValidationResult, type ValidationLevel } from './ValidationFeedback';
export * from './UniversalFormValidator';
export { AccessibleFormField } from './AccessibleFormField';

// Collaboration
export { CollaborationThread } from './CollaborationThread';

// System Health & Diagnostics
export { SmokeTester } from './SmokeTester';
export { SystemHealthIndicator, useSystemHealth } from './SystemHealthIndicator';
export { PerformanceMonitor, useRenderTime, usePerformanceTrack } from './PerformanceMonitor';
export { SecurityChecker } from './SecurityChecker';

// User Experience
export { RateLimitIndicator } from './RateLimitIndicator';
export { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
export { SessionTimeoutWarning } from './SessionTimeoutWarning';
export { PremiumTransition } from './PremiumTransition';
export { ModuleOnboarding } from './ModuleOnboarding';
export { NextStepSuggestion } from './NextStepSuggestion';

// Search & Navigation
export { GlobalSearch, SearchModal, useGlobalSearch } from './SearchEngine';
export { SavedCountriesButton } from './SavedCountriesButton';

// Notifications
export { NotificationBell, NotificationCenter, useNotifications } from './NotificationManager';

// Integration - Module connections
export { 
  setModuleContext, 
  getModuleContext, 
  clearModuleContext, 
  useModuleContext, 
  useContextualNavigation,
  connectExitKeysToDashboard,
  connectCountryToCompare,
  connectProfileToExitKeys,
  connectLatentToTraceOS,
  connectIrreversaToTraceOS
} from './GlobalConnector';
