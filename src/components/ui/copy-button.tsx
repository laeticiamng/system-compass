/**
 * Copy Button - Button to copy text to clipboard with feedback
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CopyButtonProps {
  value: string;
  label?: string;
  showIcon?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({
  value,
  label,
  showIcon = true,
  variant = 'ghost',
  size = 'icon',
  className,
  onCopy,
}: CopyButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t('common.copied', 'Copié !'));
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('common.copyFailed', 'Échec de la copie'));
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        'transition-all',
        copied && 'text-green-600 dark:text-green-400',
        className
      )}
      title={copied ? t('common.copied', 'Copié !') : t('common.copy', 'Copier')}
    >
      {showIcon && (
        copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )
      )}
      {label && <span className={cn(showIcon && 'ml-2')}>{label}</span>}
    </Button>
  );
}

/**
 * Copy Field - Input-like display with copy button
 */
export function CopyField({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
        <code className="flex-1 text-sm font-mono truncate">{value}</code>
        <CopyButton value={value} size="sm" />
      </div>
    </div>
  );
}
