// UI Components Index - Centralized exports for all UI primitives
// This file provides a single import point for commonly used UI components

// Base shadcn/ui components - re-exported for convenience
export { Button, buttonVariants } from './button';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export { Checkbox } from './checkbox';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Badge } from './badge';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Progress } from './progress';
export { Skeleton } from './skeleton';
export { Separator } from './separator';
export { Switch } from './switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// Dialogs and overlays
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog';
export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

// Navigation
export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from './navigation-menu';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';

// Custom components
export { EmptyState } from './empty-state';
export { DataTableSkeleton, StatsGridSkeleton, FormSkeleton as DataFormSkeleton } from './data-table-skeleton';
export { ConfirmationDialog, DeleteConfirmationDialog } from './confirmation-dialog';
export { StatusBadge, RiskBadge, ProgressBadge } from './status-badge';
export { InfoTooltip, LabelWithTooltip } from './info-tooltip';
export { CopyButton, CopyField } from './copy-button';
export { StepIndicator, SimpleProgressSteps } from './step-indicator';
export { SearchInput, FilteredSearch } from './search-input';
export { OfflineBanner } from './offline-banner';
export { CookieConsent } from './cookie-consent';
export { PasswordStrengthMeter } from './password-strength-meter';
export { RateLimitFeedback } from './rate-limit-feedback';
export { ErrorBoundary, withErrorBoundary } from './error-boundary';
export { 
  CardSkeleton, 
  ListItemSkeleton, 
  TableSkeleton, 
  ChartSkeleton, 
  ProfileSkeleton, 
  FormSkeleton 
} from './loading-skeleton';
export { SkeletonCard, SkeletonGrid, SkeletonTable, SkeletonPage } from './skeleton-card';
export { SkipToContent } from './skip-to-content';
export { DataFreshnessIndicator } from './data-freshness-indicator';
export { SuccessFeedback } from './success-feedback';
export { ProgressIndicator } from './progress-indicator';
export { LoadingOverlay } from './loading-overlay';
export { AnimatedBadge } from './animated-badge';
export { AnimatedSkeleton } from './animated-skeleton';
export { PaginationControls } from './pagination-controls';
export { EnhancedCard } from './enhanced-card';

// Re-export common types for convenience
export type { ButtonProps } from './button';
