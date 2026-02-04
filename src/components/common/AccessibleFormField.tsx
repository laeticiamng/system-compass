/**
 * AccessibleFormField - ARIA-compliant form field wrapper
 * Ensures consistent accessibility across all forms
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleFormField({
  id,
  label,
  error,
  success,
  required,
  description,
  children,
  className,
}: AccessibleFormFieldProps) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const hasError = !!error;
  const hasDescription = !!description;

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={id}
        className={cn(
          'flex items-center gap-1',
          hasError && 'text-destructive'
        )}
      >
        {label}
        {required && (
          <span className="text-destructive" aria-label="requis">
            *
          </span>
        )}
        {success && !hasError && (
          <CheckCircle className="w-4 h-4 text-green-500 ml-1" aria-hidden="true" />
        )}
      </Label>

      {hasDescription && (
        <p
          id={descriptionId}
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      )}

      {/* Clone children to add ARIA attributes */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            id,
            'aria-invalid': hasError ? 'true' : undefined,
            'aria-describedby': [
              hasError ? errorId : null,
              hasDescription ? descriptionId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined,
            'aria-required': required ? 'true' : undefined,
            className: cn(
              (child.props as any).className,
              hasError && 'border-destructive focus-visible:ring-destructive'
            ),
          });
        }
        return child;
      })}

      {hasError && (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Accessible error summary for forms
 */
interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
}

export function FormErrorSummary({ errors, title = 'Erreurs dans le formulaire' }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) return null;

  return (
    <div
      className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="font-medium text-destructive flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {title}
      </h3>
      <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} className="hover:underline">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({ targetId = 'main-content', label = 'Aller au contenu principal' }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
    >
      {label}
    </a>
  );
}

/**
 * Visually hidden text for screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Live region for dynamic announcements
 */
export function LiveRegion({
  children,
  politeness = 'polite',
}: {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}
