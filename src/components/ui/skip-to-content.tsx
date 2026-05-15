/**
 * Skip to Content Link - Accessibility component
 * Allows keyboard users to skip navigation and jump to main content
 */
import { cn } from '@/lib/utils';
import { scrollToAnchor } from '@/components/SmoothScrollProvider';

interface SkipToContentProps {
  contentId?: string;
  className?: string;
}

export function SkipToContent({ 
  contentId = 'main-content',
  className 
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(contentId);
    if (element) {
      element.focus({ preventScroll: true });
      scrollToAnchor(element);
    }
  };

  return (
    <a
      href={`#${contentId}`}
      onClick={handleClick}
      className={cn(
        // Hidden by default, visible on focus
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        'focus:px-4 focus:py-2 focus:rounded-md',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'focus:outline-none focus:shadow-lg',
        'transition-all duration-200',
        className
      )}
    >
      Aller au contenu principal
    </a>
  );
}
